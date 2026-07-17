/**
 * AI Provider Registry Facade
 * ===========================
 * 服务层门面：将 AI Provider 注册表与 AI 文本服务重新导出到
 * `src/services/ai/` 命名空间。
 *
 * 包含：
 *   - providerRegistry 单例：统一管理 AI Provider Strategy
 *     （OpenAI、Anthropic、Google、Baidu、Alibaba、Zhipu、Mock）。
 *   - aiService 单例（AIService）：AI 文本/脚本/小说分析服务门面。
 *
 * 本文件仅做 re-export，不含任何业务逻辑。旧路径
 * `@/core/ai/providers` 与 `@/core/services/ai/text/ai-service` 仍可有效
 * 导入 —— 本 facade 是为未来渐进式迁移建立的 `services/` 层入口。
 *
 * @example
 * ```ts
 * // 新代码（推荐，面向 services/ 层）
 * import {
 *   providerRegistry,
 *   openAIStrategy,
 *   mockStrategy,
 *   aiService,
 *   type AIProviderStrategy,
 *   type ChatMessage,
 * } from '@/services/ai/AIProviderRegistry';
 *
 * // 旧代码（仍然有效）
 * import { providerRegistry } from '@/core/ai/providers/provider-registry';
 * import { aiService } from '@/core/services/ai/text/ai-service';
 * ```
 */

// ─────────── AI Provider 注册表（单例） ───────────

export { providerRegistry } from '@/core/ai/providers/provider-registry';

export { providerRegistry as default } from '@/core/ai/providers/provider-registry';

// ─────────── AI Provider Strategy（具名策略） ───────────
// 各策略的 detailed export 由 providers barrel index.ts 聚合。

export {
  openAIStrategy,
  anthropicStrategy,
  googleStrategy,
  baiduStrategy,
  alibabaStrategy,
  zhipuStrategy,
  mockStrategy,
} from '@/core/ai/providers/index';

// Provider Strategy 接口 & 消息类型
export type { AIProviderStrategy, ChatMessage } from '@/core/ai/providers/index';

// ─────────── AI 文本服务 ───────────

export { aiService } from '@/core/services/ai/text/ai-service';

// AI 请求/响应类型
export type { AIResponse, AIRequestConfig } from '@/core/services/ai/text/ai-service';
