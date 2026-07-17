# Phase 1: Dead Code Cleanup + Deprecated Shim Marking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate dead code, mark deprecated shims, unify naming, and centralize constants — zero functional regression.

**Architecture:** Pure cleanup and marking. No behavioral changes. All deprecated exports remain accessible for backward compatibility. Each task is independently testable.

**Tech Stack:** TypeScript, pnpm, Jest

## Global Constraints

- **Backward compatibility**: All existing exports must remain accessible during Phase 1.
- **Zero regression**: `pnpm test` must pass after each task.
- **Naming convention**: camelCase for variables/functions, UPPER_SNAKE_CASE for constants, PascalCase for types/classes.
- **Dependency direction**: Strictly enforce UI → core → shared; no reverse imports.
- **YAGNI**: Do not add new abstractions or functionality.

---

### Task 1: Delete deprecated `infrastructure/ai/providers/` directory

**Files:**
- Delete: `src/infrastructure/ai/providers/` (entire directory)
- Verify: `src/infrastructure/tauri-bridge/commands.ts` (ensure no cross-references)

**Interfaces:**
- Consumes: None
- Produces: Removes dead code directory

- [ ] **Step 1: Verify directory exists and has no importers**

```bash
ls -la src/infrastructure/ai/providers/
grep -rn "from.*infrastructure/ai" src/ || echo "No importers found"
```

Expected: Directory exists, no importers found.

- [ ] **Step 2: Delete the directory**

```bash
rm -rf src/infrastructure/ai/providers/
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
pnpm tsc --noEmit
```

Expected: No errors related to deleted directory.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete dead infrastructure/ai/providers/ directory"
```

---

### Task 2: Delete deprecated `shared/utils/general.ts` barrel

**Files:**
- Modify: `src/shared/utils/index.ts` (replace `export * from './general'` with direct exports)
- Delete: `src/shared/utils/general.ts`

**Interfaces:**
- Consumes: `src/shared/utils/index.ts` barrel
- Produces: Direct exports from sub-modules, no intermediate barrel

- [ ] **Step 1: Rewrite `src/shared/utils/index.ts` to export directly**

Replace:
```typescript
export * from './general';
```

With:
```typescript
export { debounce, throttle, delay, retry, PROCESSING_DELAY_MS, retryRequest } from './timing';
export type { RetryOptions } from './timing';
export {
  deepClone, generateId, generatePrefixedId, generateSceneId,
  generateFrameId, generateCharId, generateCompId, generateProjectId,
  generateItemId, safeJSONParse, computeHash, getErrorMessage,
} from './data';
export {
  truncateText, capitalize, camelToKebab, kebabToCamel,
  isValidEmail, isValidURL,
} from './string';
export { chunkArray, uniqueArray, sortBy } from './collection';
```

- [ ] **Step 2: Delete `src/shared/utils/general.ts`**

```bash
rm src/shared/utils/general.ts
```

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove general.ts barrel, export directly from utils/index"
```

---

### Task 3: Clean comment-block dead code in 10 core files

**Files:**
- Modify: `src/core/pipeline/step-import.ts`
- Modify: `src/core/pipeline/step-analysis.ts`
- Modify: `src/core/pipeline/step-script.ts`
- Modify: `src/core/pipeline/step-character.ts`
- Modify: `src/core/pipeline/step-render.ts`
- Modify: `src/core/pipeline/step-composition.ts`
- Modify: `src/core/pipeline/step-export.ts`
- Modify: `src/core/pipeline/step-audio-synthesis.ts`
- Modify: `src/core/pipeline/step-storyboard.ts`
- Modify: `src/core/pipeline/pipeline-engine.ts`

**Interfaces:**
- Consumes: None
- Produces: Clean files without submodule reference comments

For each file, remove `// ========== Xxx（原 xxx.ts） ==========` comment blocks that serve no documentation purpose. Keep functional comments that explain logic.

- [ ] **Step 1: Remove merge-header comments from step-import.ts**

Remove line: `// ========== 导入数据接口 ==========`

- [ ] **Step 2: Remove merge-header comments from step-analysis.ts**

Remove line: `// ========== AnalysisStep 实现 ==========`

- [ ] **Step 3: Remove merge-header comments from step-script.ts**

Remove lines:
```
// ========== 配置与输出接口 ==========
// ========== ScriptStep 实现 ==========
// ========== 工厂函数 ==========
```

- [ ] **Step 4: Remove merge-header comments from step-character.ts**

Remove line: `// ========== CharacterStep 实现 ==========`

- [ ] **Step 5: Remove merge-header comments from step-render.ts**

Remove line: `// ========== RenderStep 实现 ==========`

- [ ] **Step 6: Remove merge-header comments from step-composition.ts**

Remove line: `// ========== CompositionStep 实现 ==========`

- [ ] **Step 7: Remove merge-header comments from step-export.ts**

Remove lines:
```
// ========== ExportStep 实现 ==========
// ========== 工厂函数 ==========
```

- [ ] **Step 8: Remove merge-header comments from step-audio-synthesis.ts**

Remove merge-header comment blocks (if any).

- [ ] **Step 9: Remove merge-header comments from step-storyboard.ts**

Remove merge-header comment blocks (if any).

- [ ] **Step 10: Remove merge-header comments from pipeline-engine.ts**

Remove line: `// ========== Checkpoint 策略（内联原 CheckpointManager） ==========`

- [ ] **Step 11: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: remove merge-header comment blocks from pipeline step files"
```

---

### Task 4: Unify `uuid` / `uuidv4` import naming

**Files:** All files importing `v4 as uuid` from `uuid` package.

**Pattern to replace:**
```typescript
import { v4 as uuid } from 'uuid';
```
**Replace with:**
```typescript
import { v4 as uuidv4 } from 'uuid';
```

**Interfaces:**
- Consumes: None
- Produces: Consistent naming across codebase

- [ ] **Step 1: Find all files using `v4 as uuid`**

```bash
grep -rn "v4 as uuid" src/ --include="*.ts" --include="*.tsx"
```

Expected: List of ~18 files.

- [ ] **Step 2: Replace in each file**

For each file found, replace `import { v4 as uuid } from 'uuid'` with `import { v4 as uuidv4 } from 'uuid'`, and update all usages of `uuid()` to `uuidv4()`.

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: unify uuid import naming to uuidv4 across codebase"
```

---

### Task 5: Centralize localStorage keys in `app-config.ts`

**Files:**
- Modify: `src/core/constants/app-config.ts` (add `STORAGE_KEYS` object)
- Modify: `src/core/hooks/useProject.ts` (import from app-config)
- Modify: `src/core/services/storyboard-service.ts` (import from app-config)
- Modify: `src/core/services/video/video-compositor-service.ts` (import from app-config)
- Modify: `src/core/services/domain/character-service.ts` (import from app-config)
- Modify: `src/core/services/domain/manga-pipeline-steps.ts` (import from app-config)

**Interfaces:**
- Consumes: None
- Produces: Single source of truth for localStorage keys

- [ ] **Step 1: Add `STORAGE_KEYS` to `app-config.ts`**

Add:
```typescript
/** localStorage keys — single source of truth */
export const STORAGE_KEYS = {
  PROJECTS: 'storyweaver_projects',
  STORYBOARDS: 'storyweaver-storyboards',
  COMPOSITIONS: 'storyweaver-compositions',
  ASSETS: 'panelcraft_assets',
  CHARACTERS: 'manga-characters',
} as const;
```

- [ ] **Step 2: Update `useProject.ts` to import from app-config**

Replace hardcoded `'storyweaver_projects'` with `STORAGE_KEYS.PROJECTS`.

- [ ] **Step 3: Update `storyboard-service.ts` to import from app-config**

Replace hardcoded `'storyweaver-storyboards'` with `STORAGE_KEYS.STORYBOARDS`.

- [ ] **Step 4: Update `video-compositor-service.ts` to import from app-config**

Replace hardcoded `'storyweaver-compositions'` with `STORAGE_KEYS.COMPOSITIONS`.

- [ ] **Step 5: Update `character-service.ts` to import from app-config**

Replace hardcoded `'panelcraft_assets'` with `STORAGE_KEYS.ASSETS`.

- [ ] **Step 6: Update `manga-pipeline-steps.ts` to import from app-config**

Replace hardcoded `'manga-characters'` with `STORAGE_KEYS.CHARACTERS`.

- [ ] **Step 7: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: centralize localStorage keys in app-config.ts"
```

---

### Task 6: Mark `core/services/pipeline/pipeline-types.ts` as `@deprecated`

**Files:**
- Modify: `src/core/services/pipeline/pipeline-types.ts`

**Interfaces:**
- Consumes: None
- Produces: File with clear deprecation warnings

- [ ] **Step 1: Add deprecation header to `pipeline-types.ts`**

Add at the top of the file:
```typescript
/**
 * @deprecated Pipeline service-layer type shim.
 *
 * Types defined in this file are incompatible with core versions:
 * - PipelineStatus lacks 'cancelled' status (core enum has it)
 * - PipelineContext.log lacks 'debug' level (core has it)
 * - PipelineStep.execute signature differs from core
 *
 * Migrate to:
 *   import { PipelineStatus, PipelineStepId, PipelineContext, PipelineStep, ... }
 *     from '@/core/pipeline/pipeline-types';
 *
 * This shim will be removed in a future PR after all 72+ callers migrate.
 */
```

- [ ] **Step 2: Add `@deprecated` JSDoc to each exported type**

Add `@deprecated` tag to each `export type` and `export interface` with migration path.

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass (no functional changes).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: mark pipeline-types.ts service shim as @deprecated"
```

---

### Task 7: Rename `createExportStep` conflict

**Files:**
- Modify: `src/core/services/pipeline/pipeline-step-factories.ts`
- Verify: `src/core/services/pipeline/pipeline-service.ts` (import alias)

**Interfaces:**
- Consumes: None
- Produces: Clear naming, no collision

- [ ] **Step 1: Rename in `pipeline-step-factories.ts`**

Rename the service-layer `createExportStep` to `createSimpleExportStep`. Keep `createExportStep` as a re-export alias for backward compatibility:

```typescript
export function createSimpleExportStep(config?: Partial<PipelineStep>): PipelineStep {
  // ... existing implementation
}

/** @deprecated Use createSimpleExportStep instead. Core version: createExportStep from '@/core/pipeline/step-export' */
export const createExportStep = createSimpleExportStep;
```

- [ ] **Step 2: Verify `pipeline-service.ts` alias**

Check that `pipeline-service.ts` already uses `createRealExportStep` alias. Update comment to reference `createSimpleExportStep`.

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: rename createExportStep to createSimpleExportStep in service layer"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass with zero failures.

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm build:check
```

Expected: No type errors.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: No new lint errors.

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "chore: Phase 1 complete — dead code cleanup + deprecated shim marking"
```

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-07-17-phase1-dead-code-cleanup.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
