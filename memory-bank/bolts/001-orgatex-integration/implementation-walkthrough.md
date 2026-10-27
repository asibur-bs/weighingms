---
stage: implement
bolt: 001-orgatex-integration
created: 2026-10-26T14:20:00Z
---

# Implementation Walkthrough: 001-orgatex-integration

### Summary

A local Fastify Dummy OrgaTEX service now serves the training queue, batch header, recipe, and consumption write-back from SQLite. A Dummy Scanner lookup maps batch-card codes to batch ids. Scale and printer APIs were not built in this bolt.

### Structure Overview

Node/TypeScript package. Fastify app factory opens SQLite, migrates, seeds if empty, and registers Dummy OrgaTEX plus scanner routes. The HTTP listener is separate from the app factory so later Vitest inject can reuse the same app.

### Completed Work

- [x] `package.json` - npm scripts and dependencies for Fastify Dummy APIs
- [x] `tsconfig.json` - TypeScript settings for the Node service
- [x] `.gitignore` - ignores node_modules, dist, and SQLite files
- [x] `src/server.ts` - listens on localhost:8787
- [x] `src/app.ts` - builds the Fastify app and wires Dummy routes
- [x] `src/db.ts` - opens SQLite and applies Dummy OrgaTEX schema
- [x] `src/dummy-orgatex/schema.sql` - training tables for batches, recipe, consumption, scanner codes, flags
- [x] `src/dummy-orgatex/seed.ts` - four training batches and B-24187 five-component recipe
- [x] `src/dummy-orgatex/types.ts` - training JSON shapes
- [x] `src/dummy-orgatex/routes.ts` - Dummy OrgaTEX HTTP handlers and unavailable mode
- [x] `src/dummy-orgatex/scanner-routes.ts` - batch-code lookup
- [x] `data/.gitkeep` - keeps the SQLite directory in git

### Key Decisions

- **Dummy contracts only**: Training paths `/api/batches` and `/api/scanner/lookup`, not brief `/api/v1` SETEX shapes.
- **SQLite is the store**: Queue and recipe are not UI constants.
- **Unavailable is a flag**: OrgaTEX routes return 503; scanner stays independent.
- **Placeholder recipes** for B-24188/90/91 so component counts match the prototype queue without inventing a plant recipe.

### Deviations from Plan

- Added `src/app.ts` so the listener and the app factory are separate (needed for later inject tests).
- Added `GET /api/batches/:batchId/consumption` so a posted record is readable without opening SQLite by hand.
- Vitest contract tests deferred to Stage 3 / Workbook STEP 18 (not written in Implement).
- Seed is included now; Workbook STEP 17 will capture seed evidence from this same store.

### Dependencies Added

- [x] `fastify` - Dummy HTTP API host
- [x] `better-sqlite3` - training persistence
- [x] `tsx` - run TypeScript without a build step
- [x] `typescript` - typecheck
- [x] `@types/node` - Node types
- [x] `@types/better-sqlite3` - SQLite types
- [x] `vitest` - reserved for Stage 3 tests

### Developer Notes

- Default URL: `http://127.0.0.1:8787`
- Native `better-sqlite3` rebuild must be allowed (`npm install-scripts approve better-sqlite3`).
- Dummy Scale and Dummy Printer wait for bolts 002 and 005.
