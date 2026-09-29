import { resolveLine } from '@/domain/chess';
import { BLACK_OPENINGS } from '../openings/black';
import { getLine, getOpening, OPENINGS } from '../openings';
import { WHITE_OPENINGS } from '../openings/white';

describe('opening library', () => {
  it('ships at least 10 openings for each side', () => {
    expect(WHITE_OPENINGS.length).toBeGreaterThanOrEqual(10);
    expect(BLACK_OPENINGS.length).toBeGreaterThanOrEqual(10);
    expect(WHITE_OPENINGS.every((o) => o.side === 'w')).toBe(true);
    expect(BLACK_OPENINGS.every((o) => o.side === 'b')).toBe(true);
  });

  it('has unique, URL-safe opening ids', () => {
    const ids = OPENINGS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });

  describe.each(OPENINGS.map((o) => [o.name, o] as const))('%s', (_name, opening) => {
    it('has at least two lines with unique ids', () => {
      expect(opening.lines.length).toBeGreaterThanOrEqual(2);
      const ids = opening.lines.map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
      ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
    });

    it.each(opening.lines.map((l) => [l.name, l] as const))('line "%s" is legal SAN with enough learner moves', (_n, line) => {
      const resolved = resolveLine(line.moves);
      expect(resolved.length).toBeGreaterThanOrEqual(12);
      // Every SAN must be exactly as chess.js writes it (checks, disambiguation…).
      expect(resolved.map((m) => m.san)).toEqual(line.moves);
      // Enough of the learner's own moves to be worth drilling.
      expect(resolved.filter((m) => m.color === opening.side).length).toBeGreaterThanOrEqual(6);
    });

    it.each(opening.lines.map((l) => [l.name, l] as const))('line "%s" notes point at real plies', (_n, line) => {
      Object.keys(line.notes).forEach((ply) => {
        expect(Number(ply)).toBeGreaterThanOrEqual(1);
        expect(Number(ply)).toBeLessThanOrEqual(line.moves.length);
      });
    });
  });

  it('looks up openings and lines by id', () => {
    expect(getOpening('italian-game')?.name).toBe('Italian Game');
    expect(getLine('italian-game', 'giuoco-piano')?.moves[0]).toBe('e4');
    expect(getOpening('nope')).toBeUndefined();
  });
});
