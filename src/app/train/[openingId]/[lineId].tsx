import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Screen, Stars } from '@/components/ui';
import { getOpening } from '@/data/openings';
import { getLineProgress, isLineMastered, MAX_STARS } from '@/domain/progress';
import { MODE_LABELS, type TrainerMode } from '@/domain/types';
import { TrainerView } from '@/features/trainer/TrainerView';
import type { SessionResult } from '@/features/trainer/useTrainerSession';
import { useProgressStore } from '@/store/progressStore';
import { colors, spacing, typography } from '@/theme';

const MODES: readonly TrainerMode[] = ['demo', 'guided', 'recall'];

function parseMode(value: string | undefined): TrainerMode {
  return MODES.includes(value as TrainerMode) ? (value as TrainerMode) : 'demo';
}

export default function TrainScreen() {
  const params = useLocalSearchParams<{ openingId: string; lineId: string; mode?: string }>();
  const opening = getOpening(params.openingId);
  const line = opening?.lines.find((l) => l.id === params.lineId);
  const progress = useProgressStore((s) => s.progress);
  const completeSession = useProgressStore((s) => s.completeSession);
  const [attempt, setAttempt] = useState(0);
  const requested = parseMode(params.mode);

  // Level 2 is locked until Level 1 has been completed once. Decided once per
  // navigation so finishing Level 1 doesn't swap the level under the learner.
  const mode = useMemo(() => {
    const p = getLineProgress(useProgressStore.getState().progress, params.openingId, params.lineId);
    return requested === 'recall' && !p.level1Complete ? 'guided' : requested;
  }, [requested, params.openingId, params.lineId]);

  if (!opening || !line) {
    return (
      <Screen>
        <Text style={styles.text}>That line doesn’t exist.</Text>
        <Button label="Back to openings" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const go = (lineId: string, nextMode: TrainerMode) =>
    router.replace(`/train/${opening.id}/${lineId}?mode=${nextMode}`);

  const index = opening.lines.indexOf(line);
  const nextLine = opening.lines
    .slice(index + 1)
    .find((l) => !isLineMastered(getLineProgress(progress, opening.id, l.id)));

  const renderComplete = (result: SessionResult) => {
    const stars = getLineProgress(progress, opening.id, line.id).stars;
    const nextLineButton = nextLine ? (
      <Button
        label={`Next line: ${nextLine.name}`}
        icon="arrow-forward"
        variant="secondary"
        onPress={() =>
          go(nextLine.id, getLineProgress(progress, opening.id, nextLine.id).level1Complete ? 'recall' : 'demo')
        }
      />
    ) : null;
    const back = <Button label="Back to opening" variant="ghost" onPress={() => router.back()} />;

    if (result.mode === 'demo') {
      return (
        <>
          <Button label="Start Level 1" icon="play" size="lg" onPress={() => go(line.id, 'guided')} />
          <Button label="Watch again" icon="refresh" variant="secondary" onPress={() => setAttempt((a) => a + 1)} />
        </>
      );
    }
    if (result.mode === 'guided') {
      return (
        <>
          <Button label="Start Level 2" icon="play" size="lg" onPress={() => go(line.id, 'recall')} />
          <Button label="Repeat Level 1" icon="refresh" variant="secondary" onPress={() => setAttempt((a) => a + 1)} />
          {back}
        </>
      );
    }
    return (
      <>
        <View style={styles.result}>
          <Stars count={stars} size={26} />
          <Text style={styles.resultTitle}>
            {result.flawless
              ? stars >= MAX_STARS
                ? 'Line mastered!'
                : 'Flawless — star earned!'
              : `${result.mistakes} ${result.mistakes === 1 ? 'mistake' : 'mistakes'}`}
          </Text>
          <Text style={styles.text}>
            {result.flawless
              ? stars >= MAX_STARS
                ? 'Three flawless runs. This line is yours.'
                : `${MAX_STARS - stars} more flawless ${MAX_STARS - stars === 1 ? 'run' : 'runs'} to master it.`
              : 'Play it again without a mistake to earn a star.'}
          </Text>
        </View>
        <Button label="Play again" icon="refresh" size="lg" onPress={() => setAttempt((a) => a + 1)} />
        {nextLineButton}
        {back}
      </>
    );
  };

  const renderToolbar =
    mode === 'demo'
      ? () => (
          <Button
            label="Skip to Level 1"
            icon="play-forward"
            variant="ghost"
            onPress={() => {
              completeSession(opening.id, line.id, 'demo', false);
              go(line.id, 'guided');
            }}
          />
        )
      : undefined;

  return (
    <Screen>
      <Stack.Screen options={{ title: `${MODE_LABELS[mode]} · ${opening.name}` }} />
      <TrainerView
        key={`${line.id}-${mode}-${attempt}`}
        opening={opening}
        line={line}
        mode={mode}
        renderComplete={renderComplete}
        renderToolbar={renderToolbar}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  result: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  resultTitle: { ...typography.title, color: colors.text },
});
