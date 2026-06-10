/**
 * 角色提取（纯函数）
 * @module core/services/video/scene-analyzer-character-extractor
 *
 * 提取自原 SceneAnalyzer.extractCharacters。
 * 行为字节级一致：AI prompt + JSON 解析 + 容错 + 字段归一。
 */

import { aiService } from '@/core/services/ai/text/ai.service';
import { type Character } from '@/shared/types';

import { buildCharacterExtractionPrompt } from './scene-analyzer-prompt-builder';
import { createCharacterFromAiResponse } from './scene-analyzer-types';

/**
 * 从小说内容中提取所有角色
 *
 * @param content 小说内容
 * @param provider AI provider（默认走 facade 持有）
 * @param model AI 模型（默认走 facade 持有）
 * @param ai AI 服务实例（默认走全局 aiService；测试可注入 mock）
 */
export async function extractCharacters(
  content: string,
  provider: string,
  model: string,
  ai: typeof aiService = aiService
): Promise<Character[]> {
  try {
    const response = await ai.generate(buildCharacterExtractionPrompt(content), {
      provider,
      model,
    });
    const characters = JSON.parse(response);
    return characters.map((char: Partial<Character>, index: number) =>
      createCharacterFromAiResponse(char, index)
    );
  } catch {
    // 提取失败，返回空列表
    return [];
  }
}
