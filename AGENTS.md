# Chess Alarm — notes for AI agents and contributors

Expo SDK 57 / React Native app for iOS, Android and web. Read `docs/PLAN.md`
first: it defines the product rules (Watch → Level 1 → Level 2, stars,
mastery, the alarm) and the architecture.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. Before writing code that touches
an Expo or React Native API, check the installed version's types in
`node_modules/<package>/build/*.d.ts` or the versioned docs at
`https://docs.expo.dev/versions/v57.0.0/`.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm install — SDK-compatible versions
npm run check               # typecheck + lint + prettier + jest — must pass before pushing
npm run build:web           # static export to dist/
```

## Conventions

- Routes live in `src/app/` and stay thin; logic goes in `src/domain/`
  (pure, framework-free, unit tested) or `src/features/`.
- Game rules change? Change `src/domain/*` and its tests first.
- Opening/line ids are persistence keys — never rename them.
- Platform-specific code uses file extensions (`*.web.ts`), not scattered
  `Platform.OS` checks, when a whole module differs.
- Persisted state goes through zustand stores in `src/store/` (namespaced
  keys via `storageKey`). Bump the store `version` and add a `migrate` when
  changing a persisted shape.
- Colours, spacing and type come from `src/theme` — no ad-hoc hex values in screens.
- `ios/` and `android/` are generated (CNG). Configure native behaviour in
  `app.json` / config plugins only.

## Deployment

Web deploys to the Winovate droplet via `.github/workflows/deploy.yml`
(`platformctl publish`). Follow the platform contract in
`Adrian-Piwin/winovate-platform` — never publish ports, never build on the
droplet, use `platformctl` for Caddy. Publishing mobile builds is a human decision.
