/**
 * AI 模型类型（从 shared/types/ai.models.ts 统一导出）
 */
import type { Script } from '../../shared/types/script';
export type { AIModelType, AIModelInfo } from '../../shared/types/ai.models';
export { AI_MODEL_INFO } from '../../shared/types/ai.models';
import type { AIModelType as SharedAIModelType } from '../../shared/types/ai.models';

/**
 * AI 模型设置
 */
export interface AIModelSettings {
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
  apiVersion?: string;
}

/**
 * 脚本生成选项
 */
export interface ScriptGenerationOptions {
  style?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  purpose?: string;
}

/**
 * 存储的应用设置
 */
export interface AppSettings {
  autoSave: boolean;
  defaultAIModel?: SharedAIModelType;
  aiModelsSettings: Partial<Record<SharedAIModelType, AIModelSettings>>;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * 项目数据
 */
export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  status?: 'draft' | 'processing' | 'completed' | 'failed';
  videos?: VideoInfo[];
  scripts?: Script[];
  settings?: ProjectSettings;
  createdAt: string;
  updatedAt: string;
  metadata?: unknown;
  keyFrames?: string[];
  coverImage?: string;
  videoPath?: string;
  thumbnail?: string;
  novelMetadata?: unknown;
  storyboardComments?: unknown[];
  storyboardVersions?: unknown[];
  storyboardFrames?: unknown[];
  evaluationReport?: unknown;
  evaluationSummary?: unknown;
}

/**
 * 项目设置
 */
export interface ProjectSettings {
  videoQuality?: 'low' | 'medium' | 'high';
  outputFormat?: 'mp4' | 'webm' | 'gif';
  resolution?: '480p' | '720p' | '1080p' | '4k';
  frameRate?: number;
  audioCodec?: string;
  videoCodec?: string;
  subtitleEnabled?: boolean;
  subtitleStyle?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    outline?: boolean;
    outlineColor?: string;
    position?: 'top' | 'bottom' | 'center';
    alignment?: 'left' | 'center' | 'right';
  };
}

/**
 * 视频信息
 */
export interface VideoInfo {
  id: string;
  path?: string;
  name: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  format?: string;
  size?: number;
  thumbnail?: string;
  createdAt?: string;
}

/**
 * 视频元数据
 */
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec?: string;
  bitrate?: number;
}

// Re-export from shared for backward compatibility
export type { Script, ScriptSegment, ScriptMetadata } from '../../shared/types/script';

/**
 * 时间线
 */
export interface Timeline {
  segments: TimelineSegment[];
  duration: number;
}

export interface TimelineSegment {
  id: string;
  startTime: number;
  endTime: number;
  type: 'video' | 'audio' | 'text';
  data: unknown;
}

/**
 * 视频分析
 */
export interface VideoAnalysis {
  duration: number;
  scenes: SceneInfo[];
  keyFrames: string[];
  audio?: AudioInfo;
  keyMoments?: KeyMoment[];
}

export interface KeyMoment {
  time: number;
  description: string;
  type: 'action' | 'transition' | 'highlight';
}

export interface SceneInfo {
  startTime: number;
  endTime: number;
  description: string;
  keyFrame?: string;
}

export interface AudioInfo {
  hasAudio: boolean;
  language?: string;
  transcript?: string;
}
