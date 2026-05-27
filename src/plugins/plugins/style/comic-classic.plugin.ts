/**
 * Comic Classic Style Plugin — 经典漫画风格插件
 * 示例：展示如何编写一个风格插件并注册到 PluginHost
 */

import type { IStylePlugin, StyleParams } from '@/plugins/types/plugin.types';

/**
 * 经典漫画风格 — 传统日漫风格，强调线条和网点
 */
export const comicClassicStylePlugin: IStylePlugin = {
  id: 'style.comic-classic',
  name: '经典漫画风格',
  description: '传统日漫风格，强调清晰线条、网点纹理和高度可读性',
  priority: 10,
  configurable: true,

  applyStyle(basePrompt: string, params?: StyleParams): string {
    const intensity = params?.intensity ?? 0.8;
    const lineStyle = params?.lineStyle ?? 'clean';
    const colorScheme = params?.colorScheme ?? 'vibrant';

    const lineModifiers: Record<string, string> = {
      clean: 'clean linework, sharp detail, crisp black outlines',
      sketchy: 'slightly rough linework, hand-drawn feel, visible sketch marks',
      bold: 'bold black lines, high contrast, thick brush strokes',
    };

    const colorModifiers: Record<string, string> = {
      vibrant: 'vibrant colors, high saturation, bold color blocking',
      muted: 'muted tones, soft colors, desaturated palette',
      noir: 'black and white with grayscale shading, dramatic contrast',
    };

    return `${basePrompt}, ${lineModifiers[lineStyle]}, halftone dots pattern, traditional manga aesthetic, ${colorModifiers[colorScheme]}, style intensity ${intensity}`;
  },

  matches(prompt: string): number {
    const keywords = ['漫画', 'anime', 'manga', 'comic', 'セル画', '漫画风格', '日系'];
    const lower = prompt.toLowerCase();
    const matches = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    return Math.min(1, matches / 2);
  },

  getQualityThresholds() {
    return {
      minConsistency: 72,
      minReadability: 75,
      minOverall: 70,
    };
  },
};

/**
 * Cyberpunk Style Plugin — 赛博朋克风格插件
 */
export const cyberpunkStylePlugin: IStylePlugin = {
  id: 'style.cyberpunk',
  name: '赛博朋克风格',
  description: '未来都市感，霓虹灯光、高对比度、科技感界面元素',
  priority: 20,
  configurable: true,

  applyStyle(basePrompt: string, params?: StyleParams): string {
    const intensity = params?.intensity ?? 0.85;
    const neon = params?.colorScheme ?? 'neon';

    const neonModifiers: Record<string, string> = {
      neon: 'neon glow effects, cyan and magenta lighting, rain-soaked streets',
      dark: 'dark atmosphere, muted neon, industrial decay',
      holographic: 'holographic UI, digital artifacts, glitch effects',
    };

    return `${basePrompt}, cyberpunk aesthetic, ${neonModifiers[neon]}, futuristic cityscape, intensity ${intensity}, high tech low life`;
  },

  matches(prompt: string): number {
    const keywords = ['赛博', 'cyberpunk', '未来', '科幻', '霓虹', '科幻城市'];
    const lower = prompt.toLowerCase();
    const matches = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    return Math.min(1, matches / 2);
  },

  getQualityThresholds() {
    return {
      minConsistency: 68,
      minOverall: 68,
    };
  },
};

/**
 * Ink Wash Style Plugin — 水墨风格插件
 */
export const inkWashStylePlugin: IStylePlugin = {
  id: 'style.ink-wash',
  name: '水墨风格',
  description: '中国传统水墨画风格，讲究留白、晕染和意境',
  priority: 5,
  configurable: true,

  applyStyle(basePrompt: string, params?: StyleParams): string {
    const intensity = params?.intensity ?? 0.9;
    return `${basePrompt}, Chinese ink wash painting style, ${intensity > 0.7 ? 'splashed ink, free brushwork' : 'precise brush strokes'}, traditional Gongbi technique, minimal color palette, contemplative mood`;
  },

  matches(prompt: string): number {
    const keywords = ['水墨', '国画', '水彩', '中国传统', '水墨画', '写意'];
    const lower = prompt.toLowerCase();
    const matches = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    return Math.min(1, matches / 2);
  },

  getQualityThresholds() {
    return {
      minReadability: 65,
      minOverall: 65,
    };
  },
};

// ========== Style Plugin Registration ==========

import { pluginHost } from '@/plugins/plugin-host';
import { logger } from '@/core/utils/logger';

/**
 * 自动注册所有内置风格插件
 */
export function registerBuiltinStylePlugins(): void {
  const plugins = [comicClassicStylePlugin, cyberpunkStylePlugin, inkWashStylePlugin];
  for (const plugin of plugins) {
    pluginHost.registerStyle(plugin);
  }
  logger.info(`[StylePlugins] Registered ${plugins.length} builtin style plugins`);
}