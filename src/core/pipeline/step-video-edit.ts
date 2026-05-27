/**
 * Step-VideoEdit — 视频剪辑步骤
 *
 * 将渲染好的帧序列进行剪辑，添加转场、字幕，
 * 最终合成连续视频片段。
 */

import type { StepInput, StepOutput } from '../pipeline/pipeline.types';
import {
  PipelineStep,
  PipelineStepId,
  PipelineExecutionMode,
  StepStatus,
  StepProgressEvent,
  RetryPolicy,
} from '../pipeline/pipeline.types';
import { ffmpegWasmService } from '../services/ffmpeg-wasm.service';
import { logger } from '../utils/logger';

export interface VideoEditOutput extends StepOutput {
  videoClips: Array<{
    sceneId: string;
    clipPath: string;
    duration: number;
    startTime: number;
    endTime: number;
    transitions: string[];
  }>;
  totalDuration: number;
  outputPath: string;
}

export interface VideoEditConfig {
  id?: string;
  name?: string;
  fps?: number;
  transition?: 'fade' | 'none';
}

export class VideoEditStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId = PipelineStepId.VIDEO_EDITING; // 真实枚举值
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy = {
    maxRetries: 2,
    initialDelayMs: 2000,
    backoffMultiplier: 2,
    maxDelayMs: 15000,
  };
  onProgress?: (event: StepProgressEvent) => void;

  private fps: number;
  private transition: 'fade' | 'none';

  constructor(config?: VideoEditConfig) {
    this.id = config?.id ?? 'step-video-edit';
    this.name = config?.name ?? '视频剪辑';
    this.fps = config?.fps ?? 2;
    this.transition = config?.transition ?? 'fade';
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[VideoEditStep] Editing video for workflow ${input.workflowId}`);

    try {
      // 从上下文中获取各步骤输出
      const renderedFrames = context.getVariable<Array<{
        frameId: string;
        imageUrl: string;
        duration?: number;
      }>>('renderedFrames') ?? [];
      const scriptOutput = context.getVariable<{
        scenes: Array<{ id: string; title: string; duration?: number }>;
      }>('scriptOutput');
      const subtitleOutput = context.getVariable<{
        tracks: Array<{ startTime: number; endTime: number; text: string }>;
      }>('subtitleOutput');

      const scriptScenes = scriptOutput?.scenes ?? [];
      const subtitleTracks = subtitleOutput?.tracks ?? [];

      this.reportProgress(10, '正在准备剪辑素材...');

      if (renderedFrames.length === 0) {
        return {
          stepId: this.stepId,
          status: StepStatus.COMPLETED,
          data: { videoClips: [], totalDuration: 0, outputPath: '' },
          metrics: { durationMs: Date.now() - startTime },
          qualityGate: undefined,
          startTime,
          endTime: Date.now(),
          retryCount: 0,
        };
      }

      // 按场景分组帧构建 clips
      const clips: VideoEditOutput['videoClips'] = [];
      let currentTime = 0;

      for (const scene of scriptScenes) {
        const sceneFrames = renderedFrames.filter(
          (f) => f.frameId.startsWith(scene.id) || f.frameId.includes(scene.id),
        );

        if (sceneFrames.length === 0) continue;

        const clipDuration =
          scene.duration ?? sceneFrames.reduce((sum, f) => sum + (f.duration ?? 3), 0);

        clips.push({
          sceneId: scene.id,
          clipPath: '',
          duration: clipDuration,
          startTime: currentTime,
          endTime: currentTime + clipDuration,
          transitions: this.transition === 'fade' ? ['fade'] : [],
        });

        currentTime += clipDuration;
      }

      const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0);

      this.reportProgress(30, '正在加载 FFmpeg...');

      // 确保 FFmpeg 已加载
      await ffmpegWasmService.load();

      this.reportProgress(50, '正在合成视频片段...');

      // 准备场景数据给 compose
      const scenes = renderedFrames.map((f, idx) => ({
        id: f.frameId,
        mediaPath: f.imageUrl,
        mediaType: 'image' as const,
        startTime: idx * (f.duration ?? 3),
        duration: f.duration ?? 3,
      }));

      const compResult = await ffmpegWasmService.compose(scenes, {
        format: 'mp4',
        fps: this.fps,
      });

      this.reportProgress(75, '正在嵌入字幕...');

      let finalPath = compResult.outputPath;

      if (subtitleTracks.length > 0) {
        if (!compResult.outputBlob) {
          throw new Error('FFmpeg compose did not return a blob for subtitle burning');
        }
        const subtitleTrack = {
          id: 'main',
          subtitles: subtitleTracks.map((t, idx) => ({
            startTime: t.startTime,
            endTime: t.endTime,
            text: t.text,
          })),
        };
        const subbedResult = await ffmpegWasmService.addSubtitles(
          compResult.outputBlob,
          subtitleTrack,
          undefined,
          'mp4',
        );
        finalPath = subbedResult.outputPath;
      }

      this.reportProgress(95, '视频剪辑完成');

      // 更新 clip 的路径
      const finalClips = clips.map((c) => ({ ...c, clipPath: finalPath }));

      logger.success(`[VideoEditStep] Video editing complete: ${totalDuration}s, ${clips.length} clips`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: {
          videoClips: finalClips,
          totalDuration,
          outputPath: finalPath,
        } as VideoEditOutput,
        metrics: {
          durationMs: Date.now() - startTime,
          framesProcessed: renderedFrames.length,
        },
        qualityGate: undefined,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[VideoEditStep] Video editing failed: ${errorMsg}`);

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

  private async writeSrtFile(
    tracks: Array<{ startTime: number; endTime: number; text: string }>,
  ): Promise<string> {
    let srtContent = '';

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const index = i + 1;
      const startTime = this.formatSrtTime(track.startTime);
      const endTime = this.formatSrtTime(track.endTime);

      srtContent += `${index}\n${startTime} --> ${endTime}\n${track.text}\n\n`;
    }

    // 保存到 localStorage 作为临时方案
    localStorage.setItem('temp_srt', srtContent);

    return 'localStorage:temp_srt';
  }

  private formatSrtTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}

export function createVideoEditStep(config?: VideoEditConfig): VideoEditStep {
  return new VideoEditStep(config);
}
