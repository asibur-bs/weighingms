---
last_updated: 2026-10-26T15:04:00Z
total_decisions: 5
---

# Decision Index

This index tracks all Architecture Decision Records (ADRs) created during Construction bolts.
Use this to find relevant prior decisions when working on related features.

## How to Use

**For Agents**: Scan the "Read when" fields below to identify decisions relevant to your current task. Before implementing new features, check if existing ADRs constrain or guide your approach. Load the full ADR for matching entries.

**For Humans**: Browse decisions chronologically or search for keywords. Each entry links to the full ADR with complete context, alternatives considered, and consequences.

---

## Decisions

### ADR-005: Overshoot never rewrites remaining targets
- **Status**: accepted
- **Date**: 2026-10-26
- **Bolt**: 004-weighing-station (weighing-station)
- **Path**: `bolts/004-weighing-station/adr-005-overshoot-does-not-recalc.md`
- **Summary**: The HTML prototype can imply surplus should change remaining recipe quantities. When zone is over, confirm is rejected and `target_mg` / `tolerance_mg` stay immutable.
- **Read when**: Handling overshoot, remaining quantity, surplus UI, or any UPDATE of recipe targets on a session.

### ADR-004: Valid confirm activates the next pending component
- **Status**: accepted
- **Date**: 2026-10-26
- **Bolt**: 004-weighing-station (weighing-station)
- **Path**: `bolts/004-weighing-station/adr-004-confirm-advances-next.md`
- **Summary**: Bolt 003 confirm did not change `activeSeq`. A 200 confirm now runs progression so the next pending component becomes active (or none at 5/5).
- **Read when**: Implementing confirm, `/active`, component rail, or session snapshot after OK.

### ADR-003: Session owns the 5/5 write-back gate
- **Status**: accepted
- **Date**: 2026-10-26
- **Bolt**: 004-weighing-station (weighing-station)
- **Path**: `bolts/004-weighing-station/adr-003-session-owns-completion-gate.md`
- **Summary**: Dummy OrgaTEX stores any consumption POST and does not know 5/5. The weighing session grants CompletionPermit and only then calls the Dummy consumption port.
- **Read when**: Implementing `/complete`, consumption write-back, 4/5 deny, quit, or HMI CONFIRMED.

### ADR-002: In-process Dummy OrgaTEX and Scale ports
- **Status**: accepted
- **Date**: 2026-10-26
- **Bolt**: 003-weighing-station (weighing-station)
- **Path**: `bolts/003-weighing-station/adr-002-in-process-dummy-ports.md`
- **Summary**: The session domain must read recipes and live net without owning Dummy HTTP contracts. Use hexagonal ports with in-process adapters to Dummy modules in the same Node process.
- **Read when**: Adding session APIs, Dummy adapters, HMI data loading, or any HTTP client to OrgaTEX/scale.

### ADR-001: Integer milligrams for weighing quantities
- **Status**: accepted
- **Date**: 2026-10-26
- **Bolt**: 003-weighing-station (weighing-station)
- **Path**: `bolts/003-weighing-station/adr-001-milligram-fixed-point.md`
- **Summary**: Tolerance and remaining must be exact for Yellow RGB 94.0 g ±0.5 g. Store and compare quantities as integer milligrams in the domain.
- **Read when**: Implementing tolerance, remaining, confirm records, or any quantity column.
