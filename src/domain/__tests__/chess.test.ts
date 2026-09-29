import {
  checkedKingSquare,
  gridToSquare,
  parseMovetext,
  piecesFromFen,
  resolveLine,
  START_FEN,
  squareColor,
  squareToGrid,
  turnOf,
} from '../chess';

describe('chess helpers', () => {
  it('parses PGN movetext', () => {
    expect(parseMovetext('1. e4 e5 2. Nf3 {develop} Nc6 3... Bc4')).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
  });

  it('resolves move kinds', () => {
    const moves = resolveLine(['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'Nf3', 'Nf6', 'Be2', 'Bg4', 'O-O']);
    expect(moves[2]!.kind).toBe('capture');
    expect(moves[10]!.kind).toBe('castle');
    expect(moves[0]).toMatchObject({ from: 'e2', to: 'e4', color: 'w', kind: 'move' });
  });

  it('throws on an illegal line', () => {
    expect(() => resolveLine(['e4', 'e4'])).toThrow('Illegal move "e4" at ply 2');
  });

  it('reads pieces, turn and check', () => {
    expect(piecesFromFen(START_FEN)).toHaveLength(32);
    expect(turnOf(START_FEN)).toBe('w');
    const fools = resolveLine(['f3', 'e5', 'g4', 'Qh4#']).at(-1)!.fenAfter;
    expect(checkedKingSquare(fools)).toBe('e1');
    expect(checkedKingSquare(START_FEN)).toBeNull();
  });

  it('maps squares to the grid for both orientations', () => {
    expect(squareToGrid('a1', 'w')).toEqual({ col: 0, row: 7 });
    expect(squareToGrid('a1', 'b')).toEqual({ col: 7, row: 0 });
    expect(gridToSquare(0, 7, 'w')).toBe('a1');
    expect(gridToSquare(7, 0, 'b')).toBe('a1');
    expect(gridToSquare(8, 0, 'w')).toBeNull();
    expect(squareColor('a1')).toBe('dark');
    expect(squareColor('h1')).toBe('light');
  });
});
