/**
 * 视频物体检测
 * @module core/services/video/video-analysis-objects
 *
 * 提取自原 `VideoAnalysisService.detectObjects`。
 * 行为字节级一致：每场景随机 1-3 个物体，置信度 + bbox 全部随机生成。
 */

import { v4 as uuidv4 } from 'uuid';

import type { ObjectDetection, Scene, VideoInfo } from '@/shared/types';

import {
  COMMON_OBJECTS,
  OBJECT_CATEGORIES,
  generateObjectConfidence,
  generateRandomBbox,
} from './video-analysis-types';

/** 从数组中随机选一个元素 */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 每场景随机检测 1-3 个物体（与原 detectObjects 内联 objectCount 一致） */
function pickObjectCountForScene(): number {
  return Math.floor(Math.random() * 3) + 1;
}

/**
 * 物体检测（模拟实现）
 *
 * @param videoInfo 视频元信息（保留以保持签名兼容）
 * @param scenes 已检测到的场景数组
 * @returns ObjectDetection 数组
 */
export function detectObjects(
  _videoInfo: VideoInfo,
  scenes: Scene[]
): ObjectDetection[] {
  const detections: ObjectDetection[] = [];

  for (const scene of scenes) {
    const objectCount = pickObjectCountForScene();

    for (let i = 0; i < objectCount; i++) {
      const category = pickRandom(OBJECT_CATEGORIES);
      const label = pickRandom(COMMON_OBJECTS);

      detections.push({
        id: uuidv4(),
        sceneId: scene.id,
        category,
        label,
        confidence: generateObjectConfidence(),
        bbox: generateRandomBbox(),
        timestamp: scene.startTime,
      });
    }
  }

  return detections;
}
