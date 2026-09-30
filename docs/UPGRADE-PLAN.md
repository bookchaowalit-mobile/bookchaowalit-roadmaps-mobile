# Upgrade Plan

## Current state

Score: 5/10 (was 2/10) — working roadmap board (milestones, items, status cycling,
progress and health, localStorage) with tested logic and honest CI.

## Backlog

- P1: Edit items and milestones; drag to reorder (delete done in pass 2).
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

## Done in this pass (pass 2)

Score: 6/10 (was 5/10) — items and milestones can be deleted, status buttons are keyboard-accessible, and the Home page has component tests.

- Delete: per-item ✕ and "Delete milestone" (removes its items too) via pure `removeItem`/`removeMilestone` (tested). Edit and drag-to-reorder remain open (P1).
- Accessibility: the status control was an `IonChip` with `role="button"` but no keyboard support; it is now an `IonButton` (focusable, Enter/Space) with the same label.
- Component tests: `src/pages/__tests__/Home.test.tsx` (Vitest + jsdom + @testing-library/react) covers sample persistence, status cycling, adding an item through Ionic `ionInput`, and deletes. 15 tests total.
- Advisories: `npm audit --omit=dev` is clean; dev-only vite 5/esbuild/vitest findings need major upgrades.
- Verified: typecheck, lint, vitest, `npm run build`.

## Done in this pass (pass 3)

Score: 6.5/10 (was 6/10) — edge-case hunt in `src/lib/roadmap.ts`.

- Bug: "end of target day" was `midnight + 24h`, so on a 25-hour DST day (e.g. 2026-10-25 in
  Europe/Berlin) a milestone turned "overdue" at 23:00 on its own target date. Now uses next local midnight.
- Bug: milestone and item titles made only of zero-width characters (U+200B/U+200D/U+2060) were accepted;
  shared `isBlank()` now guards both forms.
- Verified: typecheck, lint, vitest (UTC, Europe/Berlin, America/New_York, Asia/Bangkok), build;
  the new tests fail on the previous code (under TZ=Europe/Berlin for the DST case).
