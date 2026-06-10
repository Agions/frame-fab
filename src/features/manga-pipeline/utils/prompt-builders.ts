/**
 * 核心提示词构建函数（5段式结构化模板）
 */
import type { StylePreset } from './style-presets';

export interface PromptContext {
  subject: string;
  appearance?: string;
  pose?: string;
  emotion?: string;
  outfit?: string;
  lighting?: string;
  camera?: string;
  atmosphere?: string;
  style: StylePreset;
}

/** 5段式角色提示词构建 */
export function buildCharacterPrompt(ctx: PromptContext): string {
  const parts: string[] = [];
  if (ctx.appearance) {
    parts.push(`${ctx.subject}, ${ctx.appearance}`);
  } else {
    parts.push(ctx.subject);
  }
  if (ctx.pose || ctx.emotion) {
    parts.push([ctx.pose, ctx.emotion].filter(Boolean).join(', '));
  }
  if (ctx.outfit && ctx.outfit !== ctx.appearance) {
    parts.push(ctx.outfit);
  }
  if (ctx.camera) {
    parts.push(ctx.camera);
  }
  if (ctx.lighting) {
    parts.push(ctx.lighting);
  }
  if (ctx.atmosphere) {
    parts.push(ctx.atmosphere);
  }
  parts.push(ctx.style.promptPrefix);
  return parts.join(', ');
}

export interface CharacterRefPrompt {
  name: string;
  appearance: string;
  outfit: string;
  pose: string;
  expression: string;
}

export interface ScenePromptContext {
  location?: string;
  timeOfDay?: string;
  weather?: string;
  characters?: string[];
  characterRefs?: CharacterRefPrompt[];
  sceneType?: string;
  emotion?: string;
  camera?: string;
  style: StylePreset;
  extraDescription?: string;
}

/** 5段式场景提示词构建 */
export function buildScenePrompt(ctx: ScenePromptContext): string {
  const parts: string[] = [];
  if (ctx.location || ctx.timeOfDay || ctx.weather) {
    parts.push([ctx.location, ctx.timeOfDay, ctx.weather].filter(Boolean).join(', '));
  }
  if (ctx.characterRefs && ctx.characterRefs.length > 0) {
    const charParts = ctx.characterRefs.map(
      (c) => `${c.name}: ${c.appearance}, ${c.outfit}, ${c.pose}, ${c.expression}`
    );
    parts.push(`consistent characters: ${charParts.join(' | ')}`);
  } else if (ctx.characters && ctx.characters.length > 0) {
    parts.push(`characters: ${ctx.characters.join(', ')}`);
  }
  if (ctx.sceneType) {
    parts.push(`scene: ${ctx.sceneType}`);
  }
  if (ctx.camera) {
    parts.push(`camera: ${ctx.camera}`);
  }
  if (ctx.emotion) {
    parts.push(`atmosphere: ${ctx.emotion}`);
  }
  if (ctx.extraDescription) {
    parts.push(ctx.extraDescription);
  }
  parts.push(ctx.style.promptPrefix);
  return parts.join(', ');
}

export interface VideoPromptContext {
  description: string;
  motion?: string;
  characterRefs?: CharacterRefPrompt[];
  cameraMovement?: string;
  duration?: number;
  style: StylePreset;
}

/** 视频生成提示词构建（含运动+角色一致性） */
export function buildVideoPrompt(ctx: VideoPromptContext): string {
  const parts: string[] = [];
  parts.push(ctx.description);
  if (ctx.characterRefs && ctx.characterRefs.length > 0) {
    const charParts = ctx.characterRefs.map((c) => `${c.name}: ${c.appearance}, ${c.pose}`);
    parts.push(`maintain character consistency: ${charParts.join(' | ')}`);
  }
  if (ctx.motion) {
    parts.push(`motion: ${ctx.motion}`);
  }
  if (ctx.cameraMovement) {
    parts.push(`camera movement: ${ctx.cameraMovement}`);
  }
  parts.push(ctx.style.promptPrefix);
  return parts.join(', ');
}
