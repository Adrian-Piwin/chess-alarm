/**
 * The wake-up session. Opened from an alarm notification; there is no back
 * button — the only way out is to play the line to the end.
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { OPENINGS } from '@/data/openings';
import { pickPracticeTarget, type PracticeTarget } from '@/domain/scheduler';
import { MODE_LABELS } from '@/domain/types';
import { alarmSession } from '@/features/alarm/alarmSession';
import { dismissAlarmNotifications } from '@/features/alarm/alarmService';
import { startAlarmLoop, stopAlarmLoop } from '@/features/sound/sounds';
import { TrainerView } from '@/features/trainer/TrainerView';
import { useLearningStore } from '@/store/learningStore';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, CONTENT_MAX_WIDTH, radius, spacing, typography } from '@/theme';

function chooseTarget(): PracticeTarget | null {
  const { learningIds, pickMode } = useLearningStore.getState();
  const progress = useProgressStore.getState().progress;
  // With nothing flagged, fall back to the whole catalogue so the alarm still works.
  const mode = learningIds.length === 0 ? 'fully-random' : pickMode;
  return pickPracticeTarget({ openings: OPENINGS, learningIds, progress, mode });
}

export default function AlarmScreen() {
  const [target] = useState(chooseTarget);
  const [solved, setSolved] = useState(false);
  const markSolved = useSettingsStore((s) => s.update);

  useEffect(() => {
    alarmSession.setActive(true);
    startAlarmLoop();
    return () => {
      alarmSession.setActive(false);
      stopAlarmLoop();
    };
  }, []);

  // Android hardware back does nothing until the alarm is solved.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => !solved);
      return () => sub.remove();
    }, [solved]),
  );

  const finish = useCallback(() => {
    setSolved(true);
    stopAlarmLoop();
    markSolved({ lastAlarmSolvedAt: Date.now() });
    dismissAlarmNotifications().catch(() => undefined);
  }, [markSolved]);

  const leave = (href: '/' | '/learning') => {
    if (router.canDismiss()) router.dismissAll();
    router.replace(href);
  };

  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.column}>
        <View style={styles.header}>
          <Ionicons name={solved ? 'sunny' : 'alarm'} size={28} color={solved ? colors.accent : colors.danger} />
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.headline}>
            {solved
              ? 'Good morning! Alarm off.'
              : target
                ? 'Play this line to switch off the alarm'
                : 'Rise and shine!'}
          </Text>
        </View>

        {target ? (
          <TrainerView
            opening={target.opening}
            line={target.line}
            mode={target.mode}
            onFirstInteraction={stopAlarmLoop}
            renderComplete={() => <SessionDone onReady={finish} onLeave={() => leave('/learning')} solved={solved} />}
            renderToolbar={() => (
              <Text style={styles.hint}>
                {MODE_LABELS[target.mode]} — {target.mode === 'guided' ? 'follow the arrows' : 'from memory'}. The alarm
                stops once you reach the end.
              </Text>
            )}
          />
        ) : (
          <Card style={styles.allDone}>
            <Ionicons name="trophy" size={40} color={colors.accent} />
            <Text style={styles.headline}>Everything you’re learning is mastered.</Text>
            <Text style={styles.hint}>Pick a new opening to learn for tomorrow’s alarm.</Text>
            <Button
              label="Choose a new opening"
              icon="grid"
              size="lg"
              onPress={() => {
                finish();
                leave('/');
              }}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionDone({ onReady, onLeave, solved }: { onReady: () => void; onLeave: () => void; solved: boolean }) {
  useEffect(() => {
    if (!solved) onReady();
  }, [onReady, solved]);
  return <Button label="I’m up — close alarm" icon="sunny" size="lg" onPress={onLeave} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: { alignItems: 'center', gap: spacing.xs },
  time: { ...typography.display, fontSize: 44, color: colors.text },
  headline: { ...typography.heading, color: colors.text, textAlign: 'center' },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  allDone: { alignItems: 'center', gap: spacing.md, borderRadius: radius.lg },
});
