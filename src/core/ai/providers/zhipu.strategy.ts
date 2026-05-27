/**
 * Zhipu GLM Provider Strategy
 */

import { BaseAIProviderStrategy } from './base';
import type { RequestConfig, AIResponse } from '@/core/services/ai.service.types';

export class ZhipuStrategy extends BaseAIProviderStrategy {
  readonly name = 'zhipu';

  async call(apiKey: string, config: RequestConfig): Promise<AIResponse> {
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