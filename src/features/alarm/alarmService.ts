/**
 * Native alarm scheduling on top of expo-notifications.
 *
 * - The alarm itself is one WEEKLY repeating notification per selected
 *   weekday, so it keeps firing even if the app is never reopened.
 * - "Nag" follow-ups (every minute for a few minutes) are one-shot DATE
 *   notifications scheduled for the next week. They are re-synced whenever
 *   the app starts or an alarm is solved, which cancels the ones for an
 *   alarm that has already been answered.
 *
 * The web build uses `alarmService.web.ts` instead.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { nagTimes, type AlarmConfig } from '@/domain/alarmSchedule';

export const ALARM_SUPPORTED = true;

export const ALARM_CHANNEL_ID = 'wake-up-alarm';
const ALARM_SOUND = 'alarm.wav';
const ID_PREFIX = 'chess-alarm-';

export type AlarmNotificationData = { type: 'alarm' };

export function isAlarmNotification(notification: Notifications.Notification): boolean {
  return (notification.request.content.data as Partial<AlarmNotificationData> | undefined)?.type === 'alarm';
}

/** Call once at startup: foreground presentation and the Android channel. */
export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: 'Wake-up alarm',
      description: 'Rings until you play your opening line.',
      importance: Notifications.AndroidImportance.MAX,
      sound: ALARM_SOUND,
      vibrationPattern: [0, 600, 400, 600, 400, 600],
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      audioAttributes: { usage: Notifications.AndroidAudioUsage.ALARM },
    });
  }
}

export async function requestAlarmPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return requested.granted;
}

function content(nag: boolean): Notifications.NotificationContentInput {
  return {
    title: nag ? '⏰ Still asleep?' : '⏰ Rise and play!',
    body: nag
      ? 'Your alarm is still ringing. Play the line to switch it off.'
      : 'Play today’s opening line to switch off the alarm.',
    sound: ALARM_SOUND,
    data: { type: 'alarm' } satisfies AlarmNotificationData,
    interruptionLevel: 'timeSensitive',
    priority: Notifications.AndroidNotificationPriority.MAX,
    sticky: true,
  };
}

async function cancelOurNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Replaces every scheduled alarm notification to match `config`. */
export async function syncAlarmSchedule(config: AlarmConfig, lastSolvedAt: number | null): Promise<void> {
  await cancelOurNotifications();
  if (!config.enabled || config.weekdays.length === 0) return;

  const channelId = Platform.OS === 'android' ? ALARM_CHANNEL_ID : undefined;
  const requests: Promise<string>[] = config.weekdays.map((weekday) =>
    Notifications.scheduleNotificationAsync({
      identifier: `${ID_PREFIX}main-${weekday}`,
      content: content(false),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        // expo-notifications counts weekdays 1 (Sunday) … 7 (Saturday).
        weekday: weekday + 1,
        hour: config.hour,
        minute: config.minute,
        channelId,
      },
    }),
  );
  nagTimes(config, new Date(), lastSolvedAt).forEach((date) =>
    requests.push(
      Notifications.scheduleNotificationAsync({
        identifier: `${ID_PREFIX}nag-${date.getTime()}`,
        content: content(true),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId },
      }),
    ),
  );
  await Promise.all(requests);
}

/** Schedules a one-off alarm a few seconds from now, to try it out. */
export async function scheduleTestAlarm(seconds = 5): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: `${ID_PREFIX}test-${Date.now()}`,
    content: content(false),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: Platform.OS === 'android' ? ALARM_CHANNEL_ID : undefined,
    },
  });
}

/** Clears alarm notifications still showing in the notification centre. */
export async function dismissAlarmNotifications(): Promise<void> {
  const presented = await Notifications.getPresentedNotificationsAsync();
  await Promise.all(
    presented.filter(isAlarmNotification).map((n) => Notifications.dismissNotificationAsync(n.request.identifier)),
  );
}
