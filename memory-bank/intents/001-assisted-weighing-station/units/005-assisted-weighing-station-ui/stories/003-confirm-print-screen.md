---
id: 003-confirm-print-screen
unit: 005-assisted-weighing-station-ui
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 006-assisted-weighing-station-ui
implemented: true
requirements:
  - FR-16
  - FR-17
  - FR-18
  - FR-22
---

# Story: 003-confirm-print-screen

## User Story

**As a** operator
**I want** to see 5/5, OrgaTEX CONFIRMED after POST, and ticket preview
**So that** screen 3 matches the prototype flow

## Acceptance Criteria

- [ ] Given 5/5, Then S3 shows 5 of 5
- [ ] Written to OrgaTEX CONFIRMED only after POST consumption 2xx
- [ ] Print calls POST /api/tickets and shows ticket fields

## UI/UX impact

S3 Confirm & print

## API dependencies

POST consumption, POST tickets

## Test expectations

Playwright e2e end of B-24187

## Requirements

FR-16, FR-17, FR-18, FR-22

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 002-weigh-screen, orgatex 003, ticket 001

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Printer down | no silent printed |

## Out of Scope

- Next batch returns to S1
