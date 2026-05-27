/**
 * Scene 领域模型校验 — 场景编号合法性等
 */

import type { ValidationResult } from '../shared/types';

/**
 * 场景描述校验
 */
export function validateSceneDescription(desc: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = desc.trim();

  if (trimmed.length === 0) {
    errors.push('场景描述不能为空');
  }
  if (trimmed.length > 500) {
    errors.push('场景描述不能超过500个字符');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 场景编号校验
 */
export function validateSceneNumber(num: number): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(num) || num < 1) {
    errors.push('场景编号必须为大于等于1的整数');
  }
  if (num > 9999) {
    errors.push('场景编号不能超过9999');
  }

  return { valid: errors.length === 0, errors };
}

export default {
  validateSceneDescription,
  validateSceneNumber,
};