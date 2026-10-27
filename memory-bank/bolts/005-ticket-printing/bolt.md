---
id: 005-ticket-printing
unit: 004-ticket-printing
intent: 001-assisted-weighing-station
type: simple-construction-bolt
status: complete
stories:
  - 001-generate-ticket
  - 002-printer-unavailable
created: '2026-10-26T14:03:00Z'
started: '2026-10-27T06:56:00Z'
completed: '2026-10-27T07:02:20Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-10-27T06:58:00Z'
    artifact: implementation-plan.md
    approved: APPROVE PLAN
  - name: implement
    completed: '2026-10-27T07:01:00Z'
    artifact: implementation-walkthrough.md
    approved: APPROVE IMPLEMENT
  - name: test
    completed: '2026-10-27T07:02:20Z'
    artifact: test-walkthrough.md
    approved: APPROVE TESTS
requires_bolts:
  - 004-weighing-station
enables_bolts:
  - 006-assisted-weighing-station-ui
requires_units:
  - 003-weighing-station
blocks: false
complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 005-ticket-printing

## Overview

Ticket payload from completed session; Dummy Printer POST; failure mode.

## Objective

Dummy Printer and ticket: POST /api/tickets stores prototype fields; unavailable is not 2xx.

## Stories Included

- [x] **001-generate-ticket**
- [x] **002-printer-unavailable**

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan** — approved (APPROVE PLAN, 2026-10-27T06:58:00Z)
- [x] **2. Implement** — approved (APPROVE IMPLEMENT, 2026-10-27T07:01:00Z)
- [x] **3. Test** — approved (APPROVE TESTS, 2026-10-27T07:02:20Z)

## Expected outcome

POST /api/tickets stores prototype fields; unavailable is not 2xx.

## Test expectations

API test of ticket fields; printer unavailable test.

## Dependencies

### Requires
- 004-weighing-station

### Enables
- 006-assisted-weighing-station-ui

## Success Criteria

- [ ] All included stories implemented
- [ ] Acceptance criteria met
- [ ] Tests listed above passing
- [ ] Dummy contracts only — no invented real OrgaTEX APIs
- [ ] UI does not hard-code live scenario tables (if this bolt touches UI)

## Notes

Ticket fields follow the prototype; Dummy Printer only.
