---
stage: plan
bolt: 002-scale-integration
created: 2026-10-26T14:32:00Z
---

# Implementation Plan: 002-scale-integration

## Objective

Add a Dummy Scale HTTP API on the existing Fastify process so live net weight and tare come from a service, not from UI variables. Two training scales: 3 kg precision and 32 kg floor. No UI. No printer. No weighing-session tolerance math.

## Workbook / checkpoint answers

### 1. What will change?

The localhost Dummy API host gains scale catalogue, status, live net weight, tare, seedable weight, and unavailable mode. Existing Dummy OrgaTEX routes stay as they are.

### 2. Which files will be created/modified?

Created:

- `src/dummy-scale/schema.sql`
- `src/dummy-scale/types.ts`
- `src/dummy-scale/seed.ts`
- `src/dummy-scale/routes.ts`
- `tests/api/scale.test.ts` (Test stage)

Modified:

- `src/db.ts` — run scale schema migrate
- `src/app.ts` — seed + register scale routes
- bolt.md / construction log after approval

Not in this bolt: React HMI, Dummy Printer, session confirm rules.

### 3. Which requirements and stories?

- `001-serve-scale-weight` — FR-09 (catalogue + live net)
- `002-tare-scale` — FR-07 (device tare / Re-tare zeros net)
- `003-scale-unavailable` — FR-20 (scale Dummy only)

FR-08 scale *selection* policy stays in bolt 003; this bolt only exposes the two scales.

### 4. Which APIs? (training Dummy, not a vendor protocol)

- `GET /api/scales`
- `GET /api/scales/:scaleId/status`
- `GET /api/scales/:scaleId/weight`
- `POST /api/scales/:scaleId/tare`
- `POST /api/dummy/scales/:scaleId/weight` with `{ net: number }` — test/demo seed
- `POST /api/dummy/scales/:scaleId/unavailable` with `{ unavailable: true|false }`

Scale ids: `scale-3kg`, `scale-32kg`.

### 5. How will this be tested?

Vitest inject (Test stage):

- Catalogue contains 3 kg precision and 32 kg floor
- Set net on `scale-3kg`, GET weight reads it back
- Unknown scale → 404
- Non-zero net, POST tare, GET weight net is 0
- Unavailable → GET weight is 503, not `{ net: 0 }` as a valid reading
- Tare while unavailable → not 2xx

## Deliverables

- Same Fastify app (`npm start`, port 8787)
- SQLite `scales` rows seeded idempotently
- Weight GET returns Dummy net for the requested scale
- Tare zeroes net used by subsequent GET
- Unavailable is an error, not a fake numeric zero
- Status: `READY` or `UNAVAILABLE`

## Technical Approach

1. Keep one Fastify process. Register Dummy Scale next to Dummy OrgaTEX.
2. Table `scales`: id, name, capacity_kg, unit, net, tare_value, unavailable, updated_at.
3. Seed:
   - `scale-3kg` — "3 kg precision", capacity 3 kg, unit `g`, net 0
   - `scale-32kg` — "32 kg floor", capacity 32 kg, unit `kg`, net 0
4. `GET /weight` returns `{ scaleId, net, unit, tare }`. 404 if missing. 503 if unavailable (`{ error: "scale_unavailable" }`).
5. `GET /status` returns `{ scaleId, name, ready, state }` where state is READY or UNAVAILABLE. 503 optional vs 200 with ready:false — **use 200 with `ready: false` and `state: UNAVAILABLE` for status; GET weight is the 503**. Status strip can still show failure without pretending a live reading.
6. `POST /tare` sets `net = 0`, records tare timestamp. Does not copy recipe container tare (214 g); that is session/recipe data in bolt 003.
7. Dummy set-weight writes net only when available.
8. Per-scale unavailable flag (Yellow RGB can fail 3 kg while 32 kg stays up).

## Out of scope

- React HMI / live polling UI
- 10 Hz industrial stream
- Physical scale protocol
- Tolerance / confirm
- Dummy Printer

## Acceptance Criteria

- [ ] `GET /api/scales` lists `scale-3kg` and `scale-32kg`
- [ ] Seeded net on `scale-3kg` is returned by `GET .../weight`
- [ ] Unknown scale id → 404
- [ ] `POST .../tare` then GET weight net is 0
- [ ] Unavailable GET weight is not 2xx and is not a valid numeric reading
- [ ] Tare while unavailable is not 2xx
- [ ] No UI hard-coded live weight
- [ ] Vitest scale contract tests pass (Test stage)
