import { ScriptScene } from '../../step1-script-generation/types/script';

export interface SceneDescription {
  sceneId: string;
  sceneNumber: number;
  prompt: string;          // AI 绘图 prompt
  negativePrompt: string;   // 反向 prompt
  styleHint: string;       // 风格标签
  aspectRatio: '16:9' | '9:16' | '4:3' | '1:1';
  duration: number;         // 秒
}

export interface StylePreset {
  name: string;
  promptPrefix: string;
  negativePrompt: string;
  aspectRatio: SceneDescription['aspectRatio'];
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
  anime: {
    name: '动漫风格',
    promptPrefix: 'anime style, vibrant colors, detailed illustration, high quality',
    negativePrompt: 'realistic, photo, 3d render, low quality, blurry',
    aspectRatio: '16:9',
  },
  comic: {
    name: '漫画风格',
    promptPrefix: 'comic style, panel layout, bold lines, halftone dots',
    negativePrompt: 'realistic, photo, watercolor, blurry',
    aspectRatio: '16:9',
  },
  sketch: {
    name: '素描风格',
    promptPrefix: 'pencil sketch, black and white, detailed linework',
    negativePrompt: 'color, painting, digital art',
    aspectRatio: '4:3',
  },
  default: {
    name: '默认风格',
    promptPrefix: 'digital illustration, vibrant, detailed, high quality',
    negativePrompt: 'low quality, blurry, amateur',
    aspectRatio: '16:9',
  },
};

export function generateSceneDescription(
  scene: ScriptScene,
  style: string = 'default'
): SceneDescription {
  const preset = STYLE_PRESETS[style] || STYLE_PRESETS['default'];

  // 构建 AI 绘图 prompt
  const promptParts: string[] = [];

  // 场景地点
  if (scene.location) {
    promptParts.push(`location: ${scene.location}`);
  }

  // 时间
  promptParts.push(`time: ${scene.timeOfDay}`);

  // 天气（如果有）
  if (scene.weather) {
    promptParts.push(`weather: ${scene.weather}`);
  }

  // 人物描述
  if (scene.characters.length > 0) {
    promptParts.push(`characters: ${scene.characters.join(', ')}`);
  }

  // 场景类型
  promptParts.push(`scene type: ${scene.type}`);

  // 情感氛围
  const emotionPrompts = getEmotionPrompts(scene.emotion);
  promptParts.push(...emotionPrompts);

  // 运镜
  promptParts.push(`camera: ${scene.cameraHint} shot`);

  // 合并 prompt
  const prompt = `${preset.promptPrefix}, ${promptParts.join(', ')}, ${scene.content.slice(0, 100)}`;

  // 估算时长（基于内容长度和场景类型）
  const duration = estimateDuration(scene);

  return {
    sceneId: scene.id,
    sceneNumber: scene.sceneNumber,
    prompt,
    negativePrompt: preset.negativePrompt,
    styleHint: preset.name,
    aspectRatio: preset.aspectRatio,
    duration,
  };
}

function getEmotionPrompts(emotion: string): string[] {
  const emotionMap: Record<string, string[]> = {
    tense: ['dark atmosphere', 'suspenseful lighting', 'dynamic tension'],
    angry: ['red tones', 'harsh lighting', 'dramatic shadows'],
    sad: ['blue tones', 'soft lighting', 'melancholic mood'],
    happy: ['bright colors', 'warm lighting', 'cheerful atmosphere'],
    surprising: ['dynamic composition', 'dramatic lighting', 'unexpected angle'],
    neutral: ['balanced lighting', 'natural colors', 'calm atmosphere'],
  };
  return emotionMap[emotion] || emotionMap['neutral'];
}

function estimateDuration(scene: ScriptScene): number {
  // 基于场景类型和内容长度估算
  const baseDuration: Record<string, number> = {
    '对话': 8,
    '动作': 12,
    '追逐': 15,
    '对峙': 10,
    '情感': 10,
    '独白': 6,
  };
  const base = baseDuration[scene.type] || 8;
  // 内容越长，时长越长（最多加 5 秒）
  const extra = Math.min(Math.floor(scene.content.length / 50) * 1, 5);
  return base + extra;
}
