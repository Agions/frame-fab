# 视频分析服务

AI 驱动的视频分析服务，提供场景检测、物体识别、情感分析和关键帧提取。

## 概述

`VideoAnalysisService` 对输入视频进行多维度智能分析，输出结构化的视频理解结果。

## 分析配置

```typescript
interface VideoAnalysisConfig {
  enableSceneDetection: boolean;    // 场景检测
  enableObjectDetection: boolean;   // 物体识别
  enableEmotionAnalysis: boolean;   // 情感分析
  enableContentSummary: boolean;   // 内容摘要
  enableKeyframeExtraction: boolean; // 关键帧提取
  sceneThreshold: number;          // 场景切换阈值（默认 0.3）
  maxKeyframes: number;             // 最大关键帧数（默认 10）
}

// 默认配置
const DEFAULT_ANALYSIS_CONFIG: VideoAnalysisConfig = {
  enableSceneDetection: true,
  enableObjectDetection: true,
  enableEmotionAnalysis: true,
  enableContentSummary: true,
  enableKeyframeExtraction: true,
  sceneThreshold: 0.3,
  maxKeyframes: 10,
};
```

## 场景类型

```typescript
const SCENE_TYPES = [
  'intro',      // 开场
  'dialogue',   // 对话
  'action',     // 动作
  'narration',  // 叙述
  'transition', // 转场
  'explanation', // 讲解
  'demo',       // 演示
  'conclusion', // 结尾
  'background', // 背景
  'highlight',  // 高光
] as const;
```

## 使用示例

```typescript
import { videoAnalysisService } from '@/core/services';

// 完整视频分析
const analysis = await videoAnalysisService.analyzeVideo(videoInfo, {
  enableSceneDetection: true,
  enableKeyframeExtraction: true,
  maxKeyframes: 20,
});

// 分析结果结构
// {
//   videoId: string;
//   duration: number;
//   scenes: Scene[];        // 检测到的场景
//   keyframes: Keyframe[];  // 关键帧
//   objects: ObjectDetection[]; // 物体检测
//   emotions: EmotionAnalysis[]; // 情感分析
//   summary: string;        // 内容摘要
//   tags: string[];         // 标签
//   sceneTypes: SceneType[]; // 场景类型
// }
```

## 方法

| 方法 | 说明 |
|------|------|
| `analyzeVideo(videoInfo, config?)` | 完整视频分析 |
| `extractKeyframes(videoUrl, count)` | 提取关键帧 |
| `detectSceneChanges(videoUrl, threshold?)` | 检测场景切换 |
| `summarizeContent(videoUrl)` | 内容摘要 |
| `cancel(videoId)` | 取消分析任务 |

## 取消分析

```typescript
// 启动分析
const analysisPromise = videoAnalysisService.analyzeVideo(videoInfo);

// 取消
videoAnalysisService.cancel(videoInfo.id);
```

## 下一步

- [TTS 服务](./tts-service.md) - 语音合成
- [视频合成](./video-compositor-service.md) - 视频合成
