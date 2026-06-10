---
title: 流水线
description: 10 步 Pipeline 引擎 API：import → analysis → script → character → scene → storyboard → render → video-edit → audio → subtitle → export，含 Checkpoint / Quality Gate / Self-Review Loop
category: api
version: '>=3.0'
---

# 流水线（pipelineService）

> 端到端 AI 漫剧生成编排引擎。**10 步流水线** + **断点续传** + **质量门禁** + **自审循环**。

## 导入

```typescript
import { pipelineService } from '@/core/services';
import type { PipelineOptions, PipelineResult, PipelineProgress } from '@/core/services';
```

## 核心方法

### run()

```typescript
async run(options: PipelineOptions): Promise<PipelineResult>
```

**参数（`PipelineOptions`）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | `string` | ✅ | 输入文本（小说/剧本） |
| `inputType` | `'novel' \| 'script' \| 'raw'` | 否 | 输入类型（自动推断） |
| `steps` | `PipelineStepType[]` | 否 | 指定执行的步骤子集 |
| `quality` | `'fast' \| 'balanced' \| 'high'` | 否 | 质量预设（默认 `balanced`） |
| `resolution` | `'720p' \| '1080p' \| '4k'` | 否 | 输出分辨率 |
| `aspectRatio` | `'16:9' \| '9:16' \| '1:1'` | 否 | 宽高比 |
| `mode` | `'manual' \| 'autonomous'` | 否 | 模式（默认 `autonomous`） |
| `checkpoint` | `boolean` | 否 | 启用断点续传（默认 true） |
| `onProgress` | `(p: PipelineProgress) => void` | 否 | 进度回调 |

**返回（`PipelineResult`）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `projectId` | `string` | 项目 ID |
| `status` | `'completed' \| 'failed' \| 'partial'` | 最终状态 |
| `outputUrl` | `string` | 成片 URL |
| `duration` | `number` | 视频时长（秒） |
| `cost` | `CostBreakdown` | 成本明细 |
| `steps` | `StepResult[]` | 各步详细结果 |

**示例**

```typescript
const result = await pipelineService.run({
  input: novelText,
  mode: 'autonomous',
  quality: 'high',
  resolution: '1080p',
  aspectRatio: '16:9',
  onProgress: (p) => {
    console.log(`${p.stage}: ${p.overallProgress}%`);
  },
});
console.log(`项目 ID: ${result.projectId}`);
console.log(`成片: ${result.outputUrl}`);
```

### 11 个流水线步骤

| # | 步骤 | 类型 | 自主模式 | 说明 |
|---|------|------|---------|------|
| 1 | `import` | IO | Auto | 解析原材料，切分章节 |
| 2 | `analysis` | AI | Auto | 分析故事结构、人物、场景 |
| 3 | `script` | AI | Auto | 生成结构化视频剧本 |
| 4 | `character` | AI | Auto | 创建角色设定卡 |
| 5 | `scene` | AI | Auto | 场景规划 |
| 6 | `storyboard` | AI+Image | Auto | 分镜脚本 + 参考图 |
| 7 | `render` | Image/Video | Auto | 批量渲染关键帧 |
| 8 | `video-edit` | Video | Auto | 视频剪辑 + 转场 |
| 9 | `audio` | TTS | Auto | 配音 + 音效 + 唇形同步 |
| 10 | `subtitle` | Subtitle | Auto | 字幕生成与嵌入 |
| 11 | `export` | Video | Auto | 最终合成输出 |

**只跑部分步骤**：

```typescript
await pipelineService.run({
  input: novelText,
  steps: ['import', 'analysis', 'script'],  // 只生成剧本
});
```

### onProgress() 进度订阅

```typescript
const unsubscribe = pipelineService.onProgress((progress: PipelineProgress) => {
  // progress.stage:        当前阶段
  // progress.overallProgress: 0-100
  // progress.currentStep:  当前步骤
  // progress.estimatedTimeRemainingMs
});
```

### 断点续传（Checkpoint）

`pipelineService` 默认**每 30 秒**自动保存 Checkpoint 到 localStorage：

```typescript
// 列出所有可恢复项目
const resumable = await pipelineService.listCheckpoints();
// [{ projectId, lastStage, savedAt, progress }]

// 恢复项目
const result = await pipelineService.resume('proj_abc123');
```

### 质量门禁（Quality Gate）

每步输出后自动评分，**不通过则触发 Self-Review Loop**：

```python
quality_gate_check(step_output):
    consistency = check_character_consistency(...)
    quality = assess_visual_quality(...)
    alignment = verify_script_alignment(...)
    
    if all(scores >= thresholds):
        return "PASS"
    else:
        return "RETRY"  # 触发自审循环
```

### Self-Review Loop

审核失败时**自动优化 Prompt 并重试**，最多 3 轮：

```
Step N 输出 → QualityGate 判定
                       │
                ┌──────┴──────┐
                │             │
              PASS          FAIL
                │             │
                ▼      优化 Prompt
            下一 步     重做 Step N（最多 3 次）
```

## 性能

| 指标 | fast | balanced | high |
|------|------|----------|------|
| 短篇小说 (1-3 万字) | ~15min | ~25min | ~45min |
| 中篇小说 (5-10 万字) | ~30min | ~60min | ~2h |
| 长篇小说 (10 万字+) | ~1h | ~2h | ~4h+ |

## 相关文档

- [API 概述](./overview.md)
- [架构设计](../developer-guide/architecture.md)
- [快速开始](../getting-started/quick-start.md)
