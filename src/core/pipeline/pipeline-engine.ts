/**
 * Pipeline Engine - 流水线引擎（facade）
 *
 * 拆分为：
 * - pipeline-engine-types.ts: 类型定义
 * - pipeline-middleware.ts: Logger + Metrics 中间件
 * - 本文件：引擎核心类 + 工厂函数
 */
import { secureStorage } from '@/core/services/project/secure-storage.service';
import { logger } from '@/core/utils/logger';
import { delay } from '@/shared/utils/timing';

import type {
  PipelineEngineEventHandler,
  PipelineEngineOptions,
  PipelineMiddleware,
} from './pipeline-engine-types';
import type { PipelineStep, StepInput, StepOutput } from './pipeline.types';
import { PipelineStatus } from './pipeline.types';

// Re-export types + middleware 保持向后兼容
export type {
  PipelineEngineEventHandler,
  PipelineMiddleware,
  PipelineEngineOptions,
} from './pipeline-engine-types';
export {
  LoggerMiddleware,
  MetricsMiddleware,
  getMetrics,
  resetMetrics,
} from './pipeline-middleware';

export class PipelineEngine {
  private steps: PipelineStep[] = [];
  private options: PipelineEngineOptions;
  private status: PipelineStatus = PipelineStatus.IDLE;
  private eventHandler?: PipelineEngineEventHandler;
  private abortController: AbortController | null = null;
  private enableCheckpoint = true;

  constructor(options: PipelineEngineOptions = {}) {
    this.options = { enableCheckpoint: true, enableQualityGate: true, ...options };
    this.enableCheckpoint = !!this.options.enableCheckpoint && !!this.options.workflowId;
  }

  onEvents(handler: PipelineEngineEventHandler): void {
    this.eventHandler = handler;
  }

  getStatus(): { status: PipelineStatus; stepCount: number; steps: string[] } {
    return {
      status: this.status,
      stepCount: this.steps.length,
      steps: this.steps.map((s) => s.id),
    };
  }

  pause(): boolean {
    if (this.status !== PipelineStatus.RUNNING) return false;
    this.status = PipelineStatus.PAUSED;
    return true;
  }

  async resume(input?: StepInput): Promise<StepOutput> {
    this.status = PipelineStatus.RUNNING;
    this.abortController = new AbortController();
    return this.runInternal(input || ({} as StepInput), true);
  }

  cancel(): void {
    this.status = PipelineStatus.CANCELLED;
    this.abortController?.abort();
  }

  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  addMiddleware(middleware: PipelineMiddleware): this {
    if (!this.options.middlewares) this.options.middlewares = [];
    this.options.middlewares.push(middleware);
    return this;
  }

  async run(input: StepInput): Promise<StepOutput> {
    this.status = PipelineStatus.RUNNING;
    this.abortController = new AbortController();
    logger.info('[PipelineEngine] Starting pipeline', {
      workflowId: this.options.workflowId,
      steps: this.steps.map((s) => s.id),
    });
    return this.runInternal(input, false);
  }

  private async runInternal(input: StepInput, isResume: boolean): Promise<StepOutput> {
    let context: StepInput = { ...input };
    this.options.middlewares?.forEach((m) => m.onPipelineStart?.());

    try {
      for (const step of this.steps) {
        if (this.status === PipelineStatus.CANCELLED) throw new Error('Pipeline cancelled');
        while (this.status === PipelineStatus.PAUSED) {
          await delay(100);
        }

        this.options.middlewares?.forEach((m) => m.onStepStart?.(step.id, context as never));

        const restored = await this.restoreCheckpoint(step.id, context, isResume);
        if (restored) {
          context = restored as StepInput;
          this.eventHandler?.onStepComplete?.(step.id, context as never);
          continue;
        }

        if (await this.shouldSkipCheckpoint(step.id)) {
          continue;
        }

        try {
          this.eventHandler?.onStepStart?.(step.id);
          this.options.onProgress?.(step.id, 0);

          const result = await step.execute(context);
          context = { ...context, ...result };

          await this.saveCheckpoint(step.id, result);

          this.options.onProgress?.(step.id, 1);
          this.eventHandler?.onStepComplete?.(step.id, result);
          this.options.middlewares?.forEach((m) => m.onStepComplete?.(step.id, result));
        } catch (error) {
          const err = error as Error;
          this.options.onError?.(step.id, err);
          this.eventHandler?.onStepFail?.(step.id, err.message);
          this.options.middlewares?.forEach((m) => m.onStepError?.(step.id, err));
          throw error;
        }
      }

      this.status = PipelineStatus.COMPLETED;
      const output = context as unknown as StepOutput;
      this.options.onComplete?.(output);
      this.options.middlewares?.forEach((m) => m.onPipelineComplete?.(output));
      logger.info('[PipelineEngine] Pipeline completed successfully');
      return output;
    } catch (error) {
      this.status = PipelineStatus.FAILED;
      const err = error as Error;
      this.eventHandler?.onStepFail?.('pipeline', err.message);
      this.options.middlewares?.forEach((m) => m.onPipelineError?.(err));
      logger.error('[PipelineEngine] Pipeline failed:', err);
      throw error;
    }
  }

  getSteps(): PipelineStep[] {
    return [...this.steps];
  }
  isRunning(): boolean {
    return this.status === PipelineStatus.RUNNING;
  }
  isCompleted(): boolean {
    return this.status === PipelineStatus.COMPLETED;
  }
  isFailed(): boolean {
    return this.status === PipelineStatus.FAILED;
  }

  // ========== Checkpoint 策略（内联原 CheckpointManager） ==========

  private async shouldSkipCheckpoint(stepId: string): Promise<boolean> {
    if (!this.enableCheckpoint) return false;
    const cp = await secureStorage.loadCheckpoint(stepId);
    return !!cp?.completed;
  }

  private async restoreCheckpoint(
    stepId: string,
    context: StepInput,
    isResume: boolean
  ): Promise<StepInput | null> {
    if (!this.enableCheckpoint || !isResume) return null;
    const cp = await secureStorage.loadCheckpoint(stepId);
    if (!cp?.completed) return null;
    return { ...context, ...(cp.data as Record<string, unknown>) } as StepInput;
  }

  private async saveCheckpoint(stepId: string, data: StepOutput): Promise<void> {
    if (!this.enableCheckpoint) return;
    await secureStorage.saveCheckpoint(stepId, data);
  }
}

/** 工厂函数 */
export function createPipelineEngine(config: {
  workflowId: string;
  projectId?: string;
  enableCheckpoint?: boolean;
  enableQualityGate?: boolean;
  middlewares?: PipelineMiddleware[];
}): PipelineEngine {
  return new PipelineEngine({
    workflowId: config.workflowId,
    projectId: config.projectId,
    enableCheckpoint: config.enableCheckpoint ?? true,
    enableQualityGate: config.enableQualityGate ?? true,
    middlewares: config.middlewares,
  });
}
