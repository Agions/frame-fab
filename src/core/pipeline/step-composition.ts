/**
 * Pipeline 步骤7：合成与导出 (Composition & Export)
 *
 * 视频合成、字幕添加、音频混音
 */

import { logger } from '@/core/utils/logger';
import { videoCompositorService } from '@/features/video-export/services/video-compositor.service';

import type {
  PipelineStep,
  StepInput,
  StepOutput,
  StepProgressEvent,
  RetryPolicy,
} from './pipeline.types';
import { PipelineStepId, PipelineExecutionMode } from './pipeline.types';
import {
  createFailedStepResult,
  createSuccessStepResult,
  reportStepProgress,
} from './step-helpers';

export interface CompositionOutput {
  videoUrl: string;
  duration: number;
  format: 'mp4' | 'webm';
  resolution: string;
  fileSize?: number;
}

export class CompositionStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId = PipelineStepId.COMPOSITION;
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy;
  readonly dependencies = [PipelineStepId.RENDER];
  onProgress?: (event: StepProgressEvent) => void;

  constructor(config?: Partial<PipelineStep>) {
    this.id = config?.id ?? 'step-composition';
    this.name = config?.name ?? '视频合成';
    this.retryPolicy = config?.retryPolicy ?? {
      maxRetries: 3,
      initialDelayMs: 5000,
      backoffMultiplier: 2,
      maxDelayMs: 30000,
    };
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[CompositionStep] Starting video composition for workflow ${input.workflowId}`);

    try {
      const renderedFrames =
        context.getVariable<Array<{ frameId: string; imageUrl: string }>>('renderedFrames') ?? [];

      if (renderedFrames.length === 0) {
        throw new Error('No rendered frames to compose');
      }

      this.reportProgress(10, '正在构建场景序列...');

      const scenes = renderedFrames.map((frame, idx) => ({
        id: frame.frameId,
        mediaPath: frame.imageUrl,
        mediaType: 'image' as const,
        startTime: idx * 5,
        duration: 5,
      }));

      this.reportProgress(30, '正在合成视频...');

      const result = await videoCompositorService.compose(scenes, {
        format: 'mp4',
      });

      this.reportProgress(90, '合成完成');

      context.setVariable('composedVideoUrl', result.outputPath);

      logger.success(`[CompositionStep] Video composed: ${result.outputPath}`);

      return createSuccessStepResult(
        this.stepId,
        startTime,
        {
          videoUrl: result.outputPath || '',
          duration: result.duration || scenes.length * 5,
          format: 'mp4' as const,
          resolution: '1920x1080',
        },
        {
          durationMs: Date.now() - startTime,
          framesProcessed: renderedFrames.length,
        }
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[CompositionStep] Composition failed: ${errorMsg}`);
      return createFailedStepResult(this.stepId, startTime, errorMsg);
    }
  }

  private reportProgress(progress: number, message: string): void {
    reportStepProgress(this.stepId, this.onProgress, progress, message);
  }
}

export function createCompositionStep(config?: Partial<PipelineStep>): CompositionStep {
  return new CompositionStep(config);
}

export default CompositionStep;
