/**
 * 结构化提示词模板（facade）
 *
 * 按职责拆分为 4 个子模块：
 * - style-presets.ts: 风格预设常量
 * - character-reference.ts: 角色三视图模板
 * - prompt-builders.ts: 5段式提示词构建
 * - prompt-validation.ts: 提示词质量检查
 */

// 风格预设
export { ANIME_STYLE, COMIC_STYLE, SKETCH_STYLE, STYLE_MAP } from './style-presets';
export type { StylePreset } from './style-presets';

// 角色三视图
export { buildCharacterReferencePrompts } from './character-reference';
export type { CharacterView } from './character-reference';

// 提示词构建
export { buildCharacterPrompt, buildScenePrompt, buildVideoPrompt } from './prompt-builders';
export type {
  PromptContext,
  ScenePromptContext,
  CharacterRefPrompt,
  VideoPromptContext,
} from './prompt-builders';

// 质量检查
export { validatePrompt } from './prompt-validation';
