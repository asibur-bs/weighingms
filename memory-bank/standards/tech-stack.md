# Tech Stack

## Overview

WeighingMS is a training-time full-stack operator station: a local React HMI plus Dummy HTTP APIs for OrgaTEX, scale, scanner, and printer. TypeScript is used throughout so the UI, Dummy APIs, and Playwright tests share one language. This stack is not a claim about FCI production infrastructure.

## Languages

TypeScript

Type safety for recipe quantities, tolerance checks, and API contracts. Node.js is already required by specs.md. Playwright runs in the same ecosystem.

## Framework

- **Frontend:** Vite + React — three-screen operator HMI (Select batch, Weigh, Confirm & print). SSR is not required for a local station.
- **Backend:** Fastify on Node.js — Dummy OrgaTEX, Scale, Scanner, and Printer APIs. The UI must consume these APIs and must not hard-code scenario data.

Training API contracts (not real OrgaTEX):

- `GET /api/batches`
- `GET /api/batches/:batchId`
- `GET /api/batches/:batchId/recipe`
- `POST /api/batches/:batchId/consumption`
- `GET /api/scales`
- `GET /api/scales/:scaleId/status`
- `GET /api/scales/:scaleId/weight`
- `POST /api/scales/:scaleId/tare`
- `POST /api/tickets`

## Authentication

Training operator ID stored in session.

Operator traceability is required. There is no real identity provider in this lab. A selected/entered operator identity is recorded on confirmations, consumption write-back, and tickets.

## Infrastructure & Deployment

Local Node process on `localhost`.

This is a demonstrable lab application, not a cloud deployment. Frontend and Dummy APIs run locally so Playwright and curl can hit the same process.

## Package Manager

npm

Already available in this environment. Avoid introducing a second package manager without cause.

## Testing

- **Unit / API:** Vitest
- **End-to-end:** Playwright

Workbook construction requires automated tolerance tests and a Playwright end-to-end run of batch B-24187.

## Data

SQLite (see `memory-bank/standards/data-stack.md`)

Used to seed training scenario B-24187 and persist consumption and ticket records so Dummy API write-back can be inspected.

## Decision Relationships

- TypeScript → Vite/React, Fastify, Vitest, Playwright, npm
- Dummy APIs as first-class product artifacts → Fastify HTTP layer, not UI-embedded fixtures
- Local demonstration + Playwright → localhost deployment, not Vercel/AWS
- Training-only operator identity → session operator ID, not Auth0/Clerk
