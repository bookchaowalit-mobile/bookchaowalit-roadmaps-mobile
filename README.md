# Roadmaps — Mobile

Ionic + React cross-platform mobile app for **Roadmaps**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Features

- **Roadmap board** (Home tab): milestones with target dates, each showing its
  items, a progress bar (in-progress counts as half) and a health badge —
  complete, on-track, at-risk (≤14 days left and under 50%) or overdue. Tap an
  item's status chip to cycle planned → in-progress → done. Add items and
  milestones; everything is saved in `localStorage` (sample roadmap on first run).
- Roadmap logic lives in `src/lib/roadmap.ts` (pure TypeScript, unit-tested).

## Tech Stack

- **Framework:** Ionic 8 + React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI:** Ionic Components + Ionicons

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev         # Vite dev server
npm run typecheck   # tsc (noEmit)
npm run lint        # ESLint flat config (typescript-eslint + react-hooks)
npm test            # vitest unit tests for src/lib
npm run build       # tsc && vite build
```

CI (`.github/workflows/build.yml`) runs all of the above with `npm ci`; failures
are not masked.

## Build

```bash
npm run build
# Deploy as native app via Capacitor or as PWA
```

## Related

- **Frontend:** [bookchaowalit-website/roadmaps-frontend](https://github.com/bookchaowalit-website/roadmaps-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
