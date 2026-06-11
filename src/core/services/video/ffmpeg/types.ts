/**
 * FFmpeg.wasm 服务类型定义
 *
 * 从 @/shared/types/video-composition.types 重导出共享类型，
 * 仅保留 FFmpeg 专有类型（VideoMetadata, SubtitleTrack）。
 */

export type {
  Scene,
  SceneEffect,
  SubtitleStyle,
  Subtitle,
  BackgroundMusic,
  CompositionOptions,
  CompositionResult,
  ExportProgress,
  ProgressCallback,
} from '@/shared/types/video-composition.types';

/** 字幕轨道（一个轨道含多条字幕） */
export interface SubtitleTrack {
  id: string;
  subtitles: import('@/shared/types/video-composition.types').Subtitle[];
}

/** 视频元信息（从浏览器 video 元素读取的粗粒度信息） */
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
}
