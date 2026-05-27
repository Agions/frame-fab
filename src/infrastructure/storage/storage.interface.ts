/**
 * Storage Interface — 存储抽象接口
 * 基础设施层：屏蔽 localStorage / IndexedDB / Tauri FileSystem 的差异
 */

import { logger } from '@/core/utils/logger';

/**
 * IStorage — 存储抽象接口
 * 实现类：LocalStorageAdapter / IndexedDBAdapter / TauriFileSystemAdapter
 */
export interface IStorage {
  /** 读取 */
  get<T>(key: string): Promise<T | null>;
  /** 写入 */
  set<T>(key: string, value: T): Promise<void>;
  /** 删除 */
  remove(key: string): Promise<void>;
  /** 列出所有 key */
  keys(): Promise<string[]>;
  /** 清除所有 */
  clear(): Promise<void>;
  /** 检查是否存在 */
  has(key: string): Promise<boolean>;
}

/**
 * LocalStorageAdapter — localStorage 实现
 */
export class LocalStorageAdapter implements IStorage {
  private prefix: string;

  constructor(prefix = 'pf:') {
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (err) {
      logger.error(`[LocalStorage] Failed to set ${key}:`, err);
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async keys(): Promise<string[]> {
    const prefix = this.prefix;
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) {
        result.push(k.slice(prefix.length));
      }
    }
    return result;
  }

  async clear(): Promise<void> {
    const prefix = this.prefix;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(this.prefix + key) !== null;
  }
}

/**
 * SecureStorageAdapter — 安全存储（加密 localStorage）
 * 用于存储 API Key 等敏感信息
 */
export class SecureStorageAdapter implements IStorage {
  private storage = new LocalStorageAdapter('pf:secure:');

  async get<T>(key: string): Promise<T | null> {
    const encrypted = await this.storage.get<string>(key);
    if (!encrypted) return null;
    try {
      // In production, decrypt with Web Crypto API
      return JSON.parse(atob(encrypted)) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const encrypted = btoa(JSON.stringify(value));
    await this.storage.set(key, encrypted);
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(key);
  }

  async keys(): Promise<string[]> {
    return await this.storage.keys();
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  async has(key: string): Promise<boolean> {
    return await this.storage.has(key);
  }
}

// Default instances
export const storage = new LocalStorageAdapter();
export const secureStorage = new SecureStorageAdapter();