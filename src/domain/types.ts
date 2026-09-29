import type { Color } from './chess';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/** A single named line (variation) of an opening. */
export interface OpeningLine {
  /** Stable id, unique within its opening. Used as a persistence key. */
  id: string;
  name: string;
  /** SAN moves from the initial position. */
  moves: string[];
  /** Optional commentary keyed by 1-based ply number, shown in Watch mode. */
  notes: Record<number, string>;
}

export interface Opening {
  /** Stable id. Used as a persistence key and in URLs — never rename. */
  id: string;
  name: string;
  eco: string;
  /** The side the learner plays. */
  side: Color;
  difficulty: Difficulty;
  summary: string;
  lines: OpeningLine[];
}

/** How a line is being studied. */
export type TrainerMode = 'demo' | 'guided' | 'recall';

export const MODE_LABELS: Record<TrainerMode, string> = {
  demo: 'Watch',
  guided: 'Level 1',
  recall: 'Level 2',
};
