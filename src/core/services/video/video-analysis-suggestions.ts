/**
 * 视频分析建议
 * @module core/services/video/video-analysis-suggestions
 *
 * 提取自原 `VideoAnalysisService.getSuggestions`。
 * 行为字节级一致：基于场景类型 / 主导情感 / 物体类别三个维度生成建议。
 */

import type { VideoAnalysis } from '@/shared/types';

/** 单条建议生成器签名 */
type SuggestionBuilder = (analysis: VideoAnalysis) => string | null;

/** 缺失 intro 场景时建议 */
const suggestIntro: SuggestionBuilder = (analysis) => {
  const sceneTypes = Object.keys(analysis.stats?.sceneTypes ?? {});
  if (!sceneTypes.includes('intro')) {
    return '建议添加开场场景来吸引观众';
  }
  return null;
};

/** 缺失 conclusion 场景时建议 */
const suggestConclusion: SuggestionBuilder = (analysis) => {
  const sceneTypes = Object.keys(analysis.stats?.sceneTypes ?? {});
  if (!sceneTypes.includes('conclusion')) {
    return '建议添加结尾总结来强化内容';
  }
  return null;
};

/** 主导情感集中 neutral 时建议 */
const suggestEmotionVariety: SuggestionBuilder = (analysis) => {
  const emotions = analysis.stats?.dominantEmotions ?? {};
  if (emotions['neutral'] > 0.7) {
    return '情感比较单一，可以增加情感变化';
  }
  return null;
};

/** 物体类别过少时建议 */
const suggestMoreVisualElements: SuggestionBuilder = (analysis) => {
  if (Object.keys(analysis.stats?.objectCategories ?? {}).length < 3) {
    return '画面元素较少，可以增加更多视觉元素';
  }
  return null;
};

/** 全部建议生成器（按顺序求值） */
const SUGGESTION_BUILDERS: SuggestionBuilder[] = [
  suggestIntro,
  suggestConclusion,
  suggestEmotionVariety,
  suggestMoreVisualElements,
];

/**
 * 基于视频分析结果生成改进建议
 *
 * 行为与原 `VideoAnalysisService.getSuggestions` 字节级一致。
 */
export function getSuggestions(analysis: VideoAnalysis): string[] {
  const suggestions: string[] = [];
  for (const builder of SUGGESTION_BUILDERS) {
    const suggestion = builder(analysis);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }
  return suggestions;
}
