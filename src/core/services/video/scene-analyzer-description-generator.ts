/**
 * 场景描述批量生成
 * @module core/services/video/scene-analyzer-description-generator
 *
 * 提取自原 SceneAnalyzer.generateSceneDescriptions。
 * 行为字节级一致：内嵌 processScene + concurrentLimit + 容错 fallback。
 */

import { aiService } from '@/core/services/ai/text/ai.service';
import { generateDefaultPrompt } from '@/core/services/ai/text/novel-helpers';
import { concurrentLimit } from '@/core/utils/concurrency';
import { logger } from '@/core/utils/logger';
import { type NovelScene, type SceneDescription } from '@/shared/types';

import { buildSceneDescriptionPrompt } from './scene-analyzer-prompt-builder';
import {
  DEFAULT_SCENE_NEGATIVE_PROMPT,
  SCENE_DESCRIPTION_FALLBACK_CONTENT_LIMIT,
  SCENE_DESCRIPTION_MAX_CONCURRENCY,
} from './scene-analyzer-types';

/**
 * 单场景描述生成
 *
 * 行为与原 generateSceneDescriptions 内联 processScene 字节级一致。
 */
async function processOneScene(
  scene: NovelScene,
  provider: string,
  model: string,
  ai: typeof aiService
): Promise<SceneDescription> {
  try {
    const response = await ai.generate(buildSceneDescriptionPrompt(scene), {
      provider,
      model,
    });
    const data = JSON.parse(response);
    return {
      sceneId: scene.id,
      description: data.description ?? '',
      visualElements: data.visualElements ?? [],
      mood: data.mood ?? '',
      colorPalette: data.colorPalette,
      lighting: data.lighting,
      cameraAngle: data.cameraAngle,
      imagePrompt: data.imagePrompt ?? generateDefaultPrompt(scene),
      negativePrompt: data.negativePrompt ?? DEFAULT_SCENE_NEGATIVE_PROMPT,
    };
  } catch {
    return {
      sceneId: scene.id,
      description: scene.content.slice(0, SCENE_DESCRIPTION_FALLBACK_CONTENT_LIMIT),
      visualElements: [],
      mood: '',
      imagePrompt: generateDefaultPrompt(scene),
      negativePrompt: DEFAULT_SCENE_NEGATIVE_PROMPT,
    };
  }
}

/**
 * 批量生成场景描述（并发控制 + 容错）
 *
 * 行为与原 `SceneAnalyzer.generateSceneDescriptions` 字节级一致。
 */
export async function generateSceneDescriptions(
  scenes: NovelScene[],
  provider: string,
  model: string,
  maxConcurrency: number = SCENE_DESCRIPTION_MAX_CONCURRENCY,
  ai: typeof aiService = aiService
): Promise<SceneDescription[]> {
  const processScene = (scene: NovelScene) => processOneScene(scene, provider, model, ai);
  const { results, errors } = await concurrentLimit(scenes, maxConcurrency, processScene);

  if (errors.length > 0) {
    logger.warn(`[SceneAnalyzer] ${errors.length} 个场景描述生成失败`);
  }

  return results;
}
