/**
 * OpenAI Provider Strategy
 */

import type { AIRequestConfig, AIResponse } from '@/core/services/ai/text/ai.service.types';

import { BaseAIProviderStrategy } from './base';

export class OpenAIStrategy extends BaseAIProviderStrategy {
  readonly name = 'openai';

  supportsStreaming = true;

  async call(apiKey: string, config: AIRequestConfig): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw this.handleError('OpenAI', response.status);
    }

    const data = await response.json();
    return this.parseOpenAIResponse(data);
  }

  async *stream(apiKey: string, config: AIRequestConfig): AsyncGenerator<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...config, stream: true }),
    });

    if (!response.ok) {
      throw this.handleError('OpenAI', response.status);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) yield content;
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const openAIStrategy = new OpenAIStrategy();
