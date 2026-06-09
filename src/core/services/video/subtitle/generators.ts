/**
 * 字幕生成器
 *
 * 从脚本分段或时间帧数组生成 SubtitleTrack。
 * 不依赖任何 IO，纯函数 + uuid 生成。
 */

import { v4 as uuidv4 } from 'uuid';

import { processSubtitleText } from './text-processor';
import type {
  ScriptSegmentInput,
  SubtitleItem,
  SubtitleStyle,
  SubtitleTimeframe,
  SubtitleTrack,
} from './types';
import { DEFAULT_SUBTITLE_STYLE } from './types';

/**
 * 从脚本分段生成字幕轨道。
 */
export function generateFromScript(
  segments: ScriptSegmentInput[],
  style: Partial<SubtitleStyle> = {}
): SubtitleTrack {
  const items: SubtitleItem[] = segments.map((segment, index) => ({
    id: segment.id || uuidv4(),
    index: index + 1,
    startTime: segment.startTime,
    endTime: segment.endTime,
    text: processSubtitleText(segment.content),
  }));

  return {
    id: uuidv4(),
    name: '字幕轨道',
    language: 'zh-CN',
    items,
    style: { ...DEFAULT_SUBTITLE_STYLE, ...style },
    format: 'srt',
  };
}

/**
 * 从文本 + 时间帧数组生成字幕轨道。
 * 为保持 API 兼容，第一个参数 `text` 实际未使用（旧实现同样忽略）。
 */
export function generateFromText(
  _text: string,
  timeframes: SubtitleTimeframe[],
  style: Partial<SubtitleStyle> = {}
): SubtitleTrack {
  const items: SubtitleItem[] = timeframes.map((frame, index) => ({
    id: uuidv4(),
    index: index + 1,
    startTime: frame.start,
    endTime: frame.end,
    text: processSubtitleText(frame.text),
  }));

  return {
    id: uuidv4(),
    name: '字幕轨道',
    language: 'zh-CN',
    items,
    style: { ...DEFAULT_SUBTITLE_STYLE, ...style },
    format: 'srt',
  };
}

/**
 * 调整字幕时间（偏移 + 缩放），起点不会出现负数。
 */
export function adjustTiming(
  track: SubtitleTrack,
  offset: number,
  scale: number = 1
): SubtitleTrack {
  return {
    ...track,
    id: uuidv4(),
    items: track.items.map((item) => ({
      ...item,
      id: uuidv4(),
      startTime: Math.max(0, item.startTime * scale + offset),
      endTime: Math.max(0, item.endTime * scale + offset),
    })),
  };
}

/**
 * 合并多条字幕轨道，按时间顺序重排 index。
 */
export function mergeTracks(tracks: SubtitleTrack[]): SubtitleTrack {
  const mergedItems: SubtitleItem[] = [];
  let globalIndex = 1;

  for (const track of tracks) {
    for (const item of track.items) {
      mergedItems.push({
        ...item,
        id: uuidv4(),
        index: globalIndex++,
      });
    }
  }

  return {
    id: uuidv4(),
    name: '合并字幕',
    language: 'zh-CN',
    items: mergedItems,
    style: DEFAULT_SUBTITLE_STYLE,
    format: 'srt',
  };
}
