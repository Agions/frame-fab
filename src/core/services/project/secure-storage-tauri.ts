/**
 * Tauri Store 包装
 * @module core/services/project/secure-storage-tauri
 *
 * 提供 Tauri Store 操作的"链式"封装：每次操作自动 try/catch 失败时回退到 fallback。
 * 消除原 8 处 `try { store.set } catch { localStorage.setItem }` 重复模板。
 */

import {
  fallbackClearAllCheckpoints,
  fallbackGetJson,
  fallbackGetString,
  fallbackRemoveString,
  fallbackSetJson,
  fallbackSetString,
} from './secure-storage-fallback';
import type { CheckpointData, ProjectDataEnvelope, TauriStore } from './secure-storage-types';

/**
 * 通用 Tauri 写：失败时回退到 fallback
 * @param store Tauri store 实例
 * @param key 完整存储 key
 * @param value 要写入的值（对象）
 * @param fallbackWrite 失败时的回退写入函数
 */
async function tauriSetOrFallback(
  store: TauriStore,
  key: string,
  value: unknown,
  fallbackWrite: () => void
): Promise<void> {
  try {
    await store.set(key, value);
    await store.save();
  } catch {
    fallbackWrite();
  }
}

/**
 * 通用 Tauri 读：失败时回退到 fallback
 */
async function tauriGetOrFallback<T>(
  store: TauriStore,
  key: string,
  fallbackRead: () => T | null
): Promise<T | null> {
  try {
    const result = await store.get<T>(key);
    return result ?? null;
  } catch {
    return fallbackRead();
  }
}

/**
 * 通用 Tauri 删：失败时回退到 fallback
 */
async function tauriDeleteOrFallback(
  store: TauriStore,
  key: string,
  fallbackRemove: () => void
): Promise<void> {
  try {
    await store.delete(key);
    await store.save();
  } catch {
    fallbackRemove();
  }
}

// ========== 业务操作（每个对应原方法的一对一封装） ==========

/** 保存 checkpoint（与原 saveCheckpoint 字节级一致） */
export async function tauriSaveCheckpoint(
  store: TauriStore,
  key: string,
  data: CheckpointData
): Promise<void> {
  return tauriSetOrFallback(store, key, data, () => fallbackSetJson(key, data));
}

/** 读取 checkpoint（与原 loadCheckpoint 字节级一致：失败回退读 raw + JSON.parse） */
export async function tauriLoadCheckpoint(
  store: TauriStore,
  key: string
): Promise<CheckpointData | null> {
  return tauriGetOrFallback<CheckpointData>(store, key, () => fallbackGetJson<CheckpointData>(key));
}

/** 删除 checkpoint（与原 clearCheckpoint 字节级一致） */
export async function tauriDeleteCheckpoint(store: TauriStore, key: string): Promise<void> {
  return tauriDeleteOrFallback(store, key, () => fallbackRemoveString(key));
}

/** 删除全部 checkpoint（与原 clearAllCheckpoints 字节级一致：失败回退到 Object.keys 扫描） */
export async function tauriClearAllCheckpoints(store: TauriStore): Promise<void> {
  try {
    const keys = await store.keys();
    for (const k of keys) {
      if (k.startsWith('checkpoint_')) {
        await store.delete(k);
      }
    }
    await store.save();
  } catch {
    fallbackClearAllCheckpoints();
  }
}

/** 保存 secure config（与原 saveSecureConfig 字节级一致：原代码未做 JSON 序列化） */
export async function tauriSaveSecureConfig(
  store: TauriStore,
  key: string,
  value: string
): Promise<void> {
  return tauriSetOrFallback(store, key, value, () => fallbackSetString(key, value));
}

/** 读取 secure config */
export async function tauriGetSecureConfig(
  store: TauriStore,
  key: string
): Promise<string | null> {
  return tauriGetOrFallback<string>(store, key, () => fallbackGetString(key));
}

/** 删除 secure config */
export async function tauriDeleteSecureConfig(
  store: TauriStore,
  key: string
): Promise<void> {
  return tauriDeleteOrFallback(store, key, () => fallbackRemoveString(key));
}

/** 保存 project data（与原 saveProjectData 字节级一致：包装 { data, updatedAt }） */
export async function tauriSaveProjectData<T>(
  store: TauriStore,
  key: string,
  data: T
): Promise<void> {
  const envelope: ProjectDataEnvelope<T> = { data, updatedAt: Date.now() };
  return tauriSetOrFallback(store, key, envelope, () => fallbackSetJson(key, envelope));
}

/** 读取 project data（与原 loadProjectData 字节级一致：返回 result.data，失败回退读 raw + 取 .data） */
export async function tauriLoadProjectData<T>(
  store: TauriStore,
  key: string
): Promise<T | null> {
  try {
    const result = await store.get<ProjectDataEnvelope<T>>(key);
    return result?.data ?? null;
  } catch {
    const envelope = fallbackGetJson<ProjectDataEnvelope<T>>(key);
    return envelope?.data ?? null;
  }
}

/** 保存 cost data（与原 saveCostData 字节级一致：JSON 序列化） */
export async function tauriSaveCostData(
  store: TauriStore,
  key: string,
  data: unknown
): Promise<void> {
  return tauriSetOrFallback(store, key, data, () => fallbackSetJson(key, data));
}

/** 读取 cost data */
export async function tauriLoadCostData<T>(
  store: TauriStore,
  key: string
): Promise<T | null> {
  return tauriGetOrFallback<T>(store, key, () => fallbackGetJson<T>(key));
}
