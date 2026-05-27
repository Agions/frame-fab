/**
 * Character 领域模型校验 — 角色名称合法性等
 */

import type { ValidationResult } from '../shared/types';

/**
 * 角色名称校验
 * - 2-30 字符
 * - 允许中文、英文、数字、下划线
 * - 不能以数字开头
 */
export function validateCharacterName(name: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    errors.push('角色名称至少需要2个字符');
  }
  if (trimmed.length > 30) {
    errors.push('角色名称不能超过30个字符');
  }
  if (!/^[a-zA-Z\u4E00-\u9FA5_][a-zA-Z0-9\u4E00-\u9FA5_]*$/.test(trimmed)) {
    errors.push('角色名称只能包含中文、英文、数字和下划线，且不能以数字开头');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 角色描述校验
 */
export function validateCharacterDescription(desc: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = desc.trim();

  if (trimmed.length > 500) {
    errors.push('角色描述不能超过500个字符');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 角色外观校验
 */
export function validateCharacterAppearance(appearance: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = appearance.trim();

  if (trimmed.length === 0) {
    errors.push('角色外观描述不能为空');
  }
  if (trimmed.length > 1000) {
    errors.push('角色外观描述不能超过1000个字符');
  }

  return { valid: errors.length === 0, errors };
}

export default {
  validateCharacterName,
  validateCharacterDescription,
  validateCharacterAppearance,
};