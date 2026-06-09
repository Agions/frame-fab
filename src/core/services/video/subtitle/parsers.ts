/**
 * 字幕文件解析
 *
 * 把 SRT/VTT 文本解析成 SubtitleTrack。
 * 解析失败/格式异常时静默跳过，与原行为一致。
 */

import { v4 as uuidv4 } from 'uuid';

import { parseSRTTime, parseVTTTime } from './time-parser';
import type { SubtitleItem, SubtitleTrack } from './types';
import { DEFAULT_SUBTITLE_STYLE } from './types';

/**
 * 解析 SRT 文本。
 */
export function parseSRT(content: string): SubtitleTrack {
  const items: SubtitleItem[] = [];
  const blocks = content.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) {
      continue;
    }

    const index = parseInt(lines[0], 10);
    const timeMatch = lines[1].match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );

    if (!timeMatch) {
      continue;
    }

    items.push({
      id: uuidv4(),
      index,
      startTime: parseSRTTime(timeMatch[1]),
      endTime: parseSRTTime(timeMatch[2]),
      text: lines.slice(2).join('\n'),
    });
  }

  return {
    id: uuidv4(),
    name: '导入的字幕',
    language: 'zh-CN',
    items,
    style: DEFAULT_SUBTITLE_STYLE,
    format: 'srt',
  };
}

/**
 * 解析 WebVTT 文本。
 */
export function parseVTT(content: string): SubtitleTrack {
  const items: SubtitleItem[] = [];
  const lines = content.split('\n');
  let index = 0;
  let currentItem: Partial<SubtitleItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes('-->')) {
      const timeMatch = line.match(
        /(\d{2}:\d{2}:\d{2}[,.]\d{3}|\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3}|\d{2}:\d{2}[,.]\d{3})/
      );

      if (timeMatch) {
        currentItem = {
          id: uuidv4(),
          index: ++index,
          startTime: parseVTTTime(timeMatch[1]),
          endTime: parseVTTTime(timeMatch[2]),
          text: '',
        };
      }
    } else if (currentItem && line) {
      currentItem.text = currentItem.text ? `${currentItem.text}\n${line}` : line;

      // 下一行若是空行/时间戳 → 当前字幕结束
      if (i + 1 >= lines.length || !lines[i + 1].trim() || lines[i + 1].includes('-->')) {
        if (currentItem.text) {
          items.push(currentItem as SubtitleItem);
        }
        currentItem = null;
      }
    }
  }

  return {
    id: uuidv4(),
    name: '导入的字幕',
    language: 'zh-CN',
    items,
    style: DEFAULT_SUBTITLE_STYLE,
    format: 'vtt',
  };
}

/**
 * 自动识别格式并解析。
 * 优先按扩展名判断，再按内容（WEBVTT header）。
 */
export function importSubtitles(content: string, filename?: string): SubtitleTrack {
  const ext = filename?.split('.').pop()?.toLowerCase();

  if (ext === 'vtt' || content.startsWith('WEBVTT')) {
    return parseVTT(content);
  }

  return parseSRT(content);
}
