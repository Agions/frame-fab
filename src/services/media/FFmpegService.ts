/**
 * FFmpeg Service Facade
 * =====================
 * 服务层门面：将 FFmpeg.wasm 视频合成/处理 API 重新导出到
 * `src/services/media/` 命名空间。
 *
 * 封装内容（原 `@/core/services/video/ffmpeg-wasm-service`）：
 *   - ffmpegWasmService：统一的 ffmpeg.wasm 服务对象（兼容历史用法）。
 *   - 核心 FFmpeg 函数：loadFFmpeg / isFFmpegWasmAvailable / composeVideoWithFFmpeg
 *     / addSubtitlesWithFFmpeg / addBackgroundMusicWithFFmpeg /
 *     exportVideoWithFFmpeg / concatenateVideosWithFFmpeg / getVideoInfoFromBlob。
 *   - 相关类型：CompositionScene / CompositionOptions / CompositionResult 等。
 *
 * 本文件仅做 re-export，不含任何业务逻辑。旧路径
 * `@/core/services/video/ffmpeg-wasm-service` 与 `@/core/services` 仍可
 * 正常导入 —— 本 facade 是为未来渐进式迁移建立的 `services/` 层入口。
 *
 * @example
 * ```ts
 * // 新代码（推荐，面向 services/ 层）
 * import {
 *   ffmpegWasmService,
 *   loadFFmpeg,
 *   composeVideoWithFFmpeg,
 *   type CompositionScene,
 *   type CompositionResult,
 * } from '@/services/media/FFmpegService';
 *
 * // 旧代码（仍然有效）
 * import { ffmpegWasmService } from '@/core/services/video/ffmpeg-wasm-service';
 * import { ffmpegWasmService } from '@/core/services';
 * ```
 */

// ─────────── FFmpeg.wasm 服务对象 ───────────

export {
  ffmpegWasmService,
  loadFFmpeg,
  isFFmpegWasmAvailable,
} from '@/core/services/video/ffmpeg-wasm-service';

// 默认导出服务对象（兼容 `import ffmpegWasmService from '...'`）
export { default } from '@/core/services/video/ffmpeg-wasm-service';

// ─────────── FFmpeg 核心合成/处理函数 ───────────

export {
  composeVideoWithFFmpeg,
  getVideoInfoFromBlob,
  addBackgroundMusicWithFFmpeg,
  addSubtitlesWithFFmpeg,
  concatenateVideosWithFFmpeg,
  exportVideoWithFFmpeg,
  getFFmpegInstance,
} from '@/core/services/video/ffmpeg-wasm-service';

// ─────────── FFmpeg / 合成相关类型 ───────────

export type {
  CompositionScene,
  CompositionOptions,
  CompositionResult,
  CompositionResult as FFmpegCompositionResult,
  ExportProgress,
  ProgressCallback,
  VideoMetadata,
  SceneEffect,
  Subtitle,
  SubtitleStyle,
  SubtitleTrack,
  BackgroundMusic,
} from '@/core/services/video/ffmpeg-wasm-service';
