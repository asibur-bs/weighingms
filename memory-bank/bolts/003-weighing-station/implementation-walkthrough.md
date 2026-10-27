---
stage: implement
bolt: 003-weighing-station
created: 2026-10-26T14:50:00Z
---

# Implementation Walkthrough: 003-weighing-station

### Summary

Weighing-session hexagonal module is on the same Fastify host. Sessions start from Dummy OrgaTEX recipes, evaluate Dummy Scale net in milligrams, and confirm only inside tolerance. No React UI.

### Structure Overview

Domain (quantity, tolerance, confirm reasons) has no SQLite or HTTP. Application use-cases talk ports. Infrastructure adapters read Dummy tables in-process. Presentation is `/api/sessions*`.

### Completed Work

- [x] `src/weighing/domain/quantity.ts` - milligram conversion and remaining
- [x] `src/weighing/domain/tolerance.ts` - inclusive zone
- [x] `src/weighing/domain/confirm.ts` - reject reasons
- [x] `src/weighing/domain/scale-map.ts` - recipe label to Dummy Scale id
- [x] `src/weighing/domain/types.ts` - session types
- [x] `src/weighing/application/ports.ts` - recipe, scale, repositories
- [x] `src/weighing/application/session-service.ts` - start, evaluate, tare, activate, confirm
- [x] `src/weighing/infrastructure/schema.sql` - session tables
- [x] `src/weighing/infrastructure/sqlite-session-repo.ts` - persistence
- [x] `src/weighing/infrastructure/dummy-ports.ts` - in-process Dummy adapters
- [x] `src/weighing/routes.ts` - Fastify session API
- [x] `src/db.ts` / `src/app.ts` - migrate and register

### Key Decisions

- Followed ADR-001 milligrams and ADR-002 in-process ports.
- Confirm does not auto-advance (bolt 004).

### Deviations from Plan

- Added `POST /api/sessions/:id/active` with `{ seq }` so Yellow RGB (seq 3) can be activated without bolt 004 progression. Done components cannot be re-opened.

### Dependencies Added

None.

### Developer Notes

- First incomplete on B-24187 is Blue RSPL (seq 1). Activate seq 3 for Yellow RGB.
- Vitest session/tolerance suite is the Test stage.
