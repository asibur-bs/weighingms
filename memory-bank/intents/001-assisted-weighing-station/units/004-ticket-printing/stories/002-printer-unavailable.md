---
id: 002-printer-unavailable
unit: 004-ticket-printing
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 005-ticket-printing
implemented: true
requirements:
  - FR-20
---

# Story: 002-printer-unavailable

## User Story

**As a** operator
**I want** to see printer Dummy failure
**So that** UI does not claim printed

## Acceptance Criteria

- [ ] Given Dummy Printer unavailable, When POST /api/tickets, Then not 2xx

## UI/UX impact

S3 error

## API dependencies

POST /api/tickets error

## Test expectations

Failure test

## Requirements

FR-20

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-generate-ticket

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Timeout | same as unavailable |

## Out of Scope

- Spooler retry policy
