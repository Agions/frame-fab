/**
 * Shared types — 各子域共用的接口/类型定义
 *
 * 避免 ValidationResult 等类型在 script/character/scene 三个 validator 中重复定义
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];  // 空数组 = 通过
}

export interface EntityValidationResult extends ValidationResult {
  warnings?: string[];  // 非致命警告
}