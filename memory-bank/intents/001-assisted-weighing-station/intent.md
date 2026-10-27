---
intent: 001-assisted-weighing-station
phase: construction
status: complete
created: 2026-10-26T13:37:00Z
updated: 2026-10-27T07:32:00Z
construction_completed_at: 2026-10-27T07:22:55Z
validation_approved_at: 2026-10-27T07:32:00Z
approved_at: 2026-10-26T13:51:00Z
inception_completed_at: 2026-10-26T14:06:00Z
type: new-feature
sources:
  - docs/brief.md
  - docs/customize-weighing-station.html
---

# Intent: Assisted Dyestuff Weighing Station

**Checkpoint 1 — APPROVED 2026-10-26T13:51:00Z**  
**STEP 33 — APPROVE VALIDATION 2026-10-27T07:32:00Z** (training product: brief, UI/UX, FRs, acceptance, tests)

## Business problem

FCI dyehouse batches start with an operator weighing powder dyestuffs and dry auxiliaries against an OrgaTEX recipe. Today that step is manual and unrecorded: the recipe is on paper, weighing is by eye, and actual dispensed quantities are not captured. When a shade fails, the plant cannot tell a bad recipe from a bad weighing.

WeighingMS closes that loop. It is a **guided weighing station**, not a replacement for OrgaTEX. OrgaTEX remains the upstream/downstream production system that owns batches and recipes. WeighingMS sits between OrgaTEX and the operator.

The system does **not** automate dispensing. The operator still dispenses by hand.

## Primary user

**Weighing operator** — daily user of the station HMI.

Secondary actors:

- **Supervisor** — override authority and hold-up visibility
- **Dummy device/system stand-ins** in this training build (see Integrations)

## Desired outcome

An operator can select a production batch, load its recipe, weigh each component against target and tolerance on the correct scale, record lot/container/tare/operator/actual weight, write consumption back to OrgaTEX (Dummy API in training), and print a weighing ticket.

The working product must reproduce the **functional experience** of `docs/customize-weighing-station.html`:

1. Select batch
2. Weigh
3. Confirm & print

Success for this training Intent is a demonstrable station that uses Dummy APIs rather than UI-embedded scenario data.

## Sources

| Source | Role |
|--------|------|
| `docs/brief.md` | Product Brief / BRD — problem, scope, FR/NFR, open questions |
| `docs/customize-weighing-station.html` | Functional UI/UX prototype — screens, states, tolerance, scale switch, five-component recipe, ticket |

The HTML is a functional prototype to reproduce, not a design to reinvent, and not JavaScript to copy.

## Scope — in

- Batch queue and batch selection
- Recipe loading and component progression
- Component identification, dyestuff lot, container, tare
- Scale selection (precision vs floor) and live weight
- Target, remaining quantity, tolerance, confirmation
- Overshoot handling as an **explicit training decision** (not silently copied from the prototype)
- Supervisor override (as represented in the prototype / brief)
- Operator traceability
- OrgaTEX consumption write-back via Dummy API
- Ticket generation via Dummy Printer API
- Safe failure when Dummy Scale / OrgaTEX / Printer is unavailable

Training scenario to be seedable: batch **B-24187**, order SO-9931, machine JET-04, shade Teal 4C, five components (Blue RSPL, Red RB, Yellow RGB, Sodium Sulphate, Soda Ash).

## Scope — out

- Replacing or modifying OrgaTEX
- Recipe authoring
- Automated dispensing or container transport
- Real OrgaTEX / scale / scanner / printer vendor contracts
- Laboratory colour matching, procurement, machine-side dyeing control
- Multi-site production deployment (training is one local station)

## Integrations (training Dummy APIs)

The real external systems are not available. Dummy APIs are **product artifacts**, not UI fixtures.

| Conceptual system | Training substitute | Purpose |
|-------------------|---------------------|---------|
| OrgaTEX | Dummy OrgaTEX API | Batch queue, recipe, consumption write-back |
| Weighing scale | Dummy Scale API | Status, live weight, tare, scale switch |
| Scanner | Dummy Scanner | Batch / material identification stand-in |
| Printer | Dummy Printer API | Ticket generate / preview |

Do **not** invent real external API contracts. Training routes are the approved lab contracts in `memory-bank/standards/tech-stack.md`.

## Unknowns (explicit)

These remain unresolved. They must stay visible through Inception. Do not treat the brief's assumptions as FCI-agreed fact.

- Real OrgaTEX interface (the brief lists open integration questions; Dummy APIs are training-only)
- Whether scale weight is continuous stream or stabilised snapshot (prototype pin Q16)
- Surplus / overshoot business rule (prototype proposes a behaviour; training must choose an explicit rule later)
- Scanner and 21-key terminal physical contracts
- Ticket/label layout owned by FCI vs training layout
- Offline/deferred sync with real OrgaTEX
- Plant volume, availability, and hardware rating figures (A-14, A-15 and other brief assumptions)
- The Product Brief's broader set of unanswered FCI questions (brief states 41 open questions; assumptions A-01…A-15)

## Tech context (already approved)

Full-stack web training app: TypeScript, Vite + React, Fastify Dummy APIs, SQLite, Vitest, Playwright, local localhost.

## Human validation checklist

- [x] Business problem is correct
- [x] Primary user is correct
- [x] Desired outcome is correct
- [x] Scope is reasonable
- [x] UI/UX is included as a source
- [x] Dummy integrations are included
- [x] Unknowns are identified
- [x] WeighingMS does not replace OrgaTEX
