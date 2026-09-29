/**
 * React glue around the pure trainer state machine: opponent reply timing,
 * the Watch autoplay, sounds/haptics, and recording progress at the end.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Square, SquarePair } from '@/domain/chess';
import type { ProgressEvent } from '@/domain/progress';
import {
  advanceDemo,
  attemptsUntilHint,
  createTrainer,
  currentFen,
  hintFor,
  isComplete,
  isFlawless,
  isOpponentTurn,
  isUserTurn,
  lastMove,
  playOpponentMove,
  rewindDemo,
  submitMove,
  type TrainerState,
} from '@/domain/trainer';
import type { Opening, OpeningLine, TrainerMode } from '@/domain/types';
import { haptic } from '@/features/sound/haptics';
import { playSound, soundForMove } from '@/features/sound/sounds';
import { useBannerStore, type Banner } from '@/store/bannerStore';
import { useProgressStore } from '@/store/progressStore';

const OPPONENT_DELAY_MS = 450;
const DEMO_STEP_MS = 1300;
const WRONG_FLASH_MS = 650;

export interface SessionResult {
  mode: TrainerMode;
  flawless: boolean;
  mistakes: number;
  events: ProgressEvent[];
}

export interface TrainerSession {
  state: TrainerState;
  fen: string;
  lastMove: SquarePair | null;
  hint: SquarePair | null;
  wrongFlash: SquarePair | null;
  canMove: boolean;
  message: { text: string; tone: 'neutral' | 'good' | 'bad' | 'hint' };
  note: string | null;
  result: SessionResult | null;
  /** Watch mode controls. */
  autoplay: boolean;
  setAutoplay: (on: boolean) => void;
  stepForward: () => void;
  stepBack: () => void;
  onMove: (from: Square, to: Square) => void;
  onPickUp: () => void;
}

export function useTrainerSession(opening: Opening, line: OpeningLine, mode: TrainerMode): TrainerSession {
  const [state, setState] = useState(() => createTrainer(line.moves, opening.side, mode));
  const [autoplay, setAutoplay] = useState(mode === 'demo');
  const [wrongFlash, setWrongFlash] = useState<SquarePair | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const completeSession = useProgressStore((s) => s.completeSession);
  const showBanner = useBannerStore((s) => s.show);

  // Every state change goes through here so completion is handled exactly once,
  // from the event or timer that finished the line.
  const finished = useRef(false);
  const commit = useCallback(
    (next: TrainerState) => {
      setState(next);
      if (finished.current || !isComplete(next)) return;
      finished.current = true;

      const flawless = isFlawless(next);
      const events = completeSession(opening.id, line.id, mode, flawless);
      setResult({ mode, flawless, mistakes: next.mistakes, events });

      const celebrate = events.some((e) => e.type === 'star-earned');
      // Let the final move sound finish first.
      setTimeout(() => {
        playSound(celebrate ? 'star' : 'complete');
        haptic('success');
      }, 350);
      events.forEach((event) => {
        const banner = bannerFor(event, events, opening, line);
        if (banner) showBanner(banner);
      });
    },
    [completeSession, showBanner, opening, line, mode],
  );

  // Opponent replies after a short "thinking" pause.
  useEffect(() => {
    if (!isOpponentTurn(state)) return;
    const timer = setTimeout(() => commit(playOpponentMove(state)), OPPONENT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state, commit]);

  // Watch mode autoplay.
  useEffect(() => {
    if (mode !== 'demo' || !autoplay || isComplete(state)) return;
    const timer = setTimeout(() => commit(advanceDemo(state)), state.ply === 0 ? 600 : DEMO_STEP_MS);
    return () => clearTimeout(timer);
  }, [mode, autoplay, state, commit]);

  // A sound for every move that lands on the board.
  const previousPly = useRef(state.ply);
  useEffect(() => {
    if (state.ply !== previousPly.current) {
      const move = lastMove(state);
      if (move) playSound(soundForMove(move.kind, move.check));
      previousPly.current = state.ply;
    }
  }, [state]);

  const onMove = useCallback(
    (from: Square, to: Square) => {
      const outcome = submitMove(state, from, to);
      if (outcome.result === 'wrong') {
        playSound('wrong');
        haptic('error');
        setWrongFlash({ from, to });
        setTimeout(() => setWrongFlash(null), WRONG_FLASH_MS);
      } else if (outcome.result === 'correct') {
        haptic('tap');
      }
      commit(outcome.state);
    },
    [state, commit],
  );

  const onPickUp = useCallback(() => haptic('tap'), []);

  const stepForward = useCallback(() => {
    setAutoplay(false);
    commit(advanceDemo(state));
  }, [state, commit]);
  const stepBack = useCallback(() => {
    setAutoplay(false);
    setState(rewindDemo);
  }, []);

  const last = lastMove(state);
  const note = (state.ply > 0 && line.notes[state.ply]) || null;

  return {
    state,
    fen: currentFen(state),
    lastMove: last ? { from: last.from, to: last.to } : null,
    hint: hintFor(state),
    wrongFlash,
    canMove: isUserTurn(state),
    message: messageFor(state),
    note,
    result,
    autoplay,
    setAutoplay,
    stepForward,
    stepBack,
    onMove,
    onPickUp,
  };
}

function bannerFor(
  event: ProgressEvent,
  all: readonly ProgressEvent[],
  opening: Opening,
  line: OpeningLine,
): Omit<Banner, 'id'> | null {
  switch (event.type) {
    case 'level1-complete':
      return { tone: 'success', title: 'Level 1 complete', message: 'Level 2 unlocked — now play it from memory.' };
    case 'star-earned':
      // A third star is announced as "Line mastered" instead.
      return all.some((e) => e.type === 'line-mastered')
        ? null
        : { tone: 'star', title: `Star earned · ${event.stars}/3`, message: `Flawless run of ${line.name}.` };
    case 'line-mastered':
      return { tone: 'mastered', title: 'Line mastered!', message: `${line.name} — three flawless runs.` };
    case 'opening-mastered':
      return {
        tone: 'mastered',
        title: `${opening.name} mastered!`,
        message: 'Every line has three stars. Time to pick a new opening.',
      };
  }
}

function messageFor(state: TrainerState): TrainerSession['message'] {
  if (isComplete(state)) return { text: 'Line complete!', tone: 'good' };
  if (state.mode === 'demo') return { text: 'Watch how the line is played.', tone: 'neutral' };
  if (isOpponentTurn(state)) {
    return state.feedback === 'correct'
      ? { text: 'Correct!', tone: 'good' }
      : { text: 'Opponent to move…', tone: 'neutral' };
  }
  if (state.mode === 'guided') {
    return state.feedback === 'wrong'
      ? { text: 'Not that one — follow the arrow.', tone: 'bad' }
      : { text: 'Play the move shown by the arrow.', tone: 'neutral' };
  }
  switch (state.feedback) {
    case 'wrong': {
      const left = attemptsUntilHint(state);
      return { text: `Not quite. ${left} more ${left === 1 ? 'try' : 'tries'} before a hint.`, tone: 'bad' };
    }
    case 'hint':
      return { text: 'Here’s a hint — follow the arrow.', tone: 'hint' };
    case 'correct':
      return { text: 'Correct! Keep going.', tone: 'good' };
    default:
      return { text: 'Your move — play it from memory.', tone: 'neutral' };
  }
}
