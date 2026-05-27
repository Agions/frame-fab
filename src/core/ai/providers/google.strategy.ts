/**
 * Google Gemini Provider Strategy
 */

import { BaseAIProviderStrategy } from './base';
import type { RequestConfig, AIResponse } from '@/core/services/ai.service.types';

export class GoogleStrategy extends BaseAIProviderStrategy {
  readonly name = 'google';

  async call(apiKey: string, config: RequestConfig): Promise<AIResponse> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: config.messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.max_tokens,
          },
        }),
      }
    );

    if (!response.ok) {
      throw this.handleError('Google', response.status);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      model: config.model,
    };
  }
}

export const googleStrategy = new GoogleStrategy();