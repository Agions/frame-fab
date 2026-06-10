/**
 * 项目备份持久化
 * @module core/services/project/project-import-export-backup
 *
 * 提取自原 ProjectImportExportService.getBackupList + deleteBackup 私有逻辑 +
 * backupProject 内的 localStorage 读写。封装为纯函数，不再耦合类成员。
 */

import type { BackupRecord } from './project-import-export-types';
import {
  BACKUP_INDEX_KEY,
  BACKUP_ITEM_PREFIX,
  MAX_BACKUPS,
  nowIso,
} from './project-import-export-types';

/** 构造单条备份内容 key */
function buildBackupItemKey(backupId: string): string {
  return `${BACKUP_ITEM_PREFIX}${backupId}`;
}

/**
 * 读取备份索引列表（与原 getBackupList 字节级一致：解析失败返回空数组）
 */
export function readBackupIndex(): BackupRecord[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(BACKUP_INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * 写入整个备份索引
 */
export function writeBackupIndex(backups: BackupRecord[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(BACKUP_INDEX_KEY, JSON.stringify(backups));
}

/**
 * 追加一条备份索引（自动按 MAX_BACKUPS 截断最早一条）
 *
 * 行为与原 backupProject 内的 `if (backups.length > 10) backups.shift()` 字节级一致。
 */
export function appendBackupRecord(record: BackupRecord): BackupRecord[] {
  const backups = readBackupIndex();
  backups.push(record);
  if (backups.length > MAX_BACKUPS) {
    backups.shift();
  }
  writeBackupIndex(backups);
  return backups;
}

/**
 * 从索引中移除指定 id 的备份条目
 */
export function removeBackupRecord(backupId: string): BackupRecord[] {
  const backups = readBackupIndex().filter((b) => b.id !== backupId);
  writeBackupIndex(backups);
  return backups;
}

/** 读取单条备份内容（JSON 字符串） */
export function readBackupContent(backupId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(buildBackupItemKey(backupId));
}

/** 写入单条备份内容 */
export function writeBackupContent(backupId: string, content: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(buildBackupItemKey(backupId), content);
}

/** 删除单条备份内容 */
export function removeBackupContent(backupId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(buildBackupItemKey(backupId));
}

/** 构造一条备份索引条目 */
export function buildBackupRecord(
  id: string,
  filename: string,
  projectId: string,
  projectName: string,
  content: string
): BackupRecord {
  return {
    id,
    filename,
    projectId,
    projectName,
    createdAt: nowIso(),
    size: content.length,
  };
}
