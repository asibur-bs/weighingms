---
bolt: 003-weighing-station
created: 2026-10-26T14:46:00Z
status: accepted
superseded_by: null
---

# ADR-001: Integer milligrams for weighing quantities

## Context

Tolerance and remaining must be exact for training Yellow RGB: 94.0 g ±0.5 g with five test points (93.4, 93.5, 94.0, 94.5, 94.6). IEEE floating point can make inclusive bounds unreliable. NFR-03 requires decimal or fixed-point arithmetic. Tech-stack does not name a decimal library.

## Decision

Store and compare quantities as **integer milligrams** in the weighing-session domain (94.0 g = 94000; 0.5 g = 500; 24.000 kg = 24000000). Convert to g or kg only at the HTTP/display edge using the component unit.

## Rationale

Fixed-point milligrams need no new npm package, survive SQLite INTEGER columns, and make band checks integer inequalities.

### Alternatives Considered

1. **decimal.js (or similar)** — exact decimal, extra dependency, still need a persistence encoding.
2. **IEEE `number` grams** — simplest, fails NFR-03 and boundary tests.
3. **Integer milligrams (chosen)** — exact for this lab’s g/kg seeds; kg uses the same milligram scale.

## Consequences

### Positive

- Inclusive 93.5–94.5 g is exact.
- SQLite stores integers; tests use integers.
- No new library.

### Negative

- Display must convert mg → g/kg.
- Sub-milligram precision is out of scope (acceptable for this training station).

### Risks

- Mixing units in one comparison — mitigated by Quantity always carrying unit and converting to mg only after unit check.

## Related

- **Stories**: 004-evaluate-tolerance-and-confirm
- **Standards**: NFR-03 Quantity arithmetic; tech-stack TypeScript
- **Previous ADRs**: none
