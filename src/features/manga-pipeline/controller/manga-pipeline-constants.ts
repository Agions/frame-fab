/**
 * Manga Pipeline 常量集中
 * =======================
 * 把分散在 controller 文件中的 magic number + 进度权重表 + 子步骤标签全部命名。
 * 单一职责：常量字典。
 */
import { MangaPipelineStep } from './manga-pipeline-types';

/**
 * 各步骤在"整体进度 0-100"中的占比区间
 * 形如 { [step]: [startPercent, endPercent] }
 * 用于把单步进度 (0-100) 线性映射到整体进度。
 */
export const STEP_PROGRESS_WEIGHTS: Record<MangaPipelineStep, [number, number]> = {
  [MangaPipelineStep.SCRIPT]: [0, 20],
  [MangaPipelineStep.STORYBOARD]: [20, 35],
  [MangaPipelineStep.MATERIAL]: [35, 55],
  [MangaPipelineStep.VOICE]: [55, 75],
  [MangaPipelineStep.KEYFRAME]: [75, 100],
};

/** 11 步子步骤标签 (供 UI 进度条文字显示) */
export const SUB_STEP_LABELS = [
  '解析文本',
  '分析叙事结构',
  '生成角色卡片',
  '生成场景',
  '整合剧本',
  '质量评估',
  '生成分镜',
  '匹配素材',
  '合成语音',
  '生成关键帧',
  '合成视频',
] as const;

/** 唇形同步：批量并发上限 (防止 API 过载) */
export const LIP_SYNC_CONCURRENCY = 3;

/** 唇形同步：轮询最大次数 (2s × 30 = 60s) */
export const LIP_SYNC_POLL_MAX_ATTEMPTS = 30;

/** 唇形同步：轮询间隔 (毫秒) */
export const LIP_SYNC_POLL_INTERVAL_MS = 2000;

/** 唇形同步：占 KEYFRAME 步的进度区间 60-80% */
export const LIP_SYNC_PROGRESS_START = 60;
export const LIP_SYNC_PROGRESS_END = 80;

/** KEYFRAME 步内的进度分配 (唇同步 60-80%, 视频合成 80-100%) */
export const KEYFRAME_STEP_LIP_SYNC_RANGE: [number, number] = [
  LIP_SYNC_PROGRESS_START,
  LIP_SYNC_PROGRESS_END,
];

/** 默认风格 (用户没传 style 时) */
export const DEFAULT_MANGA_STYLE = 'anime';

/** 默认画面比例 */
export const DEFAULT_KEYFRAME_ASPECT_RATIO = '16:9';

/** 进度事件结束标识 */
export const PROGRESS_COMPLETE = 100;
