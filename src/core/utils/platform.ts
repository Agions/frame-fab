/**
 * 平台适配层
 * 提供跨平台的统一 API
 */

import { logger } from '@/core/utils/logger';

// 平台类型 - 桌面端专用，移除移动端
export type Platform = 'web' | 'desktop';

// 环境检测
const getPlatform = (): Platform => {
  // Tauri 环境
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    return 'desktop';
  }

  return 'web';
};

export const platform = getPlatform();

export const isWeb = platform === 'web';
export const isDesktop = platform === 'desktop';
// 移除移动端检测，始终为 false
export const isMobile = false;
export const isIOS = false;
export const isAndroid = false;

// ========== 存储适配 ==========

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

class WebStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

class DesktopStorageAdapter implements StorageAdapter {
  // Tauri 使用 same localStorage
  private storage = new WebStorageAdapter();

  get<T>(key: string): T | null {
    return this.storage.get<T>(key);
  }

  set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.remove(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// 获取当前平台的存储适配器
export const getStorageAdapter = (): StorageAdapter => {
  if (isDesktop) {
    return new DesktopStorageAdapter();
  }
  return new WebStorageAdapter();
};

// ========== 文件系统适配 ==========

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface FileSystemAdapter {
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  selectFile(options?: { multiple?: boolean; accept?: string[] }): Promise<FileInfo[]>;
  selectDirectory(): Promise<string>;
  exists(path: string): Promise<boolean>;
}

class WebFileSystemAdapter implements FileSystemAdapter {
  async readFile(path: string): Promise<Uint8Array> {
    // Web 端通过 fetch 读取
    const response = await fetch(path);
    return new Uint8Array(await response.arrayBuffer());
  }

  async writeFile(path: string, data: Uint8Array): Promise<void> {
    // Web 端使用 download 方式
    const blob = new Blob([data as BlobPart]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'file';
    a.click();
    URL.revokeObjectURL(url);
  }

  async selectFile(options?: { multiple?: boolean; accept?: string[] }): Promise<FileInfo[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options?.multiple || false;
      input.accept = options?.accept?.join(',') || '*';

      input.onchange = async () => {
        const files = input.files || [];
        const results: FileInfo[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          results.push({
            name: file.name,
            path: URL.createObjectURL(file),
            size: file.size,
            type: file.type,
          });
        }

        resolve(results);
      };

      input.click();
    });
  }

  async selectDirectory(): Promise<string> {
    // Web 端不支持选择目录
    throw new Error('Web 端不支持选择目录');
  }

  async exists(path: string): Promise<boolean> {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

class DesktopFileSystemAdapter implements FileSystemAdapter {
  private webAdapter = new WebFileSystemAdapter();

  async readFile(path: string): Promise<Uint8Array> {
    try {
      const { readFile } = await import('@tauri-apps/plugin-fs');
      return await readFile(path);
    } catch (err) {
      logger.warn('[Platform] Desktop readFile fallback to web:', err);
      return this.webAdapter.readFile(path);
    }
  }

  async writeFile(path: string, data: Uint8Array): Promise<void> {
    try {
      const { writeFile, mkdir, BaseDirectory } = await import('@tauri-apps/plugin-fs');
      const dir = path.substring(0, path.lastIndexOf('/'));
      if (dir) {
        await mkdir(dir, { recursive: true }).catch(() => { /* ignore */ });
      }
      await writeFile(path, data);
    } catch (err) {
      logger.warn('[Platform] Desktop writeFile fallback to web:', err);
      return this.webAdapter.writeFile(path, data);
    }
  }

  async selectFile(options?: { multiple?: boolean; accept?: string[] }): Promise<FileInfo[]> {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const result = await open({
        multiple: options?.multiple ?? false,
        filters: options?.accept ? [{ name: 'Files', extensions: options.accept }] : undefined,
      });
      if (!result) return [];
      const paths = Array.isArray(result) ? result : [result];
      return paths.map(p => ({
        name: p.split('/').pop() ?? p,
        path: p,
        size: 0,
        type: p.split('.').pop() ?? '',
      }));
    } catch (err) {
      logger.warn('[Platform] Desktop selectFile fallback to web:', err);
      return this.webAdapter.selectFile(options);
    }
  }

  async selectDirectory(): Promise<string> {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const result = await open({ directory: true });
      return result as string;
    } catch (err) {
      logger.warn('[Platform] Desktop selectDirectory fallback:', err);
      throw new Error('Directory selection cancelled');
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      const { exists } = await import('@tauri-apps/plugin-fs');
      return await exists(path);
    } catch {
      return this.webAdapter.exists(path);
    }
  }
}

// 获取当前平台的文件系统适配器
export const getFileSystemAdapter = (): FileSystemAdapter => {
  if (isDesktop) {
    return new DesktopFileSystemAdapter();
  }
  return new WebFileSystemAdapter();
};

// ========== 通知适配 ==========

export interface NotificationAdapter {
  show(options: { title: string; body?: string; icon?: string }): void;
  requestPermission(): Promise<boolean>;
}

class WebNotificationAdapter implements NotificationAdapter {
  show(options: { title: string; body?: string; icon?: string }): void {
    if (Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon,
      });
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

class DesktopNotificationAdapter implements NotificationAdapter {
  show(options: { title: string; body?: string; icon?: string }): void {
    if (!options.title) return;
    void getTauriNotification().then(({ notify }) => notify(options.title, options.body));
  }

  async requestPermission(): Promise<boolean> {
    const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
    let granted = await isPermissionGranted();
    if (!granted) {
      const result = await requestPermission();
      granted = result === 'granted';
    }
    return granted;
  }
}

async function getTauriNotification() {
  const { sendNotification } = await import('@tauri-apps/plugin-notification');
  return { notify: (title: string, body?: string) => sendNotification({ title, body }) };
}

export const getNotificationAdapter = (): NotificationAdapter => {
  if (isDesktop) {
    return new DesktopNotificationAdapter();
  }
  return new WebNotificationAdapter();
};

// ========== 剪贴板适配 ==========

export interface ClipboardAdapter {
  read(): Promise<string>;
  write(text: string): Promise<void>;
}

class WebClipboardAdapter implements ClipboardAdapter {
  async read(): Promise<string> {
    return await navigator.clipboard.readText();
  }

  async write(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }
}

export const getClipboardAdapter = (): ClipboardAdapter => {
  return new WebClipboardAdapter();
};

// ========== 导出平台工具 ==========

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
