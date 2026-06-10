/**
 * SecureStorage 初始化器
 * @module core/services/project/secure-storage-initializer
 *
 * 提取自原 SecureStorageService.init + 内部状态（store / initPromise / useFallback）。
 * 集中处理"Tauri Store 加载 / 失败回退到 localStorage"逻辑。
 */

import { logger } from '@/core/utils/logger';

import { TAURI_STORE_FILENAME, detectTauriEnvironment, type TauriStore } from './secure-storage-types';

/**
 * 存储初始化器
 *
 * 内部状态：
 *   - store: 已加载的 Tauri Store（Tauri 环境失败时为 null）
 *   - initPromise: 加载 Promise（确保多次调用只加载一次）
 *   - useFallback: 是否降级到 localStorage
 */
export class SecureStorageInitializer {
  private store: TauriStore | null = null;
  private initPromise: Promise<void> | null = null;
  private useFallback = false;

  /** 是否已就绪（store 可用或已切 fallback） */
  get isReady(): boolean {
    return this.store !== null || this.useFallback;
  }

  /** 当前是否使用 fallback */
  get isFallback(): boolean {
    return this.useFallback;
  }

  /** 获取 Tauri store（fallback 时为 null） */
  get tauriStore(): TauriStore | null {
    return this.store;
  }

  /**
   * 初始化：仅执行一次
   *
   * 行为与原 `init()` 字节级一致：
   *   - 非 Tauri 环境 → useFallback=true
   *   - Tauri 环境 → 动态 import @tauri-apps/plugin-store + Store.load
   *   - 任何失败 → useFallback=true（带 logger.warn）
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!detectTauriEnvironment()) {
        this.useFallback = true;
        return;
      }

      try {
        const { Store } = await import('@tauri-apps/plugin-store');
        this.store = (await Store.load(TAURI_STORE_FILENAME)) as unknown as TauriStore;
      } catch (error) {
        logger.warn(
          '[SecureStorage] Tauri store not available, using localStorage fallback:',
          error
        );
        this.useFallback = true;
      }
    })();

    return this.initPromise;
  }
}
