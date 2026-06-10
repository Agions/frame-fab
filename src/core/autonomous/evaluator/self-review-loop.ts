/**
 * SelfReviewLoop — AI 自审循环（Facade）
 * ======================================
 * 核心创新：当 Step 输出未通过 QualityGate 时，
 * 调用 LLM 自我分析失败原因，重新生成修复后的输出。
 * 最多循环 maxRetries 次（默认 3 次）。
 *
 * 拆分思路（2 个 sibling 模块）：
 * - self-review-prompt-templates.ts  2 个 prompt 模板 + STEP_NAMES + 温度/token 常量
 * - self-review-parsers.ts           extractJson / parseReviewResult / parseJsonOutput
 * - self-review-loop.ts (facade)     SelfReviewLoop 类 (薄壳) + createSelfReviewLoop 工厂
 */

import { aiService } from '../../../../src/core/services/ai/text/ai.service';
import { logger } from '../../../../src/core/utils/logger';
import type { ReviewResult, StepOutput } from '../types/autonomous.types';

import { parseReviewResult, parseJsonOutput } from './self-review-parsers';
import {
  REVIEW_PROMPT_TEMPLATE,
  REPAIR_PROMPT_TEMPLATE,
  STEP_NAMES,
  REVIEW_TEMPERATURE,
  REVIEW_MAX_TOKENS,
  REPAIR_TEMPERATURE,
  REPAIR_MAX_TOKENS,
} from './self-review-prompt-templates';

export class SelfReviewLoop {
  private maxRetries: number;
  private model: string;
  private reviewCount: Map<string, number> = new Map();

  constructor(options: { maxRetries?: number; model?: string } = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.model = options.model ?? 'glm-5';
  }

  /** 审核 Step 输出 */
  async review(stepId: string, output: StepOutput): Promise<ReviewResult> {
    const stepName = STEP_NAMES[stepId] ?? stepId;

    const prompt = REVIEW_PROMPT_TEMPLATE.replace('{stepName}', stepName).replace(
      '{originalOutput}',
      JSON.stringify(output, null, 2)
    );

    try {
      const response = await aiService.generate(prompt, {
        model: this.model,
        provider: 'openai',
        max_tokens: REVIEW_MAX_TOKENS,
        temperature: REVIEW_TEMPERATURE,
      });

      return parseReviewResult(response);
    } catch (error) {
      // 审核失败时，默认通过（不阻塞流程）
      logger.error(`[SelfReviewLoop] Review failed for ${stepId}:`, error);
      return {
        passed: true,
        score: 70,
        dimensions: [],
        reasons: [],
        suggestions: [],
      };
    }
  }

  /** 判定是否应该重试 */
  shouldRetry(stepId: string, result: ReviewResult): boolean {
    const currentCount = this.reviewCount.get(stepId) ?? 0;
    if (!result.passed && currentCount < this.maxRetries) {
      return true;
    }
    return false;
  }

  /** 增加重试计数 */
  incrementRetry(stepId: string): number {
    const current = this.reviewCount.get(stepId) ?? 0;
    const next = current + 1;
    this.reviewCount.set(stepId, next);
    return next;
  }

  /** 重置重试计数 */
  reset(stepId: string): void {
    this.reviewCount.delete(stepId);
  }

  /** 获取当前重试次数 */
  getRetryCount(stepId: string): number {
    return this.reviewCount.get(stepId) ?? 0;
  }

  /** 修复 Step 输出 */
  async repair(
    stepId: string,
    originalOutput: StepOutput,
    reviewResult: ReviewResult
  ): Promise<StepOutput> {
    const stepName = STEP_NAMES[stepId] ?? stepId;

    const reasons =
      reviewResult.reasons.length > 0 ? reviewResult.reasons.join('\n') : '综合评分未达标';

    const suggestions =
      reviewResult.suggestions.length > 0
        ? reviewResult.suggestions.join('\n')
        : '请根据审核反馈优化输出质量';

    const reviewResultText = `
评分：${reviewResult.score}/100
${reviewResult.dimensions
  .map((d) => `${d.dimension}: ${d.score}分 ${d.passed ? '✓' : '✗'} - ${d.detail}`)
  .join('\n')}
修复建议：${suggestions}
`.trim();

    const prompt = REPAIR_PROMPT_TEMPLATE.replace(/{stepName}/g, stepName)
      .replace('{originalOutput}', JSON.stringify(originalOutput, null, 2))
      .replace('{reviewResult}', reviewResultText)
      .replace('{fallbackReasons}', reasons);

    try {
      const response = await aiService.generate(prompt, {
        model: this.model,
        provider: 'openai',
        max_tokens: REPAIR_MAX_TOKENS,
        temperature: REPAIR_TEMPERATURE,
      });

      const repaired = parseJsonOutput(response);
      return repaired ?? originalOutput; // 解析失败时返回原输出
    } catch (error) {
      logger.error(`[SelfReviewLoop] Repair failed for ${stepId}:`, error);
      return originalOutput;
    }
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

let sharedInstance: SelfReviewLoop | null = null;

export function createSelfReviewLoop(options?: {
  maxRetries?: number;
  model?: string;
}): SelfReviewLoop {
  if (!sharedInstance) {
    sharedInstance = new SelfReviewLoop(options);
  }
  return sharedInstance;
}
