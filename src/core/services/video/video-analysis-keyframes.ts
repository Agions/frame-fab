/**
 * 视频关键帧提取
 * @module core/services/video/video-analysis-keyframes
 *
 * 提取自原 `VideoAnalysisService.extractKeyframes`。
 * 行为字节级一致：按 `duration / (count + 1)` 间隔均匀采样。
 */

import { v4 as uuidv4 } from 'uuid';

import { formatTime } from '@/shared/utils';
import type { Keyframe, VideoInfo } from '@/shared/types';

/** 关键帧描述模板前缀（与原 "第 ${i} 个关键帧于 ${formatTime(timestamp)}" 一致） */
export function buildKeyframeDescription(index: number, timestamp: number): string {
  return `第 ${index} 个关键帧于 ${formatTime(timestamp)}`;
}

/**
 * 均匀提取 count 个关键帧
 *
 * @param videoInfo 视频元信息
 * @param count 期望关键帧数（默认 10）
 * @returns Keyframe 数组，thumbnail 留空由前端 Canvas 生成
 */
export function extractKeyframes(videoInfo: VideoInfo, count: number = 10): Keyframe[] {
  const keyframes: Keyframe[] = [];
  const duration = videoInfo.duration!;
  const interval = duration / (count + 1);

  for (let i = 1; i <= count; i++) {
    const timestamp = Math.round(interval * i);
    keyframes.push({
      id: uuidv4(),
      timestamp,
      thumbnail: '', // 缩略图由前端使用 Canvas 生成
      description: buildKeyframeDescription(i, timestamp),
    });
  }

  return keyframes;
}
