---
id: 002-scale-integration
unit: 002-scale-integration
intent: 001-assisted-weighing-station
type: simple-construction-bolt
status: complete
stories:
  - 001-serve-scale-weight
  - 002-tare-scale
  - 003-scale-unavailable
created: '2026-10-26T14:03:00Z'
started: '2026-10-26T14:32:00Z'
completed: '2026-10-26T14:39:11Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-10-26T14:33:00Z'
    artifact: implementation-plan.md
    approved: APPROVE PLAN
  - name: implement
    completed: '2026-10-26T14:36:00Z'
    artifact: implementation-walkthrough.md
    approved: APPROVE IMPLEMENT
  - name: test
    completed: '2026-10-26T14:39:11Z'
    artifact: test-walkthrough.md
    approved: APPROVE TESTS
requires_bolts: []
enables_bolts:
  - 003-weighing-station
  - 006-assisted-weighing-station-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 002-scale-integration

## Overview

Dummy 3 kg and 32 kg scales with live weight, tare, unavailable mode.

## Objective

Dummy Scale API: GET /api/scales, status, weight; POST tare; seedable weight for tests.

## Stories Included

- [x] **001-serve-scale-weight**
- [x] **002-tare-scale**
- [x] **003-scale-unavailable**

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan** — approved (APPROVE PLAN, 2026-10-26T14:33:00Z)
- [x] **2. Implement** — approved (APPROVE IMPLEMENT, 2026-10-26T14:36:00Z)
- [x] **3. Test** — approved (APPROVE TESTS, 2026-10-26T14:39:11Z)

## Expected outcome

GET /api/scales, status, weight; POST tare; seedable weight for tests.

## Test expectations

API tests: set weight, read back, tare to 0, unavailable error.

## Dependencies

### Requires
- None

### Enables
- 003-weighing-station
- 006-assisted-weighing-station-ui

## Success Criteria

- [ ] All included stories implemented
- [ ] Acceptance criteria met
- [ ] Tests listed above passing
- [ ] Dummy contracts only — no invented real OrgaTEX APIs
- [ ] UI does not hard-code live scenario tables (if this bolt touches UI)

## Notes

Can start in parallel with 001-orgatex-integration.
