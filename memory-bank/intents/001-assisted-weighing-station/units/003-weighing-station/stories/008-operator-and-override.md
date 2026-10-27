---
id: 008-operator-and-override
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: should
created: '2026-10-26T14:00:00Z'
assigned_bolt: 004-weighing-station
implemented: true
requirements:
  - FR-19
  - FR-21
---

# Story: 008-operator-and-override

## User Story

**As a** operator/supervisor
**I want** every confirm has an operator; override is logged without auto-confirm
**So that** traceability and no silent over-tol confirm

## Acceptance Criteria

- [ ] Given no operator on session, When confirm, Then rejected
- [ ] When Supervisor override, Then a log record exists and over-tol Confirm stays disabled unless a later rule says otherwise

## UI/UX impact

operator chip; Override button

## API dependencies

session fields

## Test expectations

Test: anonymous confirm rejected; override does not confirm 94.6

## Requirements

FR-19, FR-21

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-start-session-from-batch

### Enables
- 004-evaluate-tolerance-and-confirm

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Shared station PIN | allowed as training session id |

## Out of Scope

- Real badge SSO Q37
