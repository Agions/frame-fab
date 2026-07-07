/**
 * Zhipu GLM Provider Strategy
 */

import type { AIRequestConfig, AIResponse } from '@/core/services/ai/text/ai.service.types';

import { BaseAIProviderStrategy } from './base';

export class ZhipuStrategy extends BaseAIProviderStrategy {
  readonly name = 'zhipu';

  async call(apiKey: string, config: AIRequestConfig): Promise<AIResponse> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw this.handleError('智谱', response.status);
    }

    const data = await response.json();
    return this.parseOpenAIResponse(data);
  }
}

export const zhipuStrategy = new ZhipuStrategy();
