/**
 * 进度管理 (subscribe / emit / calculateOverallProgress)
 * =======================================================
 * 集中"订阅 → 触发 → 整体进度计算"三件事。
 * 单一职责：进度事件。
 */
import type { StepState } from '../base/BasePipelineController';

import { STEP_PROGRESS_WEIGHTS } from './manga-pipeline-constants';
import {
  MangaPipelineStep,
  type MangaPipelineProgress,
  type ProgressListener,
} from './manga-pipeline-types';

/** 进度管理闭包 */
export interface ProgressManager {
  /** 订阅进度 */
  subscribe(listener: ProgressListener): () => void;
  /** 触发进度事件 (自动算 overall + 通知所有订阅者) */
  emitProgress(
    step: MangaPipelineStep,
    stepProgress: number,
    subStepName: string,
    stepState: StepState,
    onOverallUpdate?: (overall: number, subStepName: string) => void
  ): MangaPipelineProgress;
}

/** 创建一个新的进度管理器 (含独立 listener 列表) */
export function createProgressManager(): ProgressManager {
  let progressListeners: ProgressListener[] = [];

  return {
    subscribe(listener: ProgressListener) {
      progressListeners.push(listener);
      return () => {
        progressListeners = progressListeners.filter((l) => l !== listener);
      };
    },

    emitProgress(step, stepProgress, subStepName, stepState, onOverallUpdate) {
      const overall = calculateOverallProgress(step, stepProgress);
      const event: MangaPipelineProgress = {
        step,
        stepProgress,
        subStepName,
        overallProgress: overall,
        state: stepState,
      };
      progressListeners.forEach((l) => l(event));
      onOverallUpdate?.(overall, subStepName);
      return event;
    },
  };
}

/**
 * 把单步进度 (0-100) 映射到整体进度 (0-100)。
 * 使用 STEP_PROGRESS_WEIGHTS 中各步的 [start, end] 区间线性插值。
 */
export function calculateOverallProgress(step: MangaPipelineStep, stepProgress: number): number {
  const [start, end] = STEP_PROGRESS_WEIGHTS[step];
  return start + (stepProgress / 100) * (end - start);
}
