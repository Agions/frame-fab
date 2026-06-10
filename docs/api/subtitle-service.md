---
title: 字幕服务
description: 字幕生成与多格式导出，支持 SRT / WebVTT / ASS，含样式配置、时间轴对齐、AI 智能断句
category: api
version: '>=3.0'
---

# 字幕服务（subtitleService）

> 从脚本/TTS 音频生成字幕，并支持 SRT / WebVTT / ASS 三种格式导出。

## 导入

```typescript
import { subtitleService } from '@/core/services';
import type {
  Subtitle,
  SubtitleStyle,
  SubtitleExportOptions,
} from '@/core/services';
```

## 数据结构

### Subtitle

```typescript
interface Subtitle {
  id: string;          // 字幕 ID
  index: number;       // 序号
  startTime: number;   // 开始时间（秒）
  endTime: number;     // 结束时间（秒）
  text: string;        // 文本
  speaker?: string;    // 说话人（角色名）
  style?: string;      // 样式引用 ID
}
```

### SubtitleStyle

```typescript
interface SubtitleStyle {
  fontFamily: string;   // 字体
  fontSize: number;     // 字号（像素）
  color: string;        // 文字颜色（#RRGGBB）
  background: string;   // 背景色（含 alpha，如 #00000080）
  bold: boolean;
  italic: boolean;
  outline: number;      // 描边宽度
  outlineColor: string;
  position: 'top' | 'middle' | 'bottom';
  alignment: 'left' | 'center' | 'right';
}
```

## 核心方法

### generateSubtitles()

从脚本生成字幕（**AI 智能断句 + 时间轴对齐**）。

```typescript
async generateSubtitles(
  script: ScriptScene[],
  options?: GenerateSubtitleOptions
): Promise<Subtitle[]>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `script` | `ScriptScene[]` | 脚本场景数组 |
| `options.audioPath` | `string` | 音频路径（用于精确对齐时间轴） |
| `options.maxCharsPerLine` | `number` | 每行最大字符数（默认 20） |
| `options.maxDuration` | `number` | 单条字幕最大时长（秒，默认 5） |

```typescript
const subtitles = await subtitleService.generateSubtitles(scenes, {
  audioPath: 'audio/scene_001.mp3',
  maxCharsPerLine: 18,
});
```

### exportSRT()

```typescript
async exportSRT(
  subtitles: Subtitle[],
  outputPath: string
): Promise<void>
```

输出标准 SRT：

```srt
1
00:00:00,000 --> 00:00:03,500
李明："这件事必须今天解决。"

2
00:00:03,500 --> 00:00:06,000
王芳："我明白，但我需要更多时间。"
```

### exportVTT()

```typescript
async exportVTT(
  subtitles: Subtitle[],
  outputPath: string,
  options?: VTTOptions
): Promise<void>
```

输出 WebVTT（HTML5 video 兼容），支持 cue settings。

### exportASS()

```typescript
async exportASS(
  subtitles: Subtitle[],
  outputPath: string,
  style: SubtitleStyle
): Promise<void>
```

输出 ASS（高级字幕）——支持字体、动画、特效。

### importSubtitles()

```typescript
async importSubtitles(filePath: string): Promise<Subtitle[]>
```

支持导入 SRT / VTT / ASS。

### mergeSubtitles()

合并字幕与时间轴（用户手动调整后写回）。

```typescript
mergeSubtitles(
  subtitles: Subtitle[],
  timings: Array<{ id: string; startTime: number; endTime: number }>
): Subtitle[]
```

## 与视频合成集成

`subtitleService` 与 `videoCompositorService` 无缝集成：

```typescript
// 一条龙：TTS → 字幕 → 视频嵌入
const tts = await ttsService.synthesize({ text, voice });
const subs = await subtitleService.generateSubtitles(scenes, {
  audioPath: tts.audioUrl,
});
const result = await videoCompositorService.compose({
  videoUrl,
  audioUrl: tts.audioUrl,
  subtitles: subs,
  outputPath: 'output.mp4',
});
```

## 相关文档

- [API 概述](./overview.md)
- [TTS 服务](./tts-service.md)
- [用户指南 - 渲染导出](../user-guide/rendering-export.md)
