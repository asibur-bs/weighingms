---
id: 004-weighing-station
unit: 003-weighing-station
intent: 001-assisted-weighing-station
type: ddd-construction-bolt
status: complete
stories:
  - 005-progress-and-complete
  - 006-overshoot-blocks-confirm
  - 007-quit-and-incomplete-safe
  - 008-operator-and-override
created: '2026-10-26T14:03:00Z'
started: '2026-10-26T14:57:00Z'
completed: '2026-10-27T06:55:07Z'
current_stage: null
stages_completed:
  - name: model
    completed: '2026-10-26T15:00:00Z'
    artifact: ddd-01-domain-model.md
    approved: APPROVE MODEL
  - name: design
    completed: '2026-10-26T15:01:00Z'
    artifact: ddd-02-technical-design.md
    approved: APPROVE DESIGN
  - name: adr
    completed: '2026-10-26T15:04:00Z'
    artifact: adr-003-session-owns-completion-gate.md
    approved: APPROVE ADR
  - name: implement
    completed: '2026-10-27T06:51:00Z'
    artifact: implementation-walkthrough.md
    approved: APPROVE IMPLEMENT
  - name: test
    completed: '2026-10-27T06:55:07Z'
    artifact: ddd-03-test-report.md
    approved: APPROVE TESTS
requires_bolts:
  - 003-weighing-station
enables_bolts:
  - 005-ticket-printing
  - 006-assisted-weighing-station-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 004-weighing-station

## Overview

Five-component progression, overshoot block without recalc, quit/incomplete, override log.

## Objective

Weighing session domain — progression and safety: B-24187 can complete 5/5; 4/5 cannot write-back; 94.6 g cannot confirm; targets unchanged on overshoot.

## Stories Included

- [x] **005-progress-and-complete**
- [x] **006-overshoot-blocks-confirm**
- [x] **007-quit-and-incomplete-safe**
- [x] **008-operator-and-override**

## Bolt Type

**Type**: ddd-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [x] **1. Model** — approved (APPROVE MODEL, 2026-10-26T15:00:00Z)
- [x] **2. Design** — approved (APPROVE DESIGN, 2026-10-26T15:01:00Z)
- [x] **3. ADR** — accepted ADR-003, ADR-004, ADR-005 (APPROVE ADR, 2026-10-26T15:04:00Z)
- [x] **4. Implement** — approved (APPROVE IMPLEMENT, 2026-10-27T06:51:00Z)
- [x] **5. Test** — approved (APPROVE TESTS, 2026-10-27T06:55:07Z)

## Expected outcome

B-24187 can complete 5/5; 4/5 cannot write-back; 94.6 g cannot confirm; targets unchanged on overshoot.

## Test expectations

Progression tests; overshoot test; quit does not complete; override does not auto-confirm.

## Dependencies

### Requires
- 003-weighing-station

### Enables
- 005-ticket-printing
- 006-assisted-weighing-station-ui

## Success Criteria

- [ ] All included stories implemented
- [ ] Acceptance criteria met
- [ ] Tests listed above passing
- [ ] Dummy contracts only — no invented real OrgaTEX APIs
- [ ] UI does not hard-code live scenario tables (if this bolt touches UI)

## Notes

Includes overshoot detect+block only. No automatic recipe recalculation.
