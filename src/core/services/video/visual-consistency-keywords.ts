/**
 * 视觉关键词提取与密度计算
 * @module core/services/video/visual-consistency-keywords
 *
 * 提取自原 VisualConsistencyScorer.extractVisualKeywords + evaluateByPromptMatch
 * 内的 keywordDensity 公式。
 */

import { HEURISTIC_PROMPT_CHUNK_SIZE } from './visual-consistency-types';

/** 视觉特征词正则（与原 extractVisualKeywords 5 个 visualPatterns 字节级一致） */
const VISUAL_PATTERNS: RegExp[] = [
  // 发型发色
  /(\w+[\s-]?(?:hair|发型|发色|发长))/gi,
  // 眼睛颜色
  /(\w+[\s-]?(?:eyes?|眼色|瞳孔))/gi,
  // 服装
  /(\w+[\s-]?(?:outfit|clothing|dress|衣服|服装|制服))/gi,
  // 颜色描述
  /\b(red|blue|green|blonde|brown|black|white|pink|金色|蓝色|黑色|白色|粉色|红色|银发|黑发|白发)\b/gi,
  // 风格标签
  /\b(anime|manga|comic|realistic|cartoon|3d|2d)\b/gi,
];

/**
 * 从角色描述中提取视觉关键词
 *
 * 行为与原 `extractVisualKeywords` 字节级一致：5 个正则匹配 + 去重。
 */
export function extractVisualKeywords(prompt: string): string[] {
  const keywords: string[] = [];
  for (const pattern of VISUAL_PATTERNS) {
    const matches = prompt.match(pattern);
    if (matches) {
      keywords.push(...matches);
    }
  }
  return Array.from(new Set(keywords));
}

/**
 * 计算关键词密度
 *
 * 行为与原 `keywordDensity = visualKeywords.length / Math.max(promptLength / 20, 1)` 字节级一致。
 */
export function computeKeywordDensity(keywords: string[], promptLength: number): number {
  return keywords.length / Math.max(promptLength / HEURISTIC_PROMPT_CHUNK_SIZE, 1);
}
