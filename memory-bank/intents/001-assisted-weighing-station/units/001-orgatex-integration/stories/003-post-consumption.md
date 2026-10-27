---
id: 003-post-consumption
unit: 001-orgatex-integration
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 001-orgatex-integration
implemented: true
requirements:
  - FR-17
---

# Story: 003-post-consumption

## User Story

**As a** completed weighing session
**I want** to POST actual consumption for B-24187
**So that** Dummy OrgaTEX stores what was weighed

## Acceptance Criteria

- [ ] Given 5/5 confirmed, When POST /api/batches/B-24187/consumption with per-component actuals, operator, timestamp, Then 2xx and a stored record is readable
- [ ] Given Dummy is up, When POST succeeds, Then UI may show CONFIRMED only after this 2xx

## UI/UX impact

S3 Written to OrgaTEX CONFIRMED

## API dependencies

POST /api/batches/:id/consumption

## Test expectations

API test: round-trip stored payload

## Requirements

FR-17

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 002-serve-batch-and-recipe

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Incomplete body | 4xx, not stored as success |

## Out of Scope

- Real OrgaTEX write contract
