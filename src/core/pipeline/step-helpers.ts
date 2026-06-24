/**
 * Pipeline Step 共享 Helpers
 * ==========================
 * 消除 step-*.ts 中 8L catch block + 3L reportProgress 的跨文件重复。
 */

import type { PipelineStep, PipelineStepId } from './pipeline.types';
import { StepStatus } from './pipeline.types';

/** 标准化失败结果（所有 step 的 catch block 共用） */
export function createFailedStepResult(
  stepId: PipelineStepId | string,
  startTime: number,
  errorMsg: string,
) {
  return {
    stepId: stepId as PipelineStepId,
    status: StepStatus.FAILED,
    data: undefined,
    error: errorMsg,
    startTime,
    endTime: Date.now(),
    retryCount: 0,
  };
}

/** 标准化进度上报（所有 step 的 reportProgress 共用） */
export function reportStepProgress(
  stepId: string,
  onProgress: PipelineStep['onProgress'],
  progress: number,
  message: string,
): void {
  onProgress?.({ stepId: stepId as PipelineStepId, progress, message });
}
