# 分镜服务

`StoryboardService` 负责分镜的创建、编辑、生成和管理。

## 概述

分镜服务管理视频创作中的分镜帧，支持 AI 自动生成、手动编辑和批量操作。

## 使用示例

```typescript
import { storyboardService } from '@/core/services/storyboard.service';

// 获取当前项目的所有分镜
const frames = storyboardService.getAll();

// 创建新的分镜帧
const newFrame = storyboardService.create({
  title: '场景1',
  sceneDescription: '现代城市夜景，电影级灯光',
});

// AI 生成一组分镜
const generated = await storyboardService.generateStoryboard({
  script: '主角走进咖啡厅，点了一杯咖啡...',
  frameCount: 8,
  style: '电影风格',
});

// 保存到本地存储
storyboardService.save();
```

## 核心方法

| 方法 | 说明 |
|------|------|
| `getAll()` | 获取当前项目所有分镜帧 |
| `getById(id)` | 根据 ID 获取单个分镜帧 |
| `create(data)` | 创建新的分镜帧 |
| `update(id, data)` | 更新分镜帧 |
| `delete(id)` | 删除分镜帧 |
| `generateStoryboard(options)` | AI 生成一组分镜 |
| `save()` | 手动保存到 localStorage |
| `exportJSON()` | 导出为 JSON 格式 |
