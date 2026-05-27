/**
 * Format Plugins — 视频格式插件
 * 示例：展示如何编写格式插件并注册到 PluginHost
 */

import type {
  IFormatPlugin,
  ExportOptions,
  ValidationResult,
  Frame,
  AudioTrack,
} from '@/plugins/types/plugin.types';
import { logger } from '@/core/utils/logger';

/**
 * MP4 Format Plugin — 使用 H.264 编码的 MP4 格式
 */
export const mp4FormatPlugin: IFormatPlugin = {
  id: 'format.mp4',
  name: 'MP4 Video',
  extensions: ['.mp4'],
  mimeTypes: ['video/mp4'],

  encodingOptions: {
    codec: 'libx264',
    bitrateKbps: 8000,
    fps: 30,
    resolution: { width: 1920, height: 1080 },
    container: 'mp4',
  },

  async export(frames: Frame[], audio: AudioTrack | null, options: ExportOptions): Promise<Blob> {
    const qualityMultiplier = {
      low: 0.5,
      medium: 0.75,
      high: 1.0,
      ultra: 1.5,
    }[options.quality];

    const bitrate = Math.round(this.encodingOptions.bitrateKbps * qualityMultiplier);
    logger.info(`[Mp4Format] Exporting ${frames.length} frames at ${bitrate}kbps, quality: ${options.quality}`);

    // Implementation would use ffmpeg.wasm or Tauri backend
    // For now, return empty blob as placeholder
    return new Blob([], { type: 'video/mp4' });
  },

  estimateSize(frames: Frame[], audioDurationSec: number): number {
    const videoDurationSec = frames.reduce((sum, f) => sum + f.duration, 0);
    const videoBytes =
      (this.encodingOptions.bitrateKbps * 1000 / 8) * videoDurationSec;
    const audioBytes = audioDurationSec * 128 * 1000 / 8; // Assume 128kbps audio
    return Math.round(videoBytes + audioBytes);
  },

  validateOptions(options: ExportOptions): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (options.quality === 'ultra' && this.encodingOptions.bitrateKbps > 20000) {
      warnings.push('Ultra quality may result in very large file sizes');
    }

    if (!options.includeAudio && frames.length > 0) {
      warnings.push('No audio track will be included in export');
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined, warnings: warnings.length > 0 ? warnings : undefined };
  },
};

/**
 * WebM Format Plugin — 使用 VP9 编码的 WebM 格式
 */
export const webmFormatPlugin: IFormatPlugin = {
  id: 'format.webm',
  name: 'WebM Video',
  extensions: ['.webm'],
  mimeTypes: ['video/webm'],

  encodingOptions: {
    codec: 'libvpx-vp9',
    bitrateKbps: 6000,
    fps: 30,
    resolution: { width: 1920, height: 1080 },
    container: 'webm',
  },

  async export(frames: Frame[], audio: AudioTrack | null, options: ExportOptions): Promise<Blob> {
    logger.info(`[WebMFormat] Exporting ${frames.length} frames, VP9 codec`);
    return new Blob([], { type: 'video/webm' });
  },

  estimateSize(frames: Frame[], audioDurationSec: number): number {
    const videoDurationSec = frames.reduce((sum, f) => sum + f.duration, 0);
    const videoBytes = (this.encodingOptions.bitrateKbps * 1000 / 8) * videoDurationSec;
    return Math.round(videoBytes + audioDurationSec * 128 * 1000 / 8);
  },

  validateOptions(options: ExportOptions): ValidationResult {
    return { valid: true };
  },
};

/**
 * GIF Format Plugin — 动画 GIF 格式（适用于短循环内容）
 */
export const gifFormatPlugin: IFormatPlugin = {
  id: 'format.gif',
  name: 'Animated GIF',
  extensions: ['.gif'],
  mimeTypes: ['image/gif'],

  encodingOptions: {
    codec: 'gif',
    bitrateKbps: 0, // GIF doesn't use bitrate
    fps: 15,
    resolution: { width: 480, height: 270 },
    container: 'gif',
  },

  async export(frames: Frame[], audio: AudioTrack | null, options: ExportOptions): Promise<Blob> {
    logger.info(`[GifFormat] Exporting ${frames.length} frames as GIF`);
    // GIF export would use a library like gif.js
    return new Blob([], { type: 'image/gif' });
  },

  estimateSize(frames: Frame[], audioDurationSec: number): number {
    // Rough estimation for GIF size
    const avgFrameSize = this.encodingOptions.resolution.width * this.encodingOptions.resolution.height / 10;
    return Math.round(avgFrameSize * frames.length);
  },

  validateOptions(options: ExportOptions): ValidationResult {
    const warnings: string[] = [];
    if (frames.length > 100) {
      warnings.push('GIF with more than 100 frames may have compatibility issues');
    }
    return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
  },
};

// ========== Format Plugin Registration ==========

import { pluginHost } from '@/plugins/plugin-host';

/**
 * 自动注册所有内置格式插件
 */
export function registerBuiltinFormatPlugins(): void {
  const plugins = [mp4FormatPlugin, webmFormatPlugin, gifFormatPlugin];
  for (const plugin of plugins) {
    pluginHost.registerFormat(plugin);
  }
  logger.info(`[FormatPlugins] Registered ${plugins.length} builtin format plugins`);
}