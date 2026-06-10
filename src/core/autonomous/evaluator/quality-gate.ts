/**
 * QualityGate — 质量门禁（Facade）
 * ================================
 * 每个 Pipeline Step 完成后，必须通过 QualityGate 判定质量。
 * 不合格的输出会触发 Self-Review Loop 进行自动修复。
 *
 * 拆分思路（2 个 sibling 模块）：
 * - quality-gate-config.ts      两个配置字典 (REVIEW_CRITERIA + GATE_CONFIG)
 * - quality-gate-evaluators.ts  基础检查 + 默认评分 + 占位 LLM 评分
 * - quality-gate.ts (facade)    QualityGate 类 (薄壳) + createQualityGate 工厂
 *
 * 调用方不需要修改。
 */

import type {
  QualityGateResult,
  QualityGateConfig,
  StepOutput,
  ReviewCriteria,
} from '../types/autonomous.types';

import { DEFAULT_QUALITY_GATE_CONFIG, FALLBACK_GATE_CONFIG } from './quality-gate-config';
import {
  performBasicChecks,
  calculateDefaultScore,
  evaluateWithCriteriaPlaceholder,
} from './quality-gate-evaluators';

// Re-export 配置字典（供外部使用）
export { DEFAULT_REVIEW_CRITERIA, DEFAULT_QUALITY_GATE_CONFIG } from './quality-gate-config';

// ============================================================================
// QualityGate 类
// ============================================================================

export class QualityGate {
  private config: QualityGateConfig;

  constructor(config: QualityGateConfig) {
    this.config = {
      ...config,
      enabled: config.enabled ?? true,
      threshold: config.threshold ?? 70,
      onFail: config.onFail ?? 'retry',
    };
  }

  /**
   * 评估 Step 输出质量。
   *
   * 1. 未启用 → 直接通过
   * 2. 基础检查失败 → 直接不通过
   * 3. 有自定义 criteria → 占位 LLM 评分
   * 4. 默认规则 → 纯规则打分 + 阈值判定
   */
  evaluate(stepId: string, output: StepOutput, criteria?: ReviewCriteria): QualityGateResult {
    if (!this.config.enabled) {
      return {
        passed: true,
        details: 'Quality gate disabled',
        score: 100,
      };
    }

    // 基础检查
    const basicCheck = performBasicChecks(stepId, output);
    if (!basicCheck.passed) {
      return {
        passed: false,
        details: basicCheck.reason ?? 'Basic check failed',
        score: basicCheck.score,
      };
    }

    // 如果有自定义 criteria，进行评分
    if (criteria) {
      return evaluateWithCriteriaPlaceholder();
    }

    // 使用默认规则
    const score = calculateDefaultScore(stepId, output);
    const passed = score >= this.config.threshold;

    return {
      passed,
      details: passed
        ? `Quality score ${score} meets threshold ${this.config.threshold}`
        : `Quality score ${score} below threshold ${this.config.threshold}`,
      score,
    };
  }

  /** 获取 onFail 处理策略 */
  getOnFailStrategy(): 'retry' | 'skip' | 'stop' {
    return this.config.onFail;
  }

  /** 是否启用自审 */
  isSelfReviewEnabled(): boolean {
    return this.config.reviewConfig?.enabled ?? false;
  }

  /** 获取最大自审次数 */
  getMaxReviewRetries(): number {
    return this.config.reviewConfig?.maxRetries ?? 2;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

export function createQualityGate(stepId: string): QualityGate {
  const config = DEFAULT_QUALITY_GATE_CONFIG[stepId] ?? FALLBACK_GATE_CONFIG;
  return new QualityGate(config);
}
