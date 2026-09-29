import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOpening } from '@/data/openings';
import { recordSession, type ProgressEvent, type ProgressMap } from '@/domain/progress';
import type { TrainerMode } from '@/domain/types';
import { persistStorage, storageKey } from './storage';

interface ProgressState {
  progress: ProgressMap;
  /** Records a finished session and returns what was achieved. */
  completeSession: (openingId: string, lineId: string, mode: TrainerMode, flawless: boolean) => ProgressEvent[];
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      completeSession: (openingId, lineId, mode, flawless) => {
        const opening = getOpening(openingId);
        if (!opening) return [];
        const result = recordSession(get().progress, opening, lineId, mode, flawless, Date.now());
        set({ progress: result.progress });
        return result.events;
      },
      resetProgress: () => set({ progress: {} }),
    }),
    {
      name: storageKey('progress'),
      storage: persistStorage,
      version: 1,
      partialize: (s) => ({ progress: s.progress }),
    },
  ),
);
