/**
 * Pipeline 步骤6：批量渲染 (Batch Render)
 * 
 * 批量生成分镜图，支持断点续跑
 */

import { imageGenerationService } from '@/core/services/image-generation.service';
import { logger } from '@/core/utils/logger';

import type {
  PipelineStep,
  StepInput,
  StepOutput,
  StepProgressEvent,
  RetryPolicy,
  StepCheckpoint,
} from './pipeline.types';
import { PipelineStepId, StepStatus, QualityGateDecision , PipelineExecutionMode } from './pipeline.types';
import type { StoryboardOutput } from './step-storyboard';

export interface RenderOutput {
  renderedFrames: Array<{
    frameId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    qualityScore?: number;
    renderTime: number;
  }>;
  failedFrames: string[];
  totalFrames: number;
  successRate: number;
}

export class RenderStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId = PipelineStepId.RENDER;
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy;
  readonly dependencies = [PipelineStepId.STORYBOARD];
  onProgress?: (event: StepProgressEvent) => void;

  private batchSize = 4;

  private reportProgress(progress: number, message: string): void {
    this.onProgress?.({
      stepId: this.stepId,
      progress,
      message,
    });
  }

  constructor(config?: Partial<PipelineStep>) {
    this.id = config?.id ?? 'step-render';
    this.name = config?.name ?? '批量渲染';
    this.retryPolicy = config?.retryPolicy ?? {
      maxRetries: 2,
      initialDelayMs: 3000,
      backoffMultiplier: 2,
      maxDelayMs: 15000,
    };
    if (config?.parallelKeys) {
      this.batchSize = Math.min(config.parallelKeys.length, 4);
    }
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[RenderStep] Starting batch render for workflow ${input.workflowId}`);

    try {
      const frames = context.getVariable<StoryboardOutput['frames']>('frames') ?? [];
      
      if (frames.length === 0) {
        throw new Error('No frames to render');
      }

      this.reportProgress(5, `开始渲染 ${frames.length} 个分镜...`);

      // 获取已完成的帧（断点续跑）
      const checkpoint = input.checkpoint;
      const completedFrameIds = new Set(checkpoint?.completedFrames ?? []);
      const framesToRender = frames.filter(f => !completedFrameIds.has(f.id));

      logger.info(`[RenderStep] ${completedFrameIds.size} already rendered, ${framesToRender.length} remaining`);

      const renderedFrames: RenderOutput['renderedFrames'] = [];
      const failedFrames: string[] = [];

      // 批量处理
      for (let i = 0; i < framesToRender.length; i += this.batchSize) {
        const batch = framesToRender.slice(i, i + this.batchSize);
        const batchProgress = 5 + Math.floor((i / framesToRender.length) * 85);

        this.reportProgress(batchProgress, `渲染批次 ${Math.floor(i / this.batchSize) + 1}/${
          Math.ceil(framesToRender.length / this.batchSize)}`);

        const results = await Promise.allSettled(
          batch.map(async (frame) => {
            try {
              const result = await imageGenerationService.generateImage(frame.prompt, { model: 'seedream-5.0', size: '2K' });

              return {
                frameId: frame.id,
                imageUrl: result.url || '',
                thumbnailUrl: result.url,
                qualityScore: 0.85,
                renderTime: Date.now() - startTime,
              };
            } catch (error) {
              throw { frameId: frame.id, error };
            }
          })
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          const frameId = batch[j].id;

          if (result.status === 'fulfilled') {
            renderedFrames.push(result.value);
            completedFrameIds.add(frameId);
          } else {
            failedFrames.push(frameId);
            logger.warn(`[RenderStep] Frame ${frameId} failed: ${result.reason}`);
          }
        }

        // 保存检查点
        if (this.batchSize > 1 || i + this.batchSize >= framesToRender.length) {
          const stepCheckpoint: StepCheckpoint = {
            stepId: this.stepId,
            completedFrames: Array.from(completedFrameIds),
            lastProcessedIndex: i + this.batchSize,
            partialOutput: { renderedFrames, failedFrames },
            timestamp: Date.now(),
          };
          context.saveCheckpoint(stepCheckpoint);
        }
      }

      this.reportProgress(95, '渲染完成');

      const totalFrames = frames.length;
      const successRate = (totalFrames - failedFrames.length) / totalFrames;

      context.setVariable('renderedFrames', renderedFrames);
      context.setVariable('failedFrames', failedFrames);
      context.setVariable('renderSuccessRate', successRate);

      logger.success(`[RenderStep] Render complete: ${renderedFrames.length}/${totalFrames} success rate: ${(successRate * 100).toFixed(1)}%`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: { renderedFrames, failedFrames, totalFrames, successRate },
        metrics: {
          durationMs: Date.now() - startTime,
          framesProcessed: totalFrames,
          qualityScore: successRate,
        },
        qualityGate: successRate >= 0.8 ? QualityGateDecision.PASS : QualityGateDecision.WARN,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[RenderStep] Render failed: ${errorMsg}`);

      return {
        stepId: this.stepId,
        status: StepStatus.FAILED,
        data: undefined,
        error: errorMsg,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };
    }
  }
}

export function createRenderStep(config?: Partial<PipelineStep>): RenderStep {
  return new RenderStep(config);
}

export default RenderStep;
