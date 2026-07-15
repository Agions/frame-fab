/**
 * Pipeline Facade
 * ===============
 * 服务层门面：将核心流水线引擎（PipelineEngine / PipelineService）与
 * 步骤工厂、流水线类型重新导出到 `src/services/pipeline/` 命名空间。
 *
 * 本文件仅做 re-export，不含任何业务逻辑。旧路径
 * `@/core/services/pipeline/pipeline.service` 与 `@/core/services` 仍
 * 可正常导入 —— 本 facade 是为未来渐进式迁移建立的 `services/` 层入口。
 *
 * @example
 * ```ts
 * // 新代码（推荐，面向 services/ 层）
 * import {
 *   PipelineService,
 *   getPipelineService,
 *   createDefaultPipeline,
 *   PIPELINE_STEP_IDS,
 *   type PipelineStep,
 *   type PipelineContext,
 *   type PipelineConfig,
 *   type PipelineStatus,
 * } from '@/services/pipeline/PipelineFacade';
 *
 * // 旧代码（仍然有效）
 * import { PipelineService } from '@/core/services/pipeline/pipeline.service';
 * ```
 */

// ─────────── 流水线引擎 / 服务（PipelineEngine 命名别名） ───────────

export {
  PipelineService,
  getPipelineService,
  createDefaultPipeline,
} from '@/core/services/pipeline/pipeline.service';

// 兼容性别名：计划文档与外部文档常称流水线引擎为 PipelineEngine，
// 实际类名为 PipelineService（Map<workflowId, PipelineRunner> 管理者）。
export { PipelineService as PipelineEngine } from '@/core/services/pipeline/pipeline.service';

// ─────────── 步骤工厂 ───────────

export {
  createImportStep,
  createAnalysisStep,
  createScriptStep,
  createStoryboardStep,
  createCharacterStep,
  createRenderStep,
  createExportStep,
  PIPELINE_STEP_IDS,
} from '@/core/services/pipeline/pipeline.service';

// ─────────── 流水线类型 ───────────

export type {
  PipelineStepId,
  PipelineStatus,
  PipelineStep,
  PipelineContext,
  PipelineResult,
  PipelineStepResult,
  PipelineConfig,
} from '@/core/services/pipeline/pipeline.service';
