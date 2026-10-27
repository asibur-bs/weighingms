---
stage: plan
bolt: 001-orgatex-integration
created: 2026-10-26T14:13:00Z
---

# Implementation Plan: 001-orgatex-integration

## Objective

Stand up the training Dummy OrgaTEX HTTP API (and a Dummy Scanner batch-code lookup) so later bolts and the HMI can load a queue, load B-24187 + five-component recipe, post consumption, and fail visibly when the Dummy is unavailable. No UI. No scale. No printer. No real SETEX contracts.

## Workbook answers (STEP 15)

### 1. What will change?

This is the first code in the repo. WeighingMS will gain a local Fastify process, SQLite training store, seed for four batches, and HTTP routes that are the system of record for queue/recipe/consumption. The UI is **not** built in this bolt; it must not gain a hard-coded `const batches = [...]`.

### 2. Which files will be created/modified?

Created (planned):

- `package.json`, `package-lock.json`, `tsconfig.json`, `vitest.config.ts`
- `src/server.ts` — Fastify bootstrap, listen on localhost
- `src/db.ts` — better-sqlite3 open + migrate
- `src/dummy-orgatex/schema.sql` — batches, recipe_components, consumption, scanner_codes, dummy_flags
- `src/dummy-orgatex/seed.ts` — B-24187..B-24191 + B-24187 five-component recipe
- `src/dummy-orgatex/routes.ts` — HTTP handlers
- `src/dummy-orgatex/scanner-routes.ts` — batch-code → batch id
- `src/dummy-orgatex/types.ts` — training JSON shapes
- `tests/api/orgatex.test.ts` — Vitest contract tests
- `.gitignore` — node_modules, sqlite files, dist

Modified:

- `memory-bank/bolts/001-orgatex-integration/bolt.md` (stage tracking after approval)
- construction log (after Plan is approved)

Not in this bolt: React app, scale routes, ticket routes, weighing-session domain.

### 3. Which requirements and stories are being implemented?

Stories:

- `001-serve-batch-queue` — FR-01
- `002-serve-batch-and-recipe` — FR-02 (data), FR-03
- `003-post-consumption` — FR-17
- `004-orgatex-unavailable` — FR-20 (OrgaTEX Dummy only)

Scanner stand-in is in the unit brief (FR-02 training scan path). Scale/printer failure is **out of scope**.

### 4. Which APIs are involved?

Training Dummy OrgaTEX:

- `GET /api/batches`
- `GET /api/batches/:batchId`
- `GET /api/batches/:batchId/recipe`
- `POST /api/batches/:batchId/consumption`

Dummy Scanner (training stand-in, not a vendor protocol):

- `GET /api/scanner/lookup?code=` → `{ batchId }` or 404

Unavailable control (tests / later failure UI):

- `POST /api/dummy/orgatex/unavailable` with `{ unavailable: true|false }`
- When unavailable: GET queue/recipe/batch and POST consumption return **503**, never 2xx

### 5. How will this be tested?

Vitest HTTP tests against the Fastify instance (inject, no UI):

- Queue 200 contains B-24187, B-24188, B-24190, B-24191 with order, machine, shade, component count, status
- `GET /api/batches/B-24187` includes SO-9931, JET-04, Teal 4C
- Recipe has five components in order; Yellow RGB is 94.0 g ±0.5 on 3 kg
- Unknown batch → 404
- POST consumption with 5/5 actuals, operator, timestamp → 2xx and readable stored record
- Incomplete POST body → 4xx, not stored
- Unavailable flag on → GET `/api/batches` and POST consumption are not 2xx
- Empty store → 200 with `[]` (not 500)

Workbook STEP 18 curl against the real port is a later lab step; this bolt’s Test stage covers the contract tests above.

## Deliverables

- Local Fastify Dummy OrgaTEX service on localhost (port decided at implement, default 8787)
- SQLite schema + seed for four training batches
- B-24187 recipe: Remazol Brill. Blue RSPL, Remazol Red RB, Remazol Yellow RGB, Sodium Sulphate, Soda Ash with target, unit, tol, scale, lot, container, tare
- Other batches: training-placeholder recipes whose length matches queue Comp. counts (5 / 7 / 4) so counts are truthful; they are not a claimed plant recipe
- Consumption persistence
- Unavailable mode
- Dummy Scanner lookup for batch codes equal to batch ids (B-24187 etc.)
- Vitest API tests listed above

## Dependencies

- Node.js + npm (already required by specs.md)
- TypeScript, Fastify, better-sqlite3, Vitest — per `memory-bank/standards/tech-stack.md` and `data-stack.md`
- No other bolts (requires_bolts empty)
- Missing `memory-bank/standards/coding-standards.md` — warn only; implement will use TypeScript/Fastify conventions from tech-stack

## Technical Approach

1. Scaffold a TypeScript Node package (no React yet).
2. Open SQLite at `data/weighingms.sqlite` (gitignored). Migrations create tables on startup.
3. Seed is idempotent: insert four batches and components if missing. B-24187 fields copied from the prototype; session actuals (`done`/`actual`) are **not** stored as OrgaTEX recipe — recipe is read-only targets. Queue status for B-24187 may seed as `WEIGHING` to match the prototype table; others `QUEUED`.
4. Routes read/write only via the repository. JSON is the Dummy contract, not SETEX.
5. `unavailable` is a row in `dummy_flags`. When true, OrgaTEX routes short-circuit to 503 with `{ error: "orgatex_unavailable" }`.
6. POST consumption requires `batchId` existing, `operator`, `timestamp`, and `components[]` with `code` + `actual`. Missing fields → 400. Does **not** enforce 5/5 weighing rules (that is bolt 003/004). Dummy OrgaTEX stores what it is given.
7. Dummy Scanner maps code `B-24187` (and the other three ids) to the same batch id so later UI can scan-or-touch without a vendor scanner protocol.

## Seed snapshot (B-24187 recipe)

| Seq | Name | Code | Target | Unit | Tol | Scale | Lot | Container | Tare |
|-----|------|------|--------|------|-----|-------|-----|-----------|------|
| 1 | Remazol Brill. Blue RSPL | DYE-1180 | 1240.0 | g | 6.0 | 3 kg precision | 2026-0341 | C-09 | 214 g |
| 2 | Remazol Red RB | DYE-2204 | 386.0 | g | 2.0 | 3 kg precision | 2026-0298 | C-11 | 214 g |
| 3 | Remazol Yellow RGB | DYE-4471 | 94.0 | g | 0.5 | 3 kg precision | 2026-0387 | C-12 | 214 g |
| 4 | Sodium Sulphate | AUX-0101 | 24.000 | kg | 0.120 | 32 kg floor | 2026-0112 | D-03 | 1.850 kg |
| 5 | Soda Ash | AUX-0107 | 9.600 | kg | 0.048 | 32 kg floor | 2026-0155 | D-05 | 1.850 kg |

Queue rows from prototype: B-24187 SO-9931 JET-04 Teal 4C 5 WEIGHING; B-24188 SO-9931 JET-07 Teal 4C 5 QUEUED; B-24190 SO-9944 JET-02 Navy 12 7 QUEUED; B-24191 SO-9947 WINCH-01 Rose 08 4 QUEUED.

## Out of scope

- React HMI / Vite
- Dummy Scale and Dummy Printer
- Tolerance, confirm, overshoot, session progression
- Real OrgaTEX / SETEX payloads
- Inventing production vendor APIs (`/api/v1/...` from the brief stays unresolved)

## Acceptance Criteria

- [ ] `GET /api/batches` returns the four training batches from SQLite, not a UI module
- [ ] `GET /api/batches/B-24187` returns SO-9931, JET-04, Teal 4C
- [ ] `GET /api/batches/B-24187/recipe` returns five components; Yellow RGB 94.0 g ±0.5 on 3 kg
- [ ] Unknown batch id → 404
- [ ] `POST /api/batches/B-24187/consumption` with complete body → 2xx and inspectable stored record
- [ ] Incomplete POST body → 4xx
- [ ] Unavailable mode → queue GET and consumption POST are not 2xx
- [ ] Dummy Scanner lookup of `B-24187` returns that batch id
- [ ] No hard-coded live scenario table in a UI
- [ ] Vitest contract tests listed above pass
