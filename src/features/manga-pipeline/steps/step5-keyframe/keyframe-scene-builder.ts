/**
 * Keyframe 场景创建器
 * ==================
 * createKeyframeScene：并发生成首帧+尾帧，组装成 KeyframeScene。
 * createPlaceholderFrame：占位帧（实际生成时替换）。
 * 单一职责：帧生成编排，无流水线编排。
 */
import {
  generateImage,
  type ImageGenerationOptions,
} from '@/core/services/ai/image/image-generation.service';

import type { DialogueSegment } from '../../types/dialogue';

import {
  suggestMotionType,
  DEFAULT_KEYFRAME_DURATION,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_FRAMES_PER_SCENE,
} from './keyframe-config';
import { buildFramePrompt } from './keyframe-prompt-builder';
import type {
  KeyframeScene,
  KeyframePipelineInput,
  CharacterVideoReference,
  GeneratedFrame,
} from './keyframe-types';

/**
 * 创建关键帧场景（并发生成首帧+尾帧）
 *
 * 优化点：
 * 1. 首帧和尾帧并发生成（不是串行等待）
 * 2. 支持传入角色参考图用于视频生成绑定
 * 3. 匹配配音片段，找到当前场景的 audioUrl
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
    frameCount = DEFAULT_FRAMES_PER_SCENE,
    defaultDuration = DEFAULT_KEYFRAME_DURATION,
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
  const startPrompt = buildFramePrompt(scene, 0, 'start', characterReferences);
  const endPrompt = buildFramePrompt(scene, 1, 'end', characterReferences);

  const [startFrameResult, endFrameResult] = await Promise.allSettled([
    generateImage(startPrompt, {
      model: (imageOptions.model as ImageGenerationOptions['model']) || DEFAULT_IMAGE_MODEL,
      size: '2K',
      style: style as ImageGenerationOptions['style'],
      ...imageOptions,
      signal,
    }),
    generateImage(endPrompt, {
      model: (imageOptions.model as ImageGenerationOptions['model']) || DEFAULT_IMAGE_MODEL,
      size: '2K',
      style: style as ImageGenerationOptions['style'],
      ...imageOptions,
      signal,
    }),
  ]).then((results) => {
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
 * 创建占位帧（实际生成时替换）
 */
export function createPlaceholderFrame(
  id: string,
  style: string,
  aspectRatio: string
): GeneratedFrame {
  const [w, h] = aspectRatio.split(':').map(Number);
  const width = 1024;
  const height = Math.round((1024 * h) / w);

  return {
    id,
    imageUrl: '', // 实际生成时填充
    prompt: '',
    width,
    height,
    duration: DEFAULT_KEYFRAME_DURATION,
  };
}
