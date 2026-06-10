/**
 * Keyframe Pipeline 类型定义集中
 * ==============================
 * 7 个 interface + 2 个 enum。
 * 单一职责：纯类型声明，无运行时逻辑。
 */

/** 运动类型枚举 */
export enum MotionType {
  FADE = 'fade', // 淡入淡出
  SLIDE = 'slide', // 滑动
  ZOOM = 'zoom', // 缩放
  PAN = 'pan', // 平移
  ROTATE = 'rotate', // 旋转
  CROSSFADE = 'crossfade', // 交叉淡入淡出
}

/** 相机运动枚举 */
export enum CameraMovement {
  STATIC = 'static',
  TRACKING = 'tracking',
  DOLLY = 'dolly',
  PAN = 'pan',
  TILT = 'tilt',
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',
}

/** AI 生成的单帧 */
export interface GeneratedFrame {
  id: string;
  imageUrl: string;
  prompt: string;
  seed?: number;
  model?: string;
  width: number;
  height: number;
  duration?: number; // 帧持续时间（秒）
}

/** 一对首帧+尾帧 + 运动描述 */
export interface KeyframePair {
  startFrame: GeneratedFrame;
  endFrame: GeneratedFrame;
  motionType: MotionType;
  cameraMovement?: CameraMovement;
  duration: number; // 秒
}

/** 单个场景的关键帧数据 */
export interface KeyframeScene {
  sceneId: string;
  sceneNumber: number;
  description: string;
  location: string;
  keyframes: KeyframePair[];
  cameraMovement?: CameraMovement;
  totalDuration: number;
  /** 对应配音音频 URL（唇同步用） */
  audioUrl?: string;
}

/** KeyframePipeline 的输入格式 */
export interface KeyframePipelineInput {
  scenes: Array<{
    sceneId: string;
    sceneNumber: number;
    description: string;
    location: string;
    emotion?: string;
    /** 视频生成专用 prompt（包含角色约束） */
    videoPrompt?: string;
  }>;
  style?: 'anime' | 'comic' | 'realistic';
  aspectRatio?: '16:9' | '9:16' | '4:3' | '1:1';
  /** 角色参考图（用于视频生成绑定） */
  characterReferences?: CharacterVideoReference[];
  /** 配音片段（用于唇同步关联） */
  dialogueSegments?: import('../../types/dialogue').DialogueSegment[];
}

/** 角色视频参考（用于生成时绑定角色一致性） */
export interface CharacterVideoReference {
  characterId: string;
  name: string;
  /** 角色特征描述 token */
  referencePrompt: string;
  /** 三视图参考图 URL */
  referenceImageUrls?: {
    front?: string;
    side?: string;
    fullBody?: string;
  };
}

/** KeyframePipeline 的输出结果 */
export interface KeyframePipelineResult {
  keyframeScenes: KeyframeScene[];
  totalDuration: number;
  metadata: {
    totalFrames: number;
    totalKeyframes: number;
    estimatedVideoDuration: number;
    style: string;
    generatedAt: number;
    /** 视觉一致性评分（0-100），由 MangaPipeline 评估后填入 */
    visualConsistencyScore?: number;
  };
  videoFragments?: unknown[];
}
