---
unit: 003-weighing-station
bolt: 004-weighing-station
stage: design
status: complete
updated: 2026-10-26T15:00:00Z
created: 2026-10-26T15:00:00Z
---

# Technical Design - Weighing Station (progression and safety)

## Architecture Pattern

**Same hexagonal ports/adapters in the existing Fastify process (bolt 003 + ADR-002).**

This bolt extends the session application layer. It does not add a second bounded context, a React UI, or a real SETEX client. Dummy OrgaTEX consumption stays the unit-001 HTTP contract; the session talks to it through an in-process **OrgatexConsumptionPort**.

Rationale: progression, overshoot freeze, quit, and override are session invariants. Write-back CONFIRMED is Dummy 2xx, not a UI flag.

## Layer Structure

```text
┌─────────────────────────────────────┐
│  Presentation                       │  Fastify /api/sessions*
├─────────────────────────────────────┤
│  Application                        │  confirm+progress / quit / complete / override
├─────────────────────────────────────┤
│        Domain                       │  Progression, CompletionPermit, OvershootPolicy
├─────────────────────────────────────┤
│     Infrastructure                  │  SQLite + Dummy ports (recipe, scale, consumption)
└─────────────────────────────────────┘
         │                    │
         ▼                    ▼
   Dummy OrgaTEX          Dummy Scale
   GET recipe             GET weight / tare
   POST consumption
```

1. **Presentation** — HTTP only; no milligram arithmetic; map 409/503.
2. **Application** — after in-band confirm, run ProgressionService; complete only with permit then consumption port; quit/override persist without confirming.
3. **Domain** — milligrams (ADR-001); targets immutable; 5/5 gate; override is a log.
4. **Infrastructure** — SQLite session + override_requests; in-process Dummy adapters.

## API Design

Bolt 003 routes remain. Confirm **changes behaviour**: a 200 confirm now advances the next pending (FR-15). `POST /active` stays as a training activator but **must not** skip recipe order.

New/changed training session API (not SETEX):

1. **POST /api/sessions/:sessionId/confirm** — unchanged request. Response 200 snapshot: current `done`, **next pending `active`** (or `activeSeq` null at 5/5). 409 if zone not `in` (including 94.6 g `zone_over`); component stays `active`; **all `target_mg` unchanged**.
2. **GET /api/sessions/:sessionId** — snapshot adds `lifecycle` (`open` | `abandoned` | `completed`), `doneCount`, `totalCount`, `completeAllowed`.
3. **GET /api/sessions/:sessionId/evaluation** — adds `surplus` (`amount`+`unit` or null) when zone is `over`. Remaining-component targets in the snapshot are the seeded values (assert no recalc).
4. **POST /api/sessions/:sessionId/active** — `{ seq }`. 200 if `seq` is the first incomplete (or already active). **Done seq is ignored** (200, no state change). Later pending while an earlier incomplete exists → 409 `recipe_order`. Abandoned/completed → 409.
5. **POST /api/sessions/:sessionId/quit** — Response 200 snapshot `lifecycle: abandoned`; former active becomes `pending` (not `done`); no ConfirmRecord. 409 if already `completed`.
6. **POST /api/sessions/:sessionId/complete** — Response 200 `{ snapshot, consumption }` when 5/5 and Dummy consumption 2xx; `lifecycle: completed`. 409 `incomplete` at 4/5, on quit, or if any component not `done`. 409 `already_completed`. 503 `orgatex_unavailable` — session stays `open` with 5/5 `done`; `completeAllowed` remains true (retry). No fake CONFIRMED.
7. **POST /api/sessions/:sessionId/override** — Request `{ reason }` (string, may be empty). Response 201 override row (session, active seq, operator, timestamp, reason, status `requested`). Does **not** confirm. 94.6 g confirm still 409. 409 if no operator / abandoned / completed.
8. **GET /api/sessions/:sessionId/overrides** — 200 list of override rows.

Identity for each of the five components reuses bolt 003 lot/container on `session_components`. If Implement has no writer for seq 1–5, add training `PUT /api/sessions/:id/components/:seq/identity` `{ lot, container }` — Dummy training only, not an OrgaTEX lot API.

Consumption payload (existing Dummy contract from unit 001): `{ operator, timestamp, components: [{ code, actual }] }` posted to `POST /api/batches/:batchId/consumption`. `actual` is display unit converted from stored milligrams at the adapter edge.

## Data Persistence

Same SQLite file. Additive schema only:

1. **weighing_sessions** — add `lifecycle` (`open` default), `completed_at` (nullable). `active_seq` nullable when 5/5 or abandoned.
2. **session_components** — unchanged columns. **Never UPDATE `target_mg` / `tolerance_mg` on overshoot.**
3. **confirm_records** — unchanged, append-only.
4. **override_requests** — id, session_id, component_seq, operator_id, timestamp, reason, status. FK session. Append-only.

Quantities remain integer milligrams.

## Security Design

1. **Authentication** — session `operatorId` from start; still no IdP.
2. **Authorization** — override is a logged training request, not a privilege that bypasses the band.
3. **Data** — localhost SQLite; no production credentials.

## NFR Implementation

1. **NFR-02 Testability** — domain tests for progression, 4/5 deny, quit, override-does-not-confirm, 94.6 over with frozen targets (mg). API tests on Fastify inject.
2. **NFR-03** — milligrams; no IEEE band or recalc.
3. **NFR-01** — same process, port 8787.
4. **Reliability** — Dummy OrgaTEX 503 on complete does not mark `completed` or report CONFIRMED.

## Error Handling

1. **confirm_rejected** — 409 (existing reasons, including `zone_over` / `zone_under`)
2. **recipe_order** — 409 activate skipped ahead
3. **incomplete** — 409 complete at 4/5 or any not-done
4. **session_abandoned** — 409 complete after quit
5. **already_completed** — 409
6. **orgatex_unavailable** — 503 on complete write-back
7. **scale_unavailable** — 503 evaluation/confirm (unchanged)
8. **missing_operator** — 409 confirm/override

## External Dependencies

1. **Dummy OrgaTEX** — recipe GET (start); **POST consumption** (complete only). In-process `OrgatexConsumptionPort`. Unavailable → 503, never fake CONFIRMED.
2. **Dummy Scale** — live net / tare (unchanged).
3. **HMI / Dummy Printer** — not this bolt.

## Module plan (Implement stage, not now)

1. Domain: ProgressionService, CompletionService, OvershootPolicy, AbandonService, OverrideLogService
2. Application: confirm advances; complete → consumption port; quit; override
3. Infra: `lifecycle` column; `override_requests`; consumption adapter to Dummy module
4. Routes: quit, complete, override, overrides list; confirm/active behaviour change
5. Tests: five-component progression; 4/5 deny; 94.6 no confirm + targets frozen; quit; override log without confirm

## Out of this bolt

Dummy Printer / tickets, React S2/S3, STEP 24 surplus compensation, real override-that-confirms, badge SSO (Q37).
