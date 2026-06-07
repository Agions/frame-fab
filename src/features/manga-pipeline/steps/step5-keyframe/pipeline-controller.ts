/**
 * KeyframePipeline - 关键帧驱动生成流程
 *
 * 参考 deep-printfilm 的关键帧驱动方法：
 * 1. 生成首帧 (start frame)
 * 2. 生成尾帧 (end frame)
 * 3. 分析运动类型
 * 4. 帧间插值生成
 * 5. 合成视频
 */

import { StepInput, StepOutput } from '@/core/pipeline/step.interface';
import {
  generateImage,
  generateVideo,
  type ImageGenerationOptions,
  type VideoGenerationOptions,
} from '@/core/services/ai/image/image-generation.service';
import { logger } from '@/core/utils/logger';

import { BasePipelineController } from '../../base/BasePipelineController';
import type { DialogueSegment } from '../../types/dialogue';

export enum MotionType {
  FADE = 'fade', // 淡入淡出
  SLIDE = 'slide', // 滑动
  ZOOM = 'zoom', // 缩放
  PAN = 'pan', // 平移
  ROTATE = 'rotate', // 旋转
  CROSSFADE = 'crossfade', // 交叉淡入淡出
}

export enum CameraMovement {
  STATIC = 'static',
  TRACKING = 'tracking',
  DOLLY = 'dolly',
  PAN = 'pan',
  TILT = 'tilt',
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',
}

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

export interface KeyframePair {
  startFrame: GeneratedFrame;
  endFrame: GeneratedFrame;
  motionType: MotionType;
  cameraMovement?: CameraMovement;
  duration: number; // 秒
}

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
  dialogueSegments?: DialogueSegment[];
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

// 相机运动指南
export const CAMERA_MOVEMENT_GUIDES: Record<CameraMovement, string[]> = {
  [CameraMovement.STATIC]: ['固定镜头', '保持画面稳定'],
  [CameraMovement.TRACKING]: ['跟拍', '跟随角色移动'],
  [CameraMovement.DOLLY]: ['推拉镜头', '向前或向后移动'],
  [CameraMovement.PAN]: ['水平摇镜', '左或右横扫'],
  [CameraMovement.TILT]: ['垂直摇镜', '上或下移动'],
  [CameraMovement.ZOOM_IN]: ['推进', '放大主体'],
  [CameraMovement.ZOOM_OUT]: ['拉远', '缩小主体'],
};

// 运动类型建议
export const MOTION_TYPE_SUGGESTIONS: Record<MotionType, string[]> = {
  [MotionType.FADE]: ['场景切换', '时间流逝', '回忆'],
  [MotionType.SLIDE]: ['角色入场', '场景过渡'],
  [MotionType.ZOOM]: ['强调', '聚焦'],
  [MotionType.PAN]: ['环境展示', '跟随动作'],
  [MotionType.ROTATE]: ['旋转效果', '眩晕感'],
  [MotionType.CROSSFADE]: ['场景融合', '梦境效果'],
};

/**
 * 分析场景特征，推荐合适的运动类型
 */
export function suggestMotionType(sceneDescription: string, emotion?: string): MotionType {
  const desc = sceneDescription.toLowerCase();

  if (desc.includes('淡') || desc.includes('fade') || desc.includes('回忆')) {
    return MotionType.FADE;
  }
  if (desc.includes('入场') || desc.includes('enter') || desc.includes('进来')) {
    return MotionType.SLIDE;
  }
  if (desc.includes('放大') || desc.includes('zoom') || desc.includes('聚焦')) {
    return MotionType.ZOOM;
  }
  if (desc.includes('跟') || desc.includes('跟踪') || desc.includes('track')) {
    return MotionType.PAN;
  }
  if (desc.includes('旋转') || desc.includes('rotate') || desc.includes('spin')) {
    return MotionType.ROTATE;
  }
  if (desc.includes('融合') || desc.includes('梦幻') || desc.includes('dream')) {
    return MotionType.CROSSFADE;
  }

  // 根据情绪默认选择
  if (emotion === 'tense' || emotion === 'angry') {
    return MotionType.ZOOM;
  }
  if (emotion === 'sad') {
    return MotionType.FADE;
  }

  return MotionType.CROSSFADE;
}

/**
 * 估算关键帧场景总时长
 */
export function estimateSceneDuration(scene: KeyframeScene): number {
  return scene.keyframes.reduce((sum, kf) => sum + kf.duration, 0);
}

/**
 * 创建关键帧场景（并发生成首帧+尾帧）
 *
 * 优化点：
 * 1. 首帧和尾帧并发生成（不是串行等待）
 * 2. 支持传入角色参考图用于视频生成绑定
 */
export async function createKeyframeScene(
  scene: KeyframePipelineInput['scenes'][0],
  options: {
    frameCount?: number;
    defaultDuration?: number;
    style: string;
    aspectRatio: string;
    imageOptions?: Partial<ImageGenerationOptions>;
    /** 角色参考图（用于视频生成时绑定一致性） */
    characterReferences?: CharacterVideoReference[];
    /** 配音片段（用于唇同步关联） */
    dialogueSegments?: DialogueSegment[];
    signal?: AbortSignal;
  }
): Promise<KeyframeScene> {
  const {
    frameCount = 2,
    defaultDuration = 3,
    style,
    aspectRatio,
    imageOptions = {},
    characterReferences,
    dialogueSegments,
    signal,
  } = options;

  // 匹配配音片段，找到当前场景的 audioUrl
  const matchingSegment = dialogueSegments?.find((seg) => seg.sceneNumber === scene.sceneNumber);
  const audioUrl = matchingSegment?.audioUrl;

  // 并发生成首帧和尾帧（使用 Promise.allSettled 防止一个失败影响另一个）
  // 注意：prompt 在此处构建并传入，角色一致性约束通过 characterReferences 注入
  const startPrompt = buildFramePrompt(scene, 0, 'start', characterReferences);
  const endPrompt = buildFramePrompt(scene, 1, 'end', characterReferences);

  const [startFrameResult, endFrameResult] = await Promise.allSettled([
    generateImage(startPrompt, {
      model: (imageOptions.model as ImageGenerationOptions['model']) || 'seedream-5.0',
      size: '2K',
      style: style as ImageGenerationOptions['style'],
      ...imageOptions,
      signal,
    }),
    generateImage(endPrompt, {
      model: (imageOptions.model as ImageGenerationOptions['model']) || 'seedream-5.0',
      size: '2K',
      style: style as ImageGenerationOptions['style'],
      ...imageOptions,
      signal,
    }),
  ]).then((results) => {
    // 验证两个都成功
    const start = results[0];
    const end = results[1];
    if (start.status === 'rejected') {
      throw new Error(`首帧生成失败: ${start.reason}`);
    }
    if (end.status === 'rejected') {
      throw new Error(`尾帧生成失败: ${end.reason}`);
    }
    return [start.value, end.value] as [typeof start.value, typeof end.value];
  });

  // 构建带角色约束的帧 prompt（用于记录到结果中）
  const recordedStartPrompt = buildFramePrompt(scene, 0, 'start', characterReferences);
  const recordedEndPrompt = buildFramePrompt(scene, 1, 'end', characterReferences);

  return {
    sceneId: scene.sceneId,
    sceneNumber: scene.sceneNumber,
    description: scene.description,
    location: scene.location,
    keyframes: [
      {
        startFrame: {
          id: `${scene.sceneId}-kf-0`,
          imageUrl: startFrameResult.url,
          prompt: recordedStartPrompt,
          width: startFrameResult.width,
          height: startFrameResult.height,
          model: startFrameResult.model,
        },
        endFrame: {
          id: `${scene.sceneId}-kf-1`,
          imageUrl: endFrameResult.url,
          prompt: recordedEndPrompt,
          width: endFrameResult.width,
          height: endFrameResult.height,
          model: endFrameResult.model,
        },
        motionType: suggestMotionType(scene.description, scene.emotion),
        duration: defaultDuration,
      },
    ],
    totalDuration: defaultDuration,
    audioUrl,
  };
}

/**
 * 构建帧提示词（集成角色一致性约束）
 */
function buildFramePrompt(
  scene: KeyframePipelineInput['scenes'][0],
  frameIndex: number,
  frameType: 'start' | 'end',
  characterReferences?: CharacterVideoReference[]
): string {
  const basePrompt = `${scene.description}, ${scene.location}`;

  // 帧类型描述
  const frameHint =
    frameType === 'start'
      ? '起始画面, character in standing pose, stable composition'
      : 'ending frame, motion continues naturally from previous scene';

  // 角色一致性约束（注入真实 reference prompt）
  let charHint = '';
  if (characterReferences && characterReferences.length > 0) {
    // 找出该场景涉及的角色
    const sceneChars = characterReferences.filter((c) =>
      scene.description?.toLowerCase().includes(c.name.toLowerCase())
    );
    if (sceneChars.length > 0) {
      const charTokens = sceneChars.map((c) => `${c.name}: ${c.referencePrompt}`).join(' | ');
      charHint = `maintain consistent character appearance: ${charTokens}`;
    }
  }

  const parts = [basePrompt, frameHint, charHint, `第${frameIndex + 1}帧`].filter(Boolean);
  return parts.join(', ');
}

/**
 * 创建占位帧（实际生成时替换）
 */
function createPlaceholderFrame(id: string, style: string, aspectRatio: string): GeneratedFrame {
  const [w, h] = aspectRatio.split(':').map(Number);
  const width = 1024;
  const height = Math.round((1024 * h) / w);

  return {
    id,
    imageUrl: '', // 实际生成时填充
    prompt: '',
    width,
    height,
    duration: 3,
  };
}

/**
 * KeyframePipeline - 关键帧驱动流水线（并发生成版）
 *
 * 优化点：
 * 1. 多个场景并发生成（非串行等待）
 * 2. 首帧+尾帧并发生成
 * 3. 集成角色一致性约束到帧和视频生成
 */
export class KeyframePipeline extends BasePipelineController {
  id = 'keyframe-pipeline';
  name = 'Keyframe-Driven Generation';

  protected subSteps = ['分析场景', '生成关键帧', '分析运动', '合成视频'];

  protected async _doProcess(input: StepInput): Promise<StepOutput> {
    const {
      scenes,
      style = 'anime',
      aspectRatio = '16:9',
      characterReferences,
      dialogueSegments,
    } = input as StepInput & KeyframePipelineInput;

    this.updateProgress(0, '分析场景');

    // ========== 阶段1：并发生成所有场景的关键帧 ==========
    // 优化：使用 Promise.all 并行处理所有场景，而非串行等待
    const sceneCount = scenes.length;
    const progressBase = 0;

    const SEMAPHORE_CONCURRENCY = 3;
    let completedCount = 0;

    const semaphore = {
      count: 0,
      queue: [] as (() => void)[],
      async acquire() {
        if (this.count < SEMAPHORE_CONCURRENCY) {
          this.count++;
          return;
        }
        await new Promise<void>((resolve) => this.queue.push(resolve));
      },
      release() {
        this.count--;
        const next = this.queue.shift();
        if (next) {
          this.count++;
          next();
        }
      },
    };

    const keyframeScenePromises = scenes.map((scene, index) =>
      (async () => {
        await semaphore.acquire();
        try {
          const result = await createKeyframeScene(scene, {
            frameCount: 2,
            defaultDuration: 3,
            style,
            aspectRatio,
            imageOptions: { model: 'seedream-5.0' },
            characterReferences,
            dialogueSegments,
          });
          completedCount++;
          this.updateProgress(
            5 + (completedCount / sceneCount) * 35,
            `生成关键帧（${completedCount}/${sceneCount}）`
          );
          return result;
        } finally {
          semaphore.release();
        }
      })()
    );

    const keyframeSceneResults = await Promise.allSettled(keyframeScenePromises);

    // 检查是否有失败
    const failures = keyframeSceneResults
      .map((r, i) => (r.status === 'rejected' ? i : null))
      .filter((i): i is number => i !== null);

    if (failures.length > 0) {
      const msg = failures.map((i) => `场景${i + 1}失败`).join(', ');
      throw new Error(`关键帧生成部分失败: ${msg}`);
    }

    const keyframeScenes = keyframeSceneResults.map(
      (r) => (r as PromiseFulfilledResult<KeyframeScene>).value
    );

    // ========== 阶段2：分析运动类型 ==========
    this.updateProgress(42, '分析运动');
    keyframeScenes.forEach((scene) => {
      scene.keyframes.forEach((kf) => {
        kf.motionType = suggestMotionType(scene.description, undefined);
        kf.cameraMovement = CameraMovement.STATIC;
      });
    });

    // ========== 阶段3：并发生成视频片段 ==========
    this.updateProgress(45, '生成视频');

    const videoPromises = keyframeScenes.map((scene, i) =>
      Promise.all(
        scene.keyframes.map(async (kf) => {
          this.updateProgress(
            45 + ((i + 1) / keyframeScenes.length) * 45,
            `合成场景 ${i + 1} 视频`
          );

          const videoResult = await generateVideo(
            buildVideoPrompt(scene, kf, characterReferences),
            {
              model: 'seedance-2.0',
              duration: kf.duration,
              referenceImage: kf.startFrame.imageUrl,
              characterReferences: characterReferences,
              aspectRatio: aspectRatio as VideoGenerationOptions['aspectRatio'],
            }
          );

          kf.startFrame.imageUrl = videoResult.url || kf.startFrame.imageUrl;
          return videoResult;
        })
      )
    );

    await Promise.allSettled(videoPromises).then((results) => {
      // 收集失败信息但继续处理
      const failures = results
        .map((r, i) => (r.status === 'rejected' ? i : null))
        .filter((i): i is number => i !== null);

      if (failures.length > 0) {
        logger.warn(`[KeyframePipeline] ${failures.length} 个视频生成失败`);
      }
    });

    this.updateProgress(95, '后处理');

    const totalDuration = keyframeScenes.reduce((sum, scene) => sum + scene.totalDuration, 0);

    this.updateProgress(100, '完成');

    const result: KeyframePipelineResult = {
      keyframeScenes,
      totalDuration,
      metadata: {
        totalFrames: keyframeScenes.reduce((sum, s) => sum + s.keyframes.length * 2, 0),
        totalKeyframes: keyframeScenes.reduce((sum, s) => sum + s.keyframes.length, 0),
        estimatedVideoDuration: totalDuration,
        style,
        generatedAt: Date.now(),
      },
    };

    return { keyframePipeline: result } as StepOutput;
  }
}

/**
 * 构建视频生成提示词（集成角色一致性绑定）
 */
function buildVideoPrompt(
  scene: KeyframeScene,
  kf: KeyframePair,
  characterReferences?: CharacterVideoReference[]
): string {
  const motionHint: Record<MotionType, string> = {
    [MotionType.FADE]: 'fade in/out transition',
    [MotionType.SLIDE]: 'smooth sliding motion',
    [MotionType.ZOOM]: 'zoom effect',
    [MotionType.PAN]: 'pan camera movement',
    [MotionType.ROTATE]: 'rotate camera movement',
    [MotionType.CROSSFADE]: 'crossfade transition',
  };

  const parts: string[] = [
    scene.description,
    motionHint[kf.motionType],
    `camera ${scene.cameraMovement || CameraMovement.STATIC}`,
  ];

  // 注入角色约束（如果有）
  if (characterReferences && characterReferences.length > 0) {
    const charPrompts = characterReferences
      .map((c) => `${c.name}: ${c.referencePrompt}`)
      .join(' | ');
    parts.push(`maintain character consistency: ${charPrompts}`);
  }

  return parts.join(', ');
}
