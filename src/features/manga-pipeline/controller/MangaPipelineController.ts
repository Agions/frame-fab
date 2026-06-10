/**
 * MangaPipelineController - 漫剧生成统一流程控制器（Facade）
 * ============================================================
 * 编排整个漫剧生成流水线：
 * 1. 脚本生成 (Script Generation)
 * 2. 分镜制作 (Storyboard)
 * 3. 素材匹配 (Material Matching)
 * 4. 语音合成 (Voice Synthesis)
 * 5. 关键帧生成 (Keyframe)
 *
 * 拆分思路（5 个 sibling 模块）：
 * - manga-pipeline-types.ts                enum + 6 个 interface / type alias
 * - manga-pipeline-constants.ts            进度权重 / 子步骤标签 / 并发数 / 轮询参数
 * - manga-pipeline-progress.ts             subscribe + emit + calculateOverallProgress
 * - manga-pipeline-character-mapper.ts     characterConstraints → references 映射（消除 2 处重复）
 * - manga-pipeline-lip-sync.ts             applyLipSync 独立函数
 * - manga-pipeline-visual-consistency.ts   evaluateVisualConsistency 独立函数
 *
 * 类本身只剩"装配 + 主流程编排"：构造 5 个 sub-pipeline + 接 progress handler +
 * 串行执行 5 步 + 末尾调唇同步 + 视觉一致性评估。
 */

import type { StepInput, StepOutput } from '@/core/pipeline/step.interface';
import { logger } from '@/core/utils/logger';

import { BasePipelineController } from '../base/BasePipelineController';
import { ScriptGenerationPipeline } from '../steps/step1-script-generation/pipeline-controller';
import { StoryboardPipeline } from '../steps/step2-storyboard/StoryboardPipeline';
import { MaterialMatchingPipeline } from '../steps/step3-material-matching/pipeline-controller';
import { VoiceSynthesisPipeline } from '../steps/step4-voice-synthesis/pipeline-controller';
import { KeyframePipeline } from '../steps/step5-keyframe/pipeline-controller';

import { mapCharacterConstraintsToReferences } from './manga-pipeline-character-mapper';
import {
  DEFAULT_MANGA_STYLE,
  DEFAULT_KEYFRAME_ASPECT_RATIO,
  PROGRESS_COMPLETE,
  SUB_STEP_LABELS,
} from './manga-pipeline-constants';
import { applyLipSyncToKeyframes } from './manga-pipeline-lip-sync';
import { createProgressManager } from './manga-pipeline-progress';
import {
  MangaPipelineStep,
  type MangaPipelineInput,
  type MangaPipelineProgress,
  type MangaPipelineState,
  type ProgressListener,
  type MangaPipelineResult,
} from './manga-pipeline-types';
import { evaluateKeyframeVisualConsistency } from './manga-pipeline-visual-consistency';

// 类型 re-export 保持旧 import 路径
export {
  MangaPipelineStep,
  type MangaPipelineInput,
  type MangaPipelineProgress,
  type MangaPipelineState,
  type MangaPipelineResult,
  type ProgressListener,
} from './manga-pipeline-types';

export class MangaPipelineController extends BasePipelineController {
  id = 'manga-pipeline';
  name = 'Manga Generation Pipeline';

  /** 11 步子步骤标签 (供 UI 进度条文字显示) */
  protected subSteps = [...SUB_STEP_LABELS];

  private scriptPipeline = new ScriptGenerationPipeline();
  private storyboardPipeline = new StoryboardPipeline();
  private materialPipeline = new MaterialMatchingPipeline();
  private voicePipeline = new VoiceSynthesisPipeline();
  private keyframePipeline = new KeyframePipeline();

  private result: MangaPipelineResult = {};
  private currentStep: MangaPipelineStep = MangaPipelineStep.SCRIPT;
  private progressManager = createProgressManager();

  constructor() {
    super();
    // 把每个 sub-pipeline 的进度事件转接到统一 emit
    this.scriptPipeline.setProgressHandler((event) => {
      this.progressManager.emitProgress(
        MangaPipelineStep.SCRIPT,
        event.progress,
        event.message,
        this._state,
        (overall, sub) => this.updateProgress(overall, sub)
      );
    });
    this.storyboardPipeline.setProgressHandler((event) => {
      this.progressManager.emitProgress(
        MangaPipelineStep.STORYBOARD,
        event.progress,
        event.message,
        this._state,
        (overall, sub) => this.updateProgress(overall, sub)
      );
    });
    this.voicePipeline.setProgressHandler((event) => {
      this.progressManager.emitProgress(
        MangaPipelineStep.VOICE,
        event.progress,
        event.message,
        this._state,
        (overall, sub) => this.updateProgress(overall, sub)
      );
    });
    this.materialPipeline.setProgressHandler((event) => {
      this.progressManager.emitProgress(
        MangaPipelineStep.MATERIAL,
        event.progress,
        event.message,
        this._state,
        (overall, sub) => this.updateProgress(overall, sub)
      );
    });
    this.keyframePipeline.setProgressHandler((event) => {
      this.progressManager.emitProgress(
        MangaPipelineStep.KEYFRAME,
        event.progress,
        event.message,
        this._state,
        (overall, sub) => this.updateProgress(overall, sub)
      );
    });
  }

  /**
   * 订阅进度事件
   */
  subscribe(listener: ProgressListener): () => void {
    return this.progressManager.subscribe(listener);
  }

  /**
   * Skip the current step and continue
   */
  skipCurrentStep(): void {
    // Mark current step as done and move on
    const currentProgress = this.progressManager.emitProgress(
      this.currentStep,
      PROGRESS_COMPLETE,
      '',
      this._state
    ).overallProgress;
    this.updateProgress(currentProgress);
  }

  /**
   * Get current pipeline state for UI binding
   */
  getPipelineState(): MangaPipelineState {
    return {
      currentStep: this.currentStep,
      stepState: this._state,
      progress: this._progress,
      subStepName: this.subSteps[this.currentSubStep] || '',
    };
  }

  /**
   * Get partial results (useful for checkpoint recovery)
   */
  getPartialResults(): MangaPipelineResult {
    return this.result;
  }

  protected async _doProcess(input: StepInput): Promise<StepOutput> {
    const { text, title, style = DEFAULT_MANGA_STYLE } = input as unknown as MangaPipelineInput;

    this.result = {};
    this.currentStep = MangaPipelineStep.SCRIPT;

    try {
      // ============ Step 1: Script Generation ============
      this.emitStepProgress(MangaPipelineStep.SCRIPT, 0, '解析文本');
      const scriptOutput = await this.scriptPipeline.process({ text, title });
      const scriptResult = (scriptOutput as StepOutput).scriptGeneration as never;
      this.result.scriptResult = scriptResult as MangaPipelineResult['scriptResult'];
      this.emitStepProgress(MangaPipelineStep.SCRIPT, PROGRESS_COMPLETE, '质量评估');
      await this.pauseCheck();

      // ============ Step 2: Storyboard ============
      this.currentStep = MangaPipelineStep.STORYBOARD;
      this.emitStepProgress(MangaPipelineStep.STORYBOARD, 0, '生成分镜');
      const storyboardOutput = await this.storyboardPipeline.process({
        script: (this.result.scriptResult as { script: unknown }).script,
        style,
      });
      const storyboardResult = (storyboardOutput as StepOutput).storyboardGeneration as {
        storyboard: MangaPipelineResult['storyboard'];
        characterConstraints: MangaPipelineResult['characterConstraints'];
      };
      this.result.storyboard = storyboardResult.storyboard;
      this.result.characterConstraints = storyboardResult.characterConstraints;
      this.emitStepProgress(MangaPipelineStep.STORYBOARD, PROGRESS_COMPLETE, '生成分镜');
      await this.pauseCheck();

      // ============ Step 3: Material Matching ============
      this.currentStep = MangaPipelineStep.MATERIAL;
      this.emitStepProgress(MangaPipelineStep.MATERIAL, 0, '匹配素材');
      const materialOutput = await this.materialPipeline.process({
        storyboard: this.result.storyboard,
      });
      this.result.materialResult = (materialOutput as StepOutput)
        .materialMatching as MangaPipelineResult['materialResult'];
      this.emitStepProgress(MangaPipelineStep.MATERIAL, PROGRESS_COMPLETE, '匹配素材');
      await this.pauseCheck();

      // ============ Step 4: Voice Synthesis ============
      this.currentStep = MangaPipelineStep.VOICE;
      this.emitStepProgress(MangaPipelineStep.VOICE, 0, '合成语音');
      const voiceOutput = await this.voicePipeline.process({
        script: (this.result.scriptResult as { script: unknown }).script,
      });
      this.result.voiceResult = (voiceOutput as StepOutput)
        .voiceSynthesis as MangaPipelineResult['voiceResult'];
      this.emitStepProgress(MangaPipelineStep.VOICE, PROGRESS_COMPLETE, '合成语音');
      await this.pauseCheck();

      // ============ Step 5: Keyframe Generation ============
      this.currentStep = MangaPipelineStep.KEYFRAME;
      this.emitStepProgress(MangaPipelineStep.KEYFRAME, 0, '生成关键帧');
      if (!this.result.storyboard) {
        throw new Error('Storyboard not generated — cannot proceed to keyframe step');
      }
      const keyframeScenes = this.result.storyboard.scenes.map((scene) => ({
        sceneId: scene.sceneId,
        sceneNumber: scene.description.sceneNumber,
        description: scene.description.prompt,
        location: scene.description.location || '',
        emotion: scene.description.emotion || '',
      }));
      const keyframeOutput = await this.keyframePipeline.process({
        scenes: keyframeScenes,
        style,
        aspectRatio: DEFAULT_KEYFRAME_ASPECT_RATIO,
        dialogueSegments: this.result.voiceResult!.dialogueSegments,
        characterReferences: mapCharacterConstraintsToReferences(this.result.characterConstraints),
      });
      this.result.keyframeResult = (keyframeOutput as StepOutput).keyframePipeline as
        | MangaPipelineResult['keyframeResult']
        | undefined;

      // ============ Lip Sync（音画同步）============
      if (this.result.keyframeResult) {
        await applyLipSyncToKeyframes(this.result.keyframeResult, (progress, subStepName) => {
          this.updateProgress(progress, subStepName);
        });

        // ============ 视觉一致性评估 ============
        const visualResult = await evaluateKeyframeVisualConsistency(
          this.result.keyframeResult,
          this.result.characterConstraints
        );
        if (visualResult) {
          const kfResult = this.result.keyframeResult as NonNullable<
            MangaPipelineResult['keyframeResult']
          >;
          if (kfResult.metadata) {
            kfResult.metadata.visualConsistencyScore = visualResult.overallScore;
            logger.info(`[MangaPipeline] 视觉一致性评分: ${visualResult.overallScore}/100`);
          }
        }
      }

      this.emitStepProgress(MangaPipelineStep.KEYFRAME, PROGRESS_COMPLETE, '合成视频');

      return this.result as StepOutput;
    } catch (err) {
      this.checkpointOnError(this.result);
      throw err;
    }
  }

  /** 内部：发某步的进度事件 + 自动回写 base updateProgress */
  private emitStepProgress(
    step: MangaPipelineStep,
    stepProgress: number,
    subStepName: string
  ): void {
    this.progressManager.emitProgress(
      step,
      stepProgress,
      subStepName,
      this._state,
      (overall, sub) => this.updateProgress(overall, sub)
    );
  }
}
