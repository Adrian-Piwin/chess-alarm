/**
 * Thin, typed layer over chess.js.
 *
 * Everything else in the app talks to chess through this module so the rest of
 * the code never depends on chess.js types or its mutable API directly.
 */
import { Chess, type Move, type Square as ChessJsSquare } from 'chess.js';

export type Square = ChessJsSquare;
export type Color = 'w' | 'b';
export type PieceCode = `${Color}${'K' | 'Q' | 'R' | 'B' | 'N' | 'P'}`;

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** What kind of sound / animation a move deserves. */
export type MoveKind = 'move' | 'capture' | 'castle' | 'promote';

/** A fully resolved move of a line, pre-computed once from its SAN. */
export interface ResolvedMove {
  san: string;
  from: Square;
  to: Square;
  promotion?: string;
  color: Color;
  kind: MoveKind;
  check: boolean;
  /** Position after the move. */
  fenAfter: string;
}

export interface BoardPiece {
  square: Square;
  code: PieceCode;
}

/** A from/to pair; used for highlights and arrows. */
export interface SquarePair {
  from: Square;
  to: Square;
}

function kindOf(move: Move): MoveKind {
  if (move.isKingsideCastle() || move.isQueensideCastle()) return 'castle';
  if (move.isPromotion()) return 'promote';
  if (move.isCapture()) return 'capture';
  return 'move';
}

/**
 * Plays a list of SAN moves from the initial position and returns each move
 * fully resolved. Throws if any move is illegal — the opening library relies
 * on this to be validated in tests.
 */
export function resolveLine(sanMoves: readonly string[], startFen = START_FEN): ResolvedMove[] {
  const game = new Chess(startFen);
  return sanMoves.map((san, index) => {
    let move: Move;
    try {
      move = game.move(san);
    } catch {
      throw new Error(`Illegal move "${san}" at ply ${index + 1}`);
    }
    return {
      san: move.san,
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      color: move.color,
      kind: kindOf(move),
      check: game.inCheck(),
      fenAfter: game.fen(),
    };
  });
}

/** Lists the pieces on the board for a FEN. */
export function piecesFromFen(fen: string): BoardPiece[] {
  const game = new Chess(fen);
  const pieces: BoardPiece[] = [];
  for (const row of game.board()) {
    for (const cell of row) {
      if (cell) {
        pieces.push({ square: cell.square, code: `${cell.color}${cell.type.toUpperCase()}` as PieceCode });
      }
    }
  }
  return pieces;
}

/** The side to move in a FEN. */
export function turnOf(fen: string): Color {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

/** Legal destination squares for the piece on `square`. */
export function legalTargets(fen: string, square: Square): Square[] {
  const game = new Chess(fen);
  return game.moves({ square, verbose: true }).map((m) => m.to);
}

/** Whether moving from → to is legal in `fen` (promotion defaults to queen). */
export function isLegalMove(fen: string, from: Square, to: Square): boolean {
  return legalTargets(fen, from).includes(to);
}

/** Square of the king of `color` if that king is currently in check. */
export function checkedKingSquare(fen: string): Square | null {
  const game = new Chess(fen);
  if (!game.inCheck()) return null;
  const color = game.turn();
  for (const row of game.board()) {
    for (const cell of row) {
      if (cell && cell.type === 'k' && cell.color === color) return cell.square;
    }
  }
  return null;
}

export function squareColor(square: Square): 'light' | 'dark' {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return (file + rank) % 2 === 0 ? 'dark' : 'light';
}

/**
 * Converts a square to a 0-based (column, row) on screen, where row 0 is the
 * top of the board for the given orientation.
 */
export function squareToGrid(square: Square, orientation: Color): { col: number; row: number } {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return orientation === 'w' ? { col: file, row: 7 - rank } : { col: 7 - file, row: rank };
}

export function gridToSquare(col: number, row: number, orientation: Color): Square | null {
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  const file = orientation === 'w' ? col : 7 - col;
  const rank = orientation === 'w' ? 7 - row : row;
  return `${FILES[file]}${RANKS[rank]}` as Square;
}

/** Splits PGN-style movetext ("1. e4 e5 2. Nf3") into bare SAN tokens. */
export function parseMovetext(movetext: string): string[] {
  return movetext
    .replace(/\{[^}]*\}/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^\d+\.(\.\.)?/, ''))
    .filter((token) => token.length > 0);
}
