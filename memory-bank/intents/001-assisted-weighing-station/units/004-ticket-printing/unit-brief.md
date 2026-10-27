---
unit: 004-ticket-printing
intent: 001-assisted-weighing-station
phase: inception
status: complete
unit_type: backend
default_bolt_type: simple-construction-bolt
created: '2026-10-26T13:58:00Z'
updated: '2026-10-26T13:58:00Z'
---

# Unit Brief: Ticket & Printing (Dummy)

## Purpose

Build the weighing ticket from a completed session and send it to Dummy Printer.

## Scope

### In Scope
- POST `/api/tickets`
- Fields: Batch, Order, Machine, Shade, Date, Operator, Components Target/Actual, barcode/batch id
- Preview payload
- Printer unavailable error

### Out of Scope
- Real printer languages
- Tolerance decisions

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-18 | Ticket generation | Must |

## Story Summary
- **Total Stories**: 2
- **Must Have**: 2
### Stories
- [ ] **001-generate-ticket** - Must
- [ ] **002-printer-unavailable** - Must

## Dependencies

- Depends on: 003-weighing-station (completed actuals)
- Depended by: 005-ui

## Success Criteria

- [ ] Ticket POST stores prototype fields for B-24187
- [ ] Unavailable printer is not reported as printed

## Bolt Suggestions

| Bolt | Type | Objective |
|------|------|-----------|
| Dummy Printer + ticket | simple-construction-bolt | FR-18 |
