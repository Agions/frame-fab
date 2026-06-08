/**
 * AI Core Module
 * 统一的 AI 接口层
 */

// Providers
export * from './providers';

/**
 * 使用示例：
 *
 * import { ProviderFactory, buildStoryboardPrompt, parseStoryboardResponse } from '@/core/ai';
 * 
 * // 创建 Provider
 * const provider = ProviderFactory.create({
 *   type: 'openrouter',
 *   config: {
 *     baseURL: 'https://openrouter.ai/api/v1',
 *     apiKey: 'your-api-key',
 *   },
 * });
 * 
 * // 构建 Prompt
 * const messages = buildStoryboardPrompt({
 *   script: '故事内容...',
 *   numPanels: 8,
 *   style: 'manga',
 * });
 * 
 * // 调用
 * const response = await provider.chat({ model: 'anthropic/claude-3', messages });
 * const result = parseStoryboardResponse(response.choices[0].message.content);
 */
