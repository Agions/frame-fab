# ADR-002: Consolidate Duplicate Types into `shared/types/`

## Status

Accepted (v3.0)

## Context

Multiple domain types were defined in 2–4 places across the codebase:

| Type                           | Locations                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `EvaluationScores`             | `shared/types/project.ts`, `core/services/project/evaluation.service.ts`           |
| `FrameComment`                 | `core/services/domain/collaboration.service.ts` re-export from unknown             |
| `StoryboardVersion`            | same pattern                                                                       |
| `SubtitleFormat`               | `shared/types/video-composition.types.ts`, `core/services/video/subtitle/types.ts` |
| `VideoMetadata`                | `shared/types/legacy.ts` + ffmpeg types                                            |
| `PipelineCallbacks` + siblings | `core/pipeline/pipeline.types.ts` AND `core/services/pipeline/pipeline.types.ts`   |

This caused:

- Import ambiguity (which source is canonical?)
- Divergent definitions when one copy was updated but not the other
- Circular/synthetic dependencies (`shared` depending on `core`)

## Decision

Establish `shared/types/` as the **single source of truth** for all cross-layer
types. Core services re-export from `shared/types/` rather than defining locally.

### Dependency direction enforced:

```
shared/types/ ← core/services/  (re-export only, never define)
```

### Strategy per type:

1. **Already in `shared/types/`** — other files re-export via `import type { X } from '@/shared/types/...'; export type { X };`
2. **Only in `core/`** — move definition to `shared/types/`, add re-export shim in old location
3. **Duplicated across both** — pick `shared/types/` canonical, delete the other

## Consequences

- `shared` layer is now the type foundation — zero reverse dependencies from `shared` to `core`
- Shim files preserve backward compatibility for existing consumers
- Future types MUST be placed in `shared/types/` if used across 2+ layers

## Exceptions

- Service-internal types (e.g., `PipelineStep.execute` signature differences)
  remain in their service layer when truly local
- The dual pipeline type sets (`core/pipeline` vs `services/pipeline`) were
  intentionally kept separate because they model different abstractions and both
  are currently dead code at runtime
