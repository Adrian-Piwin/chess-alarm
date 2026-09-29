import { MAX_STARS, type ProgressMap } from '../progress';
import { nextLineToPractise, pickPracticeTarget, pickRandom } from '../scheduler';
import type { Opening } from '../types';

function opening(id: string, lineIds: string[]): Opening {
  return {
    id,
    name: id,
    eco: 'A00',
    side: 'w',
    difficulty: 'beginner',
    summary: '',
    lines: lineIds.map((l) => ({ id: l, name: l, moves: ['e4'], notes: {} })),
  };
}

const A = opening('a', ['a1', 'a2']);
const B = opening('b', ['b1']);
const C = opening('c', ['c1']);
const ALL = [A, B, C];

const mastered = { watched: true, level1Complete: true, stars: MAX_STARS, lastPlayedAt: 1 };

describe('scheduler', () => {
  it('plays Level 1 on a line never completed, then Level 2', () => {
    expect(nextLineToPractise(A, {})).toMatchObject({ line: { id: 'a1' }, mode: 'guided' });
    const p: ProgressMap = { a: { a1: { ...mastered, stars: 1 } } };
    expect(nextLineToPractise(A, p)).toMatchObject({ line: { id: 'a1' }, mode: 'recall' });
  });

  it('moves on to the next unmastered line', () => {
    const p: ProgressMap = { a: { a1: mastered } };
    expect(nextLineToPractise(A, p)).toMatchObject({ line: { id: 'a2' }, mode: 'guided' });
  });

  it('sequential mode sticks to the first learning opening until mastered', () => {
    const base = { openings: ALL, learningIds: ['b', 'a'], mode: 'sequential' as const };
    expect(pickPracticeTarget({ ...base, progress: {} })?.opening.id).toBe('b');
    const p: ProgressMap = { b: { b1: mastered } };
    expect(pickPracticeTarget({ ...base, progress: p })?.opening.id).toBe('a');
  });

  it('returns null when every learning opening is mastered', () => {
    const p: ProgressMap = { b: { b1: mastered } };
    expect(pickPracticeTarget({ openings: ALL, learningIds: ['b'], progress: p, mode: 'sequential' })).toBeNull();
    expect(pickPracticeTarget({ openings: ALL, learningIds: [], progress: {}, mode: 'random-learning' })).toBeNull();
  });

  it('random-learning only picks from the learning list', () => {
    const picks = new Set<string>();
    for (const r of [0, 0.49, 0.51, 0.99]) {
      const t = pickPracticeTarget({ openings: ALL, learningIds: ['a', 'c'], progress: {}, mode: 'random-learning', rng: () => r });
      picks.add(t!.opening.id);
    }
    expect([...picks].sort()).toEqual(['a', 'c']);
  });

  it('fully-random can pick any unmastered opening', () => {
    const t = pickPracticeTarget({ openings: ALL, learningIds: [], progress: {}, mode: 'fully-random', rng: () => 0.99 });
    expect(t?.opening.id).toBe('c');
  });

  it('pickRandom handles edges', () => {
    expect(pickRandom([])).toBeUndefined();
    expect(pickRandom([1, 2, 3], () => 0.9999999)).toBe(3);
  });
});
