#!/usr/bin/env node
/**
 * Synthesises the app's sound effects as small 16-bit mono WAV files.
 *
 * Generating them keeps the repo free of third-party audio licences and makes
 * every sound tweakable in code. Run with `npm run generate:sounds`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 44100;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

/** Deterministic noise so regenerated files are byte-identical. */
function makeNoise(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return (s / 4294967296) * 2 - 1;
  };
}

function buffer(seconds) {
  return new Float32Array(Math.ceil(seconds * SAMPLE_RATE));
}

/** A wooden "knock": a low-passed noise burst plus a short pitched body. */
function knock(out, at, { pitch = 190, gain = 0.9, decay = 38, seed = 7 } = {}) {
  const noise = makeNoise(seed);
  const start = Math.floor(at * SAMPLE_RATE);
  const length = Math.floor(0.09 * SAMPLE_RATE);
  let lp = 0;
  for (let i = 0; i < length && start + i < out.length; i += 1) {
    const t = i / SAMPLE_RATE;
    lp += 0.35 * (noise() - lp);
    const env = Math.exp(-t * decay);
    const click = i < 60 ? (1 - i / 60) * 0.6 : 0;
    const body = Math.sin(2 * Math.PI * pitch * t) * 0.7 + Math.sin(2 * Math.PI * pitch * 2.3 * t) * 0.25;
    out[start + i] += gain * env * (lp * 0.9 + body * 0.55 + click);
  }
}

/** A soft sine tone with a smooth attack and exponential release. */
function tone(out, at, { freq, dur, gain = 0.4, decay = 6, harmonics = [1, 0.3, 0.1] }) {
  const start = Math.floor(at * SAMPLE_RATE);
  const length = Math.floor(dur * SAMPLE_RATE);
  for (let i = 0; i < length && start + i < out.length; i += 1) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.006);
    const env = attack * Math.exp(-t * decay);
    let v = 0;
    harmonics.forEach((h, k) => {
      v += h * Math.sin(2 * Math.PI * freq * (k + 1) * t);
    });
    out[start + i] += gain * env * v;
  }
}

function normalise(samples, peak = 0.89) {
  let max = 0;
  for (const v of samples) max = Math.max(max, Math.abs(v));
  const k = max > 0 ? peak / max : 1;
  return samples.map((v) => v * k);
}

function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const SOUNDS = {
  move() {
    const b = buffer(0.12);
    knock(b, 0, { pitch: 180, gain: 0.8 });
    return normalise(b, 0.7);
  },
  capture() {
    const b = buffer(0.16);
    knock(b, 0, { pitch: 150, gain: 1, decay: 30, seed: 3 });
    knock(b, 0.018, { pitch: 240, gain: 0.6, decay: 45, seed: 11 });
    return normalise(b, 0.85);
  },
  castle() {
    const b = buffer(0.24);
    knock(b, 0, { pitch: 175, gain: 0.8 });
    knock(b, 0.1, { pitch: 200, gain: 0.8, seed: 13 });
    return normalise(b, 0.75);
  },
  check() {
    const b = buffer(0.3);
    knock(b, 0, { pitch: 180, gain: 0.8 });
    tone(b, 0.02, { freq: 988, dur: 0.26, gain: 0.25, decay: 14 });
    return normalise(b, 0.8);
  },
  wrong() {
    const b = buffer(0.32);
    tone(b, 0, { freq: 311, dur: 0.14, gain: 0.5, decay: 10, harmonics: [1, 0.5, 0.25] });
    tone(b, 0.12, { freq: 233, dur: 0.2, gain: 0.5, decay: 9, harmonics: [1, 0.5, 0.25] });
    return normalise(b, 0.6);
  },
  correct() {
    const b = buffer(0.35);
    tone(b, 0, { freq: 1047, dur: 0.33, gain: 0.35, decay: 9 });
    tone(b, 0.06, { freq: 1568, dur: 0.28, gain: 0.25, decay: 10 });
    return normalise(b, 0.55);
  },
  complete() {
    const b = buffer(0.9);
    [523, 659, 784, 1047].forEach((f, i) => tone(b, i * 0.1, { freq: f, dur: 0.6, gain: 0.3, decay: 5 }));
    return normalise(b, 0.7);
  },
  star() {
    const b = buffer(1.1);
    [784, 988, 1175, 1568, 1976].forEach((f, i) =>
      tone(b, i * 0.07, { freq: f, dur: 0.7, gain: 0.22, decay: 5, harmonics: [1, 0.2] }),
    );
    return normalise(b, 0.75);
  },
  alarm() {
    // Two-tone beeps, repeated — loud and hard to sleep through.
    const b = buffer(3);
    for (let r = 0; r < 4; r += 1) {
      const base = r * 0.75;
      for (let k = 0; k < 3; k += 1) {
        tone(b, base + k * 0.16, {
          freq: k % 2 ? 1319 : 1047,
          dur: 0.13,
          gain: 0.6,
          decay: 2,
          harmonics: [1, 0.4, 0.2],
        });
      }
    }
    return normalise(b, 0.95);
  },
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, make] of Object.entries(SOUNDS)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(make()));
  console.log(`wrote ${file}`);
}
