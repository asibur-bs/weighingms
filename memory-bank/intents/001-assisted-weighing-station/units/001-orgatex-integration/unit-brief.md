---
unit: 001-orgatex-integration
intent: 001-assisted-weighing-station
phase: inception
status: complete
unit_type: backend
default_bolt_type: simple-construction-bolt
created: '2026-10-26T13:58:00Z'
updated: '2026-10-26T13:58:00Z'
---

# Unit Brief: OrgaTEX Integration (Dummy)

## Purpose

Provide the training OrgaTEX boundary: read batch queue, batch, recipe; write consumption; optional Dummy Scanner for batch codes. Not a real SETEX adapter.

## Scope

### In Scope
- Dummy HTTP: GET `/api/batches`, GET `/api/batches/:batchId`, GET `/api/batches/:batchId/recipe`, POST `/api/batches/:batchId/consumption`
- Seed B-24187 (and B-24188, B-24190, B-24191)
- Recipe of five components with training fields
- Store consumption records
- Unavailable mode for FR-20
- Dummy Scanner: batch code → batch id

### Out of Scope
- Live weight, tare, tolerance, confirm
- Tickets
- Operator HMI
- Real OrgaTEX contracts

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Batch queue | Must |
| FR-02 | Batch selection (data) | Must |
| FR-03 | Recipe loading | Must |
| FR-17 | OrgaTEX write-back | Must |

## Domain Concepts

| Entity | Description |
|--------|-------------|
| Batch | Dummy OrgaTEX batch header |
| Recipe / RecipeComponent | Read-only seed |
| ConsumptionRecord | Posted actuals |

## Story Summary
- **Total Stories**: 4
- **Must Have**: 4
### Stories
- [ ] **001-serve-batch-queue** - Must
- [ ] **002-serve-batch-and-recipe** - Must
- [ ] **003-post-consumption** - Must
- [ ] **004-orgatex-unavailable** - Must

## Dependencies

- Depends on: none
- Depended by: 003-weighing-station, 005-ui
- External: conceptual OrgaTEX (unimplemented)

## Technical Context

Fastify Dummy API + SQLite seed. Training contracts only.

## Success Criteria

- [ ] Queue GET returns four training batches without UI constants
- [ ] B-24187 recipe has five components
- [ ] POST consumption persists and returns 2xx
- [ ] Unavailable mode does not return fake success

## Bolt Suggestions

| Bolt | Type | Objective |
|------|------|-----------|
| Dummy OrgaTEX API + seed | simple-construction-bolt | FR-01, FR-02, FR-03, FR-17 |
