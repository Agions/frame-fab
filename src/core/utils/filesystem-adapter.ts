/**
 * 文件系统适配器
 */
import { logger } from '@/core/utils/logger';

import { isDesktop } from './platform-detection';

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
    const response = await fetch(path);
    return new Uint8Array(await response.arrayBuffer());
  }
  async writeFile(path: string, data: Uint8Array): Promise<void> {
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
    throw new Error('Web 端不支持选择目录');
  }
  async exists(path: string): Promise<boolean> {
    try {
      return (await fetch(path, { method: 'HEAD' })).ok;
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
      const { writeFile, mkdir } = await import('@tauri-apps/plugin-fs');
      const dir = path.substring(0, path.lastIndexOf('/'));
      if (dir) await mkdir(dir, { recursive: true }).catch(() => {});
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
      return paths.map((p) => ({
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
      return (await open({ directory: true })) as string;
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

export const getFileSystemAdapter = (): FileSystemAdapter => {
  return isDesktop ? new DesktopFileSystemAdapter() : new WebFileSystemAdapter();
};
