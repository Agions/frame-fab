/**
 * Script 领域模型校验 — 剧本标题长度、角色名称合法性等
 *
 * 改造前：散落在各个组件/服务中重复校验
 * 改造后：实体类封装所有校验规则，上层只调用 validate()
 */

import type { ValidationResult } from '../shared/types';

/**
 * 剧本标题校验
 * - 长度：2-200 字符（中文按2字节算）
 * - 不能全空白
 * - 不能包含控制字符
 */
export function validateScriptTitle(title: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = title.trim();

  if (trimmed.length < 2) {
    errors.push('剧本标题至少需要2个字符');
  }
  if (trimmed.length > 200) {
    errors.push('剧本标题不能超过200个字符');
  }
  if (!/[^\s]/.test(trimmed)) {
    errors.push('剧本标题不能全为空白字符');
  }
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    errors.push('剧本标题不能包含控制字符');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 剧本内容校验
 * - 不能为空
 * - 最大长度 50000 字符
 */
export function validateScriptContent(content: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    errors.push('剧本内容不能为空');
  }
  if (trimmed.length > 50000) {
    errors.push('剧本内容不能超过50000个字符');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 场景描述校验
 */
export function validateSceneDescription(desc: string): ValidationResult {
  const errors: string[] = [];

  if (desc.trim().length === 0) {
    errors.push('场景描述不能为空');
  }
  if (desc.trim().length > 500) {
    errors.push('场景描述不能超过500个字符');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 对话内容校验
 */
export function validateDialogue(dialogue: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = dialogue.trim();

  if (trimmed.length === 0) {
    errors.push('对话内容不能为空');
  }
  if (trimmed.length > 1000) {
    errors.push('单条对话内容不能超过1000个字符');
  }

  return { valid: errors.length === 0, errors };
}

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
 * 完整剧本实体校验
 */
export function validateScript(script: {
  title?: string;
  content?: string;
  characters?: Array<{ name: string }>;
  scenes?: Array<{ description: string }>;
}): ValidationResult {
  const allErrors: string[] = [];

  if (script.title !== undefined) {
    allErrors.push(...validateScriptTitle(script.title).errors);
  }
  if (script.content !== undefined) {
    allErrors.push(...validateScriptContent(script.content).errors);
  }
  if (script.characters) {
    script.characters.forEach((char, i) => {
      const r = validateCharacterName(char.name);
      if (!r.valid) allErrors.push(`角色${i + 1}：${r.errors.join('；')}`);
    });
  }
  if (script.scenes) {
    script.scenes.forEach((scene, i) => {
      const r = validateSceneDescription(scene.description);
      if (!r.valid) allErrors.push(`场景${i + 1}：${r.errors.join('；')}`);
    });
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}

// ============================================
// 实体类封装（可选，面向对象风格）
// ============================================

export class ScriptTitle {
  private constructor(private readonly value: string) {}

  static create(raw: string): ScriptTitle {
    const result = validateScriptTitle(raw);
    if (!result.valid) throw new Error(result.errors.join('；'));
    return new ScriptTitle(raw.trim());
  }

  get(): string { return this.value; }
  getLength(): number { return this.value.length; }
  isEmpty(): boolean { return !/\S/.test(this.value); }
}

export class CharacterName {
  private constructor(private readonly value: string) {}

  static create(raw: string): CharacterName {
    const result = validateCharacterName(raw);
    if (!result.valid) throw new Error(result.errors.join('；'));
    return new CharacterName(raw.trim());
  }

  get(): string { return this.value; }
}

// 导出实体工厂函数（函数式风格，与类风格二选一）
export const scriptEntity = {
  title: (raw: string) => {
    const r = validateScriptTitle(raw);
    if (!r.valid) throw new Error(r.errors.join('；'));
    return { value: raw.trim(), maxLength: 200 };
  },
  characterName: (raw: string) => {
    const r = validateCharacterName(raw);
    if (!r.valid) throw new Error(r.errors.join('；'));
    return { value: raw.trim(), maxLength: 30 };
  },
};