/**
 * Checkpoint Manager — 断点续传管理器
 * 负责流水线步骤的检查点持久化，支持从失败点恢复
 */

import { logger } from '@/core/utils/logger';

export interface Checkpoint {
  stepId: string;
  completed: boolean;
  data?: unknown;
  error?: string;
  partialResult?: unknown;
  timestamp: number;
}

export interface CheckpointManagerOptions {
  storageKey: string;
  maxAgeMs?: number;
  onCheckpointSaved?: (stepId: string) => void;
  onCheckpointLoaded?: (stepId: string, checkpoint: Checkpoint) => void;
}

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * CheckpointManager — 断点续传核心
 * 抽象存储接口，可对接 localStorage / IndexedDB / Tauri FileSystem
 */
export interface ICheckpointStorage {
  save(key: string, data: Checkpoint): Promise<void>;
  load(key: string): Promise<Checkpoint | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  list(): Promise<string[]>;
}

export class CheckpointManager {
  private storage = new Map<string, Checkpoint>();
  private options: Required<CheckpointManagerOptions>;
  private nativeStorage?: ICheckpointStorage;

  constructor(options: CheckpointManagerOptions) {
    this.options = {
      maxAgeMs: DEFAULT_MAX_AGE_MS,
      onCheckpointSaved: () => {},
      onCheckpointLoaded: () => {},
      ...options,
    };
  }

  /**
   * 绑定原生存储（localStorage / IndexedDB / Tauri）
   */
  bindStorage(storage: ICheckpointStorage): void {
    this.nativeStorage = storage;
  }

  /**
   * 保存检查点
   */
  async save(stepId: string, data: unknown, completed = false, error?: string): Promise<void> {
    const checkpoint: Checkpoint = {
      stepId,
      completed,
      data,
      error,
      timestamp: Date.now(),
    };

    this.storage.set(stepId, checkpoint);

    if (this.nativeStorage) {
      await this.nativeStorage.save(this.checkpointKey(stepId), checkpoint);
    }

    this.options.onCheckpointSaved(stepId);
    logger.info(`[CheckpointManager] Saved checkpoint for step: ${stepId}, completed: ${completed}`);
  }

  /**
   * 加载检查点
   */
  async load(stepId: string): Promise<Checkpoint | null> {
    // Check memory first
    let checkpoint = this.storage.get(stepId);

    if (!checkpoint && this.nativeStorage) {
      checkpoint = await this.nativeStorage.load(this.checkpointKey(stepId)) ?? undefined;
    }

    if (!checkpoint) return null;

    // Check age
    const age = Date.now() - checkpoint.timestamp;
    if (age > this.options.maxAgeMs) {
      logger.info(`[CheckpointManager] Checkpoint expired for step: ${stepId}, age: ${age}ms`);
      await this.delete(stepId);
      return null;
    }

    if (checkpoint) {
      this.options.onCheckpointLoaded(stepId, checkpoint);
    }

    return checkpoint ?? null;
  }

  /**
   * 检查是否存在有效的检查点
   */
  async has(stepId: string): Promise<boolean> {
    const checkpoint = await this.load(stepId);
    return checkpoint !== null && checkpoint.completed;
  }

  /**
   * 删除检查点
   */
  async delete(stepId: string): Promise<void> {
    this.storage.delete(stepId);
    if (this.nativeStorage) {
      await this.nativeStorage.delete(this.checkpointKey(stepId));
    }
    logger.info(`[CheckpointManager] Deleted checkpoint for step: ${stepId}`);
  }

  /**
   * 清除所有检查点
   */
  async clear(): Promise<void> {
    this.storage.clear();
    if (this.nativeStorage) {
      await this.nativeStorage.clear();
    }
    logger.info('[CheckpointManager] Cleared all checkpoints');
  }

  /**
   * 列出所有检查点
   */
  async list(): Promise<Checkpoint[]> {
    const keys = this.nativeStorage ? await this.nativeStorage.list() : [];
    const checkpoints: Checkpoint[] = [];

    for (const key of keys) {
      if (key.startsWith(this.options.storageKey)) {
        const checkpoint = await this.nativeStorage!.load(key);
        if (checkpoint) checkpoints.push(checkpoint);
      }
    }

    return checkpoints;
  }

  /**
   * 获取检查点年龄（毫秒）
   */
  async getAge(stepId: string): Promise<number | null> {
    const checkpoint = await this.load(stepId);
    return checkpoint ? Date.now() - checkpoint.timestamp : null;
  }

  private checkpointKey(stepId: string): string {
    return `${this.options.storageKey}:${stepId}`;
  }
}

// ========== LocalStorage 实现 ==========

export class LocalStorageCheckpointAdapter implements ICheckpointStorage {
  private prefix: string;

  constructor(prefix = 'panel-flow-checkpoint') {
    this.prefix = prefix;
  }

  async save(key: string, data: Checkpoint): Promise<void> {
    try {
      localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(data));
    } catch (err) {
      logger.error('[LocalStorageCheckpoint] Save failed:', err);
    }
  }

  async load(key: string): Promise<Checkpoint | null> {
    try {
      const raw = localStorage.getItem(`${this.prefix}:${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(`${this.prefix}:${key}`);
  }

  async clear(): Promise<void> {
    const prefix = this.prefix;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(`${prefix}:`)) {
        localStorage.removeItem(k);
      }
    }
  }

  async list(): Promise<string[]> {
    const prefix = `${this.prefix}:`;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) {
        keys.push(k.slice(prefix.length));
      }
    }
    return keys;
  }
}

// Default instance
export const checkpointManager = new CheckpointManager({
  storageKey: 'pf-checkpoint',
});