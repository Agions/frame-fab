# ADR-003: Remove Dead Build/Test Configuration

## Status

Accepted (v3.0)

## Context

The codebase accumulated dead configuration from deprecated packages and historical
optimizations:

| Dead config                      | Location          | Reason                                   |
| -------------------------------- | ----------------- | ---------------------------------------- |
| `@story-weaver/common` alias     | `vite.config.ts`  | `packages/common/` deleted, zero imports |
| `@core/` and `@shared/` comments | `jest.config.cjs` | aliases already removed                  |
| `jspdf` mock comment             | `jest.config.cjs` | mock already removed                     |
| `@frame-fab/common` comment      | `jest.config.cjs` | path already removed                     |
| v3.2 perf notes                  | `jest.config.cjs` | historical, settings self-explanatory    |
| Project test skip rationale      | `jest.config.cjs` | verbose 4-line comment per file          |

## Decision

Remove dead aliases, stale comments, and verbose performance notes. Configuration
comments should explain _why_, not _what changed when_.

## Consequences

- `vite.config.ts`: 130 → 128 lines, single alias remains (`@/` → `src/`)
- `jest.config.cjs`: 90 → 68 lines, all remaining comments are meaningful
- Build and test behavior unchanged (verified: 42 suites / 837 tests pass)
