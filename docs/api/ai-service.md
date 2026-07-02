---
title: AI 服务
description: 统一 AI 文本生成接口，支持 8+ 模型，含 ProviderRegistry 降级链、Fallback 策略、Token 计量
category: api
version: '>=3.0'
---

# AI 服务（aiService）

> 统一的 AI 文本生成入口。通过 `ProviderRegistry` 注册所有提供商，调用时**自动 Fallback**到可用 Provider。

---

## 导入

```typescript
import { aiService } from '@/core/services';
import type { GenerationOptions, GenerationResult } from '@/core/services';
```

---

## 核心方法

### generate()

通用文本生成。

```typescript
async generate(
  prompt: string,
  options?: GenerationOptions
): Promise<GenerationResult>
```

**参数（`GenerationOptions`）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `provider` | `AIProvider` | 否 | 指定 Provider；缺省走 Fallback 链 |
| `model` | `string` | 否 | 模型名（如 `glm-5`、`m2.5`） |
| `maxTokens` | `number` | 否 | 最大 token 数 |
| `temperature` | `number` | 否 | 随机性（0-2） |
| `systemPrompt` | `string` | 否 | 系统提示词 |
| `stopSequences` | `string[]` | 否 | 停止序列 |

**返回（`GenerationResult`）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `content` | `string` | 生成文本 |
| `usage` | `TokenUsage` | `{ prompt, completion, total }` |
| `provider` | `string` | 实际命中的 Provider（fallback 后） |
| `model` | `string` | 实际命中的模型 |
| `latencyMs` | `number` | 请求耗时 |
| `cached` | `boolean` | 是否命中缓存 |

**示例**

```typescript
const result = await aiService.generate('写一段戏剧性场景', {
  provider: 'zhipu',
  model: 'glm-5',
  maxTokens: 1000,
  temperature: 0.7,
});
console.log(result.content);
```

### analyze()

内容分析（专用 Prompt 模板）。

```typescript
async analyze(
  content: string,
  options?: AnalysisOptions
): Promise<AnalysisResult>
```

详见 [用户指南 - 导入与分析](../user-guide/import-analysis.md#四内容分析analysisstep)。

### chat()

多轮对话。

```typescript
async chat(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<ChatResult>
```

### streamGenerate()

流式生成（Server-Sent Events）。

```typescript
async *streamGenerate(
  prompt: string,
  options?: GenerationOptions
): AsyncGenerator<StreamChunk>
```

---

## ProviderRegistry & Fallback

`aiService` 内部使用 `ProviderRegistry` 管理所有 Provider，调用失败时**自动降级**：

```typescript
// 默认降级链（可在配置中调整）
const DEFAULT_TEXT_FALLBACK = [
  'zhipu',      // GLM-5  首选（国内、低价）
  'anthropic',  // Claude 3.5  高质量
  'minimax',    // M2.5    备选
  'moonshot',   // Kimi K2.5
  'doubao',     // Doubao 2.0
  'qwen',       // Qwen 2.5
  'ernie',      // ERNIE 4.0
];
```

```typescript
// 自定义降级链
aiService.setFallbackChain(['zhipu', 'anthropic', 'minimax']);

// 手动指定 Provider（跳过 fallback）
const result = await aiService.generate(prompt, {
  provider: 'anthropic',  // 失败不降级
  model: 'claude-3-5-sonnet',
});
```

---

## 支持的 Provider

| Provider | 模型 | 价格档 | 适用场景 |
|----------|------|--------|----------|
| 智谱 `zhipu` | GLM-5 | 💰 | 中文/剧本生成首选 |
| Anthropic `anthropic` | Claude 3.5 Sonnet | 💰💰 | 长文本/高质量 |
| MiniMax `minimax` | M2.5 | 💰 | 备选/特定任务 |
| 月之暗面 `moonshot` | Kimi K2.5 | 💰 | 长上下文 |
| 字节跳动 `doubao` | Doubao 2.0 | 💰 | 国内备选 |
| 阿里云 `qwen` | Qwen 2.5 | 💰 | 国内备选 |
| 百度 `ernie` | ERNIE 4.0 | 💰 | 国内备选 |
| OpenAI `openai` | GPT-4o | 💰💰💰 | 国际/英文 |

详见 [AI Providers](../developer-guide/ai-providers.md)。

---

## 成本与配额

```typescript
// 实时成本统计
const stats = aiService.getUsageStats();
console.log(`今日消耗: ¥${stats.todayCny}`);
console.log(`本月 Token: ${stats.monthTokens}`);
```

> 💰 完整配置与价格对比见 [配置 AI API Key](../getting-started/configuration.md)。

---

## 相关文档

- [API 概述](./overview.md)
- [Provider 适配层](../developer-guide/platform-layer.md)
- [AI Providers](../developer-guide/ai-providers.md)
- [架构设计](../developer-guide/architecture.md)
