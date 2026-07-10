# ADR-001: Replace 53-prop Drilling with ProjectEditContext

## Status

Accepted (v3.0)

## Context

`ProjectEditPage` had 53 props drilled through `StepContentSwitcher` into 9 step
components. This caused:

- **Maintenance burden**: Adding one field required modifying 3+ files
- **Re-render cascade**: Every state change re-rendered all 9 steps
- **Readability**: `StepContentSwitcher.tsx` was 80% prop-passing boilerplate

## Decision

Introduce `ProjectEditContext` (React Context + useReducer) with per-step
selector hooks:

- `ProjectEditProvider` — wraps the page, holds all edit state
- `useProjectEdit()` — full context access (rarely needed)
- `useScriptStep()`, `useStoryboardStep()`, etc. — per-step slices

Each step component subscribes only to its own data slice via its selector
hook, eliminating unnecessary re-renders.

## Consequences

- **Prop count**: 53 → 1 (`currentStep` still passed to `StepContentSwitcher`)
  or → 0 (if consuming context directly for step routing too)
- **Backward compat**: All step component prop interfaces kept as `@deprecated`
  optional — old tests and external callers continue to work
- **Bundle impact**: Context + selectors add ~2 KB (negligible)
- **Learning curve**: New developers must understand selector pattern, but it's
  idiomatic React

## Migration notes

1. State previously passed as props now lives in context
2. Call `useParams()` inside step components to get `projectId`
3. Navigation via `useProject().setCurrentStep()` instead of `onNext`/`onBack`
