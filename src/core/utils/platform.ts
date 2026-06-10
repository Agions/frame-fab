/**
 * 平台适配层（facade）
 *
 * 按职责拆分为 4 个子模块：
 * - platform-detection.ts: 平台检测
 * - storage-adapter.ts: 存储适配器
 * - filesystem-adapter.ts: 文件系统适配器
 * - notification-adapter.ts: 通知 + 剪贴板适配器
 */

export { platform, isWeb, isDesktop, isMobile, isIOS, isAndroid } from './platform-detection';
export type { Platform } from './platform-detection';

export { getStorageAdapter } from './storage-adapter';
export type { StorageAdapter } from './storage-adapter';

export { getFileSystemAdapter } from './filesystem-adapter';
export type { FileInfo, FileSystemAdapter } from './filesystem-adapter';

export { getNotificationAdapter, getClipboardAdapter } from './notification-adapter';
export type { NotificationAdapter, ClipboardAdapter } from './notification-adapter';

import { getFileSystemAdapter } from './filesystem-adapter';
import { getNotificationAdapter, getClipboardAdapter } from './notification-adapter';
import { platform, isWeb, isDesktop, isMobile, isIOS, isAndroid } from './platform-detection';
import { getStorageAdapter } from './storage-adapter';

export const platformUtils = {
  platform,
  isWeb,
  isDesktop,
  isMobile,
  isIOS,
  isAndroid,
  storage: getStorageAdapter(),
  fileSystem: getFileSystemAdapter(),
  notification: getNotificationAdapter(),
  clipboard: getClipboardAdapter(),
};

export default platformUtils;
