---
id: 003-weighing-station
unit: 003-weighing-station
intent: 001-assisted-weighing-station
type: ddd-construction-bolt
status: complete
stories:
  - 001-start-session-from-batch
  - 002-identify-component-lot-container
  - 003-select-scale-and-tare
  - 004-evaluate-tolerance-and-confirm
created: '2026-10-26T14:03:00Z'
started: '2026-10-26T14:40:00Z'
completed: '2026-10-26T14:55:32Z'
current_stage: null
stages_completed:
  - name: model
    completed: '2026-10-26T14:42:00Z'
    artifact: ddd-01-domain-model.md
    approved: APPROVE MODEL
  - name: design
    completed: '2026-10-26T14:44:00Z'
    artifact: ddd-02-technical-design.md
    approved: APPROVE DESIGN
  - name: adr
    completed: '2026-10-26T14:47:00Z'
    artifact: adr-001-milligram-fixed-point.md
    approved: APPROVE ADR
  - name: implement
    completed: '2026-10-26T14:51:00Z'
    artifact: implementation-walkthrough.md
    approved: APPROVE IMPLEMENT
  - name: test
    completed: '2026-10-26T14:55:32Z'
    artifact: ddd-03-test-report.md
    approved: APPROVE TESTS
requires_bolts:
  - 001-orgatex-integration
  - 002-scale-integration
enables_bolts:
  - 004-weighing-station
requires_units:
  - 001-orgatex-integration
  - 002-scale-integration
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 003-weighing-station

## Overview

DDD model of session, identity, scale selection, tare, Yellow RGB tolerance confirm.

## Objective

Weighing session domain — confirm: Session can confirm Yellow RGB only in 93.5–94.5 g and persist the traceability set.

## Stories Included

- [x] **001-start-session-from-batch**
- [x] **002-identify-component-lot-container**
- [x] **003-select-scale-and-tare**
- [x] **004-evaluate-tolerance-and-confirm**

## Bolt Type

**Type**: ddd-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [x] **1. Model** — approved (APPROVE MODEL, 2026-10-26T14:42:00Z)
- [x] **2. Design** — approved (APPROVE DESIGN, 2026-10-26T14:44:00Z)
- [x] **3. ADR** — accepted ADR-001, ADR-002 (APPROVE ADR, 2026-10-26T14:47:00Z)
- [x] **4. Implement** — approved (APPROVE IMPLEMENT, 2026-10-26T14:51:00Z)
- [x] **5. Test** — approved (APPROVE TESTS, 2026-10-26T14:55:32Z)

## Expected outcome

Session can confirm Yellow RGB only in 93.5–94.5 g and persist the traceability set.

## Test expectations

Unit tests for five tolerance points; missing lot/container/operator reject confirm.

## Dependencies

### Requires
- 001-orgatex-integration
- 002-scale-integration

### Enables
- 004-weighing-station

## Success Criteria

- [ ] All included stories implemented
- [ ] Acceptance criteria met
- [ ] Tests listed above passing
- [ ] Dummy contracts only — no invented real OrgaTEX APIs
- [ ] UI does not hard-code live scenario tables (if this bolt touches UI)

## Notes

DDD bolt. Do not implement until 001 and 002 Dummy APIs exist.
