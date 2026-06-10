/**
 * localStorage 读写 helper
 * =========================
 * 从 useSettings.ts 提取的 `getStoredValue` / `setStoredValue`。
 * 单一职责：安全读写 localStorage JSON。
 */
import { logger } from '@/core/utils/logger';

/** 从 localStorage 读取 JSON（失败返回 defaultValue） */
export function getStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    logger.error(`[useSettings] 读取 ${key} 时发生错误:`, error);
    return defaultValue;
  }
}

/** 写入 localStorage JSON（失败静默 log） */
export function setStoredValue<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`[useSettings] 保存 ${key} 时发生错误:`, error);
  }
}
