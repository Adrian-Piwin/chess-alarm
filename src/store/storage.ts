import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Shared persistence backend: AsyncStorage on native, localStorage on web
 * (AsyncStorage's web implementation).
 */
export const persistStorage = createJSONStorage(() => AsyncStorage);

/** Namespaced keys make a future "reset everything" or migration trivial. */
export const storageKey = (name: string) => `chess-alarm/${name}`;
