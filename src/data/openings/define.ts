import { parseMovetext } from '@/domain/chess';
import type { OpeningLine } from '@/domain/types';

/**
 * Authoring helper so lines read like a book:
 *
 *   line('main', 'Main line', '1. e4 e5 2. Nf3 Nc6', { 3: 'Develop and attack e5.' })
 *
 * Note keys are 1-based ply numbers (1 = White's first move, 2 = Black's reply…).
 */
export function line(id: string, name: string, movetext: string, notes: Record<number, string> = {}): OpeningLine {
  return { id, name, moves: parseMovetext(movetext), notes };
}
