# Data Stack

## Overview

Training-time persistence for Dummy API data: batch queue, recipes, live scale readings, consumption write-back, and printed tickets. Not a production OrgaTEX database.

## Database

SQLite

File-based, zero-ops, inspectable. Enough to seed batch B-24187 / SO-9931 / JET-04 / Teal 4C and five recipe components, then store actual consumption and ticket records.

## ORM / Database Client

`better-sqlite3` with a thin typed repository layer.

Synchronous, simple, and sufficient for a local Dummy API. Schema is owned by WeighingMS training data, not by a real OrgaTEX contract.

## What is stored

- Batches and recipe components (seeded Dummy OrgaTEX data)
- Scale catalogue and last known weight/status
- Confirmed component weighings (lot, container, tare, scale, operator, timestamp, actual weight)
- Consumption write-back records
- Generated tickets

## What is not stored

- Real OrgaTEX schemas or vendor API payloads
- Production credentials or plant network configuration
