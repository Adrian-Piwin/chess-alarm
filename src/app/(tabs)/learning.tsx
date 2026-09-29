import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, ProgressBar, Screen, SideBadge } from '@/components/ui';
import { getOpening, OPENINGS } from '@/data/openings';
import { summarizeOpening } from '@/domain/progress';
import { pickPracticeTarget, PICK_MODE_LABELS, type PickMode } from '@/domain/scheduler';
import type { Opening } from '@/domain/types';
import { AlarmSettingsCard } from '@/features/alarm/AlarmSettingsCard';
import { useBannerStore } from '@/store/bannerStore';
import { useLearningStore } from '@/store/learningStore';
import { useProgressStore } from '@/store/progressStore';
import { colors, radius, spacing, typography } from '@/theme';

const PICK_MODE_HELP: Record<PickMode, string> = {
  sequential: 'Focus on one opening at a time, top of your list first, until it’s mastered.',
  'random-learning': 'Each session picks a random opening from your learning list.',
  'fully-random': 'Anything goes — a random opening from the whole catalogue.',
};

export default function LearningScreen() {
  const learningIds = useLearningStore((s) => s.learningIds);
  const pickMode = useLearningStore((s) => s.pickMode);
  const setPickMode = useLearningStore((s) => s.setPickMode);
  const toggleLearning = useLearningStore((s) => s.toggleLearning);
  const progress = useProgressStore((s) => s.progress);
  const showBanner = useBannerStore((s) => s.show);

  const learning = learningIds.map(getOpening).filter((o): o is Opening => o !== undefined);

  const practiseNow = () => {
    const mode = learning.length === 0 ? 'fully-random' : pickMode;
    const target = pickPracticeTarget({ openings: OPENINGS, learningIds, progress, mode });
    if (!target) {
      showBanner({ tone: 'mastered', title: 'All mastered!', message: 'Flag a new opening to keep learning.' });
      return;
    }
    router.push(`/train/${target.opening.id}/${target.line.id}?mode=${target.mode}`);
  };

  return (
    <Screen>
      <Card style={styles.hero}>
        <Text style={styles.title}>Daily drill</Text>
        <Text style={styles.body}>
          Play one line from your rotation — exactly what the alarm will ask for. New lines start at Level 1, known
          lines at Level 2.
        </Text>
        <Button label="Practice now" icon="flash" size="lg" onPress={practiseNow} />
      </Card>

      <Text style={styles.section}>Alarm</Text>
      <AlarmSettingsCard />

      <Text style={styles.section}>What to practise</Text>
      <View style={styles.chips}>
        {(Object.keys(PICK_MODE_LABELS) as PickMode[]).map((mode) => (
          <Chip
            key={mode}
            label={PICK_MODE_LABELS[mode]}
            selected={pickMode === mode}
            onPress={() => setPickMode(mode)}
          />
        ))}
      </View>
      <Text style={styles.caption}>{PICK_MODE_HELP[pickMode]}</Text>

      <Text style={styles.section}>Learning list</Text>
      {learning.length === 0 ? (
        <Card style={styles.empty}>
          <Ionicons name="bookmark-outline" size={28} color={colors.textMuted} />
          <Text style={styles.body}>
            You’re not learning anything yet. Open an opening and tap “Learn this opening”, or let the alarm pick at
            random.
          </Text>
          <Button label="Browse openings" icon="grid" variant="secondary" onPress={() => router.navigate('/')} />
        </Card>
      ) : (
        <View style={styles.list}>
          {learning.map((opening, index) => {
            const summary = summarizeOpening(opening, progress);
            return (
              <View key={opening.id} style={styles.row}>
                <Link href={`/opening/${opening.id}`} asChild>
                  <Pressable style={styles.rowMain} accessibilityRole="link" accessibilityLabel={opening.name}>
                    <Text style={styles.index}>{index + 1}</Text>
                    <View style={{ flex: 1, gap: 6 }}>
                      <View style={styles.rowTitle}>
                        <Text style={styles.name}>{opening.name}</Text>
                        {summary.mastered ? <Ionicons name="trophy" size={16} color={colors.accent} /> : null}
                      </View>
                      <View style={styles.rowTitle}>
                        <SideBadge side={opening.side} />
                        <Text style={styles.caption}>
                          {summary.linesMastered}/{summary.lineCount} lines mastered
                        </Text>
                      </View>
                      <ProgressBar value={summary.stars / summary.maxStars} height={4} />
                    </View>
                  </Pressable>
                </Link>
                <Pressable
                  onPress={() => toggleLearning(opening.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Stop learning ${opening.name}`}
                  style={styles.remove}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.md },
  title: { ...typography.title, color: colors.text },
  body: { ...typography.body, color: colors.textMuted, lineHeight: 21 },
  section: { ...typography.heading, color: colors.text, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  caption: { ...typography.caption, color: colors.textMuted },
  empty: { alignItems: 'center', gap: spacing.md },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: spacing.sm,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  index: { ...typography.heading, color: colors.textFaint, width: 20, textAlign: 'center' },
  name: { ...typography.bodyStrong, color: colors.text },
  remove: { padding: spacing.sm },
});
