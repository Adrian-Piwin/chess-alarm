# ♞ Chess Alarm

Learn chess openings line by line — and wake up to them.

One Expo / React Native codebase for **iOS, Android and the web**:

- **Catalogue** of 21 openings (10 as White, 11 as Black), each with 2–3 lines.
- **Watch → Level 1 → Level 2.** Watch the line with commentary, play it with
  arrows guiding every move, then play it from memory. Three misses on a move
  reveal a hint; you always play to the end.
- **Stars & mastery.** Each flawless Level 2 run earns a ★. Three stars master
  a line; master every line to master the opening (with a banner to celebrate).
- **Learning list.** Flag openings to learn; practise them in order, randomly
  from your list, or fully at random.
- **Wake-up alarm (mobile).** It keeps ringing until you've played a line from
  your list. On the web the alarm is hidden and the landing page promotes the app.
- Tap-or-drag board, legal-move dots, move sounds, haptics, board themes.

Live web app: **https://chess.winovatesolutions.com** (once the one-time
droplet setup in [`deploy/README.md`](deploy/README.md) is done).

## Getting started

```bash
npm install
npm run web          # browser
npm run ios          # iOS simulator (dev build needed for notifications)
npm run android      # Android emulator
```

Notifications and the custom alarm sound need a **development build**
(`npx expo run:ios|android` or `npx eas-cli build --profile development`);
everything else also runs in Expo Go.

## Scripts

| Command                   | What it does                                                                |
| ------------------------- | --------------------------------------------------------------------------- |
| `npm run check`           | typecheck + lint + format check + tests (run before pushing)                |
| `npm test`                | Jest unit tests (domain rules + every opening line validated with chess.js) |
| `npm run build:web`       | static web export to `dist/`                                                |
| `npm run generate:sounds` | re-synthesise the WAV sound effects                                         |
| `npm run format`          | Prettier                                                                    |

## Project layout

```
src/
  app/            Expo Router screens (thin): tabs, opening/[id], train/…, alarm
  components/     UI kit + chessboard (board/)
  data/openings/  the opening library — plain data, validated in tests
  domain/         pure TypeScript rules: chess, trainer, progress, scheduler, alarm timing
  features/       alarm (native + web stub), sound, trainer (hook + view)
  store/          zustand stores persisted with AsyncStorage / localStorage
  theme/          design tokens and board themes
docs/             PLAN.md (scope & decisions), ALARM.md
deploy/           droplet manifest, Caddy snippet, setup guide
scripts/          sound generator
```

Read [`docs/PLAN.md`](docs/PLAN.md) for the product rules and architecture and
[`docs/ALARM.md`](docs/ALARM.md) for how the alarm works and its platform limits.

## Adding an opening

1. Add an entry to `src/data/openings/white.ts` or `black.ts` using the
   `line(id, name, movetext, notes)` helper. Notes are keyed by ply
   (1 = White's first move).
2. `npm test` — every line is replayed through chess.js, so a typo or illegal
   move fails the build.
3. Ids are persistence keys: never rename an existing one.

## Deployment

- **Web:** merging to `main` runs `.github/workflows/deploy.yml`, which builds
  and publishes to the Winovate droplet. One-time setup: [`deploy/README.md`](deploy/README.md).
- **Mobile:** `npx eas-cli build --profile production` then `eas submit`.
  Store publishing is a manual, human decision.

## Credits

Piece artwork: Colin M.L. Burnett (BSD licence) — see
[`assets/pieces/LICENSE.md`](assets/pieces/LICENSE.md). Sounds are synthesised
by `scripts/generate-sounds.mjs`.
