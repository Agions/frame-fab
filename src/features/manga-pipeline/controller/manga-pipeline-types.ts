/**
 * Manga Pipeline Controller 类型定义集中
 * ======================================
 * 把分散在 controller 文件中的 enum / interface / type alias 归类。
 * 单一职责：纯类型声明。
 */
import type { StepState } from '../base/BasePipelineController';
import type { ScriptGenerationResult } from '../steps/step1-script-generation/pipeline-controller';
import type { Storyboard } from '../steps/step2-storyboard/composer';
import type { StoryboardGenerationResult } from '../steps/step2-storyboard/StoryboardPipeline';
import type { MaterialMatchingResult } from '../steps/step3-material-matching/pipeline-controller';
import type { VoiceSynthesisResult } from '../steps/step4-voice-synthesis/pipeline-controller';
import type { KeyframePipelineResult } from '../steps/step5-keyframe/pipeline-controller';

/** 流水线步骤枚举 */
export enum MangaPipelineStep {
  SCRIPT = 'script',
  STORYBOARD = 'storyboard',
  MATERIAL = 'material',
  VOICE = 'voice',
  KEYFRAME = 'keyframe',
}

/** 流水线输入 */
export interface MangaPipelineInput {
  text: string;
  title?: string;
  style?: string;
}

/** 流水线状态 (UI 绑定用) */
export interface MangaPipelineState {
  currentStep: MangaPipelineStep;
  stepState: StepState;
  progress: number;
  subStepName: string;
}

/** 流水线结果 (各步部分结果汇总) */
export interface MangaPipelineResult {
  scriptResult?: ScriptGenerationResult;
  storyboard?: Storyboard;
  materialResult?: MaterialMatchingResult;
  voiceResult?: VoiceSynthesisResult;
  keyframeResult?: KeyframePipelineResult;
  /** 角色约束 (从 StoryboardPipeline 流出, 供视频生成使用) */
  characterConstraints?: StoryboardGenerationResult['characterConstraints'];
}

/** 流水线进度事件 */
export interface MangaPipelineProgress {
  step: MangaPipelineStep;
  stepProgress: number;
  subStepName: string;
  overallProgress: number;
  state: StepState;
}

/** 进度回调签名 */
export type ProgressListener = (event: MangaPipelineProgress) => void;
