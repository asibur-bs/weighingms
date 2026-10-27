---
unit: 003-weighing-station
bolt: 003-weighing-station
stage: design
status: complete
updated: 2026-10-26T14:43:00Z
created: 2026-10-26T14:43:00Z
---

# Technical Design - Weighing Station

## Architecture Pattern

**Hexagonal (ports and adapters) inside the existing Fastify process.**

Domain stays free of HTTP and SQLite. Application use-cases orchestrate Dummy OrgaTEX (recipe in), Dummy Scale (net/tare), and session persistence. Presentation is a small Fastify session API for later HMI (bolt 006). No React in this bolt.

Rationale: training stack is already Fastify + SQLite; the domain rules (tolerance, confirm) must be unit-testable without Dummy HTTP.

## Layer Structure

```text
┌─────────────────────────────────────┐
│  Presentation                       │  Fastify /api/sessions*
├─────────────────────────────────────┤
│  Application                        │  Start / evaluate / tare / confirm
├─────────────────────────────────────┤
│  Domain                             │  Session, Quantity, Tolerance, Remaining
├─────────────────────────────────────┤
│  Infrastructure                     │  SQLite session store; Dummy ports
└─────────────────────────────────────┘
         │                    │
         ▼                    ▼
   Dummy OrgaTEX          Dummy Scale
   (recipe GET)           (weight / tare)
```

1. **Presentation** — HTTP only; maps 409/503; no arithmetic.
2. **Application** — loads recipe, maps scale, reads live net, calls domain confirm, saves.
3. **Domain** — Quantity in milligrams internally; inclusive band; confirm invariants.
4. **Infrastructure** — `WeighingSessionRepository` SQLite; `OrgatexRecipePort` and `ScalePort` in-process adapters to Dummy modules (same Node process, not invented SETEX).

## API Design

Training session API (not SETEX):

1. **POST /api/sessions** — Request: `{ batchId, operatorId }` — Response 201: session snapshot. 400 if no recipe / empty operator.
2. **GET /api/sessions/:sessionId** — Response 200: batch, operator, components (state, lot, container, scaleId, target, unit, actual), active seq. 404 unknown.
3. **GET /api/sessions/:sessionId/evaluation** — Response 200: `{ net, unit, remaining, zone, confirmAllowed, reasons[] }`. 503 if scale unavailable (`confirmAllowed: false`, no fake net 0 used as valid).
4. **POST /api/sessions/:sessionId/tare** — Response 200 evaluation after Dummy Scale tare. 503 if scale unavailable.
5. **POST /api/sessions/:sessionId/confirm** — Response 200 snapshot with component done + confirm record. 409 if zone not `in` or lot/container/operator/identity/weight invalid.

Snapshot includes Yellow RGB fields when that component is active: target 94.0 g, band 93.5–94.5 g.

## Data Persistence

SQLite (same training file as Dummy APIs):

1. **weighing_sessions** — id, batch_id, operator_id, active_seq, started_at. One active session per id.
2. **session_components** — session_id, seq, name, code, state, lot, container, recipe_tare, tare_unit, scale_id, unit, target_mg, tolerance_mg, actual_mg (nullable). FK session.
3. **confirm_records** — id, session_id, component_seq, actual_mg, operator_id, lot, container, tare_mg, scale_id, timestamp. Append-only.

Quantities stored as **integer milligrams** (94.0 g = 94000; 0.5 g = 500; 24.000 kg = 24000000). Display converts to g or kg per component unit.

## Security Design

1. **Authentication** — training operatorId on start; no IdP (tech-stack).
2. **Authorization** — none beyond “session has operator”; supervisor override is bolt 004.
3. **Data** — localhost SQLite; no production credentials.

## NFR Implementation

1. **NFR-02 Testability** — `ToleranceService.zone` unit-tested at 93.4 / 93.5 / 94.0 / 94.5 / 94.6 g (mg integers). Confirm rejection tests for missing lot/container/operator without Fastify.
2. **NFR-03 Quantity arithmetic** — milligrams only inside domain; no IEEE float for band checks.
3. **NFR-01 Local demo** — same port 8787 process as Dummy APIs.
4. **Reliability** — scale 503 blocks confirm; invalid live net is not stored as actual 0.

## Error Handling

1. **no_recipe / empty_operator** — 400
2. **session_not_found** — 404
3. **confirm_rejected** — 409 `{ error, reasons[] }` (missing_lot, missing_container, missing_operator, identity_mismatch, invalid_weight, zone_under, zone_over)
4. **scale_unavailable** — 503 `{ error: "scale_unavailable" }`
5. **component_already_done** — 409

## External Dependencies

1. **Dummy OrgaTEX** — GET batch + recipe when starting session (unit 001). In-process port.
2. **Dummy Scale** — GET weight / POST tare on assigned `scale-3kg` or `scale-32kg` (unit 002). In-process port.
3. **HMI** — not this bolt; will call `/api/sessions*` later.
4. **Printer / consumption POST** — bolt 004/005, not here.

## Module plan (Implement stage, not now)

1. `src/weighing/domain/` — Quantity, ToleranceBand, WeighingSession
2. `src/weighing/application/` — startSession, evaluate, tare, confirm
3. `src/weighing/infra/` — sqlite repos, orgatex/scale adapters
4. `src/weighing/routes.ts` — Fastify register on existing app
5. `tests/unit/tolerance.test.ts` — five Yellow RGB points
6. `tests/api/session.test.ts` — start B-24187, confirm in band, reject 93.4/94.6, missing lot

## Out of this bolt

Progression to next component / 5/5, overshoot recipe freeze (already cannot confirm), quit, override, React UI.
