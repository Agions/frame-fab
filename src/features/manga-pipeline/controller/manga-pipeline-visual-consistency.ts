/**
 * 视觉一致性评估模块
 * ==================
 * 对关键帧视频片段进行角色视觉一致性评估。
 *
 * - 提取所有场景的首帧 URL
 * - 与 characterConstraints 提供的三视图参考进行对比
 * - 返回 overallScore (0-100)
 */
import { visualConsistencyScorer } from '@/core/services/video/visual-consistency-scorer.service';
import { logger } from '@/core/utils/logger';

import type { StoryboardGenerationResult } from '../steps/step2-storyboard/StoryboardPipeline';
import type { KeyframePipelineResult } from '../steps/step5-keyframe/pipeline-controller';

import { mapCharacterConstraintsToReferences } from './manga-pipeline-character-mapper';

/**
 * 评估关键帧的角色视觉一致性。
 *
 * @returns scorer 的完整结果 (含 overallScore) 或 null (无关键帧时)
 */
export async function evaluateKeyframeVisualConsistency(
  keyframeResult: KeyframePipelineResult,
  characterConstraints: StoryboardGenerationResult['characterConstraints'] | undefined
): Promise<Awaited<ReturnType<typeof visualConsistencyScorer.evaluate>> | null> {
  try {
    const scenes = keyframeResult.keyframeScenes;
    if (!scenes || scenes.length === 0) return null;

    const frameUrls = scenes
      .map((s) => s.keyframes[0]?.startFrame?.imageUrl)
      .filter((url): url is string => !!url);

    if (frameUrls.length === 0) {
      logger.info('[MangaPipeline] 无关键帧图像可用于视觉一致性评估');
      return null;
    }

    return await visualConsistencyScorer.evaluate({
      frameUrls,
      characterReferences: mapCharacterConstraintsToReferences(characterConstraints),
    });
  } catch (err) {
    logger.warn(`[MangaPipeline] 视觉一致性评估失败: ${err}`);
    return null;
  }
}
