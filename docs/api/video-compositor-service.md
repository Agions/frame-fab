# 视频合成服务

`VideoCompositorService` 负责视频合成、字幕添加、音频混音和视频导出。

## 概述

视频合成服务将分镜渲染结果、音频、字幕合成为最终视频输出，支持多种转场效果和导出格式。

## 导出格式

| 格式 | 说明 |
|------|------|
| MP4 (H.264) | 通用格式，兼容性最好 |
| WebM (VP9) | Web 友好，体积更小 |
| MOV | 保留质量，适合后期编辑 |

## 使用示例

```typescript
import { videoCompositorService } from '@/core/services/video-compositor.service';

// 合成视频
const result = await videoCompositorService.composeVideo({
  scenes: [
    { id: '1', mediaPath: '/path/to/scene1.mp4', startTime: 0, duration: 5 },
    { id: '2', mediaPath: '/path/to/scene2.mp4', startTime: 5, duration: 3 },
  ],
  subtitleTrack: {
    id: 'main',
    subtitles: [
      { startTime: 0, endTime: 3, text: '欢迎来到PlotCraft' },
    ],
  },
  backgroundMusic: {
    path: '/path/to/bgm.mp3',
    volume: 0.3,
    fadeIn: 1,
  },
  outputFormat: 'mp4',
  resolution: '1920x1080',
});

// 导出字幕
await videoCompositorService.exportSubtitle(result.subtitleTrack, 'srt');
```

## 核心方法

| 方法 | 说明 |
|------|------|
| `composeVideo(options)` | 合成完整视频 |
| `addSubtitles(scenes, track)` | 添加字幕轨道 |
| `mixAudio(scenes, audio)` | 混音背景音乐 |
| `exportSubtitle(track, format)` | 导出字幕（SRT/ASS/VTT） |
| `getSupportedFormats()` | 获取支持的导出格式 |
