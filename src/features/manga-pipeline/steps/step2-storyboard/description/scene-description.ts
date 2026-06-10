/**
 * 场景描述生成（集成角色约束 + 样式预设）
 */
import {
  buildScenePrompt,
  buildVideoPrompt,
  type CharacterRefPrompt,
  ANIME_STYLE,
  COMIC_STYLE,
  SKETCH_STYLE,
} from '../../../utils/prompt-template';

import type { EnhancedCharacterConstraint } from './char-constraints';
import { getEmotionKeyword, estimateDuration, getStylePreset } from './style-utils';

export interface SceneDescription {
  sceneId: string;
  sceneNumber: number;
  prompt: string;
  negativePrompt: string;
  styleHint: string;
  aspectRatio: '16:9' | '9:16' | '4:3' | '1:1';
  duration: number;
  characterConstraints?: EnhancedCharacterConstraint[];
  location?: string;
  emotion?: string;
  videoPrompt?: string;
}

export interface StylePreset {
  name: string;
  promptPrefix: string;
  negativePrompt: string;
}

export const LEGACY_STYLE_PRESETS: Record<string, StylePreset> = {
  anime: {
    name: '动漫风格',
    promptPrefix: 'anime style, vibrant colors, detailed illustration, high quality',
    negativePrompt: 'realistic, photo, 3d render, low quality, blurry',
  },
  comic: {
    name: '漫画风格',
    promptPrefix: 'comic style, panel layout, bold lines, halftone dots',
    negativePrompt: 'realistic, photo, watercolor, blurry',
  },
  sketch: {
    name: '素描风格',
    promptPrefix: 'pencil sketch, black and white, detailed linework',
    negativePrompt: 'color, painting, digital art',
  },
  default: {
    name: '默认风格',
    promptPrefix: 'digital illustration, vibrant, detailed, high quality',
    negativePrompt: 'low quality, blurry, amateur',
  },
};

/** 生成场景描述（含视频 prompt） */
export function generateSceneDescription(
  scene: {
    id: string;
    sceneNumber: number;
    location?: string;
    timeOfDay: string;
    weather?: string;
    characters: string[];
    type: string;
    emotion?: string;
    cameraHint?: string;
    content: string;
  },
  style: string = 'default',
  characterConstraints?: EnhancedCharacterConstraint[]
): SceneDescription {
  const preset = LEGACY_STYLE_PRESETS[style] || LEGACY_STYLE_PRESETS['default'];
  const ctxStyle =
    style === 'anime'
      ? ANIME_STYLE
      : style === 'comic'
        ? COMIC_STYLE
        : style === 'sketch'
          ? SKETCH_STYLE
          : { ...preset, lightingPresets: [], cameraHints: [] };

  const charRefs: CharacterRefPrompt[] | undefined = characterConstraints
    ?.filter((c) =>
      scene.characters.some(
        (n) => n.toLowerCase() === c.name.toLowerCase() || n.includes(c.name) || c.name.includes(n)
      )
    )
    .map((c) => ({
      name: c.name,
      appearance: c.appearance,
      outfit: c.outfit,
      pose: c.pose,
      expression: c.expression,
    }));

  const prompt = buildScenePrompt({
    location: scene.location,
    timeOfDay: scene.timeOfDay,
    weather: scene.weather,
    characterRefs: charRefs,
    sceneType: scene.type,
    emotion: getEmotionKeyword(scene.emotion),
    camera: scene.cameraHint ? `${scene.cameraHint} shot` : undefined,
    style: ctxStyle,
    extraDescription: scene.content.slice(0, 80),
  });

  const videoPrompt = buildVideoPrompt({
    description: prompt,
    characterRefs: charRefs,
    cameraMovement: scene.cameraHint,
    style: ctxStyle,
  });

  return {
    sceneId: scene.id,
    sceneNumber: scene.sceneNumber,
    prompt,
    negativePrompt: preset.negativePrompt,
    styleHint: preset.name,
    aspectRatio: '16:9',
    duration: estimateDuration(scene.type, scene.content.length),
    characterConstraints,
    location: scene.location,
    emotion: scene.emotion,
    videoPrompt,
  };
}
