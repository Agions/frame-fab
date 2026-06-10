/**
 * SecureStorageService 共享类型与常量
 * @module core/services/project/secure-storage-types
 */

/** 检查点数据结构（与原 file-private CheckpointData 字节级一致） */
export interface CheckpointData {
  stepId: string;
  completed: boolean;
  data: unknown;
  timestamp: number;
}

/** localStorage key 前缀字典（与原内联 `\`checkpoint_${...}\`` / `\`secure_${...}\`` 等字节级一致） */
export const KEY_PREFIX = {
  checkpoint: 'checkpoint_',
  secure: 'secure_',
  project: 'project_',
  cost: 'cost_',
} as const;

/** Tauri Store 子集接口（最小化类型，仅包含我们用到的 set/get/save/delete/keys） */
export interface TauriStore {
  set: (key: string, value: unknown) => Promise<void>;
  get: <T>(key: string) => Promise<T | null>;
  delete: (key: string) => Promise<boolean | void>;
  keys: () => Promise<string[]>;
  save: () => Promise<void>;
}

/** Tauri Store 文件名（与原 Store.load('secure-data.json') 字节级一致） */
export const TAURI_STORE_FILENAME = 'secure-data.json';

/** 项目数据包装类型（与原内联 `{ data, updatedAt: Date.now() }` 字节级一致） */
export interface ProjectDataEnvelope<T = unknown> {
  data: T;
  updatedAt: number;
}

/** Tauri 环境检测（与原 `typeof window !== 'undefined' && '__TAURI__' in window` 字节级一致） */
export function detectTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/** 构造 checkpoint 存储 key */
export function buildCheckpointKey(stepId: string): string {
  return `${KEY_PREFIX.checkpoint}${stepId}`;
}

/** 构造 secure config 存储 key */
export function buildSecureConfigKey(key: string): string {
  return `${KEY_PREFIX.secure}${key}`;
}

/** 构造 project data 存储 key */
export function buildProjectDataKey(projectId: string): string {
  return `${KEY_PREFIX.project}${projectId}`;
}

/** 构造 cost data 存储 key */
export function buildCostDataKey(key: string): string {
  return `${KEY_PREFIX.cost}${key}`;
}
