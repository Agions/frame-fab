/**
 * Orchestration Layer — 流程编排层导出
 *
 * ⚠️ DEPRECATED: 此模块已被 @/core/pipeline 取代
 * - core/pipeline 包含真实 step 实现（step-analysis, step-script 等）
 * - orchestration/pipeline 的 DAG 引擎功能将逐步合并到 core/pipeline
 *
 * @deprecated 请使用 @/core/pipeline
 */

export { DAGPipelineEngine, type DAGPipelineConfig, type ReviewGate, type ConditionRule, type PipelineResult, PipelineStatus } from './engine/dag-pipeline-engine';
export { CheckpointManager, LocalStorageCheckpointAdapter, type Checkpoint, type ICheckpointStorage } from './engine/checkpoint-manager';
export { BasePipelineStep, type IPipelineStep, type StepResult, type StepProgressEvent, type RetryPolicy, type StepMetrics, StepStatus, ExecutionMode, DEFAULT_RETRY_POLICY } from './engine/step.interface';
export type { PipelineContext } from './engine/pipeline-context';

// Step implementations
export { StepScriptGeneration, type StepScriptConfig } from './steps/step-script';
export { StepImport, type StepImportConfig } from './steps/step-import';
