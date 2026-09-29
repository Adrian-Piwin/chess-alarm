/**
 * Progress rules: level unlocks, stars and mastery. Pure functions over plain
 * data so they are trivially persisted and unit tested.
 */
import type { Opening, TrainerMode } from './types';

export const MAX_STARS = 3;

export interface LineProgress {
  /** The Watch demo has been seen (or skipped). */
  watched: boolean;
  /** Level 1 has been completed at least once — unlocks Level 2. */
  level1Complete: boolean;
  /** Flawless Level 2 runs, capped at MAX_STARS. */
  stars: number;
  lastPlayedAt: number | null;
}

/** openingId → lineId → progress */
export type ProgressMap = Record<string, Record<string, LineProgress>>;

export const EMPTY_LINE_PROGRESS: LineProgress = Object.freeze({
  watched: false,
  level1Complete: false,
  stars: 0,
  lastPlayedAt: null,
});

export type ProgressEvent =
  | { type: 'level1-complete' }
  | { type: 'star-earned'; stars: number }
  | { type: 'line-mastered' }
  | { type: 'opening-mastered' };

export function getLineProgress(progress: ProgressMap, openingId: string, lineId: string): LineProgress {
  return progress[openingId]?.[lineId] ?? EMPTY_LINE_PROGRESS;
}

export function isLineMastered(line: LineProgress): boolean {
  return line.stars >= MAX_STARS;
}

export function isOpeningMastered(opening: Opening, progress: ProgressMap): boolean {
  return opening.lines.every((line) => isLineMastered(getLineProgress(progress, opening.id, line.id)));
}

export interface OpeningSummary {
  stars: number;
  maxStars: number;
  linesMastered: number;
  lineCount: number;
  mastered: boolean;
  started: boolean;
}

export function summarizeOpening(opening: Opening, progress: ProgressMap): OpeningSummary {
  let stars = 0;
  let linesMastered = 0;
  let started = false;
  for (const line of opening.lines) {
    const p = getLineProgress(progress, opening.id, line.id);
    stars += Math.min(p.stars, MAX_STARS);
    if (isLineMastered(p)) linesMastered += 1;
    if (p.watched || p.level1Complete || p.stars > 0) started = true;
  }
  return {
    stars,
    maxStars: opening.lines.length * MAX_STARS,
    linesMastered,
    lineCount: opening.lines.length,
    mastered: linesMastered === opening.lines.length,
    started,
  };
}

/** The level a learner should do next on a line when they tap "Study". */
export function recommendedMode(line: LineProgress): TrainerMode {
  if (!line.watched && !line.level1Complete) return 'demo';
  if (!line.level1Complete) return 'guided';
  return 'recall';
}

export function isModeUnlocked(line: LineProgress, mode: TrainerMode): boolean {
  return mode !== 'recall' || line.level1Complete;
}

/**
 * Applies the result of a finished session and reports what changed, so the
 * UI can celebrate (banners, sounds).
 */
export function recordSession(
  progress: ProgressMap,
  opening: Opening,
  lineId: string,
  mode: TrainerMode,
  flawless: boolean,
  now: number,
): { progress: ProgressMap; events: ProgressEvent[] } {
  const before = getLineProgress(progress, opening.id, lineId);
  const after: LineProgress = { ...before, lastPlayedAt: now };
  const events: ProgressEvent[] = [];

  if (mode === 'demo') {
    after.watched = true;
  } else if (mode === 'guided') {
    after.watched = true;
    if (!before.level1Complete) events.push({ type: 'level1-complete' });
    after.level1Complete = true;
  } else if (mode === 'recall' && flawless && before.stars < MAX_STARS) {
    after.stars = before.stars + 1;
    events.push({ type: 'star-earned', stars: after.stars });
    if (after.stars === MAX_STARS) events.push({ type: 'line-mastered' });
  }

  const next: ProgressMap = {
    ...progress,
    [opening.id]: { ...progress[opening.id], [lineId]: after },
  };

  if (!isOpeningMastered(opening, progress) && isOpeningMastered(opening, next)) {
    events.push({ type: 'opening-mastered' });
  }
  return { progress: next, events };
}
