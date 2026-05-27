/**
 * AI Provider 工厂
 * 根据配置创建合适的 Provider 实例
 */

import type { AIProvider, AIProviderConfig } from './ai-provider.interface';
import { OpenAICompatibleProvider } from './openai-compatible.provider';

export type ProviderType = 'openai' | 'openrouter' | 'azure' | 'claude' | 'gemini' | 'custom';

export interface ProviderFactoryConfig {
  type: ProviderType;
  config: AIProviderConfig;
}

export class ProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static create(config: ProviderFactoryConfig): AIProvider {
    const key = `${config.type}-${config.config.baseURL}`;
    
    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    let provider: AIProvider;

    switch (config.type) {
      case 'openai':
      case 'openrouter':
      case 'azure':
      case 'custom':
        provider = new OpenAICompatibleProvider(config.config);
        break;
      // 后续可扩展 Claude/Gemini 等专用 Provider
      default:
        provider = new OpenAICompatibleProvider(config.config);
    }

    this.providers.set(key, provider);
    return provider;
  }

  static clearCache(): void {
    this.providers.clear();
  }
}

export { OpenAICompatibleProvider } from './openai-compatible.provider';
export type { AIProvider, AIProviderConfig, ChatMessage } from './ai-provider.interface';
