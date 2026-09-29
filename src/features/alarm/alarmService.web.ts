/**
 * Web stub: browsers can't reliably wake a sleeping device, so the alarm is a
 * mobile-only feature. The UI checks ALARM_SUPPORTED and promotes the app.
 */
import type { AlarmConfig } from '@/domain/alarmSchedule';

export const ALARM_SUPPORTED = false;

export async function configureNotifications(): Promise<void> {}
export async function requestAlarmPermission(): Promise<boolean> {
  return false;
}
export async function syncAlarmSchedule(_config: AlarmConfig, _lastSolvedAt: number | null): Promise<void> {}
export async function scheduleTestAlarm(_seconds?: number): Promise<void> {}
export async function dismissAlarmNotifications(): Promise<void> {}
