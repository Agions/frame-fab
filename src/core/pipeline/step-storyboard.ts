/**
 * Pipeline 步骤5：分镜设计 (Storyboard)
 * 
 * AI自动生成分镜图描述、镜头语言设计
 */

import { logger } from '@/core/utils/logger';

import type {
  PipelineStep,
  StepInput,
  StepOutput,
  StepProgressEvent,
  RetryPolicy,
} from './pipeline.types';
import { PipelineStepId, StepStatus, QualityGateDecision , PipelineExecutionMode } from './pipeline.types';

export interface StoryboardOutput {
  frames: Array<{
    id: string;
    sceneId: string;
    shotNumber: number;
    shotType: 'ECU' | 'CU' | 'MCU' | 'MS' | 'WS' | 'EWS';
    cameraAngle: '仰拍' | '俯拍' | '平拍' | '侧拍';
    lighting: '顺光' | '侧光' | '逆光' | '顶光';
    description: string;
    prompt: string;
    duration: number;
  }>;
  totalFrames: number;
}

const SHOT_TYPES = ['ECU', 'CU', 'MCU', 'MS', 'WS', 'EWS'] as const;
const CAMERA_ANGLES = ['仰拍', '俯拍', '平拍', '侧拍'] as const;
const LIGHTING_TYPES = ['顺光', '侧光', '逆光', '顶光'] as const;

export class StoryboardStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId = PipelineStepId.STORYBOARD;
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy;
  readonly dependencies = [PipelineStepId.SCRIPT, PipelineStepId.CHARACTER];
  onProgress?: (event: StepProgressEvent) => void;

  constructor(config?: Partial<PipelineStep>) {
    this.id = config?.id ?? 'step-storyboard';
    this.name = config?.name ?? '分镜设计';
    this.retryPolicy = config?.retryPolicy ?? {
      maxRetries: 2,
      initialDelayMs: 2000,
      backoffMultiplier: 2,
      maxDelayMs: 10000,
    };
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[StoryboardStep] Generating storyboard for workflow ${input.workflowId}`);

    try {
      const scenes = context.getVariable<Array<{ id: string; title: string; description: string }>>('scenes') ?? [];
      const characters = context.getVariable<Array<{ name: string; appearance: Record<string, string> }>>('characters') ?? [];

      this.reportProgress(10, '正在分析场景...');

      const frames: StoryboardOutput['frames'] = [];
      let shotNumber = 1;

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        this.reportProgress(10 + (i * 60 / scenes.length), `处理场景: ${scene.title}`);

        // 每个场景生成 2-4 个镜头
        const shotCount = 2 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < shotCount; j++) {
          const shotType = SHOT_TYPES[Math.floor(Math.random() * SHOT_TYPES.length)];
          const cameraAngle = CAMERA_ANGLES[Math.floor(Math.random() * CAMERA_ANGLES.length)];
          const lighting = LIGHTING_TYPES[Math.floor(Math.random() * LIGHTING_TYPES.length)];

          const mainCharacter = characters[0]?.name || '主角';
          const prompt = this.buildShotPrompt(scene, shotType, cameraAngle, lighting, mainCharacter);

          frames.push({
            id: `frame-${i}-${j}`,
            sceneId: scene.id || `scene-${i}`,
            shotNumber: shotNumber++,
            shotType,
            cameraAngle,
            lighting,
            description: scene.description || '场景描述',
            prompt,
            duration: 3 + Math.random() * 5,
          });
        }
      }

      this.reportProgress(80, '正在保存分镜...');
      context.setVariable('frames', frames);
      context.setVariable('totalFrames', frames.length);

      logger.success(`[StoryboardStep] Generated ${frames.length} frames`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: { frames, totalFrames: frames.length },
        metrics: {
          durationMs: Date.now() - startTime,
          framesProcessed: frames.length,
        },
        qualityGate: QualityGateDecision.PASS,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[StoryboardStep] Storyboard generation failed: ${errorMsg}`);

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

  private reportProgress(progress: number, message: string): void {
    this.onProgress?.({ stepId: this.stepId, progress, message });
  }

  private buildShotPrompt(
    scene: { title: string; description: string },
    shotType: string,
    cameraAngle: string,
    lighting: string,
    mainCharacter: string
  ): string {
    return `${mainCharacter}, ${shotType} shot, ${cameraAngle}, ${lighting}, ${scene.description || scene.title}, high detail, 8k`;
  }
}

export function createStoryboardStep(config?: Partial<PipelineStep>): StoryboardStep {
  return new StoryboardStep(config);
}

export default StoryboardStep;
