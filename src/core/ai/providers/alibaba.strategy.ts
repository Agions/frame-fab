/**
 * Alibaba (Tongyi Qianwen) Provider Strategy
 */

import { BaseAIProviderStrategy } from './base';
import type { RequestConfig, AIResponse } from '@/core/services/ai/text/ai.service.types';

export class AlibabaStrategy extends BaseAIProviderStrategy {
  readonly name = 'alibaba';

  async call(apiKey: string, config: RequestConfig): Promise<AIResponse> {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw this.handleError('阿里云', response.status);
    }

    const data = await response.json();
    return this.parseOpenAIResponse(data);
  }
}

export const alibabaStrategy = new AlibabaStrategy();