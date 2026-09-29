import { describeWeekdays, formatAlarmTime, NAG_COUNT, nagTimes, nextOccurrence, upcomingOccurrences, type AlarmConfig } from '../alarmSchedule';

// Wednesday 1 October 2025, 06:00 local time.
const NOW = new Date(2025, 9, 1, 6, 0, 0);
const WEEKDAYS: AlarmConfig = { enabled: true, hour: 7, minute: 30, weekdays: [1, 2, 3, 4, 5] };

describe('alarm schedule', () => {
  it('lists upcoming weekday occurrences', () => {
    const next = upcomingOccurrences(WEEKDAYS, NOW);
    expect(next[0]).toEqual(new Date(2025, 9, 1, 7, 30));
    expect(next.every((d) => d.getDay() >= 1 && d.getDay() <= 5)).toBe(true);
  });

  it('returns nothing when disabled', () => {
    expect(upcomingOccurrences({ ...WEEKDAYS, enabled: false }, NOW)).toEqual([]);
    expect(nextOccurrence({ ...WEEKDAYS, weekdays: [] }, NOW)).toBeNull();
  });

  it('schedules nags after each occurrence', () => {
    const nags = nagTimes(WEEKDAYS, NOW, null);
    expect(nags[0]).toEqual(new Date(2025, 9, 1, 7, 31));
    expect(nags).toHaveLength(upcomingOccurrences(WEEKDAYS, NOW).length * NAG_COUNT);
  });

  it('drops the remaining nags once today’s alarm is solved', () => {
    const during = new Date(2025, 9, 1, 7, 32);
    const solvedAt = during.getTime();
    const nags = nagTimes(WEEKDAYS, during, solvedAt);
    expect(nags.every((d) => d.getDate() !== 1)).toBe(true);
    // Without solving, the 07:33+ nags remain.
    expect(nagTimes(WEEKDAYS, during, null)[0]).toEqual(new Date(2025, 9, 1, 7, 33));
  });

  it('formats times and weekdays for humans', () => {
    expect(formatAlarmTime(7, 5)).toBe('7:05 AM');
    expect(formatAlarmTime(0, 0)).toBe('12:00 AM');
    expect(formatAlarmTime(13, 30)).toBe('1:30 PM');
    expect(describeWeekdays([1, 2, 3, 4, 5])).toBe('Weekdays');
    expect(describeWeekdays([0, 6])).toBe('Weekends');
    expect(describeWeekdays([0, 1, 2, 3, 4, 5, 6])).toBe('Every day');
    expect(describeWeekdays([1, 3])).toBe('Mon, Wed');
  });
});
