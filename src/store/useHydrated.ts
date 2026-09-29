import { useEffect, useState } from 'react';
import { useLearningStore } from './learningStore';
import { useProgressStore } from './progressStore';
import { useSettingsStore } from './settingsStore';

const STORES = [useProgressStore, useLearningStore, useSettingsStore];

/** True once every persisted store has loaded from disk. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => STORES.every((s) => s.persist.hasHydrated()));
  useEffect(() => {
    if (hydrated) return;
    const check = () => setHydrated(STORES.every((s) => s.persist.hasHydrated()));
    const unsubs = STORES.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, [hydrated]);
  return hydrated;
}
