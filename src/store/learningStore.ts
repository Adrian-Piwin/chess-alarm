import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PickMode } from '@/domain/scheduler';
import { persistStorage, storageKey } from './storage';

interface LearningState {
  /** Openings flagged "Learning", in the order they were added. */
  learningIds: string[];
  pickMode: PickMode;
  toggleLearning: (openingId: string) => void;
  setLearning: (openingId: string, learning: boolean) => void;
  setPickMode: (mode: PickMode) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      learningIds: [],
      pickMode: 'sequential',
      toggleLearning: (id) =>
        set((s) => ({
          learningIds: s.learningIds.includes(id) ? s.learningIds.filter((x) => x !== id) : [...s.learningIds, id],
        })),
      setLearning: (id, learning) =>
        set((s) => {
          const has = s.learningIds.includes(id);
          if (learning === has) return s;
          return { learningIds: learning ? [...s.learningIds, id] : s.learningIds.filter((x) => x !== id) };
        }),
      setPickMode: (pickMode) => set({ pickMode }),
    }),
    { name: storageKey('learning'), storage: persistStorage, version: 1 },
  ),
);
