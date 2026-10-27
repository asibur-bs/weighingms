---
id: 001-generate-ticket
unit: 004-ticket-printing
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 005-ticket-printing
implemented: true
requirements:
  - FR-18
---

# Story: 001-generate-ticket

## User Story

**As a** operator
**I want** to generate a ticket after 5/5
**So that** print/preview matches prototype fields

## Acceptance Criteria

- [ ] Given completed B-24187, When POST /api/tickets, Then 2xx and stored ticket has Batch, Order, Machine, Shade, Date, Operator, component TGT/ACT, barcode/batch id

## UI/UX impact

S3 ticket + Print F1

## API dependencies

POST /api/tickets

## Test expectations

API + UI preview test

## Requirements

FR-18

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- weighing 005-progress-and-complete

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Reprint | could mark reprint later; not Must |

## Out of Scope

- Real printer language Q18
