/**
 * Integration Tests — PluginHost (插件注册与激活)
 */

import { PluginHost } from '@/plugins/plugin-host';
import type { IStylePlugin, IFormatPlugin } from '@/plugins/types/plugin.types';

describe('PluginHost', () => {
  let host: PluginHost;

  beforeEach(() => {
    host = new PluginHost();
  });

  // ============================================
  // Style Plugins
  // ============================================

  describe('registerStyle / activateStyle', () => {
    const comicStyle: IStylePlugin = {
      id: 'comic',
      name: 'Classic Comic',
      priority: 10,
      applyStyle(basePrompt, params) {
        return basePrompt + ', classic comic art style';
      },
      matches(prompt) {
        return prompt.includes('comic') ? 0.9 : 0;
      },
    };

    const animeStyle: IStylePlugin = {
      id: 'anime',
      name: 'Anime',
      priority: 5,
      applyStyle(basePrompt, params) {
        return basePrompt + ', anime art style';
      },
      matches(prompt) {
        return prompt.includes('anime') ? 0.9 : 0;
      },
    };

    it('should register and activate style plugin', () => {
      host.registerStyle(comicStyle);
      host.activateStyle('comic');

      // activateStyle returns void, use getStylePlugin to verify
      const active = host.getStylePlugin('comic');
      expect(active).not.toBeUndefined();
      expect(active!.id).toBe('comic');
    });

    it('should match correct plugin by prompt', () => {
      host.registerStyle(comicStyle);
      host.registerStyle(animeStyle);

      const matched = host.matchStyle('I want a comic style manga page');
      expect(matched?.id).toBe('comic');
    });

    it('should return highest priority when multiple match', () => {
      host.registerStyle(comicStyle); // priority 10
      host.registerStyle(animeStyle); // priority 5

      const matched = host.matchStyle('comic and anime both appear');
      expect(matched?.id).toBe('comic'); // higher priority
    });
  });

  // ============================================
  // Format Plugins
  // ============================================

  describe('registerFormat / activateFormat', () => {
    const mp4Format: IFormatPlugin = {
      id: 'mp4',
      name: 'MP4 Video',
      extensions: ['mp4'],
      mimeTypes: ['video/mp4'],
      export(frames, audio, options) {
        return Promise.resolve(new Blob([], { type: 'video/mp4' }));
      },
      estimateSize(frames, duration) {
        return frames.length * 1024 * 10;
      },
      validateOptions(options) {
        return { valid: true, errors: [] };
      },
    };

    it('should register and activate format plugin', () => {
      host.registerFormat(mp4Format);
      host.activateFormat('mp4');

      // activateFormat returns void, use getFormatPlugin to verify
      const active = host.getFormatPlugin('mp4');
      expect(active).not.toBeUndefined();
      expect(active!.id).toBe('mp4');
    });

    it('should list all registered format extensions', () => {
      host.registerFormat(mp4Format);
      const formats = host.getAllFormats();

      const extensions = formats.flatMap((f) => f.extensions);
      expect(extensions).toContain('mp4');
    });
  });

  // ============================================
  // Unregister (开闭原则验证)
  // ============================================

  describe('unregister', () => {
    it('should remove plugin from registry', () => {
      host.registerStyle({
        id: 'test',
        name: 'Test',
        priority: 1,
        applyStyle(p) { return p; },
        matches() { return 0; },
      });

      host.unregister('test');
      expect(host.getStylePlugin('test')).toBeUndefined();
    });
  });
});
