import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ResolvedMove } from '@/domain/chess';
import { colors, radius, spacing, typography } from '@/theme';

interface MoveListProps {
  steps: readonly ResolvedMove[];
  ply: number;
  /** Show moves not played yet (Watch mode). Otherwise they stay hidden so Level 2 can't leak answers. */
  revealUpcoming: boolean;
}

interface Pair {
  number: number;
  white?: number;
  black?: number;
}

/** Numbered move pairs, keeping the last played move in view. */
export function MoveList({ steps, ply, revealUpcoming }: MoveListProps) {
  const scroll = useRef<ScrollView>(null);
  const pairOffsets = useRef<number[]>([]);

  const pairs: Pair[] = [];
  const visibleCount = revealUpcoming ? steps.length : ply;
  for (let i = 0; i < visibleCount; i += 1) {
    if (i % 2 === 0) pairs.push({ number: i / 2 + 1, white: i });
    else if (pairs.length) pairs[pairs.length - 1]!.black = i;
    else pairs.push({ number: 1, black: i });
  }

  useEffect(() => {
    const current = Math.max(0, Math.floor((ply - 1) / 2));
    const x = pairOffsets.current[current] ?? 0;
    scroll.current?.scrollTo({ x: Math.max(0, x - 60), animated: true });
  }, [ply]);

  const cell = (index: number | undefined) => {
    if (index === undefined) return <View style={styles.cell} />;
    const played = index < ply;
    const current = index === ply - 1;
    return (
      <View style={[styles.cell, current && styles.current]}>
        <Text style={[styles.san, !played && styles.upcoming, current && styles.currentText]}>{steps[index]!.san}</Text>
      </View>
    );
  };

  if (pairs.length === 0) {
    return <Text style={styles.placeholder}>Moves will appear here.</Text>;
  }

  return (
    <ScrollView
      ref={scroll}
      style={styles.list}
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {pairs.map((pair, i) => (
        <View
          key={pair.number}
          style={styles.pair}
          onLayout={(e) => {
            pairOffsets.current[i] = e.nativeEvent.layout.x;
          }}
        >
          <Text style={styles.number}>{pair.number}.</Text>
          {cell(pair.white)}
          {cell(pair.black)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 0 },
  content: { gap: spacing.sm, paddingVertical: spacing.xs },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  number: { ...typography.caption, color: colors.textFaint, marginRight: 2 },
  cell: { minWidth: 40, paddingHorizontal: 6, paddingVertical: 4, borderRadius: radius.sm },
  current: { backgroundColor: colors.surfaceRaised },
  san: { ...typography.mono, color: colors.text, fontWeight: '600' },
  upcoming: { color: colors.textFaint },
  currentText: { color: colors.accent },
  placeholder: { ...typography.caption, color: colors.textFaint, paddingVertical: spacing.sm },
});
