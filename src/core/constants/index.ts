/**
 * 常量定义（facade）
 *
 * 按功能域拆分为 4 个子模块：
 * - script-options.ts: 脚本生成选项
 * - video-options.ts: 视频导出/编辑选项
 * - app-config.ts: 应用级配置
 * - llm-models.ts: LLM 模型配置
 */

// 脚本选项
export {
  SCRIPT_STYLES,
  TONE_OPTIONS,
  SCRIPT_LENGTHS,
  TARGET_AUDIENCES,
  LANGUAGE_OPTIONS,
} from './script-options';

// 视频选项
export {
  VIDEO_FORMATS,
  EXPORT_QUALITIES,
  RESOLUTION_OPTIONS,
  ASPECT_RATIOS,
  SHORT_VIDEO_ASPECT_RATIOS,
  getAspectRatioDimensions,
  CROP_MODES,
  CROP_ALIGNMENTS,
  TRANSITION_EFFECTS,
} from './video-options';

// 应用配置
export {
  STORAGE_KEYS,
  ROUTES,
  EVENTS,
  ERROR_CODES,
  DEFAULTS,
  FILE_TYPE_MAP,
  ANIMATION_CONFIG,
} from './app-config';

// LLM 模型
export { LLM_MODELS, DEFAULT_LLM_MODEL, MODEL_RECOMMENDATIONS } from './llm-models';
export type { LLMModelConfig, LLMModels } from './llm-models';
