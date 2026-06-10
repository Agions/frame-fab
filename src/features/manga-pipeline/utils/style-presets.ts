/**
 * 风格预设常量
 */
export interface StylePreset {
  name: string;
  promptPrefix: string;
  negativePrompt: string;
  lightingPresets: string[];
  cameraHints: string[];
}

export const ANIME_STYLE: StylePreset = {
  name: 'anime',
  promptPrefix: 'anime style, vibrant colors, detailed illustration, high quality, cel shading',
  negativePrompt: 'realistic, photo, 3d render, low quality, blurry, deformed, amateur',
  lightingPresets: [
    'golden hour lighting',
    'soft natural light',
    'dramatic backlight',
    'studio lighting',
  ],
  cameraHints: ['medium shot', 'close-up', 'wide shot', 'over-the-shoulder'],
};

export const COMIC_STYLE: StylePreset = {
  name: 'comic',
  promptPrefix:
    'digital art style, comic style, bold lines, halftone dots, dynamic composition, vibrant',
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
