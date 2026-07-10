# ADR-005: Reject PropertyPanel Controlled Input Migration (Deferred)

## Status

Rejected (v3.0)

## Context

The plan proposed converting `PropertyPanel.tsx` tabs (`SubtitleSettings`,
`AudioSettings`, `VideoSettings`) from uncontrolled to controlled inputs
(wired to `useState` with external `exportSettings` state).

## Decision

**Rejected** — PropertyPanel is already well-decomposed:

- Each tab is a separate functional component (`SubtitleSettings`, `AudioSettings`, `VideoSettings`, `ExportSettings`)
- `ExportSettings` already uses controlled inputs correctly
- The other three tabs are **pure configuration previews** (no backend effect)
- Adding full state management is unnecessary until they need persistence

## Consequences

- Current pattern (controlled where it matters, uncontrolled for display) remains
- Future work should first define what the tabs should _do_ (not just wire state)
