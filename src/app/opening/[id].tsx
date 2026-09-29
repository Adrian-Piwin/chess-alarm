import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MiniBoard } from '@/components/board/MiniBoard';
import { Button, Card, ProgressBar, Screen, SideBadge, Stars } from '@/components/ui';
import { getOpening } from '@/data/openings';
import {
  getLineProgress,
  isLineMastered,
  isModeUnlocked,
  MAX_STARS,
  recommendedMode,
  summarizeOpening,
  type LineProgress,
} from '@/domain/progress';
import { MODE_LABELS, type Opening, type OpeningLine, type TrainerMode } from '@/domain/types';
import { useLearningStore } from '@/store/learningStore';
import { useProgressStore } from '@/store/progressStore';
import { colors, radius, spacing, typography } from '@/theme';

function trainHref(openingId: string, lineId: string, mode: TrainerMode) {
  return `/train/${openingId}/${lineId}?mode=${mode}` as const;
}

export default function OpeningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const opening = getOpening(id);
  const { width } = useWindowDimensions();
  const progress = useProgressStore((s) => s.progress);
  const learning = useLearningStore((s) => (opening ? s.learningIds.includes(opening.id) : false));
  const toggleLearning = useLearningStore((s) => s.toggleLearning);

  if (!opening) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={styles.summary}>That opening doesn’t exist.</Text>
        <Button label="Back to openings" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const summary = summarizeOpening(opening, progress);
  const wide = width >= 860;
  const boardSize = Math.min(wide ? 360 : width - spacing.lg * 2, 420);
  const next = opening.lines.find((l) => !isLineMastered(getLineProgress(progress, opening.id, l.id)));

  const continueStudy = () => {
    const target = next ?? opening.lines[0]!;
    const lp = getLineProgress(progress, opening.id, target.id);
    router.push(trainHref(opening.id, target.id, next ? recommendedMode(lp) : 'recall'));
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: opening.name }} />
      <View style={[styles.top, wide && styles.topWide]}>
        <MiniBoard moves={opening.lines[0]!.moves} size={boardSize} orientation={opening.side} />
        <View style={styles.info}>
          <View style={styles.metaRow}>
            <SideBadge side={opening.side} />
            <Text style={styles.meta}>
              ECO {opening.eco} · {opening.difficulty[0]!.toUpperCase() + opening.difficulty.slice(1)}
            </Text>
          </View>
          <Text style={styles.title}>{opening.name}</Text>
          <Text style={styles.summary}>{opening.summary}</Text>

          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                {summary.mastered ? 'Mastered' : `${summary.linesMastered} of ${summary.lineCount} lines mastered`}
              </Text>
              {summary.mastered ? <Ionicons name="trophy" size={20} color={colors.accent} /> : null}
            </View>
            <ProgressBar
              value={summary.stars / summary.maxStars}
              color={summary.mastered ? colors.accent : colors.primary}
            />
            <Text style={styles.meta}>
              {summary.stars} / {summary.maxStars} stars
            </Text>
          </Card>

          <View style={styles.actions}>
            <Button
              label={summary.mastered ? 'Practise again' : summary.started ? 'Continue' : 'Start learning'}
              icon="play"
              size="lg"
              onPress={continueStudy}
              style={styles.flex}
            />
            <Button
              label={learning ? 'Learning' : 'Learn this opening'}
              icon={learning ? 'bookmark' : 'bookmark-outline'}
              variant={learning ? 'secondary' : 'ghost'}
              size="lg"
              onPress={() => toggleLearning(opening.id)}
              accessibilityHint="Adds this opening to your learning rotation and wake-up alarm"
              style={styles.flex}
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lines</Text>
      <View style={styles.lines}>
        {opening.lines.map((line) => (
          <LineRow
            key={line.id}
            opening={opening}
            line={line}
            progress={getLineProgress(progress, opening.id, line.id)}
          />
        ))}
      </View>
    </Screen>
  );
}

function LineRow({ opening, line, progress }: { opening: Opening; line: OpeningLine; progress: LineProgress }) {
  const mastered = isLineMastered(progress);
  const status = mastered
    ? 'Mastered'
    : progress.level1Complete
      ? `Level 2 · ${progress.stars}/${MAX_STARS} flawless runs`
      : progress.watched
        ? 'Ready for Level 1'
        : 'New';
  const learnerMoves = line.moves.filter((_, i) => (opening.side === 'w' ? i % 2 === 0 : i % 2 === 1)).length;

  return (
    <View style={styles.lineRow}>
      <Pressable
        style={styles.lineMain}
        onPress={() => router.push(trainHref(opening.id, line.id, recommendedMode(progress)))}
        accessibilityRole="button"
        accessibilityLabel={`Study ${line.name}`}
      >
        <View style={styles.flex}>
          <Text style={styles.lineName}>{line.name}</Text>
          <Text style={styles.meta}>
            {learnerMoves} moves to learn · {status}
          </Text>
        </View>
        <Stars count={progress.stars} />
      </Pressable>
      <View style={styles.levels}>
        {(['demo', 'guided', 'recall'] as const).map((mode) => {
          const unlocked = isModeUnlocked(progress, mode);
          return (
            <Pressable
              key={mode}
              disabled={!unlocked}
              onPress={() => router.push(trainHref(opening.id, line.id, mode))}
              accessibilityRole="button"
              accessibilityLabel={`${MODE_LABELS[mode]}${unlocked ? '' : ' (complete Level 1 to unlock)'}`}
              style={({ pressed }) => [styles.level, !unlocked && styles.levelLocked, pressed && { opacity: 0.8 }]}
            >
              {!unlocked ? <Ionicons name="lock-closed" size={12} color={colors.textFaint} /> : null}
              <Text style={[styles.levelText, !unlocked && { color: colors.textFaint }]}>{MODE_LABELS[mode]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { gap: spacing.lg },
  topWide: { flexDirection: 'row', alignItems: 'flex-start' },
  info: { flex: 1, gap: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { ...typography.caption, color: colors.textMuted },
  title: { ...typography.display, color: colors.text },
  summary: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  progressCard: { gap: spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { ...typography.bodyStrong, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  lines: { gap: spacing.sm },
  lineRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  lineMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lineName: { ...typography.bodyStrong, color: colors.text },
  levels: { flexDirection: 'row', gap: spacing.sm },
  level: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  levelLocked: { opacity: 0.6 },
  levelText: { ...typography.caption, color: colors.text, fontWeight: '700' },
});
