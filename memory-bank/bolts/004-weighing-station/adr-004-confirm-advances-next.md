---
bolt: 004-weighing-station
created: 2026-10-26T15:03:00Z
status: accepted
superseded_by: null
---

# ADR-004: Valid confirm activates the next pending component

## Context

Bolt 003 confirm marked a component `done` and **did not** change `activeSeq`. Tests used `POST /active` to reach Yellow RGB. FR-15 now requires: after a valid confirm, the next pending component becomes active (or none remain at 5/5). Leaving confirm non-advancing would force the HMI to call `/active` after every OK, and would drift from the approved requirement.

## Decision

A **200 confirm** runs ProgressionService: current `done`, next `pending` in recipe order becomes `active`; if none remain, `activeSeq` is null and `completeAllowed` may become true. `POST /active` remains a training helper that **cannot skip ahead** (later pending while an earlier incomplete exists → 409 `recipe_order`). Selecting a `done` component is ignored.

## Rationale

FR-15 and UI analysis both describe Confirm → next pending. Recipe order stays one active component.

### Alternatives Considered

1. **Keep bolt-003 confirm (no advance)** — extra `/active` after every OK; contradicts FR-15.
2. **Operator picks any pending component** — breaks “sequence for B-24187”; parallel weigh is out of scope.
3. **Auto-advance on valid confirm (chosen)** — one OK, one next; `/active` cannot skip the queue.

## Consequences

### Positive

- HMI Confirm can reload the snapshot and show the next rail item.
- 5/5 is a session fact (`activeSeq` null + `doneCount === totalCount`), not a UI count.
- Bolt 003 Yellow RGB test path (`POST /active` to seq 3) is no longer the happy path.

### Negative

- Existing 003 tests that confirm then expect the same `activeSeq` will break and must assert the next component.

### Risks

- Accidental skip via `/active` — mitigated by `recipe_order` 409.

## Related

- **Stories**: 005-progress-and-complete
- **Standards**: FR-15
- **Previous ADRs**: none
