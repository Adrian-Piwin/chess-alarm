# Chess Alarm — Product & Implementation Plan

Chess Alarm is a chess-openings trainer for **iOS, Android and the web**, built
from a single Expo / React Native codebase. Its hook is the **alarm**: when it
rings, you have to play an opening line from memory to switch it off.

This document is the source of truth for scope. Tick items as they land.

---

## 1. Requirements (from the brief)

| # | Requirement | Where it lives |
|---|---|---|
| R1 | One codebase for iOS, Android and web | Expo SDK 57 + Expo Router + react-native-web |
| R2 | Main page is a **catalogue** of openings | `src/app/(tabs)/index.tsx` |
| R3 | Select an opening → study it | `src/app/opening/[id].tsx` |
| R4 | First time: the app **demonstrates** the whole line | Trainer mode `demo` |
| R5 | **Level 1**: play the line fully guided (arrow + highlight on every move) | Trainer mode `guided` |
| R6 | **Level 2**: play from memory. A wrong move is rejected with feedback and you keep going. After **3 failed attempts** on the same move you get a hint | Trainer mode `recall` |
| R7 | Finish a Level 2 run **flawlessly** → earn a **star** on that line | `src/domain/progress.ts` |
| R8 | **3 stars** → "Mastered" banner | `src/components/Banner.tsx` |
| R9 | Flag an opening as **"Learning"** | Opening screen toggle |
| R10 | **Alarm**: when it rings you're forced to play Level 2 of a line (Level 1 if you've never played that line). Cycles the opening until every line is mastered, then asks you to pick a new one | `src/features/alarm/*`, `src/app/alarm.tsx` |
| R11 | Learn several openings at once. Alarm picks: **in order** (focus), **random among learning**, or **fully random** | `src/domain/scheduler.ts` |
| R12 | "Pick a random opening for me" | Catalogue button |
| R13 | Starting library: **≥10 White, ≥10 Black** openings | `src/data/openings/*` |
| R14 | Clean chess.com-*feel* UI: board, pieces, move sounds, drag & tap controls — but its own look | `src/components/board/*`, `src/theme/*` |
| R15 | Web: hide the alarm features and advertise the mobile app instead | `Platform.OS === 'web'` checks, `WebHero` |
| R16 | Deploy to the DigitalOcean droplet | `.github/workflows/deploy.yml`, `deploy/` |
| R17 | Clean, documented, tested code | README, `docs/`, Jest, ESLint, Prettier, CI |

## 2. Interpretation of the progression rules

Stars and mastery are tracked **per line** — an opening is a family of lines
(e.g. Italian Game → Giuoco Pianissimo, Evans Gambit declined…).

```
               ┌──────────┐  finish   ┌───────────┐  finish   ┌────────────┐
 first open →  │  Watch   │ ────────▶ │  Level 1  │ ────────▶ │  Level 2   │ ─┐
               │  (demo)  │           │  guided   │           │  recall    │  │ flawless run: +1 ★
               └──────────┘           └───────────┘           └────────────┘ ◀┘ (max ★★★)
```

* **Watch** — the line auto-plays with move-by-move commentary. Skippable.
* **Level 1** — every one of *your* moves is shown with an arrow; the opponent
  replies automatically. Completing it unlocks Level 2.
* **Level 2** — no help. A wrong move bounces back with an error sound and a
  "Not quite — try again" message; the run is no longer flawless. After three
  wrong tries **on the same move** the correct move is hinted (arrow). You
  always play on to the end of the line.
* A flawless Level 2 run earns ★ (up to ★★★). ★★★ = **line mastered**
  (banner). All lines mastered = **opening mastered** (bigger banner, and the
  opening leaves the learning rotation).

### Alarm session (native only)

1. The alarm fires (scheduled local notification with sound; see §5).
2. Tapping it opens `/alarm`, a full-screen session with no back button.
3. The scheduler chooses an opening from the learning list (per the chosen
   mode) and, inside it, the **first line that is not mastered**:
   never completed Level 1 → Level 1, otherwise → Level 2.
4. Finishing the line (flawlessly or not) dismisses the alarm and cancels the
   pending "snooze" repeats. Progress counts exactly like normal study.
5. If every learning opening is mastered, the session congratulates you and
   links to the catalogue to choose a new one.

## 3. Architecture

```
src/
  app/                    Expo Router routes (screens only — thin)
    _layout.tsx           root stack, providers, store hydration, notification routing
    (tabs)/               Catalogue · Learning · Settings
    opening/[id].tsx      opening detail + line list
    train/[openingId]/[lineId].tsx   the trainer
    alarm.tsx             forced alarm session
  components/             reusable UI (Button, Card, Stars, Banner…)
    board/                Chessboard, pieces, arrows, drag & tap input
  data/openings/          the opening library (pure data, validated in tests)
  domain/                 pure TypeScript, no React — unit tested
    chess.ts              thin wrapper over chess.js
    trainer.ts            the trainer state machine (demo/guided/recall)
    progress.ts           stars, mastery, level unlocks
    scheduler.ts          which opening/line the alarm should serve
  features/
    alarm/                notification scheduling (native) + web stub
    sound/                sound effects (expo-audio)
  store/                  zustand stores persisted to AsyncStorage
  theme/                  colors, spacing, typography, board themes
assets/
  pieces/                 SVG piece set (Colin M.L. Burnett, BSD licence)
  sounds/                 generated WAVs (scripts/generate-sounds.mjs)
```

Key decisions:

* **Expo Router** for file-based navigation that works identically on web.
* **chess.js** for move legality/SAN; our own board renderer in
  **react-native-svg** so it looks identical on every platform.
* **Board input** with React Native's `PanResponder` (tap-tap *and*
  drag-and-drop), which react-native-web supports — no extra native modules.
* **zustand + persist(AsyncStorage)** — tiny, typed, works on web
  (localStorage) and native.
* **Domain logic is framework-free** so the rules above are unit tested.
* **Sounds are generated** by a script (no licensing questions, tiny files).

## 4. Opening library (v1)

White (you play White): Italian Game, Ruy Lopez, Scotch Game, Vienna Game,
King's Gambit, Evans Gambit, Queen's Gambit, London System, Catalan,
English Opening.

Black (you play Black): Sicilian Najdorf, Sicilian Dragon, French Defence,
Caro-Kann, Scandinavian, Petrov, King's Indian, Queen's Gambit Declined,
Slav, Nimzo-Indian, Dutch Leningrad.

Every line is validated with chess.js in `src/data/__tests__`.

## 5. Platform notes — the alarm

* **iOS / Android:** implemented with `expo-notifications` weekly triggers
  (one per selected weekday) using a loud sound and a high-importance Android
  channel. When it fires a short burst of follow-up notifications
  (every minute for 10 minutes) is scheduled so it keeps nagging until the
  line is played. Tapping any of them deep-links to `/alarm`.
* Operating systems do **not** let a regular app override silent mode or
  launch itself full-screen from a notification without extra native work.
  Follow-ups (documented in `docs/ALARM.md`): iOS AlarmKit (iOS 26+) and an
  Android full-screen-intent `AlarmManager` module via a config plugin.
* **Web:** no reliable background alarms → alarm UI hidden; the catalogue
  shows a "Get the app for wake-up training" hero instead.

## 6. Deployment

The web build (`expo export -p web`) is a static SPA. It is published to the
Winovate droplet exactly like `winovate-root`: GitHub Actions builds, then
streams a tarball over SSH to `platformctl publish chess-alarm <tag>`, which
flips an atomic `current` symlink. Caddy serves it at
`chess.winovatesolutions.com` (the wildcard DNS already points there).
One-time droplet setup is in `deploy/README.md`.

Mobile builds go through EAS (`eas build`) — publishing to the stores is a
human decision.

## 7. Milestones

- [x] M0 Plan, scaffold, tooling (TS strict, ESLint, Prettier, Jest, CI)
- [x] M1 Domain: chess wrapper, trainer state machine, progress, scheduler + tests
- [x] M2 Opening library (21 openings) + validation tests
- [x] M3 Board: pieces, themes, tap & drag, highlights, arrows, sounds
- [x] M4 Screens: catalogue, opening detail, trainer, learning, settings
- [x] M5 Stars, mastery banners, learning flags, random pick
- [x] M6 Alarm (native) + web hero
- [x] M7 Web deploy pipeline + droplet instructions
- [ ] M8 Store builds (EAS), native alarm module, accounts/sync (future)
