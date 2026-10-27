---
stage: implement
bolt: 005-ticket-printing
created: 2026-10-27T06:59:00Z
---

# Implementation Walkthrough: 005-ticket-printing

### Summary

Dummy Printer routes now sit on the same Fastify host. A completed weighing session can generate a stored ticket with prototype fields. Unavailable Dummy Printer returns an error and does not store a ticket. No React UI and no real printer language.

### Structure Overview

Ticket persistence is a SQLite table migrated beside Dummy OrgaTEX and Dummy Scale. HTTP handlers assemble the document from a completed session plus the Dummy batch header, then store JSON for later preview.

### Completed Work

- [x] `src/dummy-printer/schema.sql` - tickets table
- [x] `src/dummy-printer/types.ts` - training ticket JSON
- [x] `src/dummy-printer/routes.ts` - generate, get, list, unavailable flag
- [x] `src/db.ts` - migrate tickets + printer_unavailable flag
- [x] `src/app.ts` - register Dummy Printer routes

### Key Decisions

- **One process**: Dummy Printer shares port 8787.
- **Completed session only**: open or abandoned sessions cannot print.
- **503 stores nothing**: unavailable is not a fake successful print.
- **JSON preview**: HTML ticket layout stays bolt 006.

### Deviations from Plan

None. Vitest `tests/api/tickets.test.ts` is deferred to the Test stage.

### Dependencies Added

None.

### Developer Notes

- POST `{ sessionId }` after `POST /api/sessions/:id/complete`.
- Toggle Dummy with `POST /api/dummy/printer/unavailable`.
- Existing Vitest suite is regression-only until the Test stage.
