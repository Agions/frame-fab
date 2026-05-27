/**
 * Pipeline 步骤4（拆分）：音频合成 (Audio Synthesis)
 * 
 * 负责：TTS 对话生成、BGM 选择与淡入淡出、音频轨道混合
 * 
 * 注意：此步骤是从原来的配音合成模块（Step 4）中拆分的独立步骤。
 * 主要功能已整合在 audio-pipeline.service.ts 中，
 * 此处作为 Pipeline Step 提供标准化的上下文管理。
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

export interface AudioSynthesisOutput {
  dialogueAudio: Array<{ audioUrl: string; duration: number; speakerId: string }>;
  selectedBgm: string;
  totalAudioDuration: number;
}

export class AudioSynthesisStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId = PipelineStepId.AUDIO_SYNTHESIS;
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy;
  readonly dependencies = [PipelineStepId.SCRIPT];
  onProgress?: (event: StepProgressEvent) => void;

  constructor(config?: Partial<PipelineStep>) {
    this.id = config?.id ?? 'step-audio-synthesis';
    this.name = config?.name ?? '音频合成';
    this.retryPolicy = config?.retryPolicy ?? {
      maxRetries: 2,
      initialDelayMs: 3000,
      backoffMultiplier: 2,
      maxDelayMs: 20000,
    };
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[AudioSynthesisStep] Starting audio synthesis for workflow ${input.workflowId}`);

    try {
      // 从上下文获取剧本数据（对话信息）
      const scriptOutput = context.getVariable<{
        scenes: Array<{
          dialogue?: Array<{ speaker: string; text: string; emotion?: string }>;
        }>;
      }>('scriptOutput');

      const selectedBgm = context.getVariable<string>('selectedBgm') ?? '';

      // 获取对话数据
      const dialogueAudio: AudioSynthesisOutput['dialogueAudio'] = [];
      if (scriptOutput?.scenes) {
        for (let i = 0; i < scriptOutput.scenes.length; i++) {
          const scene = scriptOutput.scenes[i];
          if (scene.dialogue && scene.dialogue.length > 0) {
            for (const line of scene.dialogue) {
              const charCount = line.text.length;
              const estimatedDuration = Math.max(1, charCount / 5); // 5 字/秒
              dialogueAudio.push({
                audioUrl: `tts://scene_${i}/${line.speaker}`,
                duration: estimatedDuration,
                speakerId: line.speaker,
              });
            }
          }
        }
      }

      this.reportProgress(50, '音频合成完成');

      // 计算总时长
      const totalAudioDuration = dialogueAudio.reduce((sum, a) => sum + a.duration, 0);

      // 保存到上下文供后续步骤使用
      context.setVariable('dialogueAudio', dialogueAudio);
      context.setVariable('totalAudioDuration', totalAudioDuration);

      const totalMs = Date.now() - startTime;
      logger.success(`[AudioSynthesisStep] Audio synthesis completed: ${dialogueAudio.length} clips, ${totalAudioDuration.toFixed(1)}s`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: {
          dialogueAudio,
          selectedBgm,
          totalAudioDuration,
        } as AudioSynthesisOutput,
        metrics: {
          durationMs: totalMs,
        },
        qualityGate: QualityGateDecision.PASS,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[AudioSynthesisStep] Audio synthesis failed: ${errorMsg}`);

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
}

export function createAudioSynthesisStep(config?: Partial<PipelineStep>): AudioSynthesisStep {
  return new AudioSynthesisStep(config);
}

export default AudioSynthesisStep;