/**
 * 视频情感分析
 * @module core/services/video/video-analysis-emotions
 *
 * 提取自原 `VideoAnalysisService.analyzeEmotions`。
 * 行为字节级一致：每场景生成 6 种情感随机分 → 归一化 → 取主导。
 */

import { v4 as uuidv4 } from 'uuid';

import type { EmotionAnalysis, Scene, VideoInfo } from '@/shared/types';

import { EMOTION_LABELS } from './video-analysis-types';

/**
 * 情感数组归一化（与原 analyzeEmotions 内联 reduce + forEach 字节级一致）
 *
 * @param emotions 待归一化数组（每个元素会被原地修改 score）
 * @returns 归一化后的同一数组（便于链式调用）
 */
export function normalizeEmotionScores<T extends { score: number }>(emotions: T[]): T[] {
  const total = emotions.reduce((sum, e) => sum + e.score, 0);
  if (total > 0) {
    emotions.forEach((e) => (e.score = e.score / total));
  }
  return emotions;
}

/** 找出情感数组中 score 最高项（与原 reduce 实现字节级一致） */
export function findDominant<T extends { score: number }>(emotions: T[]): T {
  return emotions.reduce((max, e) => (e.score > max.score ? e : max), emotions[0]);
}

/**
 * 情感分析（模拟实现）
 *
 * @param videoInfo 视频元信息（保留以保持签名兼容）
 * @param scenes 已检测到的场景数组
 * @returns EmotionAnalysis 数组
 */
export function analyzeEmotions(
  _videoInfo: VideoInfo,
  scenes: Scene[]
): EmotionAnalysis[] {
  const analyses: EmotionAnalysis[] = [];

  for (const scene of scenes) {
    // 随机分配情感
    const emotions = EMOTION_LABELS.map((emotion) => ({
      id: uuidv4(),
      name: emotion,
      score: Math.random(),
    }));

    // 归一化 + 找主导
    normalizeEmotionScores(emotions);
    const dominant = findDominant(emotions);

    analyses.push({
      id: uuidv4(),
      sceneId: scene.id,
      timestamp: scene.startTime,
      emotions,
      dominant: dominant.name,
      intensity: dominant.score,
    });
  }

  return analyses;
}
