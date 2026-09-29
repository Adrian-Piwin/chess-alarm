import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { resolveLine, START_FEN, type Color } from '@/domain/chess';
import { BOARD_THEMES } from '@/theme/boardThemes';
import { useSettingsStore } from '@/store/settingsStore';
import { Chessboard } from './Chessboard';

/** A static thumbnail of a line's final position. */
export const MiniBoard = memo(function MiniBoard({
  moves,
  size,
  orientation,
}: {
  moves: readonly string[];
  size: number;
  orientation: Color;
}) {
  const themeId = useSettingsStore((s) => s.boardTheme);
  const { fen, lastMove } = useMemo(() => {
    const resolved = resolveLine(moves);
    const last = resolved[resolved.length - 1];
    return { fen: last?.fenAfter ?? START_FEN, lastMove: last ? { from: last.from, to: last.to } : null };
  }, [moves]);
  return (
    <View pointerEvents="none">
      <Chessboard
        fen={fen}
        size={size}
        theme={BOARD_THEMES[themeId]}
        orientation={orientation}
        showCoordinates={false}
        lastMove={lastMove}
        animateMoves={false}
      />
    </View>
  );
});
