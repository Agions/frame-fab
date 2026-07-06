/**
 * frame-fab Pipeline 统一入口
 *
 * 精简版：删除死代码 PipelineService（运行时从未被外部消费）。
 * 仅保留 PipelineEngine 导出和各 step 产出的类型 re-export。
 */

export { PipelineEngine, createPipelineEngine } from './pipeline-engine';
export { PipelineStepId, PipelineExecutionMode, PipelineStatus } from './pipeline.types';

// ========== 类型重新导出 ==========

export type { ImportInput, ImportOutput } from './step-import';
export type { ScriptOutput } from './step-script';
export type { CharacterOutput } from './step-character';
export type { StoryboardOutput } from './step-storyboard';
export type { RenderOutput } from './step-render';
export type { AudioSynthesisOutput } from './step-audio-synthesis';
export type { VideoEditingOutput } from './step-video-editing';
export type { CompositionOutput } from './step-composition';
