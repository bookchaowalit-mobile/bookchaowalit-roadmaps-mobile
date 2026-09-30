# Upgrade Plan

## Current state

Score: 5/10 (was 2/10) — working roadmap board (milestones, items, status cycling,
progress and health, localStorage) with tested logic and honest CI.

## Backlog

- P1: Edit/delete items and milestones; drag to reorder.
- P1: Component tests (vitest + @testing-library/react + jsdom) for the Home page.
- P1: Code-split Ionic (bundle is ~1 MB; Vite warns about chunk size).
- P2: Sync with the roadmaps backend / share a read-only public roadmap link.
- P2: Explore tab: timeline view across milestones.
- P2: Capacitor config for native builds; PWA manifest.

## Done in this pass

- Fixed missing `setupIonicReact()` and the missing `padding.css`/`text-alignment.css`
  imports (so `ion-padding` actually applied).
- Roadmap board backed by pure `src/lib/roadmap.ts` (weighted progress, milestone
  health, ordering, strict date validation, defensive storage parsing) with 9 vitest tests.
- `npm run lint` was broken (ESLint not installed); added ESLint 9 flat config.
- CI runs `npm ci`, typecheck, lint, tests and build without `|| true`; lockfile committed.
