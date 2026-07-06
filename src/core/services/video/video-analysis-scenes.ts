/**
 * 视频场景检测
 * @module core/services/video/video-analysis-scenes
 *
 * 提取自原 `VideoAnalysisService.detectScenes` + 私有 `getSceneDescription`。
 * 行为字节级一致：固定 30s 平均时长等分，随机分前 5 种场景类型。
 */

import { v4 as uuidv4 } from 'uuid';

import type { VideoScene, VideoInfo } from '@/shared/types';

import {
  SCENE_AVG_DURATION_SECONDS,
  SCENE_DESCRIPTIONS,
  SCENE_TYPES,
  UNKNOWN_SCENE_DESCRIPTION,
  generateSceneConfidence,
  pickSceneTypeByIndex,
  type SceneType,
} from './video-analysis-types';

/** 取场景类型描述（与原 getSceneDescription 字节级一致） */
export function getSceneDescription(type: SceneType): string {
  return SCENE_DESCRIPTIONS[type] ?? UNKNOWN_SCENE_DESCRIPTION;
}

/**
 * 场景检测（模拟实现）
 *
 * @param videoInfo 视频元信息
 * @param _threshold 场景切换阈值（原参数保留以保持签名，但实际未使用）
 * @returns VideoScene 数组
 */
export function detectScenes(videoInfo: VideoInfo, _threshold: number = 0.3): VideoScene[] {
  const scenes: VideoScene[] = [];
  const duration = videoInfo.duration;
  const avgSceneDuration = SCENE_AVG_DURATION_SECONDS;
  const sceneCount = Math.max(1, Math.floor(duration! / avgSceneDuration));

  const sceneTypeSamples: readonly SceneType[] = SCENE_TYPES.slice(0, 5);

  for (let i = 0; i < sceneCount; i++) {
    const startTime = Math.round(i * avgSceneDuration);
    const endTime = Math.min(Math.round((i + 1) * avgSceneDuration), duration!);
    const sceneType = pickSceneTypeByIndex(i, sceneTypeSamples);

    scenes.push({
      id: uuidv4(),
      startTime,
      endTime,
      thumbnail: '',
      description: getSceneDescription(sceneType),
      tags: [sceneType, `场景${i + 1}`],
      type: sceneType,
      confidence: generateSceneConfidence(),
    });
  }

  return scenes;
}
