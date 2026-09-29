/**
 * Opens the alarm session when an alarm notification is tapped, or when one
 * fires while the app is open. Also keeps the schedule in sync with settings.
 *
 * `enabled` must only become true once stores are hydrated and the navigator
 * is mounted, otherwise the cold-start redirect has nowhere to go.
 */
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { alarmSession } from './alarmSession';
import { configureNotifications, isAlarmNotification, syncAlarmSchedule } from './alarmService';

function openAlarm() {
  if (!alarmSession.isActive()) router.push('/alarm');
}

export function useAlarmRouting(enabled: boolean): void {
  const alarm = useSettingsStore((s) => s.alarm);
  const lastSolvedAt = useSettingsStore((s) => s.lastAlarmSolvedAt);

  useEffect(() => {
    configureNotifications().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    syncAlarmSchedule(alarm, lastSolvedAt).catch(() => undefined);
  }, [enabled, alarm, lastSolvedAt]);

  useEffect(() => {
    if (!enabled) return;
    // Cold start from a tapped notification.
    const last = Notifications.getLastNotificationResponse();
    if (last && isAlarmNotification(last.notification)) {
      Notifications.clearLastNotificationResponse();
      openAlarm();
    }
    const tapped = Notifications.addNotificationResponseReceivedListener((response) => {
      if (isAlarmNotification(response.notification)) {
        Notifications.clearLastNotificationResponse();
        openAlarm();
      }
    });
    const received = Notifications.addNotificationReceivedListener((notification) => {
      if (isAlarmNotification(notification)) openAlarm();
    });
    return () => {
      tapped.remove();
      received.remove();
    };
  }, [enabled]);
}
