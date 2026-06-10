/**
 * Pipeline Engine - 流水线引擎（facade）
 *
 * 拆分为：
 * - pipeline-engine-types.ts: 类型定义
 * - pipeline-middleware.ts: Logger + Metrics 中间件
 * - 本文件：引擎核心类 + 工厂函数
 */
import { logger } from '@/core/utils/logger';

import { saveCheckpoint, loadCheckpoint, hasCheckpoint } from './checkpoint';
import type {
  PipelineEngineEventHandler,
  PipelineEngineOptions,
  PipelineMiddleware,
} from './pipeline-engine-types';
import { PipelineStatus } from './pipeline.types';
import type { PipelineExecutionState, PipelineContext } from './pipeline.types';
import type { PipelineStep, StepInput, StepOutput } from './step.interface';

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
export type { PipelineStep } from './step.interface';

export class PipelineEngine {
  private steps: PipelineStep[] = [];
  private options: PipelineEngineOptions;
  private status: PipelineStatus = PipelineStatus.IDLE;
  private eventHandler?: PipelineEngineEventHandler;
  private abortController: AbortController | null = null;

  constructor(options: PipelineEngineOptions = {}) {
    this.options = { enableCheckpoint: true, enableQualityGate: true, ...options };
  }

  onEvents(handler: PipelineEngineEventHandler): void {
    this.eventHandler = handler;
  }

  getStatus(): PipelineExecutionState {
    return {
      workflowId: this.options.workflowId ?? '',
      status: this.status,
      stepStates: new Map(),
      context: new Map() as unknown as PipelineContext,
    } as PipelineExecutionState;
  }

  pause(): boolean {
    this.status = PipelineStatus.PAUSED;
    return true;
  }

  async resume(input?: StepInput): Promise<StepOutput> {
    this.status = PipelineStatus.RUNNING;
    this.abortController = new AbortController();
    return this.runInternal(input || {}, true);
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
    this.options.middlewares!.push(middleware);
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
    const enableCheckpoint = this.options.enableCheckpoint && this.options.workflowId;

    this.options.middlewares?.forEach((m) => m.onPipelineStart?.());

    try {
      for (const step of this.steps) {
        if (this.status === PipelineStatus.CANCELLED) throw new Error('Pipeline cancelled');
        while (this.status === PipelineStatus.PAUSED) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.options.middlewares?.forEach((m) => m.onStepStart?.(step.id, context));

        // 恢复检查点
        if (isResume && enableCheckpoint) {
          const checkpoint = await loadCheckpoint(step.id);
          if (checkpoint?.completed) {
            logger.info(`[PipelineEngine] Restoring from checkpoint: ${step.id}`);
            context = { ...context, ...(checkpoint.data as StepInput) };
            this.eventHandler?.onStepComplete?.(step.id, checkpoint.data as StepOutput);
            continue;
          }
        }

        // 跳过已完成步骤
        if (enableCheckpoint && (await hasCheckpoint(step.id))) {
          logger.info(`[PipelineEngine] Skipping completed step: ${step.id}`);
          continue;
        }

        // 执行步骤
        try {
          this.eventHandler?.onStepStart?.(step.id);
          this.options.onProgress?.(step.id, 0);

          const result = await step.execute(context);
          context = { ...context, ...result };

          if (enableCheckpoint) await saveCheckpoint(step.id, result);

          this.options.onProgress?.(step.id, 1);
          this.eventHandler?.onStepComplete?.(step.id, result);
          this.options.middlewares?.forEach((m) => m.onStepComplete?.(step.id, result));
        } catch (error) {
          this.options.onError?.(step.id, error as Error);
          this.eventHandler?.onStepFail?.(step.id, (error as Error).message);
          this.options.middlewares?.forEach((m) => m.onStepError?.(step.id, error as Error));
          throw error;
        }
      }

      this.status = PipelineStatus.COMPLETED;
      this.options.onComplete?.(context as StepOutput);
      this.options.middlewares?.forEach((m) => m.onPipelineComplete?.(context as StepOutput));
      logger.info('[PipelineEngine] Pipeline completed successfully');
      return context as StepOutput;
    } catch (error) {
      this.status = PipelineStatus.FAILED;
      this.eventHandler?.onStepFail?.('pipeline', (error as Error).message);
      this.options.middlewares?.forEach((m) => m.onPipelineError?.(error as Error));
      logger.error('[PipelineEngine] Pipeline failed:', error);
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
