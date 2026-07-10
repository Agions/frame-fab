# ADR-004: Reject TauriService SRP Split (Deferred)

## Status

Rejected (v3.0)

## Context

The plan proposed splitting `TauriService` into per-concern services
(`TauriWindowService`, `TauriStorageService`, `TauriNotificationService`, etc.)
to follow Single Responsibility Principle.

## Decision

**Rejected** — the current `TauriService` is a thin facade over Tauri APIs:

- Each method is 2–5 lines of `invoke()` wrapping
- No business logic lives inside
- Splitting would create 5 files with identical boilerplate
- Consumers already import the single facade and use only 1–2 methods each

## Rationale

SRP is about **reason to change**, not about method grouping. The facade changes
only when Tauri APIs change — a single reason. Splitting by concern would add
module count without adding cohesion.

## Consequences

- `TauriService` remains as a single facade
- If it grows beyond ~20 methods or starts containing logic, revisit
