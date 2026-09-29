import { memo } from 'react';
import { SvgXml } from 'react-native-svg';
import type { PieceCode } from '@/domain/chess';
import { PIECE_SVGS } from './pieceSvgs';

interface PieceProps {
  code: PieceCode;
  size: number;
}

/** A single chess piece. Memoised: SVG parsing is the costly part of a board render. */
export const Piece = memo(function Piece({ code, size }: PieceProps) {
  return <SvgXml xml={PIECE_SVGS[code]} width={size} height={size} />;
});
