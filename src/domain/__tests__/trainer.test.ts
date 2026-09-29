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
  MAX_ATTEMPTS_BEFORE_HINT,
  playOpponentMove,
  rewindDemo,
  submitMove,
  type TrainerState,
} from '../trainer';
import { START_FEN } from '../chess';

const ITALIAN = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'];

/** Plays the whole line correctly, including opponent replies. */
function playThrough(state: TrainerState): TrainerState {
  let s = state;
  while (!isComplete(s)) {
    if (isOpponentTurn(s)) {
      s = playOpponentMove(s);
    } else {
      const step = s.steps[s.ply]!;
      s = submitMove(s, step.from, step.to).state;
    }
  }
  return s;
}

describe('trainer', () => {
  it('starts from the initial position', () => {
    const s = createTrainer(ITALIAN, 'w', 'recall');
    expect(currentFen(s)).toBe(START_FEN);
    expect(isUserTurn(s)).toBe(true);
  });

  it('lets the opponent move first when the learner plays Black', () => {
    const s = createTrainer(['e4', 'c5', 'Nf3'], 'b', 'recall');
    expect(isUserTurn(s)).toBe(false);
    expect(isOpponentTurn(s)).toBe(true);
    const after = playOpponentMove(s);
    expect(after.ply).toBe(1);
    expect(isUserTurn(after)).toBe(true);
  });

  it('accepts the book move and rejects others', () => {
    const s = createTrainer(ITALIAN, 'w', 'recall');
    const wrong = submitMove(s, 'd2', 'd4');
    expect(wrong.result).toBe('wrong');
    expect(wrong.state.ply).toBe(0);
    expect(wrong.state.mistakes).toBe(1);
    expect(wrong.state.lastWrong).toEqual({ from: 'd2', to: 'd4' });

    const right = submitMove(wrong.state, 'e2', 'e4');
    expect(right.result).toBe('correct');
    expect(right.state.ply).toBe(1);
    expect(right.state.attemptsOnCurrent).toBe(0);
  });

  it('ignores illegal moves without counting a mistake', () => {
    const s = createTrainer(ITALIAN, 'w', 'recall');
    const r = submitMove(s, 'e2', 'e5');
    expect(r.result).toBe('illegal');
    expect(r.state).toBe(s);
  });

  it('ignores input when it is not the learner’s turn', () => {
    const s = submitMove(createTrainer(ITALIAN, 'w', 'recall'), 'e2', 'e4').state;
    expect(submitMove(s, 'd2', 'd4').result).toBe('ignored');
  });

  it('shows a hint only after three wrong tries in Level 2', () => {
    let s = createTrainer(ITALIAN, 'w', 'recall');
    for (let i = 0; i < MAX_ATTEMPTS_BEFORE_HINT; i += 1) {
      expect(hintFor(s)).toBeNull();
      expect(attemptsUntilHint(s)).toBe(MAX_ATTEMPTS_BEFORE_HINT - i);
      s = submitMove(s, 'd2', 'd4').state;
    }
    expect(hintFor(s)).toEqual({ from: 'e2', to: 'e4' });
    expect(s.feedback).toBe('hint');
  });

  it('always shows the hint in Level 1 and does not count mistakes', () => {
    const s = createTrainer(ITALIAN, 'w', 'guided');
    expect(hintFor(s)).toEqual({ from: 'e2', to: 'e4' });
    const wrong = submitMove(s, 'd2', 'd4').state;
    expect(wrong.mistakes).toBe(0);
    expect(wrong.feedback).toBe('wrong');
  });

  it('is flawless only for a clean Level 2 run', () => {
    expect(isFlawless(playThrough(createTrainer(ITALIAN, 'w', 'recall')))).toBe(true);
    expect(isFlawless(playThrough(createTrainer(ITALIAN, 'w', 'guided')))).toBe(false);

    const withMistake = submitMove(createTrainer(ITALIAN, 'w', 'recall'), 'd2', 'd4').state;
    expect(isFlawless(playThrough(withMistake))).toBe(false);
  });

  it('steps through the demo forwards and backwards', () => {
    let s = createTrainer(ITALIAN, 'w', 'demo');
    expect(isUserTurn(s)).toBe(false);
    s = advanceDemo(advanceDemo(s));
    expect(s.ply).toBe(2);
    s = rewindDemo(s);
    expect(s.ply).toBe(1);
    while (!isComplete(s)) s = advanceDemo(s);
    expect(advanceDemo(s)).toBe(s);
  });
});
