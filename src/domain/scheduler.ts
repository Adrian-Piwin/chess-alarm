/**
 * Decides what to practise: which opening an alarm (or "Practice now") serves,
 * and which line inside it.
 */
import { getLineProgress, isLineMastered, isOpeningMastered, type ProgressMap } from './progress';
import type { Opening, OpeningLine, TrainerMode } from './types';

/**
 * - `sequential`: focus on the first learning opening until it is mastered.
 * - `random-learning`: a random opening from the learning list.
 * - `fully-random`: a random opening from the whole catalogue.
 */
export type PickMode = 'sequential' | 'random-learning' | 'fully-random';

export const PICK_MODE_LABELS: Record<PickMode, string> = {
  sequential: 'In order',
  'random-learning': 'Random from my list',
  'fully-random': 'Fully random',
};

export type Rng = () => number;

export interface PracticeTarget {
  opening: Opening;
  line: OpeningLine;
  /** Never Watch: a practice session is always played. */
  mode: Exclude<TrainerMode, 'demo'>;
}

export function pickRandom<T>(items: readonly T[], rng: Rng = Math.random): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}

/** First line of the opening that still needs work, with the level to play. */
export function nextLineToPractise(
  opening: Opening,
  progress: ProgressMap,
): { line: OpeningLine; mode: PracticeTarget['mode'] } | null {
  for (const line of opening.lines) {
    const p = getLineProgress(progress, opening.id, line.id);
    if (!isLineMastered(p)) return { line, mode: p.level1Complete ? 'recall' : 'guided' };
  }
  return null;
}

export function pickPracticeTarget(options: {
  openings: readonly Opening[];
  learningIds: readonly string[];
  progress: ProgressMap;
  mode: PickMode;
  rng?: Rng;
}): PracticeTarget | null {
  const { openings, learningIds, progress, mode, rng = Math.random } = options;
  const byId = new Map(openings.map((o) => [o.id, o]));
  const unmastered = (list: readonly Opening[]) => list.filter((o) => !isOpeningMastered(o, progress));

  const learning = learningIds.map((id) => byId.get(id)).filter((o): o is Opening => o !== undefined);

  let opening: Opening | undefined;
  switch (mode) {
    case 'sequential':
      opening = unmastered(learning)[0];
      break;
    case 'random-learning':
      opening = pickRandom(unmastered(learning), rng);
      break;
    case 'fully-random':
      opening = pickRandom(unmastered(openings), rng);
      break;
  }
  if (!opening) return null;

  const next = nextLineToPractise(opening, progress);
  return next ? { opening, ...next } : null;
}
