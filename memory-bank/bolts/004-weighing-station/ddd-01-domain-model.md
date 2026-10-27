---
unit: 003-weighing-station
bolt: 004-weighing-station
stage: model
status: complete
updated: 2026-10-26T14:57:00Z
created: 2026-10-26T14:57:00Z
---

# Static Model - Weighing Station (progression and safety)

## Bounded Context

**Same weighing-session context as bolt 003.** One operator, one batch, one WeighingSession root. This bolt does not split a second aggregate.

Bolt 003 already owns start, identity, scale/tare, tolerance, and confirm-in-band. This bolt adds:

- recipe-order progression after a valid confirm
- batch complete / write-back gate (5/5 only)
- overshoot detect+block with **no recipe recalc**
- quit / abandon without completing
- override request log that does **not** auto-confirm

It still does **not** own Dummy OrgaTEX HTTP, Dummy Scale HTTP, tickets, or HMI layout.

Constrained by **ADR-001** (integer milligrams) and **ADR-002** (in-process Dummy ports). Quantity comparisons stay milligrams. Write-back is an application call through a Dummy OrgaTEX port, not a second SETEX client.

## Domain Entities

- **WeighingSession**: `id`, `batchId`, `operatorId`, `startedAt`, ordered `ComponentWeighing` list, `activeSeq` (nullable when all done or quit), `lifecycle` (`open` | `abandoned` | `completed`). Rules: operator required; at most one `active` component while `open`; `completed` only when every component is `done`; `abandoned` never becomes `completed` without a later explicit restart (out of this bolt).
- **ComponentWeighing**: same properties as bolt 003 (`seq`, `name`, `code`, `state`, lot, container, tare, scale, unit, target, tolerance, `actual`). Additional rules for this bolt: `done` cannot be re-opened; selecting a `done` component is ignored; only the first incomplete component in recipe order may be `active`.
- **ConfirmRecord**: unchanged — append-only traceability set on valid in-band confirm.
- **OverrideRequest**: `sessionId`, `componentSeq`, `operatorId`, `timestamp`, `reason`, `status` (`requested`). Rules: written when Supervisor Override is activated; does not change `ToleranceZone`; does not mark the component `done`; does not enable confirm while zone is `over` or `under`.
- **ConsumptionWriteBack**: not an entity in this context. Dummy OrgaTEX stores the posted record. This context only decides whether write-back is **allowed**.

## Value Objects

- **Quantity / ToleranceBand / ToleranceZone / ScaleAssignment / OperatorId / LiveNetWeight**: unchanged from bolt 003. Overshoot is zone `over` in milligrams (Yellow RGB 94.6 g = 94600 mg; upper bound 94500 mg).
- **RecipeSequence**: ordered component codes for the batch. B-24187: Blue RSPL → Remazol Red RB → Remazol Yellow RGB → Sodium Sulphate → Soda Ash.
- **SessionLifecycle**: `open` (weighing), `abandoned` (quit), `completed` (5/5, write-back permitted).
- **CompletionPermit**: `allowed` | `denied`. Allowed only when lifecycle would be `completed` (all components `done`) and operator present. Denied at 4/5, on quit, and while any component is not `done`.
- **Surplus**: `net − (target + tolerance)` when zone is `over`, else none. Observable for display. **Must not** be applied as new remaining-component targets.

## Aggregates

- **WeighingSession (root)**
  - Members: ComponentWeighing list, ConfirmRecords, OverrideRequests, last LiveNetWeight (not system of record for mass).
  - Invariants (bolt 003 still hold, plus):
    1. At most one `active` component.
    2. Confirm only if zone is `in`, lot/container/operator/identity/valid net hold, and lifecycle is `open`.
    3. Recipe **targets are immutable** in this context. Over-tolerance never rewrites remaining targets (no prototype surplus table, no shade-ratio recalc).
    4. After a **valid** confirm: that component is `done`; the next `pending` in `RecipeSequence` becomes `active`; if none remain, `activeSeq` is empty and the session may complete.
    5. Invalid / under / over confirm is rejected; the component stays **not** `done` (still `active`).
    6. `CompletionPermit` is denied until 5/5 `done`. 4/5 cannot write-back.
    7. Quit sets lifecycle `abandoned`, does not write a ConfirmRecord, does not mark the active component `done` (it returns to `pending`).
    8. OverrideRequest appends a log row only. Confirm of 94.6 g remains rejected.
    9. Activating a `done` component is ignored. Activating a later `pending` while an earlier incomplete exists is forbidden (recipe order).
    10. Anonymous confirm remains rejected (operator required).

## Domain Events

- **ComponentConfirmed** (extended): ConfirmRecord written; component `done`; if a next pending exists it becomes active (`ActiveAdvanced`); if none remain, `SessionReadyToComplete`.
- **ActiveAdvanced**: next pending in recipe order is now `active`.
- **SessionReadyToComplete**: 5/5 `done`; no active component.
- **BatchCompleted**: lifecycle `completed`; CompletionPermit granted; application may POST Dummy consumption.
- **CompletionRejected**: 4/5 or incomplete or abandoned or Dummy OrgaTEX unavailable — no fake CONFIRMED write-back.
- **OvershootDetected**: zone `over`; ConfirmRejected; surplus optional; targets unchanged.
- **ConfirmRejected**: same reasons as bolt 003, including `zone_over` / `zone_under`.
- **SessionAbandoned**: Quit; active not `done`; write-back forbidden.
- **OverrideRequested**: OverrideRequest appended; confirm rules unchanged.

## Domain Services

- **ProgressionService**: `afterConfirm(session)` — mark current `done`, activate next pending or clear active. Depends on RecipeSequence. Does not run on rejected confirm.
- **CompletionService**: `permit(session)` / `complete(session)` — 5/5 + operator → `completed`; otherwise deny. Application then calls Dummy OrgaTEX consumption port (ADR-002). Dummy 503 → CompletionRejected, session stays `open` with 5/5 done (weighing records kept; write-back not CONFIRMED).
- **OvershootPolicy**: `onOver(session, net)` — zone `over`; block confirm; return Surplus; **do not** mutate remaining targets. STEP 24 alternative rules are out of scope.
- **AbandonService**: `quit(session)` — lifecycle `abandoned`; active → `pending`; no confirm.
- **OverrideLogService**: `request(session, reason)` — append OverrideRequest; never calls confirm.

ToleranceService / RemainingService / SessionFactory from bolt 003 are unchanged.

## Repository Interfaces

- **WeighingSessionRepository**: `save`, `getById`, `getActiveByBatch` (from 003).
- **ConfirmRecordRepository**: `append`, `listBySession` (from 003).
- **OverrideRequestRepository**: `append`, `listBySession`.

No recipe repository. Consumption persistence belongs to Dummy OrgaTEX (unit 001), invoked only when CompletionPermit is allowed.

## Ubiquitous Language

- **Progression**: after a valid confirm, the next pending component becomes the only active one.
- **5/5**: all five B-24187 components `done`; only then may the batch complete.
- **4/5**: four done, one not; write-back forbidden.
- **Overshoot / OVER**: live net above inclusive upper band; confirm blocked; surplus visible; targets stay as seeded.
- **No auto-recalc**: remaining recipe quantities are not rewritten from surplus.
- **Quit / abandon**: leave the session without marking the current component done and without write-back.
- **Complete / write-back**: session-domain permit plus Dummy OrgaTEX POST consumption; CONFIRMED only after Dummy 2xx.
- **Override**: logged request; not a silent over-tolerance confirm.
- **Done is ignored**: operator cannot re-open a confirmed component in this bolt.

## Stories covered

1. **005-progress-and-complete** — ProgressionService + CompletionService; invalid weight stays not done; next pending activates; 4/5 cannot write-back; 5/5 may complete; done selection ignored.
2. **006-overshoot-blocks-confirm** — OvershootPolicy; Yellow RGB 94.6 g zone `over`; Confirm rejected; remaining targets unchanged.
3. **007-quit-and-incomplete-safe** — AbandonService; Quit does not mark done; incomplete forbids consumption POST.
4. **008-operator-and-override** — anonymous confirm rejected; OverrideRequest log; 94.6 g still cannot confirm.

Out of this bolt: Dummy Printer / tickets (005), HMI screens (006), STEP 24 surplus-compensation alternatives, real badge SSO (Q37).
