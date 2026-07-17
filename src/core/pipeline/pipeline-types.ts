/**
 * Pipeline 类型兼容入口。
 *
 * Canonical definitions live in `@/types/pipeline`; this path remains available
 * for existing core pipeline consumers and external callers.
 */
export {
  CONTEXT_KEY,
  PipelineStepId,
  PipelineExecutionMode,
  PipelineStatus,
  StepStatus,
  QualityGateDecision,
} from '@/types/pipeline';

export type {
  StepInput,
  StepOutput,
  StepMetrics,
  StepCheckpoint,
  PipelineContext,
  PipelineEvent,
  PipelineStep,
  StepProgressEvent,
  RetryPolicy,
  QualityGateConfig,
  PipelineConfig,
  PipelineExecutionState,
  PipelineEngineEvent,
  PipelineCallbacks,
  PipelineResult,
  PipelineStepResult,
} from '@/types/pipeline';
