/**
 * 分镜帧工厂
 * @module core/services/storyboard-frame-factory
 *
 * 集中处理"字段默认值 + uuid 兜底"逻辑。
 * 原实现里 `create` / `bulkCreate` / `generateFromScript` 三处各自手写了一遍
 * `{ id, title, sceneDescription, composition: '中心构图', cameraType: 'medium', dialogue: '', duration: 5, imageUrl }`，
 * 字段任一调整需同步三处。本模块消除该重复。
 */

import { v4 as uuidv4 } from 'uuid';

import {
  STORYBOARD_FRAME_DEFAULTS,
  type StoryboardFrame,
} from './storyboard-types';

/** 单帧构造输入：create / bulkCreate 接受的最小必填字段 */
export interface CreateStoryboardInput {
  title: string;
  sceneDescription: string;
  id?: string;
  composition?: string;
  cameraType?: string;
  dialogue?: string;
  duration?: number;
  imageUrl?: string;
}

/**
 * 把 create 风格的输入归一为完整的 StoryboardFrame
 * @param input 来自调用方的字段（必填项已校验）
 * @param index 分镜序号，用于生成默认 title
 */
export function createStoryboardFrame(
  input: CreateStoryboardInput,
  index?: number
): StoryboardFrame {
  return {
    id: input.id ?? uuidv4(),
    title: input.title ?? (typeof index === 'number' ? `分镜 ${index + 1}` : ''),
    sceneDescription: input.sceneDescription,
    composition: input.composition ?? STORYBOARD_FRAME_DEFAULTS.composition,
    cameraType: input.cameraType ?? STORYBOARD_FRAME_DEFAULTS.cameraType,
    dialogue: input.dialogue ?? STORYBOARD_FRAME_DEFAULTS.dialogue,
    duration: input.duration || STORYBOARD_FRAME_DEFAULTS.duration,
    imageUrl: input.imageUrl,
  };
}

/**
 * 把 AI 返回的 Partial<StoryboardFrame> 归一为完整帧
 *
 * 与原 `generateFromScript` 内的 `.map((f, i) => ({ id, title: f.title ?? \`分镜 ${i+1}\`, ... }))` 行为完全一致。
 * @param partial AI 返回的半成品帧（任意字段可能缺失）
 * @param index 序号，用于 title fallback
 */
export function coerceAiFrame(
  partial: Partial<StoryboardFrame>,
  index: number
): StoryboardFrame {
  return createStoryboardFrame(
    {
      id: partial.id,
      title: partial.title ?? `分镜 ${index + 1}`,
      sceneDescription: partial.sceneDescription ?? '场景描述',
      composition: partial.composition,
      cameraType: partial.cameraType,
      dialogue: partial.dialogue,
      duration: partial.duration,
      imageUrl: partial.imageUrl,
    },
    index
  );
}
