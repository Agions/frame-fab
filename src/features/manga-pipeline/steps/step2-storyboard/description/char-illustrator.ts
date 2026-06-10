/**
 * 角色立绘 + 场景描述（facade）
 *
 * 按职责拆分为 4 个子模块：
 * - style-utils.ts: 样式预设 + 性格/情感/时长工具
 * - char-illustration.ts: 角色立绘生成（含三视图）
 * - char-constraints.ts: 角色约束构建
 * - scene-description.ts: 场景描述生成
 */

// Re-export 所有公共 API 保持向后兼容
export {
  getStylePreset,
  getPersonalityPose,
  getEmotionKeyword,
  estimateDuration,
} from './style-utils';

export { generateCharacterIllustration } from './char-illustration';
export type { CharacterIllustration, CharacterIllustrationInput } from './char-illustration';

export { buildCharacterConstraints } from './char-constraints';
export type { EnhancedCharacterConstraint } from './char-constraints';

export { generateSceneDescription, LEGACY_STYLE_PRESETS } from './scene-description';
export type { SceneDescription, StylePreset } from './scene-description';
