import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, SettingRow } from '@/components/ui';
import { describeWeekdays, formatAlarmTime, nextOccurrence, WEEKDAY_SHORT } from '@/domain/alarmSchedule';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radius, spacing, typography } from '@/theme';
import { ALARM_SUPPORTED, requestAlarmPermission, scheduleTestAlarm } from './alarmService';

function notify(title: string, message: string) {
  if (Platform.OS === 'web') globalThis.alert?.(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

/** Alarm on/off, time, weekdays and a test button. Mobile only. */
export function AlarmSettingsCard() {
  const alarm = useSettingsStore((s) => s.alarm);
  const updateAlarm = useSettingsStore((s) => s.updateAlarm);
  const [testing, setTesting] = useState(false);

  if (!ALARM_SUPPORTED) return <AlarmPromoCard />;

  const setEnabled = async (enabled: boolean) => {
    if (enabled && !(await requestAlarmPermission())) {
      notify('Notifications are off', 'Allow notifications for Chess Alarm in Settings so the alarm can ring.');
      return;
    }
    updateAlarm({ enabled });
  };

  const shiftTime = (minutes: number) => {
    const total = (alarm.hour * 60 + alarm.minute + minutes + 24 * 60) % (24 * 60);
    updateAlarm({ hour: Math.floor(total / 60), minute: total % 60 });
  };

  const toggleDay = (day: number) => {
    const weekdays = alarm.weekdays.includes(day) ? alarm.weekdays.filter((d) => d !== day) : [...alarm.weekdays, day];
    updateAlarm({ weekdays: weekdays.sort() });
  };

  const test = async () => {
    if (!(await requestAlarmPermission())) {
      notify('Notifications are off', 'Allow notifications to test the alarm.');
      return;
    }
    setTesting(true);
    await scheduleTestAlarm(5);
    setTimeout(() => setTesting(false), 5000);
    notify('Test alarm set', 'It will ring in 5 seconds. Lock your phone to see it like a real alarm.');
  };

  const next = nextOccurrence(alarm, new Date());

  return (
    <Card style={styles.card}>
      <SettingRow
        label="Wake-up alarm"
        description="Rings until you play a line from your learning list."
        value={alarm.enabled}
        onValueChange={setEnabled}
      />
      <View style={[styles.body, !alarm.enabled && styles.disabled]} pointerEvents={alarm.enabled ? 'auto' : 'none'}>
        <View style={styles.timeRow}>
          <Stepper icon="remove" label="Earlier" onPress={() => shiftTime(-5)} />
          <Pressable onLongPress={() => shiftTime(60)} accessibilityHint="Long-press to add an hour">
            <Text style={styles.time}>{formatAlarmTime(alarm.hour, alarm.minute)}</Text>
          </Pressable>
          <Stepper icon="add" label="Later" onPress={() => shiftTime(5)} />
        </View>
        <View style={styles.hourRow}>
          <Chip label="−1 hour" onPress={() => shiftTime(-60)} />
          <Chip label="+1 hour" onPress={() => shiftTime(60)} />
        </View>
        <View style={styles.days}>
          {WEEKDAY_SHORT.map((name, day) => (
            <Chip key={name} label={name} selected={alarm.weekdays.includes(day)} onPress={() => toggleDay(day)} />
          ))}
        </View>
        <Text style={styles.caption}>
          {describeWeekdays(alarm.weekdays)}
          {next && alarm.enabled
            ? ` · next: ${next.toLocaleDateString([], { weekday: 'long' })} ${formatAlarmTime(next.getHours(), next.getMinutes())}`
            : ''}
        </Text>
      </View>
      <Button
        label={testing ? 'Ringing in 5s…' : 'Test the alarm'}
        icon="alarm-outline"
        variant="secondary"
        onPress={test}
        disabled={testing}
      />
    </Card>
  );
}

function Stepper({ icon, label, onPress }: { icon: 'add' | 'remove'; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.stepper, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={24} color={colors.text} />
    </Pressable>
  );
}

/** Shown on the web instead of the alarm settings. */
export function AlarmPromoCard() {
  return (
    <Card style={styles.card}>
      <View style={styles.promoRow}>
        <Ionicons name="phone-portrait-outline" size={28} color={colors.accent} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.promoTitle}>The wake-up alarm lives in the app</Text>
          <Text style={styles.promoText}>
            Browsers can’t wake your phone. Install Chess Alarm on iOS or Android and your alarm only stops once you’ve
            played a line from your learning list. Your “Practice now” sessions here work just the same.
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  body: { gap: spacing.md },
  disabled: { opacity: 0.45 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  hourRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  time: { ...typography.display, fontSize: 40, color: colors.text, minWidth: 190, textAlign: 'center' },
  stepper: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  caption: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  promoRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  promoTitle: { ...typography.bodyStrong, color: colors.text },
  promoText: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
});
