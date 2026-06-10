/**
 * localStorage Fallback 存储
 * @module core/services/project/secure-storage-fallback
 *
 * 纯 localStorage 包装，提供 set / get / remove / clearWithPrefix 四个底层操作。
 * 集中处理"读取 raw + JSON.parse + 异常返回 null"等重复模式。
 */

import { KEY_PREFIX } from './secure-storage-types';

/**
 * 字符串安全读取：localStorage 不存在或抛错时返回 null
 */
function safeGetString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** 字符串安全写入：localStorage 抛错时吞掉异常 */
function safeSetString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 静默：原代码 catch 块也只做回退 */
  }
}

/** 字符串安全删除 */
function safeRemoveString(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* 静默 */
  }
}

/**
 * 把"读 raw + JSON.parse + 异常返回 null"封装为单行 helper
 * （消除原 4 处 `try { JSON.parse } catch { return null }` 重复）
 */
function readJsonOrNull<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** localStorage 字符串读写 */
export function fallbackSetString(key: string, value: string): void {
  safeSetString(key, value);
}

export function fallbackGetString(key: string): string | null {
  return safeGetString(key);
}

export function fallbackRemoveString(key: string): void {
  safeRemoveString(key);
}

/** localStorage JSON 读写 */
export function fallbackSetJson(key: string, value: unknown): void {
  safeSetString(key, JSON.stringify(value));
}

export function fallbackGetJson<T>(key: string): T | null {
  return readJsonOrNull<T>(safeGetString(key));
}

/**
 * 删除指定前缀的全部 key
 *
 * 行为与原 `Object.keys(localStorage).filter(k => k.startsWith(CHECKPOINT_PREFIX)).forEach(k => localStorage.removeItem(k))` 字节级一致。
 */
export function fallbackClearByPrefix(prefix: string): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
  for (const k of keys) {
    safeRemoveString(k);
  }
}

/** checkpoint 命名空间清理（语法糖） */
export function fallbackClearAllCheckpoints(): void {
  fallbackClearByPrefix(KEY_PREFIX.checkpoint);
}
