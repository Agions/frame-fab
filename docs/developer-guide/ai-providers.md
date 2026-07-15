# AI Provider 编排

> 7 Provider + 智能 Fallback Chain

## Provider 列表

| Provider  | 名称        | OpenAI 兼容 | 默认模型        |
| --------- | ----------- | ----------- | --------------- |
| OpenAI    | `openai`    | ✅          | gpt-4           |
| Anthropic | `anthropic` | ❌          | claude-4-sonnet |
| Google    | `google`    | ❌          | gemini-2.5      |
| 智谱      | `zhipu`     | ✅          | glm-5           |
| 阿里      | `alibaba`   | ✅          | qwen-max        |
| 百度      | `baidu`     | ❌          | ernie-4.0       |
| Mock      | `mock`      | —           | (模拟)          |

## 策略模式

```typescript
// base.ts
export abstract class BaseAIProviderStrategy {
  abstract readonly name: string;
  abstract call(apiKey: string, config: AIRequestConfig): Promise<AIResponse>();
}

// openai-compatible.strategy.ts
export abstract class OpenAICompatibleStrategy extends BaseAIProviderStrategy {
  protected abstract readonly apiConfig: OpenAICompatibleConfig;
  // OpenAI/Alibaba/Zhipu 共享实现
}

// 具策略
export class OpenAIStrategy extends OpenAICompatibleStrategy { ... }
export class AnthropicStrategy extends BaseAIProviderStrategy { ... }
```

## Fallback Chain

```typescript
// 主 Provider 失败 → 自动切换下一个
const dispatcher = new AICallDispatcher(providerRegistry);

// 调用示例
const result = await dispatcher.dispatchAIRequest({
  provider: 'openai',
  model: 'gpt-4',
  messages: [...],
  // Fallback Chain 在 openai 失败时自动尝试 → anthropic → zhipu → mock
});
```

## 新增 Provider

```typescript
// 1. 创建策略文件
export class NewProviderStrategy extends OpenAICompatibleStrategy {
  readonly name = 'new-provider';
  protected readonly apiConfig = {
    name: 'NewProvider',
    endpoint: 'https://api.example.com/v1/chat/completions',
    providerLabel: 'NewProvider',
  };
}

// 2. 注册到 Registry
providerRegistry.register(new NewProviderStrategy());
```

[下一步：API 参考 →](/api/)
