---
id: 002-serve-batch-and-recipe
unit: 001-orgatex-integration
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 001-orgatex-integration
implemented: true
requirements:
  - FR-02
  - FR-03
---

# Story: 002-serve-batch-and-recipe

## User Story

**As a** Dummy OrgaTEX consumer
**I want** to GET batch B-24187 and its recipe
**So that** weighing can start with five components

## Acceptance Criteria

- [ ] Given B-24187 exists, When GET /api/batches/B-24187, Then header includes SO-9931, JET-04, Teal 4C
- [ ] When GET /api/batches/B-24187/recipe, Then five components in order Blue RSPL, Red RB, Yellow RGB, Sodium Sulphate, Soda Ash with target, unit, tol, scale, lot, container, tare
- [ ] Given unknown id, When GET, Then 404

## UI/UX impact

S1 selection then S2 rail

## API dependencies

GET /api/batches/:id and /recipe

## Test expectations

Contract test: five components; Yellow RGB 94.0 g ±0.5 on 3 kg

## Requirements

FR-02, FR-03

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-serve-batch-queue

### Enables
- 003-post-consumption

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unknown batch | 404 |

## Out of Scope

- Recipe authoring
