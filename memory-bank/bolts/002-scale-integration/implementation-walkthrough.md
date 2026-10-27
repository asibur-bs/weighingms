---
stage: implement
bolt: 002-scale-integration
created: 2026-10-26T14:35:00Z
---

# Implementation Walkthrough: 002-scale-integration

### Summary

Dummy Scale routes now sit on the same Fastify host as Dummy OrgaTEX. Two training scales expose catalogue, status, live net weight, tare-to-zero, seedable net, and per-scale unavailable mode. No UI and no printer.

### Structure Overview

Scale persistence is a SQLite table migrated beside the OrgaTEX schema. Seed inserts the 3 kg and 32 kg instruments if missing. HTTP handlers live in a Dummy Scale module registered from the existing app factory.

### Completed Work

- [x] `src/dummy-scale/schema.sql` - scales table
- [x] `src/dummy-scale/types.ts` - training JSON shapes
- [x] `src/dummy-scale/seed.ts` - 3 kg precision and 32 kg floor
- [x] `src/dummy-scale/routes.ts` - Dummy Scale HTTP handlers
- [x] `src/db.ts` - applies scale schema on open
- [x] `src/app.ts` - seeds scales and registers routes

### Key Decisions

- **One process**: Scale Dummy shares port 8787 with OrgaTEX Dummy.
- **Per-scale unavailable**: 3 kg can fail while 32 kg stays READY.
- **Weight 503 vs status 200**: GET weight does not return a fake net 0; GET status still reports UNAVAILABLE for a strip.
- **Tare zeros Dummy net**: recipe container tare 214 g remains session data.

### Deviations from Plan

None. Vitest `tests/api/scale.test.ts` is deferred to the Test stage.

### Dependencies Added

None (reused Fastify, better-sqlite3, TypeScript).

### Developer Notes

- Scale ids: `scale-3kg`, `scale-32kg`
- Seed net with `POST /api/dummy/scales/:id/weight`
- Existing OrgaTEX Vitest suite still 9/9
