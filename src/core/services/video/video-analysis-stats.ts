/**
 * 视频分析统计信息
 * @module core/services/video/video-analysis-stats
 *
 * 提取自原 `VideoAnalysisService.calculateStats`。
 * 把"场景类型 / 物体类别 / 主导情感 / 平均时长"四个独立聚合拆为子函数。
 */

import type { VideoAnalysis } from '@/shared/types';

/** 通用 Record<string, number> 计数器（消除 3 处 `record[key] = (record[key] ?? 0) + 1` 重复） */
export function countBy<T>(items: T[], keyFn: (item: T) => string | undefined): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item) ?? 'unknown';
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

/** 统计场景类型（与原 calculateStats 内联一致：type 缺失时归 "unknown"） */
export function countSceneTypes(analysis: VideoAnalysis): Record<string, number> {
  return countBy(analysis.scenes, (s) => s.type);
}

/** 统计物体类别（与原 calculateStats 内联一致） */
export function countObjectCategories(analysis: VideoAnalysis): Record<string, number> {
  return countBy(analysis.objects, (o) => o.category);
}

/** 统计主导情感（与原 calculateStats 内联一致） */
export function countDominantEmotions(analysis: VideoAnalysis): Record<string, number> {
  return countBy(analysis.emotions, (e) => e.dominant);
}

/** 计算平均场景时长（与原 calculateStats 内联 reduce 一致） */
export function computeAvgSceneDuration(analysis: VideoAnalysis): number {
  const totalDuration = analysis.scenes.reduce(
    (sum, s) => sum + (s.endTime - s.startTime),
    0
  );
  return analysis.scenes.length > 0 ? totalDuration / analysis.scenes.length : 0;
}

/**
 * 计算视频分析的完整统计信息
 *
 * 行为与原 `VideoAnalysisService.calculateStats` 字节级一致。
 */
export function calculateStats(analysis: VideoAnalysis): VideoAnalysis['stats'] {
  return {
    sceneCount: analysis.scenes.length,
    objectCount: analysis.objects.length,
    avgSceneDuration: computeAvgSceneDuration(analysis),
    sceneTypes: countSceneTypes(analysis),
    objectCategories: countObjectCategories(analysis),
    dominantEmotions: countDominantEmotions(analysis),
  };
}
