/**
 * Plugin Types — 插件系统核心接口
 * 遵循开闭原则：新增风格/格式只需编写插件文件并注册
 */

/** 风格参数 */
export interface StyleParams {
  intensity?: number;           // 0-1，风格强度
  colorScheme?: string;         // 配色方案
  lineStyle?: 'clean' | 'sketchy' | 'bold';
  [key: string]: unknown;
}

/** 导出选项 */
export interface ExportOptions {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  includeAudio: boolean;
  startTime?: number;
  endTime?: number;
  format?: string;
}

/** 编码选项 */
export interface EncodingOptions {
  codec: string;
  bitrateKbps: number;
  fps: number;
  resolution: { width: number; height: number };
  container: string;
}

/** 验证结果 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * IStylePlugin — 漫画风格插件接口
 * 新增一种风格只需编写一个插件文件并注册，无需修改核心流程
 */
export interface IStylePlugin {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** 优先级（数字越小优先级越高） */
  readonly priority: number;
  readonly configurable: boolean;

  /** 生成风格化的 prompt 后缀 */
  applyStyle(basePrompt: string, params?: StyleParams): string;

  /** 验证 prompt 是否符合此风格（返回 0-1 匹配度） */
  matches(prompt: string): number;

  /** 获取风格特定的质量门控阈值（可选） */
  getQualityThresholds?(): Partial<QualityGateThresholds>;
}

/**
 * WithDefaults — 为 IStylePlugin 提供可选方法默认实现
 */
export function withStyleDefaults(plugin: IStylePlugin): IStylePlugin {
  return {
    ...plugin,
    getQualityThresholds: plugin.getQualityThresholds ?? (() => ({})),
  };
}

export interface QualityGateThresholds {
  minFrameCount: number;
  minSceneCoverage: number;
  minRenderedCoverage: number;
  maxFrameDurationSec: number;
  minConsistency: number;
  minPacing: number;
  minReadability: number;
  minCostScore: number;
  minOverall: number;
  requireEvaluationSummary: boolean;
}

/**
 * IFormatPlugin — 视频格式插件接口
 * 新增一种格式只需编写一个插件文件并注册，无需修改核心流程
 */
export interface IFormatPlugin {
  readonly id: string;
  readonly name: string;
  readonly extensions: string[];
  readonly mimeTypes: string[];
  readonly encodingOptions: EncodingOptions;

  /** 导出视频 */
  export(
    frames: Frame[],
    audio: AudioTrack | null,
    options: ExportOptions
  ): Promise<Blob>;

  /** 获取文件大小估算（字节） */
  estimateSize(frames: Frame[], audioDurationSec: number): number;

  /** 验证导出选项 */
  validateOptions(options: ExportOptions): ValidationResult;
}

export interface Frame {
  id: string;
  imageUrl: string;
  timestamp: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface AudioTrack {
  id: string;
  url: string;
  duration: number;
  startTime?: number;
}