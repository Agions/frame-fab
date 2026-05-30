import type { PipelineExecutionMode } from './pipeline.types';
import type { QualityGateDecision } from './pipeline.types';

export type StepInput = Record<string, unknown>;
export type StepOutput = Record<string, unknown>;

export interface CheckpointState<S = unknown> {
  stepId: string;
  completed: boolean;
  data: S;
  timestamp: number;
}

export interface PipelineStep<S = unknown> {
  /** 步骤唯一标识 */
  id: string;
  /** 步骤显示名称 */
  name: string;
  /** 流水线内排序（数字越小越先执行） */
  order?: number;
  stepId?: string;
  mode?: PipelineExecutionMode;

  /** 执行入口 */
  execute(input: StepInput): Promise<StepOutput>;

  /** 可选的质量门控验证（返回 PASS/FAIL/WARN） */
  validate?(output: StepOutput): Promise<QualityGateDecision>;

  /** 可选的回滚逻辑（当后续步骤失败时清理副作用） */
  rollback?(output: StepOutput): Promise<void>;

  /** 获取检查点状态（用于断点续跑） */
  getCheckpoint?(): CheckpointState<S> | null;

  /** 从检查点恢复状态 */
  restore?(state: CheckpointState<S>): void;

  /** 进度回调 */
  onProgress?: (event: { stepId: string; progress: number; message: string }) => void;
}

export interface PipelineOptions {
  onProgress?: (stepId: string, progress: number) => void;
  onComplete?: (output: StepOutput) => void;
  onError?: (stepId: string, error: Error) => void;
}