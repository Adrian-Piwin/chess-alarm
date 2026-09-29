import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MiniBoard } from '@/components/board/MiniBoard';
import { ProgressBar, SideBadge, Stars } from '@/components/ui';
import type { OpeningSummary } from '@/domain/progress';
import type { Opening } from '@/domain/types';
import { colors, radius, spacing, typography } from '@/theme';

interface OpeningCardProps {
  opening: Opening;
  summary: OpeningSummary;
  learning: boolean;
  width: number;
}

const DIFFICULTY_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as const;

export const OpeningCard = memo(function OpeningCard({ opening, summary, learning, width }: OpeningCardProps) {
  const boardSize = Math.floor(width - spacing.md * 2);
  const starsOnAverage = summary.lineCount ? Math.floor(summary.stars / summary.lineCount) : 0;
  return (
    <Link href={`/opening/${opening.id}`} asChild>
      <Pressable
        // Link's asChild slot doesn't forward function styles, so keep this static.
        style={StyleSheet.flatten([styles.card, { width }])}
        accessibilityRole="link"
        accessibilityLabel={`${opening.name}, play as ${opening.side === 'w' ? 'White' : 'Black'}`}
      >
        <View>
          <MiniBoard moves={opening.lines[0]!.moves} size={boardSize} orientation={opening.side} />
          {summary.mastered ? (
            <View style={[styles.flag, styles.masteredFlag]}>
              <Ionicons name="trophy" size={13} color={colors.background} />
              <Text style={styles.flagText}>Mastered</Text>
            </View>
          ) : learning ? (
            <View style={[styles.flag, styles.learningFlag]}>
              <Ionicons name="bookmark" size={12} color={colors.primaryText} />
              <Text style={styles.flagText}>Learning</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {opening.name}
          </Text>
          <View style={styles.meta}>
            <SideBadge side={opening.side} />
            <Text style={styles.metaText}>
              {opening.eco} · {DIFFICULTY_LABEL[opening.difficulty]}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Stars count={starsOnAverage} size={13} />
            <Text style={styles.metaText}>
              {summary.linesMastered}/{summary.lineCount} lines
            </Text>
          </View>
          <ProgressBar
            value={summary.stars / summary.maxStars}
            height={4}
            color={summary.mastered ? colors.accent : colors.primary}
          />
        </View>
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  body: { gap: spacing.sm },
  name: { ...typography.heading, color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  metaText: { ...typography.caption, color: colors.textMuted },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flag: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  learningFlag: { backgroundColor: colors.primary },
  masteredFlag: { backgroundColor: colors.accent },
  flagText: { ...typography.caption, fontSize: 11, fontWeight: '800', color: colors.background },
});
