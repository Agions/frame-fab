/**
 * 视觉一致性评分聚合
 * @module core/services/video/visual-consistency-aggregator
 *
 * 提取自原 evaluateWithVLM / evaluateWithHeuristic 内的"计算 overallScore"重复块。
 */

import type { CharacterConsistencyScore } from './visual-consistency-types';

/**
 * 把若干单角色评分聚合成总体一致性得分
 *
 * 行为与原 `Math.round(...reduce...) / characterScores.length` 字节级一致。
 */
export function aggregateOverallScore(scores: CharacterConsistencyScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
}
