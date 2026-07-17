/**
 * @deprecated Legacy types directory.
 *
 * Media types defined here have been migrated to canonical locations:
 * - Subtitle types → @/shared/types/video-composition-types
 * - Audio types → @/shared/types/audio.ts
 * - Video metadata → @/core/services/video/ffmpeg/types.ts
 *
 * New code should import from the canonical locations directly.
 * This shim will be removed in a future PR after all callers migrate.
 */

// ---------------------------------------------------------------------------
// 字幕类型（Subtitle）
// ---------------------------------------------------------------------------

/**
 * 渲染时用的扁平可选字段（FFmpeg / 合成管线用）。
 * 与 features/subtitle 的 SubtitleStyle (UI 编辑用, 全 required) 区别开。
 */
export interface SubtitleRenderStyle {
  font?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  position?: 'top' | 'center' | 'bottom';
  margin?: number;
}

export interface SubtitleItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  style?: SubtitleRenderStyle;
}

/** 字幕轨道（完整版，含 label / language） */
export interface SubtitleTrack {
  id: string;
  label?: string;
  language?: string;
  subtitles: SubtitleItem[];
}

/** 字幕文件格式（原 core/services/video/subtitle/types.ts） */
export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'txt';

/** 单条字幕（无 id 版本，兼容 FFmpeg/VideoCompositor） */
export type Subtitle = Omit<SubtitleItem, 'id'>;

// ---------------------------------------------------------------------------
// 合成类型（Composition）
// ---------------------------------------------------------------------------

export interface SceneEffect {
  type: 'fade_in' | 'fade_out' | 'zoom' | 'slide' | 'blur';
  duration: number;
  params?: Record<string, number | string>;
}

export interface CompositionScene {
  id: string;
  mediaPath: string;
  mediaType: 'video' | 'image';
  startTime: number;
  duration: number;
  volume?: number;
  effects?: SceneEffect[];
}

export interface CompositionOptions {
  format?: 'mp4' | 'webm' | 'mov' | 'avi';
  videoCodec?: 'h264' | 'h265' | 'vp9' | 'av1';
  audioCodec?: 'aac' | 'mp3' | 'opus' | 'flac';
  bitrate?: string;
  fps?: number;
  resolution?: { width: number; height: number };
  masterVolume?: number;
}

export interface CompositionResult {
  outputPath: string;
  outputBlob?: Blob;
  duration: number;
  width: number;
  height: number;
  fileSize: number;
}

export interface ExportProgress {
  progress: number;
  status: 'preparing' | 'loading' | 'processing' | 'encoding' | 'completed' | 'failed';
  message?: string;
  eta?: number;
}

export type ProgressCallback = (progress: ExportProgress) => void;

// ---------------------------------------------------------------------------
// 音频类型（Audio）
// ---------------------------------------------------------------------------

export interface VoiceTrack {
  id: string;
  name: string;
  filePath: string;
  fileUrl?: string;
  duration: number;
  startTime: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  type: 'dubbing' | 'voiceover';
}

export interface BackgroundMusic {
  id: string;
  name: string;
  filePath: string;
  fileUrl?: string;
  duration: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  startTime: number;
}

export interface SoundEffect {
  id: string;
  name: string;
  filePath: string;
  fileUrl?: string;
  duration: number;
  volume: number;
  startTime: number;
  category: string;
}

export interface AudioTrackConfig {
  voiceTracks: VoiceTrack[];
  backgroundMusic: BackgroundMusic | null;
  soundEffects: SoundEffect[];
  masterVolume: number;
  voiceVolume: number;
  musicVolume: number;
  effectVolume: number;
}

// ---------------------------------------------------------------------------
// 视频元信息（Video metadata）
// ---------------------------------------------------------------------------

/** 视频元信息（从浏览器 video 元素读取的粗粒度信息） */
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
}
