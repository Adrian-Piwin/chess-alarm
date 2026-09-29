/**
 * Sound effects. Players are created lazily and reused; every call is
 * fire-and-forget and never throws (a missing sound must not break a move).
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import type { MoveKind } from '@/domain/chess';
import { useSettingsStore } from '@/store/settingsStore';

const SOURCES = {
  move: require('../../../assets/sounds/move.wav'),
  capture: require('../../../assets/sounds/capture.wav'),
  castle: require('../../../assets/sounds/castle.wav'),
  check: require('../../../assets/sounds/check.wav'),
  wrong: require('../../../assets/sounds/wrong.wav'),
  correct: require('../../../assets/sounds/correct.wav'),
  complete: require('../../../assets/sounds/complete.wav'),
  star: require('../../../assets/sounds/star.wav'),
  alarm: require('../../../assets/sounds/alarm.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

const players = new Map<SoundName, AudioPlayer>();
let audioModeSet = false;

/**
 * Browsers refuse to play audio before the first user gesture (and reject
 * asynchronously, so try/catch can't help). Stay silent until then.
 */
let webAudioUnlocked = Platform.OS !== 'web';
if (!webAudioUnlocked && typeof window !== 'undefined') {
  const unlock = () => {
    webAudioUnlocked = true;
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

function player(name: SoundName): AudioPlayer {
  let p = players.get(name);
  if (!p) {
    p = createAudioPlayer(SOURCES[name]);
    players.set(name, p);
  }
  return p;
}

function ensureAudioMode() {
  if (audioModeSet || Platform.OS === 'web') return;
  audioModeSet = true;
  // Play even when the iOS ring/silent switch is on silent — it's an alarm app.
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
}

export function playSound(name: SoundName): void {
  if (!webAudioUnlocked) return;
  if (!useSettingsStore.getState().soundEnabled && name !== 'alarm') return;
  try {
    ensureAudioMode();
    const p = player(name);
    p.seekTo(0).catch(() => undefined);
    p.play();
  } catch {
    // Audio is best effort.
  }
}

export function soundForMove(kind: MoveKind, check: boolean): SoundName {
  if (check) return 'check';
  if (kind === 'capture') return 'capture';
  if (kind === 'castle') return 'castle';
  return 'move';
}

/** Loops the alarm tone until `stopAlarmLoop` is called. */
export function startAlarmLoop(): void {
  try {
    ensureAudioMode();
    const p = player('alarm');
    p.loop = true;
    p.volume = 1;
    p.seekTo(0).catch(() => undefined);
    p.play();
  } catch {
    // Best effort.
  }
}

export function stopAlarmLoop(): void {
  const p = players.get('alarm');
  if (!p) return;
  try {
    p.loop = false;
    p.pause();
  } catch {
    // Best effort.
  }
}
