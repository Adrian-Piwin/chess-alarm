import { create } from 'zustand';

export type BannerTone = 'success' | 'star' | 'mastered' | 'info';

export interface Banner {
  id: number;
  title: string;
  message?: string;
  tone: BannerTone;
}

interface BannerState {
  queue: Banner[];
  show: (banner: Omit<Banner, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/** In-app celebration banners ("Line mastered!"). Not persisted. */
export const useBannerStore = create<BannerState>()((set) => ({
  queue: [],
  show: (banner) => set((s) => ({ queue: [...s.queue, { ...banner, id: nextId++ }] })),
  dismiss: (id) => set((s) => ({ queue: s.queue.filter((b) => b.id !== id) })),
}));
