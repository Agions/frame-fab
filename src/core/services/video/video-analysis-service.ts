/**
 * AI 视频分析服务 - Video Analysis Service
 *
 * 合并自原 9 个子模块（types / abort-registry / emotions / keyframes / objects /
 * scenes / stats / suggestions / summary），保持对外 API 完全兼容。
 *
 * @module core/services/video/video-analysis-service
 */

import { v4 as uuidv4 } from 'uuid';

import { aiService } from '@/core/services/ai/text/ai-service';
import { logger } from '@/core/utils/logger';
import { formatTime } from '@/shared/utils';
import type { EmotionAnalysis, Keyframe, ObjectDetection, VideoAnalysis, VideoInfo, VideoScene } from '@/shared/types';


/** 视频分析配置 */
export interface VideoAnalysisConfig {
  enableSceneDetection: boolean;
  enableObjectDetection: boolean;
  enableEmotionAnalysis: boolean;
  enableContentSummary: boolean;
  enableKeyframeExtraction: boolean;
  sceneThreshold: number;
  maxKeyframes: number;
}

/** 默认配置 */
export const DEFAULT_ANALYSIS_CONFIG: VideoAnalysisConfig = {
  enableSceneDetection: true,
  enableObjectDetection: true,
  enableEmotionAnalysis: true,
  enableContentSummary: true,
  enableKeyframeExtraction: true,
  sceneThreshold: 0.3,
  maxKeyframes: 10,
};

/** 预定义场景类型 */
export const SCENE_TYPES = [
  'intro',
  'dialogue',
  'action',
  'narration',
  'transition',
  'explanation',
  'demo',
  'conclusion',
  'background',
  'highlight',
] as const;

export type SceneType = (typeof SCENE_TYPES)[number];

/** 场景类型 → 中文描述字典 */
export const SCENE_DESCRIPTIONS: Record<SceneType, string> = {
  intro: '视频开场部分，通常用于介绍主题',
  dialogue: '对话场景，包含人物交流',
  action: '动作场景，展示具体行为',
  narration: '叙述场景，画外音或旁白',
  transition: '转场过渡',
  explanation: '讲解说明，解释内容',
  demo: '演示展示，操作示范',
  conclusion: '结尾总结，回顾要点',
  background: '背景画面',
  highlight: '精彩高光时刻',
};

/** 场景类型未知时的兜底文案 */
export const UNKNOWN_SCENE_DESCRIPTION = '未知场景类型';

/** 情感标签表 */
export const EMOTION_LABELS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fear'] as const;

/** 物体类别表 */
export const OBJECT_CATEGORIES = ['人物', '物品', '文字', '背景', '动物', '车辆'] as const;

/** 常见物体表 */
export const COMMON_OBJECTS = [
  '人物',
  '人脸',
  '文字',
  '手机',
  '电脑',
  '书本',
  '桌子',
  '椅子',
  '窗户',
  '门',
  '杯子',
  '衣服',
] as const;

/** 场景检测平均时长 */
export const SCENE_AVG_DURATION_SECONDS = 30;

/** 物体检测置信度随机生成 */
export function generateObjectConfidence(): number {
  return 0.5 + Math.random() * 0.5;
}

/** 物体检测随机 bbox 生成 */
export function generateRandomBbox(): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.random() * 0.8,
    y: Math.random() * 0.8,
    width: 0.1 + Math.random() * 0.3,
    height: 0.1 + Math.random() * 0.3,
  };
}

/** 场景检测置信度随机生成 */
export function generateSceneConfidence(): number {
  return 0.7 + Math.random() * 0.3;
}

/** 场景类型从数组中按 index 循环取样 */
export function pickSceneTypeByIndex(
  index: number,
  samples: readonly SceneType[] = SCENE_TYPES.slice(0, 5)
): SceneType {
  return samples[index % samples.length] as SceneType;
}

/**
 * 构造一个空 VideoAnalysis
 */
export function createEmptyAnalysis(videoInfo: VideoInfo, analysisId?: string): VideoAnalysis {
  return {
    id: analysisId ?? uuidv4(),
    videoId: videoInfo.id,
    scenes: [],
    keyframes: [],
    objects: [],
    emotions: [],
    summary: '',
    stats: {
      sceneCount: 0,
      objectCount: 0,
      avgSceneDuration: 0,
      sceneTypes: {},
      objectCategories: {},
      dominantEmotions: {},
    },
    createdAt: new Date().toISOString(),
  };
}


class AbortControllerRegistry {
  private controllers: Map<string, AbortController> = new Map();

  register(id: string): AbortController {
    const controller = new AbortController();
    this.controllers.set(id, controller);
    return controller;
  }

  cancel(id: string): boolean {
    const controller = this.controllers.get(id);
    if (!controller) return false;
    controller.abort();
    this.controllers.delete(id);
    return true;
  }

  get(id: string): AbortController | undefined {
    return this.controllers.get(id);
  }

  get size(): number {
    return this.controllers.size;
  }

  clear(): void {
    this.controllers.clear();
  }
}


/**
 * 均匀提取 count 个关键帧
 */
function extractKeyframes(videoInfo: VideoInfo, count: number = 10): Keyframe[] {
  const keyframes: Keyframe[] = [];
  const duration = videoInfo.duration!;
  const interval = duration / (count + 1);

  for (let i = 1; i <= count; i++) {
    const timestamp = Math.round(interval * i);
    keyframes.push({
      id: uuidv4(),
      timestamp,
      thumbnail: '',
      description: `第 ${i} 个关键帧于 ${formatTime(timestamp)}`,
    });
  }

  return keyframes;
}


/** 取场景类型描述 */
function getSceneDescription(type: SceneType): string {
  return SCENE_DESCRIPTIONS[type] ?? UNKNOWN_SCENE_DESCRIPTION;
}

/**
 * 场景检测（模拟实现）
 */
function detectScenes(videoInfo: VideoInfo, _threshold: number = 0.3): VideoScene[] {
  const scenes: VideoScene[] = [];
  const duration = videoInfo.duration;
  const avgSceneDuration = SCENE_AVG_DURATION_SECONDS;
  const sceneCount = Math.max(1, Math.floor(duration! / avgSceneDuration));

  const sceneTypeSamples: readonly SceneType[] = SCENE_TYPES.slice(0, 5);

  for (let i = 0; i < sceneCount; i++) {
    const startTime = Math.round(i * avgSceneDuration);
    const endTime = Math.min(Math.round((i + 1) * avgSceneDuration), duration!);
    const sceneType = pickSceneTypeByIndex(i, sceneTypeSamples);

    scenes.push({
      id: uuidv4(),
      startTime,
      endTime,
      thumbnail: '',
      description: getSceneDescription(sceneType),
      tags: [sceneType, `场景${i + 1}`],
      type: sceneType,
      confidence: generateSceneConfidence(),
    });
  }

  return scenes;
}


/** 从数组中随机选一个元素 */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 每场景随机检测 1-3 个物体 */
function pickObjectCountForScene(): number {
  return Math.floor(Math.random() * 3) + 1;
}

/**
 * 物体检测（模拟实现）
 */
function detectObjects(_videoInfo: VideoInfo, scenes: VideoScene[]): ObjectDetection[] {
  const detections: ObjectDetection[] = [];

  for (const scene of scenes) {
    const objectCount = pickObjectCountForScene();

    for (let i = 0; i < objectCount; i++) {
      const category = pickRandom(OBJECT_CATEGORIES);
      const label = pickRandom(COMMON_OBJECTS);

      detections.push({
        id: uuidv4(),
        sceneId: scene.id,
        category,
        label,
        confidence: generateObjectConfidence(),
        bbox: generateRandomBbox(),
        timestamp: scene.startTime,
      });
    }
  }

  return detections;
}


/** 情感数组归一化 */
function normalizeEmotionScores<T extends { score: number }>(emotions: T[]): T[] {
  const total = emotions.reduce((sum, e) => sum + e.score, 0);
  if (total > 0) {
    emotions.forEach((e) => (e.score = e.score / total));
  }
  return emotions;
}

/** 找出情感数组中 score 最高项 */
function findDominant<T extends { score: number }>(emotions: T[]): T {
  return emotions.reduce((max, e) => (e.score > max.score ? e : max), emotions[0]);
}

/**
 * 情感分析（模拟实现）
 */
function analyzeEmotions(_videoInfo: VideoInfo, scenes: VideoScene[]): EmotionAnalysis[] {
  const analyses: EmotionAnalysis[] = [];

  for (const scene of scenes) {
    const emotions = EMOTION_LABELS.map((emotion) => ({
      id: uuidv4(),
      name: emotion,
      score: Math.random(),
    }));

    normalizeEmotionScores(emotions);
    const dominant = findDominant(emotions);

    analyses.push({
      id: uuidv4(),
      sceneId: scene.id,
      timestamp: scene.startTime,
      emotions,
      dominant: dominant.name,
      intensity: dominant.score,
    });
  }

  return analyses;
}


/** 通用 Record<string, number> 计数器 */
function countBy<T>(items: T[], keyFn: (item: T) => string | undefined): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item) ?? 'unknown';
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

/**
 * 计算视频分析的完整统计信息
 */
function calculateStats(analysis: VideoAnalysis): VideoAnalysis['stats'] {
  const totalDuration = analysis.scenes.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
  const avgSceneDuration = analysis.scenes.length > 0 ? totalDuration / analysis.scenes.length : 0;

  return {
    sceneCount: analysis.scenes.length,
    objectCount: analysis.objects.length,
    avgSceneDuration,
    sceneTypes: countBy(analysis.scenes, (s) => s.type),
    objectCategories: countBy(analysis.objects, (o) => o.category),
    dominantEmotions: countBy(analysis.emotions, (e) => e.dominant),
  };
}


/** 单条建议生成器签名 */
type SuggestionBuilder = (analysis: VideoAnalysis) => string | null;

/** 缺失 intro 场景时建议 */
const suggestIntro: SuggestionBuilder = (analysis) => {
  const sceneTypes = Object.keys(analysis.stats?.sceneTypes ?? {});
  if (!sceneTypes.includes('intro')) {
    return '建议添加开场场景来吸引观众';
  }
  return null;
};

/** 缺失 conclusion 场景时建议 */
const suggestConclusion: SuggestionBuilder = (analysis) => {
  const sceneTypes = Object.keys(analysis.stats?.sceneTypes ?? {});
  if (!sceneTypes.includes('conclusion')) {
    return '建议添加结尾总结来强化内容';
  }
  return null;
};

/** 主导情感集中 neutral 时建议 */
const suggestEmotionVariety: SuggestionBuilder = (analysis) => {
  const emotions = analysis.stats?.dominantEmotions ?? {};
  if (emotions['neutral'] > 0.7) {
    return '情感比较单一，可以增加情感变化';
  }
  return null;
};

/** 物体类别过少时建议 */
const suggestMoreVisualElements: SuggestionBuilder = (analysis) => {
  if (Object.keys(analysis.stats?.objectCategories ?? {}).length < 3) {
    return '画面元素较少，可以增加更多视觉元素';
  }
  return null;
};

/** 全部建议生成器 */
const SUGGESTION_BUILDERS: SuggestionBuilder[] = [
  suggestIntro,
  suggestConclusion,
  suggestEmotionVariety,
  suggestMoreVisualElements,
];

/**
 * 基于视频分析结果生成改进建议
 */
function getSuggestions(analysis: VideoAnalysis): string[] {
  const suggestions: string[] = [];
  for (const builder of SUGGESTION_BUILDERS) {
    const suggestion = builder(analysis);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }
  return suggestions;
}


/** 按 category 分组物体 */
function groupObjectsByCategory(
  objects: ObjectDetection[]
): [string, ObjectDetection[]][] {
  const groups = new Map<string, ObjectDetection[]>();

  objects.forEach((obj) => {
    const list = groups.get(obj.category) ?? [];
    list.push(obj);
    groups.set(obj.category, list);
  });

  return Array.from(groups.entries());
}

/**
 * 构造 AI 摘要 prompt
 */
function buildSummaryPrompt(
  videoInfo: VideoInfo,
  analysis: Partial<VideoAnalysis>
): string {
  const sceneLines =
    analysis.scenes?.map((s) => `- ${s.type}: ${s.description}`).join('\n') || '无';

  const objectLines =
    groupObjectsByCategory(analysis.objects ?? [])
      .map(([cat, objs]) => `- ${cat}: ${objs.length}个`)
      .join('\n') || '无';

  return `请为以下视频生成一个简洁的内容摘要：

视频信息：
- 时长：${formatTime(videoInfo.duration!)}
- 分辨率：${videoInfo.width}x${videoInfo.height}
- 格式：${videoInfo.format}

场景分析：
${sceneLines}

物体识别：
${objectLines}

请生成 2-3 句话的内容摘要。`;
}

/**
 * 生成默认摘要（当 AI 失败时回退）
 */
function generateDefaultSummary(
  videoInfo: VideoInfo,
  analysis: Partial<VideoAnalysis>
): string {
  const sceneCount = analysis.scenes?.length ?? 0;
  const objectTypes = Object.keys(analysis.stats?.objectCategories ?? {});

  return (
    `视频时长 ${formatTime(videoInfo.duration!)}，分辨率 ${videoInfo.width}x${videoInfo.height}。` +
    `包含 ${sceneCount} 个场景${objectTypes.length > 0 ? `，主要元素包括 ${objectTypes.slice(0, 3).join('、')}` : ''}。`
  );
}

/**
 * AI 生成视频内容摘要（失败时回退到默认摘要）
 */
async function generateSummary(
  videoInfo: VideoInfo,
  analysis: Partial<VideoAnalysis>,
  ai: typeof aiService = aiService
): Promise<string> {
  try {
    return await ai.generate(buildSummaryPrompt(videoInfo, analysis), {
      model: 'gpt-3.5-turbo',
      provider: 'openai',
    });
  } catch (error) {
    logger.error('生成摘要失败:', error);
    return generateDefaultSummary(videoInfo, analysis);
  }
}


/**
 * AI 视频分析服务
 *
 * 内部维护：
 *   - abortRegistry: 跟踪所有进行中分析任务的 AbortController
 *
 * 子流程方法以类字段方式挂载，保持与原公共方法签名一致。
 */
class VideoAnalysisService {
  private abortRegistry = new AbortControllerRegistry();

  // ========== 子流程方法（类字段绑定，保持 API 兼容） ==========

  /** 均匀提取关键帧 */
  extractKeyframes = extractKeyframes;

  /** 场景检测 */
  detectScenes = detectScenes;

  /** 物体检测 */
  detectObjects = detectObjects;

  /** 情感分析 */
  analyzeEmotions = analyzeEmotions;

  /** AI 摘要（失败时回退到默认摘要） */
  generateSummary = generateSummary;

  // ========== 主流程编排 ==========

  /**
   * 完整的视频分析
   *
   * 编排顺序：关键帧 → 场景 → 物体 → 情感 → 摘要 → 统计
   */
  async analyzeVideo(
    videoInfo: VideoInfo,
    config: Partial<VideoAnalysisConfig> = {}
  ): Promise<VideoAnalysis> {
    const finalConfig = { ...DEFAULT_ANALYSIS_CONFIG, ...config };
    const result = createEmptyAnalysis(videoInfo);

    if (finalConfig.enableKeyframeExtraction) {
      result.keyframes = await this.extractKeyframes(videoInfo, finalConfig.maxKeyframes);
    }
    if (finalConfig.enableSceneDetection) {
      result.scenes = await this.detectScenes(videoInfo, finalConfig.sceneThreshold);
    }
    if (finalConfig.enableObjectDetection) {
      result.objects = await this.detectObjects(videoInfo, result.scenes);
    }
    if (finalConfig.enableEmotionAnalysis) {
      result.emotions = await this.analyzeEmotions(videoInfo, result.scenes);
    }
    if (finalConfig.enableContentSummary) {
      result.summary = await this.generateSummary(videoInfo, result, aiService);
    }
    result.stats = calculateStats(result);

    return result;
  }

  /**
   * 取消正在进行的分析
   */
  cancelAnalysis(analysisId: string): void {
    this.abortRegistry.cancel(analysisId);
  }

  /**
   * 获取视频分析改进建议
   */
  getSuggestions(analysis: VideoAnalysis): string[] {
    return getSuggestions(analysis);
  }
}


export const videoAnalysisService = new VideoAnalysisService();
export default videoAnalysisService;
