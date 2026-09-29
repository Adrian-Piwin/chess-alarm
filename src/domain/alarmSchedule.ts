/**
 * Alarm timing maths, kept free of any notification API so it can be tested.
 *
 * An alarm fires at `hour:minute` on each selected weekday. After each firing
 * we "nag" with follow-up notifications every minute until the line is played.
 */

export interface AlarmConfig {
  enabled: boolean;
  hour: number;
  minute: number;
  /** 0 = Sunday … 6 = Saturday (JavaScript `Date#getDay`). */
  weekdays: number[];
}

export const DEFAULT_ALARM: AlarmConfig = {
  enabled: false,
  hour: 7,
  minute: 0,
  weekdays: [1, 2, 3, 4, 5],
};

export const NAG_COUNT = 5;
export const NAG_INTERVAL_MINUTES = 1;
/** How far ahead one-shot nag notifications are scheduled. */
export const SCHEDULE_WINDOW_DAYS = 7;

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Upcoming alarm times within the next `days` days, soonest first. */
export function upcomingOccurrences(config: AlarmConfig, now: Date, days = SCHEDULE_WINDOW_DAYS): Date[] {
  if (!config.enabled || config.weekdays.length === 0) return [];
  const result: Date[] = [];
  for (let offset = 0; offset <= days; offset += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, config.hour, config.minute, 0, 0);
    if (config.weekdays.includes(d.getDay()) && d.getTime() > now.getTime() - NAG_COUNT * 60_000) {
      result.push(d);
    }
  }
  return result;
}

/**
 * The nag times still worth scheduling: every NAG_INTERVAL_MINUTES after each
 * occurrence, in the future, and not for an occurrence already solved.
 */
export function nagTimes(config: AlarmConfig, now: Date, lastSolvedAt: number | null): Date[] {
  const times: Date[] = [];
  for (const occurrence of upcomingOccurrences(config, now)) {
    if (lastSolvedAt !== null && lastSolvedAt >= occurrence.getTime()) continue;
    for (let i = 1; i <= NAG_COUNT; i += 1) {
      const t = new Date(occurrence.getTime() + i * NAG_INTERVAL_MINUTES * 60_000);
      if (t.getTime() > now.getTime()) times.push(t);
    }
  }
  return times;
}

export function nextOccurrence(config: AlarmConfig, now: Date): Date | null {
  return upcomingOccurrences(config, now).find((d) => d.getTime() > now.getTime()) ?? null;
}

export function formatAlarmTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function describeWeekdays(weekdays: readonly number[]): string {
  const sorted = [...weekdays].sort();
  if (sorted.length === 7) return 'Every day';
  if (sorted.join() === '1,2,3,4,5') return 'Weekdays';
  if (sorted.join() === '0,6') return 'Weekends';
  if (sorted.length === 0) return 'Never';
  return sorted.map((d) => WEEKDAY_SHORT[d]).join(', ');
}
