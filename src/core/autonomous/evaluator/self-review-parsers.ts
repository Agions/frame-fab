/**
 * Self-Review Loop JSON 解析器
 * ============================
 * 从 LLM 回复中提取结构化 JSON 的 3 个方法。
 *
 * extractJson：3 种策略（直接解析 → code block → 首尾大括号）
 * parseReviewResult：提取 5 维度评分
 * parseJsonOutput：提取修复后的 JSON（as StepOutput）
 *
 * 单一职责：纯解析，无 AI 调用。
 */
import type { ReviewResult, ReviewDimension, StepOutput } from '../types/autonomous.types';

/**
 * 从文本中提取 JSON 对象。
 * 3 种策略（按优先级）：
 * 1. 直接 JSON.parse
 * 2. ```json ... ``` code block
 * 3. 首个 { ... 最后一个 } 之间的内容
 *
 * 全部失败返回 null。
 */
export function extractJson(text: string): Record<string, unknown> | null {
  // 策略 1：直接解析
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    // 继续
  }

  // 策略 2：从 ```json 块中提取
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as Record<string, unknown>;
    } catch {
      // 继续
    }
  }

  // 策略 3：首个 { ... 最后一个 } 之间的内容
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
    } catch {
      // 放弃
    }
  }

  return null;
}

/** 解析失败时的默认 ReviewResult（通过，不阻塞流程） */
const DEFAULT_REVIEW_RESULT: ReviewResult = {
  passed: true,
  score: 70,
  dimensions: [],
  reasons: [],
  suggestions: [],
};

/** 分数值夹具：0-100 范围限制 */
function clampScore(value: unknown): number {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

/**
 * 解析审核结果（5 维度评分）。
 * 解析失败时返回 DEFAULT_REVIEW_RESULT（通过，不阻塞）。
 */
export function parseReviewResult(response: string): ReviewResult {
  try {
    const json = extractJson(response);
    if (!json) throw new Error('No JSON found');

    return {
      passed: Boolean(json.passed),
      score: clampScore(json.score),
      dimensions: Array.isArray(json.dimensions)
        ? json.dimensions.map((d: Record<string, unknown>) => ({
            dimension: (d.dimension as ReviewDimension) ?? 'completeness',
            score: clampScore(d.score),
            passed: Boolean(d.passed),
            detail: String(d.detail ?? ''),
          }))
        : [],
      reasons: Array.isArray(json.reasons) ? json.reasons.map(String) : [],
      suggestions: Array.isArray(json.suggestions) ? json.suggestions.map(String) : [],
    };
  } catch {
    return DEFAULT_REVIEW_RESULT;
  }
}

/**
 * 解析修复后的 JSON 输出（as StepOutput）。
 * 返回 null 表示解析失败，调用方回退到原输出。
 */
export function parseJsonOutput(text: string): StepOutput | null {
  const json = extractJson(text);
  return json as StepOutput | null;
}
