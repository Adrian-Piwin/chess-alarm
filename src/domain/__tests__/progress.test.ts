import {
  EMPTY_LINE_PROGRESS,
  getLineProgress,
  isModeUnlocked,
  MAX_STARS,
  recommendedMode,
  recordSession,
  summarizeOpening,
  type ProgressMap,
} from '../progress';
import type { Opening } from '../types';

const OPENING: Opening = {
  id: 'test',
  name: 'Test',
  eco: 'A00',
  side: 'w',
  difficulty: 'beginner',
  summary: '',
  lines: [
    { id: 'a', name: 'A', moves: ['e4'], notes: {} },
    { id: 'b', name: 'B', moves: ['d4'], notes: {} },
  ],
};

function play(progress: ProgressMap, lineId: string, times: number) {
  let p = progress;
  const events = [];
  for (let i = 0; i < times; i += 1) {
    const r = recordSession(p, OPENING, lineId, 'recall', true, i);
    p = r.progress;
    events.push(...r.events);
  }
  return { progress: p, events };
}

describe('progress', () => {
  it('recommends Watch → Level 1 → Level 2', () => {
    expect(recommendedMode(EMPTY_LINE_PROGRESS)).toBe('demo');
    expect(recommendedMode({ ...EMPTY_LINE_PROGRESS, watched: true })).toBe('guided');
    expect(recommendedMode({ ...EMPTY_LINE_PROGRESS, watched: true, level1Complete: true })).toBe('recall');
  });

  it('locks Level 2 until Level 1 is done', () => {
    expect(isModeUnlocked(EMPTY_LINE_PROGRESS, 'recall')).toBe(false);
    expect(isModeUnlocked({ ...EMPTY_LINE_PROGRESS, level1Complete: true }, 'recall')).toBe(true);
  });

  it('completes Level 1 once', () => {
    const first = recordSession({}, OPENING, 'a', 'guided', false, 1);
    expect(first.events).toEqual([{ type: 'level1-complete' }]);
    expect(getLineProgress(first.progress, 'test', 'a').level1Complete).toBe(true);
    const again = recordSession(first.progress, OPENING, 'a', 'guided', false, 2);
    expect(again.events).toEqual([]);
  });

  it('awards a star only for flawless Level 2 runs', () => {
    const sloppy = recordSession({}, OPENING, 'a', 'recall', false, 1);
    expect(getLineProgress(sloppy.progress, 'test', 'a').stars).toBe(0);
    const clean = recordSession({}, OPENING, 'a', 'recall', true, 1);
    expect(clean.events).toEqual([{ type: 'star-earned', stars: 1 }]);
  });

  it('masters a line at three stars and caps there', () => {
    const { progress, events } = play({}, 'a', MAX_STARS + 1);
    expect(getLineProgress(progress, 'test', 'a').stars).toBe(MAX_STARS);
    expect(events.filter((e) => e.type === 'line-mastered')).toHaveLength(1);
    expect(events.some((e) => e.type === 'opening-mastered')).toBe(false);
  });

  it('masters the opening when every line is mastered', () => {
    const a = play({}, 'a', MAX_STARS);
    const b = play(a.progress, 'b', MAX_STARS);
    expect(b.events.at(-1)).toEqual({ type: 'opening-mastered' });
    expect(summarizeOpening(OPENING, b.progress)).toMatchObject({
      stars: 6,
      maxStars: 6,
      linesMastered: 2,
      mastered: true,
    });
  });

  it('does not mutate the previous progress map', () => {
    const before: ProgressMap = {};
    recordSession(before, OPENING, 'a', 'recall', true, 1);
    expect(before).toEqual({});
  });
});
