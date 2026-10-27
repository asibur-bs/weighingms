---
id: 006-assisted-weighing-station-ui
unit: 005-assisted-weighing-station-ui
intent: 001-assisted-weighing-station
type: simple-construction-bolt
status: complete
stories:
  - 001-select-batch-screen
  - 002-weigh-screen
  - 003-confirm-print-screen
  - 004-show-device-failures
created: '2026-10-26T14:03:00Z'
started: '2026-10-27T07:03:00Z'
completed: '2026-10-27T07:22:55Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-10-27T07:05:00Z'
    artifact: implementation-plan.md
    approved: APPROVE PLAN
  - name: implement
    completed: '2026-10-27T07:14:00Z'
    artifact: implementation-walkthrough.md
    approved: APPROVE IMPLEMENT
  - name: test
    completed: '2026-10-27T07:22:55Z'
    artifact: test-walkthrough.md
    approved: APPROVE TESTS
requires_bolts:
  - 001-orgatex-integration
  - 002-scale-integration
  - 004-weighing-station
  - 005-ticket-printing
enables_bolts: []
requires_units:
  - 001-orgatex-integration
  - 002-scale-integration
  - 003-weighing-station
  - 004-ticket-printing
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: 006-assisted-weighing-station-ui

## Overview

Reproduce Select batch, Weigh, Confirm & print using Dummy APIs only.

## Objective

Operator HMI S1–S3: Demonstrable B-24187 path; no hard-coded live batch table; Playwright-ready UI.

## Stories Included

- [x] **001-select-batch-screen**
- [x] **002-weigh-screen**
- [x] **003-confirm-print-screen**
- [x] **004-show-device-failures**

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan** — approved (APPROVE PLAN, 2026-10-27T07:05:00Z)
- [x] **2. Implement** — approved (APPROVE IMPLEMENT, 2026-10-27T07:14:00Z)
- [x] **3. Test** — approved (APPROVE TESTS, 2026-10-27T07:22:55Z)

## Expected outcome

Demonstrable B-24187 path; no hard-coded live batch table; Playwright-ready UI.

## Test expectations

Playwright happy path; network assertions; failure UI; scale switch 3 kg / 32 kg.

## Dependencies

### Requires
- 001-orgatex-integration
- 002-scale-integration
- 004-weighing-station
- 005-ticket-printing

### Enables
- Inception complete / demonstration

## Success Criteria

- [x] All included stories implemented
- [x] Acceptance criteria met
- [x] Tests listed above passing
- [x] Dummy contracts only — no invented real OrgaTEX APIs
- [x] UI does not hard-code live scenario tables (if this bolt touches UI)

## Notes

Must consume Dummy APIs. Do not copy prototype JavaScript.
