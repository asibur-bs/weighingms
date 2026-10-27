---
id: 001-start-session-from-batch
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 003-weighing-station
implemented: true
requirements:
  - FR-04
  - FR-15
  - FR-19
---

# Story: 001-start-session-from-batch

## User Story

**As a** operator
**I want** to start a session from B-24187 recipe
**So that** one active incomplete component is ready

## Acceptance Criteria

- [ ] Given recipe loaded, When session starts, Then first incomplete component is active and others pending/done as seeded
- [ ] Then operator identity is attached to the session

## UI/UX impact

S2 rail n of 5

## API dependencies

uses 001 recipe GET

## Test expectations

Unit test: active component set

## Requirements

FR-04, FR-15, FR-19

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- orgatex 002-serve-batch-and-recipe

### Enables
- 002-identify-component-lot-container

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No recipe | session does not start |

## Out of Scope

- Multi-station
