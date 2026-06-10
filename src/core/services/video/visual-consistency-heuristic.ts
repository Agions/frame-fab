/**
 * 启发式评分（无 VLM 时的降级策略）
 * @module core/services/video/visual-consistency-heuristic
 *
 * 提取自原 VisualConsistencyScorer.evaluateByPromptMatch + evaluateWithHeuristic。
 */

import type { CharacterVideoRef } from '@/core/services/ai/image/image-generation/types';

import { computeKeywordDensity, extractVisualKeywords } from './visual-consistency-keywords';
import {
  HEURISTIC_BASE_SCORE,
  HEURISTIC_DENSITY_COEFFICIENT,
  HEURISTIC_FALLBACK_SCORE,
  HEURISTIC_MAX_SCORE,
  MODEL_HEURISTIC,
  pickScoreNotes,
  type CharacterConsistencyScore,
  type VisualConsistencyInput,
  type VisualConsistencyResult,
} from './visual-consistency-types';

/**
 * 基于关键词密度的启发式评分
 *
 * 行为与原 `evaluateByPromptMatch` 字节级一致：
 *   - 关键词为空 → 返回 HEURISTIC_FALLBACK_SCORE
 *   - 否则 score = min(HEURISTIC_MAX_SCORE, HEURISTIC_BASE_SCORE + density * COEFFICIENT)
 */
export function evaluateByPromptMatch(prompt: string): number {
  const visualKeywords = extractVisualKeywords(prompt);
  if (visualKeywords.length === 0) {
    return HEURISTIC_FALLBACK_SCORE;
  }
  const density = computeKeywordDensity(visualKeywords, prompt.length);
  return Math.round(Math.min(HEURISTIC_MAX_SCORE, HEURISTIC_BASE_SCORE + density * HEURISTIC_DENSITY_COEFFICIENT));
}

/**
 * 启发式评分主入口
 *
 * 行为与原 `evaluateWithHeuristic` 字节级一致：
 *   - 遍历 characterReferences
 *   - 每角色用 prompt 描述评单帧分数（重复 N 帧）
 *   - 聚合 overallScore
 */
export function evaluateWithHeuristic(input: VisualConsistencyInput): VisualConsistencyResult {
  const { frameUrls, characterReferences, characterDescriptions = {} } = input;
  const characterScores: CharacterConsistencyScore[] = [];

  for (const charRef of characterReferences) {
    const desc = characterDescriptions[charRef.characterId] || charRef.referencePrompt;
    const score = evaluateByPromptMatch(desc ?? '');
    characterScores.push({
      characterId: charRef.characterId,
      characterName: charRef.name,
      score,
      frameScores: new Array(frameUrls.length).fill(score),
      notes: [pickScoreNotes(score)],
    });
  }

  const overallScore =
    characterScores.length > 0
      ? Math.round(characterScores.reduce((a, c) => a + c.score, 0) / characterScores.length)
      : 0;

  return {
    overallScore,
    characterScores,
    framesEvaluated: frameUrls.length,
    model: MODEL_HEURISTIC,
  };
}
