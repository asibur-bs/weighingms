---
stage: implement
bolt: 006-assisted-weighing-station-ui
created: 2026-10-27T07:12:00Z
---

# Implementation Walkthrough: 006-assisted-weighing-station-ui

### Summary

Vite + React operator HMI now reproduces Select batch, Weigh, and Confirm & print against the existing Dummy and session APIs. Queue rows, live weight, confirm enablement, write-back CONFIRMED, and ticket preview all come from HTTP. Prototype JavaScript was not copied. Playwright specs remain the Test stage.

### Structure Overview

The HMI lives in `web/` and talks to Fastify on port 8787 through a Vite `/api` proxy. Screen state is `queue | weigh | done`. Weighing math stays on `GET /api/sessions/:id/evaluation`; the UI only displays zone, remaining, and `confirmAllowed`. Dummy Scale weight is injected by tests/demo via the existing dummy weight POST, not meeting-chrome Simulate buttons.

### Completed Work

- [x] `web/index.html` - station document
- [x] `web/vite.config.ts` - Vite + `/api` proxy to Dummy host
- [x] `web/tsconfig.json` - React TypeScript project
- [x] `web/src/main.tsx` - React mount
- [x] `web/src/App.tsx` - S1–S3 orchestration, device strip, failure banners
- [x] `web/src/api.ts` - fetch client for Dummy and session routes
- [x] `web/src/types.ts` - training JSON shapes
- [x] `web/src/format.ts` - display units and operator chip
- [x] `web/src/styles.css` - HMI layout (labels from prototype, no copied behaviour)
- [x] `src/app.ts` - CORS headers so the UI origin can call Dummy APIs
- [x] `src/server.ts` - listen banner points at the HMI
- [x] `package.json` - React/Vite deps and `dev:web` / `build:web`

### Key Decisions

- **Proxy, not a second Dummy host**: UI fetch paths are `/api/...`; Vite forwards to `:8787`.
- **Evaluation owns Confirm**: the HMI never recomputes milligram bands.
- **Overshoot is informational**: surplus amount is shown; remaining targets are not rewritten.
- **No meeting chrome**: no Simulate dispense/overshoot, no screen-segment skip buttons, no question pins.
- **Playwright later**: `data-testid` attributes are in place; e2e files wait for Test stage.

### Deviations from Plan

- Fastify does not yet serve `web/dist`. Dev/demo uses Vite `:5173` plus Dummy `:8787`. Optional same-origin static serve can wait.
- Next batch returns to S1 (thin wiring; story 003 listed it out of scope as a Must).

### Dependencies Added

- [x] `react` / `react-dom` - operator HMI
- [x] `vite` / `@vitejs/plugin-react` - local UI bundler
- [x] `@types/react` / `@types/react-dom` - TypeScript

### Developer Notes

- Run Dummy APIs: `npm start` (`http://127.0.0.1:8787`).
- Run HMI: `npm run dev:web` (`http://127.0.0.1:5173`).
- Set training net with `POST /api/dummy/scales/scale-3kg/weight` or `scale-32kg`.
- Existing `npm test` (47) stays the API regression suite until Playwright in Test stage.
