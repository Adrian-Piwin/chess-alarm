import { StyleSheet, Text, View } from 'react-native';
import type { Color } from '@/domain/chess';
import { colors, radius, spacing, typography } from '@/theme';

/** "Play as White/Black" pill with a little piece-coloured dot. */
export function SideBadge({ side }: { side: Color }) {
  const white = side === 'w';
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: white ? '#F4F4F4' : '#1B1B1B' }]} />
      <Text style={styles.label}>{white ? 'White' : 'Black'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.textFaint },
  label: { ...typography.caption, color: colors.textMuted },
});
