/**
 * The trainer state machine — pure functions, no React.
 *
 * A session walks one line ply by ply. The learner plays their own side; the
 * opponent's replies are applied by the UI via `playOpponentMove` (after a
 * short delay so it feels like a real opponent).
 *
 *   demo    every move is played automatically (`advanceDemo`).
 *   guided  Level 1 — the expected move is always shown as a hint.
 *   recall  Level 2 — no hint until MAX_ATTEMPTS_BEFORE_HINT wrong tries on
 *           the same move. Any wrong try makes the run non-flawless.
 */
import {
  isLegalMove,
  resolveLine,
  START_FEN,
  type Color,
  type ResolvedMove,
  type Square,
  type SquarePair,
} from './chess';
import type { TrainerMode } from './types';

export const MAX_ATTEMPTS_BEFORE_HINT = 3;

export type TrainerFeedback = 'correct' | 'wrong' | 'hint' | null;

export interface TrainerState {
  mode: TrainerMode;
  userColor: Color;
  steps: readonly ResolvedMove[];
  /** Number of plies already played. */
  ply: number;
  /** Total wrong attempts in this run. */
  mistakes: number;
  /** Wrong attempts on the move currently expected. */
  attemptsOnCurrent: number;
  feedback: TrainerFeedback;
  /** The last wrong move tried, for a red flash on the board. */
  lastWrong: SquarePair | null;
}

export type SubmitResult = 'correct' | 'wrong' | 'illegal' | 'ignored';

export function createTrainer(moves: readonly string[], userColor: Color, mode: TrainerMode): TrainerState {
  return {
    mode,
    userColor,
    steps: resolveLine(moves),
    ply: 0,
    mistakes: 0,
    attemptsOnCurrent: 0,
    feedback: null,
    lastWrong: null,
  };
}

export function currentFen(state: TrainerState): string {
  return state.ply === 0 ? START_FEN : state.steps[state.ply - 1]!.fenAfter;
}

export function lastMove(state: TrainerState): ResolvedMove | null {
  return state.ply === 0 ? null : state.steps[state.ply - 1]!;
}

export function nextStep(state: TrainerState): ResolvedMove | null {
  return state.steps[state.ply] ?? null;
}

export function isComplete(state: TrainerState): boolean {
  return state.ply >= state.steps.length;
}

export function isUserTurn(state: TrainerState): boolean {
  const step = nextStep(state);
  return state.mode !== 'demo' && step !== null && step.color === state.userColor;
}

export function isOpponentTurn(state: TrainerState): boolean {
  const step = nextStep(state);
  return state.mode !== 'demo' && step !== null && step.color !== state.userColor;
}

/** A flawless run is a finished Level 2 run without a single wrong move. */
export function isFlawless(state: TrainerState): boolean {
  return state.mode === 'recall' && isComplete(state) && state.mistakes === 0;
}

/** The arrow to draw, if the learner should currently see one. */
export function hintFor(state: TrainerState): SquarePair | null {
  if (!isUserTurn(state)) return null;
  const step = nextStep(state)!;
  const show =
    state.mode === 'guided' || (state.mode === 'recall' && state.attemptsOnCurrent >= MAX_ATTEMPTS_BEFORE_HINT);
  return show ? { from: step.from, to: step.to } : null;
}

/** Remaining wrong attempts before the hint appears (Level 2 only). */
export function attemptsUntilHint(state: TrainerState): number {
  return Math.max(0, MAX_ATTEMPTS_BEFORE_HINT - state.attemptsOnCurrent);
}

function advance(state: TrainerState, feedback: TrainerFeedback): TrainerState {
  return { ...state, ply: state.ply + 1, attemptsOnCurrent: 0, feedback, lastWrong: null };
}

/** The learner tries a move. */
export function submitMove(
  state: TrainerState,
  from: Square,
  to: Square,
): { state: TrainerState; result: SubmitResult } {
  if (!isUserTurn(state)) return { state, result: 'ignored' };

  const step = nextStep(state)!;
  if (step.from === from && step.to === to) {
    return { state: advance(state, 'correct'), result: 'correct' };
  }
  if (!isLegalMove(currentFen(state), from, to)) {
    return { state, result: 'illegal' };
  }

  // Level 1 shows the arrow already, so a wrong move there is not a "mistake".
  if (state.mode === 'guided') {
    return { state: { ...state, feedback: 'wrong', lastWrong: { from, to } }, result: 'wrong' };
  }
  const attemptsOnCurrent = state.attemptsOnCurrent + 1;
  return {
    state: {
      ...state,
      mistakes: state.mistakes + 1,
      attemptsOnCurrent,
      feedback: attemptsOnCurrent >= MAX_ATTEMPTS_BEFORE_HINT ? 'hint' : 'wrong',
      lastWrong: { from, to },
    },
    result: 'wrong',
  };
}

/** Plays the opponent's reply. No-op unless it is the opponent's turn. */
export function playOpponentMove(state: TrainerState): TrainerState {
  if (!isOpponentTurn(state)) return state;
  // Keep the "correct" message from the learner's move visible over the reply.
  return advance(state, state.feedback);
}

/** Watch mode: plays the next move, whoever's it is. */
export function advanceDemo(state: TrainerState): TrainerState {
  if (state.mode !== 'demo' || isComplete(state)) return state;
  return advance(state, null);
}

/** Watch mode: steps one move back. */
export function rewindDemo(state: TrainerState): TrainerState {
  if (state.mode !== 'demo' || state.ply === 0) return state;
  return { ...state, ply: state.ply - 1 };
}
