/**
 * 结构化提示词模板 - 5段式模板
 * 
 * 行业最佳实践（参考即梦/Seedance/Midjourney）：
 * [主体描述] + [动作/情绪] + [镜头类型] + [光线/氛围] + [风格]
 * 
 * 例如：
 * "青衣女侠站在竹林中，衣袂飘扬，仰头长笑，仰拍中景，逆光，金粉粒子飘散，水墨国风写意风格"
 */

// ========== 风格预设 ==========

export interface StylePreset {
  name: string;
  promptPrefix: string;       // 风格前缀
  negativePrompt: string;      // 反向提示词
  lightingPresets: string[];   // 光线预设
  cameraHints: string[];       // 镜头预设
}

export const ANIME_STYLE: StylePreset = {
  name: 'anime',
  promptPrefix: 'anime style, vibrant colors, detailed illustration, high quality, cel shading',
  negativePrompt: 'realistic, photo, 3d render, low quality, blurry, deformed, amateur',
  lightingPresets: ['golden hour lighting', 'soft natural light', 'dramatic backlight', 'studio lighting'],
  cameraHints: ['medium shot', 'close-up', 'wide shot', 'over-the-shoulder'],
};

export const COMIC_STYLE: StylePreset = {
  name: 'comic',
  promptPrefix: 'digital art style, comic style, bold lines, halftone dots, dynamic composition, vibrant',
  negativePrompt: 'realistic, photo, watercolor, blurry, amateur, photography',
  lightingPresets: ['high contrast', 'dramatic spotlight', 'flat lighting'],
  cameraHints: ['dynamic angle', 'low angle', 'bird eye view'],
};

export const SKETCH_STYLE: StylePreset = {
  name: 'sketch',
  promptPrefix: 'pencil sketch, black and white, detailed linework, artistic',
  negativePrompt: 'color, painting, digital art, blurry',
  lightingPresets: ['chiaroscuro', 'single source light'],
  cameraHints: ['portrait', 'full body shot'],
};

export const STYLE_MAP: Record<string, StylePreset> = {
  anime: ANIME_STYLE,
  comic: COMIC_STYLE,
  sketch: SKETCH_STYLE,
};

// ========== 角色三视图模板 ==========

export interface CharacterView {
  angle: 'front' | 'side' | 'full-body';
  prompt: string;
  description: string;  // 用于参考说明
}

/**
 * 生成角色三视图提示词（解决角色一致性核心问题）
 * 
 * 三视图是角色设计标准，用于：
 * 1. 建立角色基础形象供 AI 学习
 * 2. 后续视频生成时通过 cref/cw 绑定角色
 * 3. 确保跨场景角色外观一致
 */
export function buildCharacterReferencePrompts(
  characterName: string,
  appearance: string,
  outfit: string,
  style: string = 'anime'
): CharacterView[] {
  const preset = STYLE_MAP[style] || ANIME_STYLE;
  
  return [
    {
      angle: 'front',
      description: '正面标准姿态',
      prompt: buildCharacterPrompt({
        subject: characterName,
        appearance,
        pose: 'standing pose, front view, hands relaxed at sides',
        outfit,
        style: preset,
        emotion: 'neutral expression',
        lighting: 'soft front lighting',
      }),
    },
    {
      angle: 'side',
      description: '侧面/3/4侧姿态',
      prompt: buildCharacterPrompt({
        subject: characterName,
        appearance,
        pose: 'standing pose, side profile, 3/4 view',
        outfit,
        style: preset,
        emotion: 'neutral expression',
        lighting: 'side lighting, dramatic shadows',
      }),
    },
    {
      angle: 'full-body',
      description: '全身姿态',
      prompt: buildCharacterPrompt({
        subject: characterName,
        appearance,
        pose: 'full body standing pose, showing complete outfit',
        outfit,
        style: preset,
        emotion: 'confident expression',
        lighting: 'balanced lighting',
      }),
    },
  ];
}

// ========== 核心模板函数 ==========

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

/**
 * 5段式结构化提示词构建
 * 
 * 段1: 主体描述 (subject + appearance)
 * 段2: 动作/情绪 (pose + emotion)
 * 段3: 镜头类型 (camera)
 * 段4: 光线/氛围 (lighting + atmosphere)
 * 段5: 风格 (style prefix)
 */
export function buildCharacterPrompt(ctx: PromptContext): string {
  const parts: string[] = [];

  // 段1: 主体
  if (ctx.appearance) {
    parts.push(`${ctx.subject}, ${ctx.appearance}`);
  } else {
    parts.push(ctx.subject);
  }

  // 段2: 姿态+情绪
  if (ctx.pose || ctx.emotion) {
    const poseStr = [ctx.pose, ctx.emotion].filter(Boolean).join(', ');
    parts.push(poseStr);
  }

  // 段2.5: 服装（仅当与 appearance 不同时添加）
  if (ctx.outfit && ctx.outfit !== ctx.appearance) {
    parts.push(ctx.outfit);
  }

  // 段3: 镜头
  if (ctx.camera) {
    parts.push(ctx.camera);
  }

  // 段4: 光线+氛围
  if (ctx.lighting) {
    parts.push(ctx.lighting);
  }
  if (ctx.atmosphere) {
    parts.push(ctx.atmosphere);
  }

  // 段5: 风格前缀
  parts.push(ctx.style.promptPrefix);

  return parts.join(', ');
}

/**
 * 场景提示词构建（用于分镜图像生成）
 */
export interface ScenePromptContext {
  location?: string;
  timeOfDay?: string;
  weather?: string;
  characters?: string[];       // 角色名列表（会注入一致性约束）
  characterRefs?: CharacterRefPrompt[];  // 角色详细引用
  sceneType?: string;
  emotion?: string;
  camera?: string;
  style: StylePreset;
  extraDescription?: string;  // 额外场景描述
}

/**
 * 角色引用提示词（用于注入角色一致性约束）
 */
export interface CharacterRefPrompt {
  name: string;
  appearance: string;   // 外观
  outfit: string;       // 服装
  pose: string;         // 姿态
  expression: string;   // 表情
}

/**
 * 5段式场景提示词构建
 */
export function buildScenePrompt(ctx: ScenePromptContext): string {
  const parts: string[] = [];

  // 段1: 地点+时间+天气
  if (ctx.location || ctx.timeOfDay || ctx.weather) {
    const envParts = [ctx.location, ctx.timeOfDay, ctx.weather].filter(Boolean);
    parts.push(envParts.join(', '));
  }

  // 段2: 角色（注入一致性约束）
  if (ctx.characterRefs && ctx.characterRefs.length > 0) {
    const charParts = ctx.characterRefs.map(
      c => `${c.name}: ${c.appearance}, ${c.outfit}, ${c.pose}, ${c.expression}`
    );
    parts.push(`consistent characters: ${charParts.join(' | ')}`);
  } else if (ctx.characters && ctx.characters.length > 0) {
    parts.push(`characters: ${ctx.characters.join(', ')}`);
  }

  // 段3: 场景类型+镜头
  if (ctx.sceneType) {
    parts.push(`scene: ${ctx.sceneType}`);
  }
  if (ctx.camera) {
    parts.push(`camera: ${ctx.camera}`);
  }

  // 段4: 情感/氛围
  if (ctx.emotion) {
    parts.push(`atmosphere: ${ctx.emotion}`);
  }

  // 段5: 额外描述
  if (ctx.extraDescription) {
    parts.push(ctx.extraDescription);
  }

  // 段6: 风格前缀
  parts.push(ctx.style.promptPrefix);

  return parts.join(', ');
}

/**
 * 视频生成提示词构建（用于图生视频）
 */
export interface VideoPromptContext {
  description: string;       // 场景描述
  motion?: string;          // 运动描述
  characterRefs?: CharacterRefPrompt[];  // 角色引用
  cameraMovement?: string;   // 相机运动
  duration?: number;         // 时长（秒）
  style: StylePreset;
}

/**
 * 构建适合视频生成的提示词
 * 包含运动指令和角色一致性约束
 */
export function buildVideoPrompt(ctx: VideoPromptContext): string {
  const parts: string[] = [];

  // 段1: 场景描述
  parts.push(ctx.description);

  // 段2: 角色一致性（通过描述注入）
  if (ctx.characterRefs && ctx.characterRefs.length > 0) {
    const charParts = ctx.characterRefs.map(
      c => `${c.name}: ${c.appearance}, ${c.pose}`
    );
    parts.push(`maintain character consistency: ${charParts.join(' | ')}`);
  }

  // 段3: 运动描述
  if (ctx.motion) {
    parts.push(`motion: ${ctx.motion}`);
  }

  // 段4: 相机运动
  if (ctx.cameraMovement) {
    parts.push(`camera movement: ${ctx.cameraMovement}`);
  }

  // 段5: 风格
  parts.push(ctx.style.promptPrefix);

  return parts.join(', ');
}

/**
 * 提示词质量检查
 */
export function validatePrompt(prompt: string): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // 检查长度
  if (prompt.length < 20) {
    warnings.push('Prompt 太短，可能缺乏细节');
  }
  if (prompt.length > 500) {
    warnings.push('Prompt 过长，可能被截断');
  }

  // 检查是否包含风格关键词
  const styleKeywords = ['style', 'anime', 'comic', 'art'];
  const hasStyle = styleKeywords.some(k => prompt.toLowerCase().includes(k));
  if (!hasStyle) {
    warnings.push('缺少风格关键词');
  }

  // 检查是否包含镜头关键词
  const cameraKeywords = ['shot', 'camera', 'view', 'angle', 'close-up', 'wide'];
  const hasCamera = cameraKeywords.some(k => prompt.toLowerCase().includes(k));
  if (!hasCamera) {
    warnings.push('缺少镜头描述，可能影响生成效果');
  }

  return { ok: warnings.length === 0, warnings };
}
