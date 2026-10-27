---
stage: implement
bolt: 004-weighing-station
created: 2026-10-26T15:09:00Z
---

# Implementation Walkthrough: 004-weighing-station

### Summary

Session domain now progresses after a valid confirm, gates Dummy consumption at 5/5, quits without completing, and logs override without confirming. Recipe `target_mg` is never updated on overshoot. No React UI.

### Structure Overview

Same hexagonal module. New domain helpers for progression, surplus, and completion permit. Application adds quit / complete / override. Infrastructure adds `override_requests` and an in-process Dummy consumption port (ADR-002 / ADR-003).

### Completed Work

- [x] `src/weighing/domain/progression.ts` - next pending, `/active` recipe order, 5/5 permit
- [x] `src/weighing/domain/overshoot.ts` - surplus milligrams; display only
- [x] `src/weighing/domain/types.ts` - lifecycle, nullable activeSeq, OverrideRequest
- [x] `src/weighing/application/ports.ts` - OverrideRequestRepository, OrgatexConsumptionPort
- [x] `src/weighing/application/session-service.ts` - confirm advances; quit; complete; override; identity PUT
- [x] `src/weighing/infrastructure/schema.sql` - lifecycle, override_requests
- [x] `src/weighing/infrastructure/sqlite-session-repo.ts` - persist lifecycle + overrides
- [x] `src/weighing/infrastructure/dummy-ports.ts` - Dummy consumption insert (503 if unavailable)
- [x] `src/weighing/routes.ts` - `/quit`, `/complete`, `/override`, `/overrides`, identity PUT
- [x] `src/db.ts` - additive columns for existing SQLite files
- [x] `tests/api/session.test.ts` - Yellow RGB reached by confirming Blue then Red (not `/active` skip)

### Key Decisions

- Followed ADR-003 (session owns write-back), ADR-004 (confirm advances), ADR-005 (freeze targets), plus ADR-001/002.
- `/active` skip-ahead is 409 `recipe_order`. Done seq is ignored (200).
- Dummy OrgaTEX 503 on complete leaves 5/5 `done` and `open` so retry is possible.

### Deviations from Plan

- Training `PUT /api/sessions/:id/components/:seq/identity` added so lot/container can be set without touching SQLite in tests. Recipe seed already fills identity for B-24187.

### Dependencies Added

None.

### Developer Notes

- Confirm Blue 1240 g then Red 386 g to reach Yellow RGB.
- 4/5 `POST /complete` → 409. 5/5 + Dummy 2xx → 200 `{ snapshot, consumption }`.
- Vitest cases for progression / quit / override are the Test stage.
