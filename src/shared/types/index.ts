/**
 * Shared Types Barrel
 *
 * Canonical type definitions. All types previously scattered across
 * `@/types` and `@/core/types` are re-exported here.
 */
export * from './ai.core';
export * from './ai.models';
export * from './composition';
export * from './legacy';
export * from './preview';
export * from './project';
export * from './script';
export * from './story-context';
export * from './video-composition.types';

// Note: novel.ts and video.ts both export 'Scene' (with different semantics).
// We re-export them via aliased names to avoid conflict; consumers should
// import the specific one they need.
// - video.ts Scene: 视频场景分析（带 startTime/endTime/thumbnail）
// - novel.ts SceneEmotion: 小说场景情感
export * from './video';
export {
  EmotionType,
  type NovelMetadata,
  type Chapter,
  type NovelScene,
  type Character,
  type CharacterRelationship,
  type Dialogue,
  type SceneEmotion,
  type AnalyzeConfig,
  type AnalyzeResult,
  type NovelStatistics,
  type SceneDescription,
  type VisualElement,
  type ExportOptions,
  type ScriptSourceType,
  type ScriptFileFormat,
  type ScriptSource,
  type ScriptChapter,
  type ScriptValidationIssue,
  type ScriptValidationResult,
  type StoryAnalysisCharacter,
  type StoryAnalysisChapter,
  type StoryAnalysis,
  type ScriptFormat,
} from './novel';
