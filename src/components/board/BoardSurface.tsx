/**
 * The static drawing of the board: squares, highlights, coordinates, legal
 * move markers and arrows — one SVG, no pieces.
 */
import { memo } from 'react';
import { Platform } from 'react-native';
import Svg, {
  Circle,
  G,
  Polygon,
  Rect,
  Line as SvgLine,
  Text as SvgText,
  RadialGradient,
  Defs,
  Stop,
} from 'react-native-svg';
import { FILES, RANKS, squareToGrid, type Color, type Square, type SquarePair } from '@/domain/chess';
import type { BoardTheme } from '@/theme/boardThemes';

const COORDINATE_FONT = Platform.select({ web: 'system-ui, sans-serif', ios: 'Helvetica', default: 'sans-serif' });

export interface BoardSurfaceProps {
  size: number;
  orientation: Color;
  theme: BoardTheme;
  showCoordinates: boolean;
  lastMove: SquarePair | null;
  selected: Square | null;
  wrong: SquarePair | null;
  checkSquare: Square | null;
  legalTargets: readonly Square[];
  /** Squares among legalTargets that hold a piece (drawn as rings, not dots). */
  occupied: ReadonlySet<Square>;
  arrows: readonly SquarePair[];
}

export const BoardSurface = memo(function BoardSurface(props: BoardSurfaceProps) {
  const {
    size,
    orientation,
    theme,
    showCoordinates,
    lastMove,
    selected,
    wrong,
    checkSquare,
    legalTargets,
    occupied,
    arrows,
  } = props;
  const sq = size / 8;

  const rect = (square: Square) => {
    const { col, row } = squareToGrid(square, orientation);
    return { x: col * sq, y: row * sq };
  };
  const center = (square: Square) => {
    const { x, y } = rect(square);
    return { cx: x + sq / 2, cy: y + sq / 2 };
  };

  const squares = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const light = (row + col) % 2 === 0;
      squares.push(
        <Rect
          key={`${row}-${col}`}
          x={col * sq}
          y={row * sq}
          width={sq}
          height={sq}
          fill={light ? theme.light : theme.dark}
        />,
      );
    }
  }

  const highlight = (square: Square | undefined, fill: string, key: string) => {
    if (!square) return null;
    const { x, y } = rect(square);
    return <Rect key={key} x={x} y={y} width={sq} height={sq} fill={fill} />;
  };

  const coordinates = [];
  if (showCoordinates) {
    const fontSize = Math.max(8, sq * 0.2);
    for (let i = 0; i < 8; i += 1) {
      // Files along the bottom edge, ranks along the left edge.
      const file = orientation === 'w' ? FILES[i]! : FILES[7 - i]!;
      const rank = orientation === 'w' ? RANKS[7 - i]! : RANKS[i]!;
      const bottomIsLight = (7 + i) % 2 === 0;
      const leftIsLight = i % 2 === 0;
      coordinates.push(
        <SvgText
          key={`f${i}`}
          x={i * sq + sq - fontSize * 0.35}
          y={size - fontSize * 0.3}
          fontSize={fontSize}
          fontFamily={COORDINATE_FONT}
          fontWeight="700"
          textAnchor="end"
          fill={bottomIsLight ? theme.dark : theme.light}
        >
          {file}
        </SvgText>,
        <SvgText
          key={`r${i}`}
          x={fontSize * 0.3}
          y={i * sq + fontSize * 1.05}
          fontSize={fontSize}
          fontFamily={COORDINATE_FONT}
          fontWeight="700"
          fill={leftIsLight ? theme.dark : theme.light}
        >
          {rank}
        </SvgText>,
      );
    }
  }

  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="check" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={theme.check} stopOpacity="1" />
          <Stop offset="0.55" stopColor={theme.check} stopOpacity="0.6" />
          <Stop offset="1" stopColor={theme.check} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <G>{squares}</G>
      {highlight(lastMove?.from, theme.lastMove, 'lm-from')}
      {highlight(lastMove?.to, theme.lastMove, 'lm-to')}
      {highlight(selected ?? undefined, theme.selected, 'sel')}
      {highlight(wrong?.from, theme.wrong, 'wr-from')}
      {highlight(wrong?.to, theme.wrong, 'wr-to')}
      {checkSquare ? <Rect {...rect(checkSquare)} width={sq} height={sq} fill="url(#check)" /> : null}
      {coordinates}
      {legalTargets.map((target) => {
        const { cx, cy } = center(target);
        return occupied.has(target) ? (
          <Circle
            key={`lt-${target}`}
            cx={cx}
            cy={cy}
            r={sq * 0.44}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth={sq * 0.08}
            fill="none"
          />
        ) : (
          <Circle key={`lt-${target}`} cx={cx} cy={cy} r={sq * 0.16} fill="rgba(0,0,0,0.18)" />
        );
      })}
      {arrows.map((arrow) => (
        <Arrow
          key={`ar-${arrow.from}${arrow.to}`}
          from={center(arrow.from)}
          to={center(arrow.to)}
          sq={sq}
          color={theme.hintArrow}
        />
      ))}
    </Svg>
  );
});

interface ArrowProps {
  from: { cx: number; cy: number };
  to: { cx: number; cy: number };
  sq: number;
  color: string;
}

function Arrow({ from, to, sq, color }: ArrowProps) {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const head = sq * 0.42;
  const halfWidth = sq * 0.3;
  const start = { x: from.cx + ux * sq * 0.18, y: from.cy + uy * sq * 0.18 };
  const tip = { x: to.cx - ux * sq * 0.12, y: to.cy - uy * sq * 0.12 };
  const base = { x: tip.x - ux * head, y: tip.y - uy * head };
  const points = [
    `${tip.x},${tip.y}`,
    `${base.x - uy * halfWidth},${base.y + ux * halfWidth}`,
    `${base.x + uy * halfWidth},${base.y - ux * halfWidth}`,
  ].join(' ');
  return (
    <G opacity={0.9}>
      <SvgLine
        x1={start.x}
        y1={start.y}
        x2={base.x}
        y2={base.y}
        stroke={color}
        strokeWidth={sq * 0.18}
        strokeLinecap="round"
      />
      <Polygon points={points} fill={color} />
    </G>
  );
}
