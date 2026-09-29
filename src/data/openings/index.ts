import type { Opening } from '@/domain/types';
import { BLACK_OPENINGS } from './black';
import { WHITE_OPENINGS } from './white';

export const OPENINGS: readonly Opening[] = [...WHITE_OPENINGS, ...BLACK_OPENINGS];

const BY_ID = new Map(OPENINGS.map((o) => [o.id, o]));

export function getOpening(id: string): Opening | undefined {
  return BY_ID.get(id);
}

export function getLine(openingId: string, lineId: string) {
  return getOpening(openingId)?.lines.find((l) => l.id === lineId);
}
