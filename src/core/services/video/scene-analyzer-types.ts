/**
 * 场景分析服务共享类型与常量
 * @module core/services/video/scene-analyzer-types
 *
 * 提取自原 SceneAnalyzer 内联 config 默认值 + AI 返回值字段映射。
 */

import { type Character, type NovelScene, type SceneDescription } from '@/shared/types';

/** 场景分析器配置 */
export interface SceneAnalyzerConfig {
  provider?: string;
  model?: string;
}

/** 默认配置（与原 SceneAnalyzer 构造默认值字节级一致） */
export const DEFAULT_SCENE_ANALYZER_CONFIG: Required<SceneAnalyzerConfig> = {
  provider: 'alibaba',
  model: 'qwen-3.5',
};

/** 生成场景描述时的最大并发数（与原 generateSceneDescriptions 内联 `MAX_CONCURRENCY = 5` 字节级一致） */
export const SCENE_DESCRIPTION_MAX_CONCURRENCY = 5;

/** 内容截断长度（与原 extractCharacters `content.slice(0, 5000)` 字节级一致） */
export const CHARACTER_EXTRACTION_CONTENT_LIMIT = 5000;

/** 场景内容截断长度（与原 generateSceneDescriptions `scene.content.slice(0, 500)` 字节级一致） */
export const SCENE_DESCRIPTION_CONTENT_LIMIT = 500;

/** 场景内容截断长度（fallback 路径：与原 `scene.content.slice(0, 100)` 字节级一致） */
export const SCENE_DESCRIPTION_FALLBACK_CONTENT_LIMIT = 100;

/** 默认 negativePrompt（与原 `negativePrompt ?? 'low quality, blurry, distorted'` 字节级一致） */
export const DEFAULT_SCENE_NEGATIVE_PROMPT = 'low quality, blurry, distorted';

/** 旁白最小长度阈值（与原 `para.length > 20` 字节级一致） */
export const NARRATOR_MIN_PARAGRAPH_LENGTH = 20;

/** 角色 ID 前缀（与原 `id: \`char_${Date.now()}_${index}\`` 字节级一致） */
export const CHARACTER_ID_PREFIX = 'char_';

/** 角色默认字段值（消除 extractCharacters 内联 8 处 `??` 重复） */
export const DEFAULT_CHARACTER_FIELDS = {
  name: '未知角色',
  role: 'minor',
  importance: 1,
} as const;

/**
 * 角色 id 生成（与原内联字符串字面量一致）
 */
export function generateCharacterId(index: number): string {
  return `${CHARACTER_ID_PREFIX}${Date.now()}_${index}`;
}

/**
 * 把 AI 返回的部分角色数据 + 序号归一为完整 Character
 *
 * 行为与原 extractCharacters 内 `.map((char, index) => ({ id, name, ... }))` 字节级一致。
 */
export function createCharacterFromAiResponse(
  aiChar: Partial<Character>,
  index: number
): Character {
  return {
    id: generateCharacterId(index),
    name: aiChar.name ?? DEFAULT_CHARACTER_FIELDS.name,
    aliases: aiChar.aliases ?? [],
    description: aiChar.description ?? '',
    appearance: (aiChar.appearance ?? '') as Character['appearance'],
    personality: aiChar.personality ?? '',
    background: aiChar.background ?? '',
    role: aiChar.role ?? DEFAULT_CHARACTER_FIELDS.role,
    importance: aiChar.importance || DEFAULT_CHARACTER_FIELDS.importance,
    dialogues: [],
    relationships: [],
  };
}
