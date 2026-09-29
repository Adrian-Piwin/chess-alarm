import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_ALARM, type AlarmConfig } from '@/domain/alarmSchedule';
import { DEFAULT_BOARD_THEME, type BoardThemeId } from '@/theme/boardThemes';
import { persistStorage, storageKey } from './storage';

interface SettingsState {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showCoordinates: boolean;
  boardTheme: BoardThemeId;
  alarm: AlarmConfig;
  /** When the last alarm session was completed (ms since epoch). */
  lastAlarmSolvedAt: number | null;
  update: (patch: Partial<Omit<SettingsState, 'update' | 'updateAlarm'>>) => void;
  updateAlarm: (patch: Partial<AlarmConfig>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticsEnabled: true,
      showCoordinates: true,
      boardTheme: DEFAULT_BOARD_THEME,
      alarm: DEFAULT_ALARM,
      lastAlarmSolvedAt: null,
      update: (patch) => set(patch),
      updateAlarm: (patch) => set((s) => ({ alarm: { ...s.alarm, ...patch } })),
    }),
    { name: storageKey('settings'), storage: persistStorage, version: 1 },
  ),
);
