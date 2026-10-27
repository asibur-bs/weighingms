---
intent: 001-assisted-weighing-station
phase: inception
status: units-approved
bolt_plan_approved_at: 2026-10-26T14:06:00Z
updated: 2026-10-26T14:00:00Z
approved_at: 2026-10-26T14:00:00Z
---

# Assisted Dyestuff Weighing Station — Unit Decomposition

Units are **capabilities**, not the three prototype screens. The Weighing Station is the weighing-session domain, not “screen 2”. Integrations are separate Dummy-API units.

## Units overview

### Unit 001-orgatex-integration

**Responsibility:** Training stand-in for OrgaTEX: batch queue, batch header, recipe (read-only), consumption write-back; Dummy Scanner for batch identity.

**Included capabilities:** FR-01, FR-02 (data), FR-03, FR-17; Dummy Scanner mapping a batch code to a batch id.

**Dependencies:** none (foundation Dummy)

**Why separate:** OrgaTEX is a different system with a different ownership boundary. Dummy contracts must not leak into weighing arithmetic.

**Bolt type:** Simple Construction Bolt (integration/utility)

### Unit 002-scale-integration

**Responsibility:** Dummy Scale catalogue, status, live weight, tare command, scale unavailability.

**Included capabilities:** scale I/O for FR-08/FR-09/FR-07 (device side); scale failure signalling.

**Dependencies:** none (foundation Dummy)

**Why separate:** Physical/device boundary. Weight source must be an API, not a UI variable.

**Bolt type:** Simple Construction Bolt (integration)

### Unit 003-weighing-station

**Responsibility:** Weighing session domain — active component, lot/container/tare policy, scale selection rule, target/remaining/tolerance, confirm, overshoot block, progression, completion, operator on records, override log, safe behaviour when integrations fail.

**Included capabilities:** FR-04, FR-05, FR-06, FR-07 (policy), FR-08 (selection rule), FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-19, FR-20, FR-21

**Dependencies:** 001-orgatex-integration, 002-scale-integration

**Why separate:** This is the product’s domain core, not a screen. Tolerance, progression, and overshoot live here even if the HMI changes.

**Bolt type:** DDD Construction Bolt (domain-heavy)

### Unit 004-ticket-printing

**Responsibility:** Build ticket payload and Dummy Printer POST; print/preview; printer failure.

**Included capabilities:** FR-18; printer part of FR-20 as consumed by session completion.

**Dependencies:** 003-weighing-station (completed session actuals)

**Why separate:** Printer is a device boundary and ticket is a document, not weighing math.

**Bolt type:** Simple Construction Bolt (integration/utility)

### Unit 005-assisted-weighing-station-ui

**Responsibility:** Operator HMI reproducing S1–S3. Consumes Dummy/session APIs. No hard-coded scenario tables.

**Included capabilities:** FR-22; presentation of all operator-facing FRs

**Dependencies:** 001, 002, 003, 004

**Why separate:** Feature-based frontend per project type; Simple bolts; must not own Dummy data.

**Bolt type:** Simple Construction Bolt (UI)

## Requirement-to-unit mapping

| FR | Requirement | Primary unit |
|----|-------------|--------------|
| FR-01 | Batch queue | 001-orgatex-integration |
| FR-02 | Batch selection (data) | 001-orgatex-integration |
| FR-03 | Recipe loading | 001-orgatex-integration |
| FR-04 | Component identification | 003-weighing-station |
| FR-05 | Dyestuff lot | 003-weighing-station |
| FR-06 | Container | 003-weighing-station |
| FR-07 | Tare | 003-weighing-station (uses 002) |
| FR-08 | Scale selection | 003-weighing-station (uses 002) |
| FR-09 | Live weight | 002-scale-integration |
| FR-10 | Target quantity | 003-weighing-station |
| FR-11 | Remaining quantity | 003-weighing-station |
| FR-12 | Tolerance | 003-weighing-station |
| FR-13 | Confirmation | 003-weighing-station |
| FR-14 | Overshoot | 003-weighing-station |
| FR-15 | Component progression | 003-weighing-station |
| FR-16 | Batch completion | 003-weighing-station |
| FR-17 | OrgaTEX write-back | 001-orgatex-integration |
| FR-18 | Ticket generation | 004-ticket-printing |
| FR-19 | Operator traceability | 003-weighing-station |
| FR-20 | Failures | 003-weighing-station (orchestrates 001/002/004) |
| FR-21 | Supervisor override | 003-weighing-station |
| FR-22 | No UI-hard-coded data | 005-assisted-weighing-station-ui |

Every Must FR has a unit. UI presents them; it does not own Dummy contracts except as HTTP client.

## Dependency graph

```text
001-orgatex-integration ──┐
                          ├──► 003-weighing-station ──► 004-ticket-printing ──┐
002-scale-integration  ───┘                                                    ├──► 005-ui
                                                                               ┘
001 and 002 also consumed directly by 005 for queue/weight display.
```

## Execution order

1. 001 Dummy OrgaTEX (+ scanner stand-in)
2. 002 Dummy Scale (can parallel 001)
3. 003 Weighing session domain
4. 004 Tickets
5. 005 Operator UI (can start shell earlier, must wire APIs last)

## Checkpoint 3 checklist — APPROVED 2026-10-26T14:00:00Z

- [x] Does every requirement belong to a Unit?
- [x] Are Units capability-oriented?
- [x] Are dependencies understandable?
- [x] Is the Weighing Station treated as more than a screen?
- [x] Are integrations separated appropriately?
