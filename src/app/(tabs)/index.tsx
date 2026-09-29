import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { OpeningCard } from '@/components/OpeningCard';
import { Button, Chip, Screen } from '@/components/ui';
import { WebHero } from '@/components/WebHero';
import { OPENINGS } from '@/data/openings';
import type { Color } from '@/domain/chess';
import { summarizeOpening } from '@/domain/progress';
import { pickRandom } from '@/domain/scheduler';
import { useLearningStore } from '@/store/learningStore';
import { useProgressStore } from '@/store/progressStore';
import { colors, CONTENT_MAX_WIDTH, radius, spacing, typography } from '@/theme';

type SideFilter = 'all' | Color | 'learning';

const GAP = spacing.md;

function columnsFor(width: number) {
  if (width < 520) return 2;
  if (width < 860) return 3;
  return 4;
}

export default function CatalogueScreen() {
  const { width } = useWindowDimensions();
  const progress = useProgressStore((s) => s.progress);
  const learningIds = useLearningStore((s) => s.learningIds);
  const [filter, setFilter] = useState<SideFilter>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OPENINGS.filter((o) => {
      if (filter === 'learning' && !learningIds.includes(o.id)) return false;
      if ((filter === 'w' || filter === 'b') && o.side !== filter) return false;
      return !q || o.name.toLowerCase().includes(q) || o.eco.toLowerCase().includes(q);
    });
  }, [filter, query, learningIds]);

  const columns = columnsFor(width);
  const innerWidth = Math.min(width, CONTENT_MAX_WIDTH) - spacing.lg * 2;
  const cardWidth = Math.floor((innerWidth - GAP * (columns - 1)) / columns);

  const surpriseMe = () => {
    const pool = visible.length ? visible : OPENINGS;
    const choice = pickRandom(pool);
    if (choice) router.push(`/opening/${choice.id}`);
  };

  return (
    <Screen>
      {Platform.OS === 'web' ? <WebHero /> : null}

      <View style={styles.toolbar}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search openings or ECO code"
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
            accessibilityLabel="Search openings"
            autoCorrect={false}
          />
        </View>
        <Button label="Surprise me" icon="shuffle" variant="secondary" onPress={surpriseMe} />
      </View>

      <View style={styles.filters}>
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Play as White" selected={filter === 'w'} onPress={() => setFilter('w')} />
        <Chip label="Play as Black" selected={filter === 'b'} onPress={() => setFilter('b')} />
        <Chip label="Learning" icon="bookmark" selected={filter === 'learning'} onPress={() => setFilter('learning')} />
      </View>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {filter === 'learning' ? 'No openings flagged yet' : 'No openings found'}
          </Text>
          <Text style={styles.emptyText}>
            {filter === 'learning'
              ? 'Open any opening and tap “Learn this opening” to add it to your rotation.'
              : 'Try a different search.'}
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {visible.map((opening) => (
            <OpeningCard
              key={opening.id}
              opening={opening}
              summary={summarizeOpening(opening, progress)}
              learning={learningIds.includes(opening.id)}
              width={cardWidth}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchInput: { flex: 1, color: colors.text, ...typography.body, paddingVertical: spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyTitle: { ...typography.heading, color: colors.text },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', maxWidth: 360 },
});
