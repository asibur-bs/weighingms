---
id: 001-orgatex-integration
unit: 001-orgatex-integration
intent: 001-assisted-weighing-station
type: simple-construction-bolt
status: complete
stories:
  - 001-serve-batch-queue
  - 002-serve-batch-and-recipe
  - 003-post-consumption
  - 004-orgatex-unavailable
created: '2026-10-26T14:03:00Z'
started: '2026-10-26T14:12:00Z'
completed: '2026-10-26T14:29:56Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-10-26T14:15:00Z'
    artifact: implementation-plan.md
    approved: APPROVE PLAN
  - name: implement
    completed: '2026-10-26T14:24:00Z'
    artifact: implementation-walkthrough.md
    approved: APPROVE IMPLEMENT
  - name: test
    completed: '2026-10-26T14:29:56Z'
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

# Bolt: 001-orgatex-integration

## Overview

Working Dummy OrgaTEX: queue, batch, recipe, consumption, unavailable mode, B-24187 seed.

## Objective

Dummy OrgaTEX API: GET /api/batches, GET /api/batches/:id, GET recipe, POST consumption; seed four batches and five-component recipe.

## Stories Included

- [x] **001-serve-batch-queue**
- [x] **002-serve-batch-and-recipe**
- [x] **003-post-consumption**
- [x] **004-orgatex-unavailable**

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan** — approved Checkpoint 5 (APPROVE PLAN, 2026-10-26T14:15:00Z)
- [x] **2. Implement** — approved (APPROVE IMPLEMENT, 2026-10-26T14:24:00Z)
- [x] **3. Test** — approved (APPROVE TESTS, 2026-10-26T14:29:56Z)

## Expected outcome

GET /api/batches, GET /api/batches/:id, GET recipe, POST consumption; seed four batches and five-component recipe.

## Test expectations

curl/API tests for B-24187 queue/recipe/consumption; error when dummy unavailable.

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

First executable bolt with empty requires_bolts: `001-orgatex-integration` (002 is also unblocked in parallel).
