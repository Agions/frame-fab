# 脚本生成

从已分析内容生成 AI 驱动的脚本。

## 概述

导入小说或脚本后，PanelFlow 可以生成针对视觉叙事优化的结构化视频脚本。

## 脚本格式

生成的脚本遵循以下结构：

```typescript
interface Script {
  id: string;
  title: string;
  content: string;           // 完整脚本文本
  segments: ScriptSegment[]; // 结构化片段
  metadata: {
    estimatedDuration: number;  // 秒数
    sceneCount: number;
    dialogueRatio: number;       // 0-1
  };
}

interface ScriptSegment {
  id: string;
  type: 'narration' | 'dialogue' | 'action';
  startTime: number;       // 开始时间（秒）
  endTime: number;         // 结束时间（秒）
  content: string;
  character?: string;       // 对话用
  emotion?: string;         // 对话用
}
```

## 生成选项

### 风格预设

| 风格 | 描述 | 适用于 |
|-------|-------------|----------|
| `dramatic` | 强调情感节点 | 电影、短片 |
| `comedic` | 注重时机 | 喜剧、小品 |
| `documentary` | 纪实、信息丰富 | 教育内容 |
| `commercial` | 简洁、有说服力 | 广告、宣传 |
| `custom` | 用户自定义 | 特殊需求 |

### 参数

```typescript
interface ScriptGenerationOptions {
  style?: 'dramatic' | 'comedic' | 'documentary' | 'commercial' | 'custom';
  tone?: string;                    // 例如："严肃"、"轻松"
  length?: 'short' | 'medium' | 'long';  // 目标时长
  dialogueRatio?: number;          // 0-1，默认 0.6
  includeStageDirections?: boolean; // 默认 true
}
```

## 使用脚本编辑器

1. **查看脚本**：点击任意片段进行预览
2. **编辑内容**：双击编辑文本
3. **调整时间**：拖动片段边缘调整时长
4. **重新排序**：拖动片段重新排序
5. **添加片段**：点击 "+" 添加新片段

## API 使用

```typescript
import { aiService } from '@/core/services';

// 从章节生成脚本
const script = await aiService.generate(
  `根据此内容生成一个戏剧性视频脚本：
   ${JSON.stringify(chapters)}
   
   格式：JSON，包含 type、content、startTime、endTime、character、emotion 的片段`,
  {
    provider: 'alibaba',
    model: 'qwen-3.5',
  }
);
```

## 最佳实践

1. **审查对话**：AI 生成的对话应审核其真实性
2. **检查时间**：确保片段符合目标视频长度
3. **平衡旁白/对话**：目标为 60% 对话，40% 旁白
4. **添加舞台指导**：为清晰起见，包含摄像机/屏幕方向

## 下一步

脚本生成后：
- [故事板设计](storyboard-design.md) - 将脚本转换为故事板
- [工作流概览](workflow-overview.md) - 返回工作流
