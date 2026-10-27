---
stage: plan
bolt: 006-assisted-weighing-station-ui
created: 2026-10-27T07:03:00Z
---

# Implementation Plan: 006-assisted-weighing-station-ui

## Objective

Add the Vite + React operator HMI (S1 Select batch, S2 Weigh, S3 Confirm & print) on localhost. Screens consume existing Dummy and session HTTP APIs. No hard-coded live batch table. No copy of prototype JavaScript. No new vendor contracts. Domain math stays in the weighing session (bolts 003–004).

## Workbook / checkpoint answers

### 1. What will change?

A React station UI appears next to the existing Fastify Dummy host (`:8787`). After this bolt the B-24187 path is demonstrable from a browser: queue → weigh five components → complete → OrgaTEX CONFIRMED → ticket preview. Dummy APIs themselves do not change unless a thin static-serve or CORS/proxy is required so the UI can call `/api`.

Workbook STEPs 19–28 are **Implement** work after this plan is approved. STEPs 29–30 are **Test** work. This Plan stage writes no UI.

### 2. Which files will be created/modified?

Created (Implement, after approval):

- `web/` Vite + React app (station chrome, S1, S2, S3, API client)
- Playwright e2e specs under `tests/e2e/` (Test stage)
- Vite/Playwright config, npm scripts (`dev:web`, `e2e`)

Modified:

- `package.json` — React, Vite, Playwright; scripts to run UI + Dummy together
- Fastify only if needed to proxy/serve `web/dist` or allow the Vite origin
- bolt.md / construction log after each approved stage

Not in this bolt: new Dummy routes, milligram domain, real printer language, Auth0, meeting-only Simulate/Reset chrome from the HTML prototype.

### 3. Which requirements and stories?

- `001-select-batch-screen` — FR-01, FR-02, FR-03, FR-22 (Workbook STEP 19)
- `002-weigh-screen` — FR-04..FR-16, FR-19, FR-22 (Workbook STEPs 20–25)
- `003-confirm-print-screen` — FR-16, FR-17, FR-18, FR-22 (Workbook STEPs 26–27)
- `004-show-device-failures` — FR-20, FR-22 (Workbook STEP 30 UI)

Presents FR-01..FR-21; does not own Dummy contracts. Story 003 out of scope: “Next batch returns to S1” is not a Must for this bolt.

### 4. Which APIs? (training Dummy + session — already built)

S1:

- `GET /api/batches` — queue table (not `const batches = [...]`)
- `GET /api/batches/:id` then `GET /api/batches/:id/recipe` on select B-24187
- `POST /api/sessions` `{ batchId, operatorId }` to open S2
- Optional: `GET /api/scanner/lookup?code=` if the operator types/scans a code; touch-select still works if scanner fails

S2:

- `GET /api/sessions/:id` — recipe rail, lot/container/tare, progress N/5
- `GET /api/sessions/:id/evaluation` — weighed now, remaining, zone, `confirmAllowed` (UI does **not** recompute milligram bands)
- `GET /api/scales/:id/weight` and `GET /api/scales/:id/status` — live cell; Yellow RGB → `scale-3kg` (g); Sodium Sulphate / Soda Ash → `scale-32kg` (kg)
- `POST /api/sessions/:id/tare` — Re-tare
- `POST /api/sessions/:id/confirm` — OK only when evaluation says allowed
- `POST /api/sessions/:id/quit` — abandon; do not complete the component
- `POST /api/sessions/:id/override` — request only; does not confirm (ADR-005 / FR-21)
- `POST /api/sessions/:id/active` `{ seq }` — pending rail click; done seq ignored by API
- `PUT /api/sessions/:id/components/:seq/identity` if lot/container must be set from S2

S3:

- `POST /api/sessions/:id/complete` — 5/5 gate then Dummy consumption (ADR-003)
- `POST /api/tickets` `{ sessionId }` then `GET /api/tickets/:id` for preview fields

Failures (story 004):

- Existing Dummy unavailable flags already return 503: OrgaTEX, scale weight, printer
- UI shows the error and blocks Confirm / write-back / print success

Playwright / demo weight injection (not product chrome):

- `POST /api/dummy/scales/:id/weight` `{ net }` — tests set 1240, 386, 94, 24, 9.6 and the Yellow RGB five-point band. Do not copy prototype Simulate buttons onto S1–S3.

### 5. How will this be tested?

Implement stage: browser walk of S1–S3 against Dummy APIs; evidence screens per Workbook 19–27.

Test stage (Playwright + existing Vitest suite still green):

- Happy path B-24187: GET `/api/batches` on S1; select B-24187 issues GET batch + GET recipe; five confirms; POST complete; POST tickets; ticket fields visible
- Network assertions: no live `const batches = [...]`
- Scale switch: Yellow RGB 3 kg / g; Sodium Sulphate 32 kg / kg
- Yellow RGB UI: 93.4 Confirm off; 93.5 / 94.0 / 94.5 on; 94.6 off (evaluation-driven)
- Failures: OrgaTEX / scale / printer unavailable visible; confirm / print not silently successful

## Deliverables

- Vite + React HMI reproducing S1–S3 **functional** experience (labels from prototype, data from HTTP)
- Shared chrome: station title, batch/order/machine crumb, operator chip, device strip
- Operator identity is a training string (prototype “R. Karim · Shift A”), stored on the session — no IdP
- Confirm button bound to `evaluation.confirmAllowed`, not a second tolerance engine
- Overshoot: show OVER TOLERANCE / surplus amount from evaluation; **no** remaining-recipe recalc (ADR-005)
- Confirm advances via session API (ADR-004); UI follows `activeSeq` / 5/5 → S3
- Playwright-ready selectors and an e2e spec (written in Test stage)

## Technical Approach

1. Add `web/` Vite React + TypeScript. Dev: Vite proxies `/api` to Fastify `:8787`. Optional: Fastify serves `web/dist` so one localhost origin works for Playwright.
2. Thin `api.ts` client — fetch only; no embedded B-24187 table.
3. Screen state `queue | weigh | done` from session lifecycle, not from copied prototype `showView`.
4. Poll evaluation + scale status while S2 is open (training continuous readout). Poll interval is a UI choice, not a plant protocol (Q16 unresolved).
5. Display units and numbers as returned by session/Dummy (`fromMilligrams` already happened server-side). Format g to 1 decimal, kg to 3 on the HMI.
6. Device strip reads Dummy status endpoints / last error — not static READY/LINKED.
7. Do not port `docs/customize-weighing-station.html` `<script>`. Layout may follow the prototype visually; behaviour comes from approved FRs and ADRs.

## Out of scope

- New Dummy OrgaTEX / scale / printer contracts
- Copying prototype JS (`zone()`, `select()`, simulate dispense)
- Meeting chrome: Screen segment buttons, Simulate dispense/overshoot, question pins
- ZPL / real printer (Q18)
- Auto-recalc on overshoot (ADR-005)
- Auth provider, i18n beyond EN, reprint workflow
- Workbook STEP 28 comparison folder can be started in Implement; full e2e report is Test / later workbook steps

## Acceptance Criteria

- [ ] S1 loads rows from `GET /api/batches`; B-24187 selection loads batch + recipe; no live hard-coded batch table
- [ ] S2 shows component, code, lot, container, tare, selected scale, weighed now, still to weigh, target, progress, tolerance, status, OK / Re-tare / Quit / Supervisor override
- [ ] Yellow RGB uses 3 kg / g; Sodium Sulphate uses 32 kg / kg; weighed now from Dummy Scale
- [ ] Confirm disabled outside Yellow RGB 93.5–94.5 g and enabled inside (from evaluation)
- [ ] Progress Blue → Red → Yellow → Salt → Soda; 5/5 then S3
- [ ] S3 shows 5 of 5; Written to OrgaTEX CONFIRMED only after complete 2xx; Print uses `POST /api/tickets` and shows stored fields
- [ ] OrgaTEX / scale / printer unavailable is visible and blocks the matching success path
- [ ] Playwright happy path + failure UI tests pass (Test stage)
- [ ] Existing `npm test` Dummy/session suite remains green
