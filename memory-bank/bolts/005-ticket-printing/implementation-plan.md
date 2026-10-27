---
stage: plan
bolt: 005-ticket-printing
created: 2026-10-27T06:56:00Z
---

# Implementation Plan: 005-ticket-printing

## Objective

Add a Dummy Printer HTTP API on the existing Fastify process so a completed B-24187 session can generate a stored weighing ticket with prototype fields. Unavailable Dummy Printer is an error, not a fake print. No React UI. No real printer language (Q18 unresolved).

## Workbook / checkpoint answers

### 1. What will change?

The localhost Dummy API host gains ticket generate, stored-ticket preview, and printer unavailable mode. Dummy OrgaTEX, Dummy Scale, and the weighing session stay as they are.

### 2. Which files will be created/modified?

Created:

- `src/dummy-printer/schema.sql`
- `src/dummy-printer/types.ts`
- `src/dummy-printer/routes.ts`
- `tests/api/tickets.test.ts` (Test stage)

Modified:

- `src/db.ts` — migrate printer schema
- `src/app.ts` — register Dummy Printer routes
- bolt.md / construction log after approval

Not in this bolt: React S3, ZPL/ESC-POS, reprint workflow, session tolerance math.

### 3. Which requirements and stories?

- `001-generate-ticket` — FR-18 (prototype fields for completed B-24187)
- `002-printer-unavailable` — FR-20 (printer Dummy only)

FR-19 operator on the ticket comes from the completed session’s `operatorId`.

### 4. Which APIs? (training Dummy, not a vendor protocol)

- `POST /api/tickets` with `{ sessionId }` — 201 stored ticket when session `lifecycle` is `completed`. 409 if not completed / abandoned. 404 unknown session. 503 if Dummy Printer unavailable.
- `GET /api/tickets/:id` — stored ticket for preview (JSON). 404 unknown. 503 if unavailable.
- `GET /api/tickets?batchId=` — list stored tickets for a batch (inspectable, like consumption GET).
- `POST /api/dummy/printer/unavailable` with `{ unavailable: true|false }`

Ticket JSON (prototype fields, not ZPL):

- `batch` (id), `order`, `machine`, `shade`, `date`, `operator`
- `barcode` / `batchId` (same training id, e.g. B-24187)
- `components[]`: `name`, `code`, `target`, `actual`, `unit`
- `title`: `FCI DYEING — WEIGHING TICKET` (training label only)

Assembly reads completed session actuals plus Dummy OrgaTEX batch header (SO-9931 / JET-04 / Teal 4C). Does not invent a SETEX print job.

### 5. How will this be tested?

Vitest inject (Test stage):

- Complete B-24187 5/5, POST `{ sessionId }` → 201; stored ticket has Batch, Order, Machine, Shade, Date, Operator, five TGT/ACT rows, barcode B-24187
- Operator on ticket equals session operator
- Incomplete or quit session → POST tickets not 2xx
- Unavailable → POST (and GET) tickets is 503, never 2xx
- GET ticket by id returns the stored payload

## Deliverables

- Same Fastify app (`npm start`, port 8787)
- SQLite `tickets` + printer unavailable flag
- Ticket built only from a **completed** session
- Preview is stored JSON (HMI HTML in bolt 006)
- Unavailable is not a successful print

## Technical Approach

1. Keep one Fastify process. Register Dummy Printer next to Dummy Scale.
2. Table `tickets`: id, session_id, batch_id, payload JSON, created_at.
3. Flag `printer_unavailable` in `dummy_flags` (same pattern as OrgaTEX).
4. POST requires `sessionId`. Load weighing session; require `lifecycle === completed`. Load batch row for order/machine/shade. Map components target/actual from session (display units, not a second milligram policy).
5. 503 `{ error: "printer_unavailable" }` when the flag is on — do not insert a ticket.
6. No React; no physical printer.

## Out of scope

- React S3 print button / HTML ticket layout (bolt 006, Workbook STEP 27 evidence screens)
- Real printer language (Q18 / A-04)
- Reprint flag (story edge, not Must)
- Changing session confirm/complete rules

## Acceptance Criteria

- [ ] `POST /api/tickets` with a completed B-24187 session → 2xx stored ticket with Batch, Order, Machine, Shade, Date, Operator, component TGT/ACT, barcode/batch id
- [ ] Operator on the ticket matches the session operator
- [ ] Incomplete session cannot store a ticket
- [ ] Unavailable POST is not 2xx and stores nothing
- [ ] `GET /api/tickets/:id` returns the stored JSON for preview
- [ ] No UI hard-coded ticket table as the live source
- [ ] Vitest ticket contract tests pass (Test stage)
