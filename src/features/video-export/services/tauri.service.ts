/**
 * Tauri API Service
 * Type-safe Tauri command wrapper
 */

import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { appConfigDir, appDataDir, documentDir, videoDir, downloadDir } from '@tauri-apps/api/path';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { open, save, message, ask, confirm } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, writeFile, exists, mkdir, remove, readDir } from '@tauri-apps/plugin-fs';
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

// ========== Type Definitions ==========

// File open options
export interface OpenFileOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  multiple?: boolean;
  directory?: boolean;
}

// File save options
export interface SaveFileOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

// Video clip options
export interface VideoClipOptions {
  inputPath: string;
  outputPath: string;
  segments: Array<{
    start: number;
    end: number;
    type: string;
    content?: string;
  }>;
  quality: 'low' | 'medium' | 'high';
  format: string;
  transition?: string;
  transitionDuration?: number;
  volume?: number;
  addSubtitles?: boolean;
  [key: string]: unknown;
}

// Preview options
export interface PreviewOptions {
  inputPath: string;
  segment: {
    start: number;
    end: number;
    type: string;
  };
  transition?: string;
  transitionDuration?: number;
  volume?: number;
  addSubtitles?: boolean;
  [key: string]: unknown;
}

// Export options
export interface ExportOptions {
  inputPath: string;
  outputPath: string;
  segments: Array<{
    start: number;
    end: number;
    type: string;
    content?: string;
  }>;
  quality: 'low' | 'medium' | 'high';
  format: string;
  transition?: string;
  transitionDuration?: number;
  volume?: number;
  addSubtitles?: boolean;
  exportId?: string;
}

// Export progress event
export interface ExportProgress {
  exportId: string;
  stage: 'preparing' | 'processing' | 'encoding' | 'finalizing' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

// Export progress callback
export type ExportProgressCallback = (progress: ExportProgress) => void;
export interface DirInfo {
  name: string;
  path: string;
  isDirectory: boolean;
}

// Window state
export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  maximized: boolean;
}

// Notification options
export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
}

// Tray menu item
export interface TrayMenuItem {
  id: string;
  label: string;
  enabled?: boolean;
  checked?: boolean;
  accelerator?: string;
}

// Shortcut definition
export interface ShortcutDefinition {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: () => void;
}

// Tauri service class
class TauriService {
  private progressListener: UnlistenFn | null = null;

  // ========== Dialog APIs ==========
  async openFileDialog(options: OpenFileOptions = {}): Promise<string | string[] | null> {
    return open({
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
      multiple: options.multiple,
      directory: options.directory,
    });
  }

  async saveFileDialog(options: SaveFileOptions = {}): Promise<string | null> {
    return save({
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
    });
  }

  async showMessage(title: string, msg: string): Promise<void> {
    await message(msg, { title });
  }

  async showAsk(title: string, msg: string): Promise<boolean> {
    return ask(msg, { title });
  }

  async showConfirm(title: string, msg: string): Promise<boolean> {
    return confirm(msg, { title });
  }

  // ========== File System APIs ==========
  async readText(path: string): Promise<string> {
    return readTextFile(path);
  }

  async writeText(path: string, content: string): Promise<void> {
    await writeTextFile(path, content);
  }

  async writeBinary(path: string, data: Uint8Array): Promise<void> {
    await writeFile(path, data);
  }

  async fileExists(path: string): Promise<boolean> {
    return exists(path);
  }

  async createDirectory(path: string, recursive: boolean = false): Promise<void> {
    await mkdir(path, { recursive });
  }

  async removeDirectory(path: string, recursive: boolean = false): Promise<void> {
    await remove(path, { recursive });
  }

  async listDirectory(path: string): Promise<DirInfo[]> {
    const entries = await readDir(path);
    return entries.map(entry => ({
      name: entry.name,
      path: entry.name,  // plugin-fs DirEntry doesn't have path property
      isDirectory: entry.isDirectory,
    }));
  }

  // ========== Path APIs ==========
  async getAppDir(): Promise<string> {
    return appConfigDir();
  }

  async getConfigDir(): Promise<string> {
    return appConfigDir();
  }

  async getDataDir(): Promise<string> {
    return appDataDir();
  }

  async getDocumentDir(): Promise<string> {
    return documentDir();
  }

  async getVideoDir(): Promise<string> {
    return videoDir();
  }

  async getDownloadDir(): Promise<string> {
    return downloadDir();
  }

  // ========== Notification APIs ==========
  async sendNotification(options: NotificationOptions): Promise<void> {
    let permitted = await isPermissionGranted();
    if (!permitted) {
      const permission = await requestPermission();
      permitted = permission === 'granted';
    }
    if (permitted) {
      await sendNotification({
        title: options.title,
        body: options.body,
      });
    }
  }

  // ========== Window APIs ==========
  async getCurrentWindowState(): Promise<WindowState> {
    const win = getCurrentWindow();
    const size = await win.innerSize();
    const position = await win.innerPosition();
    const maximized = await win.isMaximized();
    return {
      width: size.width,
      height: size.height,
      x: position.x,
      y: position.y,
      maximized,
    };
  }

  async minimizeWindow(): Promise<void> {
    const win = getCurrentWindow();
    await win.minimize();
  }

  async maximizeWindow(): Promise<void> {
    const win = getCurrentWindow();
    const maximized = await win.isMaximized();
    if (maximized) {
      await win.unmaximize();
    } else {
      await win.maximize();
    }
  }

  async closeWindow(): Promise<void> {
    const win = getCurrentWindow();
    await win.close();
  }

  // ========== Video Processing APIs (Tauri backend) ==========
  async processVideo(options: VideoClipOptions): Promise<string> {
    return invoke<string>('process_video', { options });
  }

  async generatePreview(options: PreviewOptions): Promise<string> {
    return invoke<string>('generate_preview', { options });
  }

  async exportVideoCommand(options: ExportOptions): Promise<string> {
    return invoke<string>('export_video', { options });
  }

  async getVideoInfoCommand(videoPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
    codec: string;
    bitrate: number;
  }> {
    return invoke('get_video_info', { videoPath });
  }

  async extractFrames(videoPath: string, outputDir: string, fps: number = 1): Promise<string[]> {
    return invoke<string[]>('extract_frames', { videoPath, outputDir, fps });
  }

  // ========== Progress Events ==========
  async listenExportProgress(callback: ExportProgressCallback): Promise<void> {
    if (this.progressListener) {
      this.progressListener();
    }
    this.progressListener = await listen<ExportProgress>('export-progress', (event) => {
      callback(event.payload);
    });
  }

  async cancelExport(exportId: string): Promise<void> {
    await invoke('cancel_export', { exportId });
  }

  // ========== Cleanup ==========
  destroy(): void {
    if (this.progressListener) {
      this.progressListener();
      this.progressListener = null;
    }
  }
}

// Singleton instance
let tauriService: TauriService | null = null;

export function getTauriService(): TauriService {
  return tauriService ??= new TauriService();
}

export default TauriService;
