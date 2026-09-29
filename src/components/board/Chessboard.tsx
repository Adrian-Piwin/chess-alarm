/**
 * Interactive chessboard.
 *
 * Input works the way chess players expect on every platform:
 *   • tap a piece, then tap a destination; or
 *   • drag a piece and drop it.
 *
 * The board is "controlled": it never changes its own position. It reports
 * attempted moves through `onMove` and the parent decides what happens (the
 * trainer accepts or rejects them and passes a new `fen`).
 */
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import {
  checkedKingSquare,
  gridToSquare,
  legalTargets as computeLegalTargets,
  piecesFromFen,
  squareToGrid,
  type Color,
  type Square,
  type SquarePair,
} from '@/domain/chess';
import type { BoardTheme } from '@/theme/boardThemes';
import { BoardSurface } from './BoardSurface';
import { Piece } from './Piece';

export interface ChessboardProps {
  fen: string;
  size: number;
  theme: BoardTheme;
  orientation?: Color;
  showCoordinates?: boolean;
  lastMove?: SquarePair | null;
  arrows?: readonly SquarePair[];
  /** Flash these squares red (a rejected move). */
  wrong?: SquarePair | null;
  /** Whether the user may move pieces. */
  interactive?: boolean;
  /** Only pieces of this colour can be picked up. */
  movableColor?: Color;
  onMove?: (from: Square, to: Square) => void;
  /** Called when a piece is picked up (for a subtle sound / haptic). */
  onPickUp?: () => void;
  /** Slide pieces for moves not made by hand (default true). */
  animateMoves?: boolean;
  accessibilityLabel?: string;
}

const MOVE_ANIMATION_MS = 170;
const DRAG_THRESHOLD = 6;
const useNativeDriver = Platform.OS !== 'web';

export function Chessboard({
  fen,
  size,
  theme,
  orientation = 'w',
  showCoordinates = true,
  lastMove = null,
  arrows = [],
  wrong = null,
  interactive = false,
  movableColor = 'w',
  onMove,
  onPickUp,
  animateMoves = true,
  accessibilityLabel,
}: ChessboardProps) {
  const sq = size / 8;
  const pieces = useMemo(() => piecesFromFen(fen), [fen]);
  const pieceAt = useMemo(() => new Map(pieces.map((p) => [p.square, p.code])), [pieces]);
  const checkSquare = useMemo(() => checkedKingSquare(fen), [fen]);

  // Selection and drag belong to a position: keyed by FEN so they reset
  // automatically when the position changes.
  const [selection, setSelection] = useState<{ fen: string; square: Square } | null>(null);
  const [drag, setDrag] = useState<{ fen: string; square: Square } | null>(null);
  const selected = selection?.fen === fen ? selection.square : null;
  const dragging = drag?.fen === fen ? drag.square : null;
  const [dragPosition] = useState(() => new Animated.ValueXY());

  const legalTargets = useMemo(() => (selected ? computeLegalTargets(fen, selected) : []), [fen, selected]);
  const occupied = useMemo(() => new Set(legalTargets.filter((t) => pieceAt.has(t))), [legalTargets, pieceAt]);

  // ----- move animation (opponent replies, demo moves) -----
  // The piece on lastMove.to always carries this offset; it is zero at rest.
  const [slide] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  /** A move the user just dropped by hand — don't animate it again. */
  const droppedMove = useRef<string | null>(null);

  // Layout effect: the offset must be applied before the new position paints.
  useLayoutEffect(() => {
    if (!lastMove || !animateMoves) return;
    const key = `${lastMove.from}${lastMove.to}`;
    if (droppedMove.current === key) {
      droppedMove.current = null;
      return;
    }
    const from = squareToGrid(lastMove.from, orientation);
    const to = squareToGrid(lastMove.to, orientation);
    slide.setValue({ x: (from.col - to.col) * sq, y: (from.row - to.row) * sq });
    const animation = Animated.timing(slide, { toValue: { x: 0, y: 0 }, duration: MOVE_ANIMATION_MS, useNativeDriver });
    animation.start();
    return () => {
      animation.stop();
      slide.setValue({ x: 0, y: 0 });
    };
    // Re-run only when the move itself changes (fen distinguishes repeated moves).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMove?.from, lastMove?.to, fen]);

  // ----- input -----
  // PanResponder callbacks are created once, so they read live values from a ref.
  const live = useRef({ interactive, movableColor, orientation, sq, selected, pieceAt, fen, onMove, onPickUp });
  useLayoutEffect(() => {
    live.current = { interactive, movableColor, orientation, sq, selected, pieceAt, fen, onMove, onPickUp };
  });
  const gesture = useRef({ start: null as Square | null, startX: 0, startY: 0, dragged: false, wasSelected: false });

  const squareAt = (x: number, y: number) => {
    const { sq: s, orientation: o } = live.current;
    return gridToSquare(Math.floor(x / s), Math.floor(y / s), o);
  };

  const isOwnPiece = (square: Square | null) => {
    if (!square) return false;
    const code = live.current.pieceAt.get(square);
    return code !== undefined && code[0] === live.current.movableColor;
  };

  const select = useCallback((square: Square | null) => {
    setSelection(square ? { fen: live.current.fen, square } : null);
  }, []);

  const tryMove = useCallback((from: Square, to: Square, byDrag: boolean) => {
    const { onMove: handler, fen: currentFen } = live.current;
    setSelection(null);
    if (from === to || !handler) return;
    if (byDrag && computeLegalTargets(currentFen, from).includes(to)) droppedMove.current = `${from}${to}`;
    handler(from, to);
  }, []);

  // PanResponder handlers only run on touch events, never during render; they
  // read the latest props through `live`. The compiler can't see that.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => live.current.interactive,
      onMoveShouldSetPanResponder: () => live.current.interactive,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        const square = squareAt(locationX, locationY);
        const wasSelected = square !== null && live.current.selected === square;
        gesture.current = { start: square, startX: locationX, startY: locationY, dragged: false, wasSelected };
        if (isOwnPiece(square) && !wasSelected) {
          select(square);
          live.current.onPickUp?.();
        }
      },
      onPanResponderMove: (_e, g) => {
        const { start, startX, startY } = gesture.current;
        if (!start || !isOwnPiece(start)) return;
        if (!gesture.current.dragged && Math.hypot(g.dx, g.dy) < DRAG_THRESHOLD) return;
        if (!gesture.current.dragged) {
          gesture.current.dragged = true;
          setDrag({ fen: live.current.fen, square: start });
        }
        const s = live.current.sq;
        dragPosition.setValue({ x: startX + g.dx - s / 2, y: startY + g.dy - s / 2 });
      },
      onPanResponderRelease: (_e, g) => {
        const { start, startX, startY, dragged, wasSelected } = gesture.current;
        setDrag(null);
        if (!start) return;
        if (dragged) {
          const target = squareAt(startX + g.dx, startY + g.dy);
          if (target && target !== start) tryMove(start, target, true);
          return;
        }
        // A tap: second tap on the same piece deselects it; a tap elsewhere
        // (empty square or enemy piece) is a move attempt.
        const selectedSquare = live.current.selected;
        if (wasSelected) {
          select(null);
        } else if (selectedSquare && !isOwnPiece(start)) {
          tryMove(selectedSquare, start, false);
        }
      },
      onPanResponderTerminate: () => setDrag(null),
    }),
  );

  return (
    <View
      style={[styles.board, { width: size, height: size }]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? 'Chessboard'}
    >
      <BoardSurface
        size={size}
        orientation={orientation}
        theme={theme}
        showCoordinates={showCoordinates}
        lastMove={lastMove}
        selected={selected}
        wrong={wrong}
        checkSquare={checkSquare}
        legalTargets={interactive ? legalTargets : []}
        occupied={occupied}
        arrows={arrows}
      />
      {pieces.map(({ square, code }) => {
        if (square === dragging) return null;
        const { col, row } = squareToGrid(square, orientation);
        const sliding = animateMoves && square === lastMove?.to;
        return (
          <Animated.View
            key={`${square}${code}`}
            pointerEvents="none"
            style={[
              styles.piece,
              { width: sq, height: sq, left: col * sq, top: row * sq },
              sliding && { transform: slide.getTranslateTransform(), zIndex: 2 },
            ]}
          >
            <Piece code={code} size={sq} />
          </Animated.View>
        );
      })}
      {dragging && pieceAt.get(dragging) ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.piece,
            styles.dragged,
            {
              width: sq,
              height: sq,
              left: 0,
              top: 0,
              transform: [...dragPosition.getTranslateTransform(), { scale: 1.12 }],
            },
          ]}
        >
          <Piece code={pieceAt.get(dragging)!} size={sq} />
        </Animated.View>
      ) : null}
      <View style={StyleSheet.absoluteFill} {...responder.panHandlers} />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
    ...Platform.select({ web: { userSelect: 'none', cursor: 'pointer', touchAction: 'none' } as object, default: {} }),
  },
  piece: { position: 'absolute' },
  dragged: { zIndex: 10 },
});
