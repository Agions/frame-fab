import { createMockScene, createMockStoryboard } from '@/__tests__/fixtures';

import { Storyboard } from '../../../features/manga-pipeline/steps/step2-storyboard/composer';
import {
  batchSearch,
  searchMaterial,
  MaterialMatch,
  MaterialItem,
  SearchQuery,
} from '../../../features/manga-pipeline/steps/step3-material-matching/services/searcher';

// 重写: material-searcher 需要 prompt 加 "time: 夜晚, scene type: 对话" (与 v2.x inline 等价)
const createSearcherScene = (overrides: any = {}) =>
  createMockScene({
    description: {
      ...createMockScene().description,
      prompt: 'anime style, location: 城市街道, time: 夜晚, scene type: 对话, dark atmosphere',
    },
    ...overrides,
  });

const createMockStoryboardWithSearcher = (scenes: any[] = []) =>
  createMockStoryboard(scenes.length > 0 ? scenes : [createSearcherScene()]);

describe('MaterialSearcher', () => {
  describe('searchMaterial', () => {
    it('should return empty array when no keywords provided', async () => {
      const scene = createSearcherScene();
      const query: SearchQuery = {
        keywords: [],
        type: 'video',
      };
      const results = await searchMaterial(scene, query);
      expect(results).toEqual([]);
    });

    it('should accept valid search query', async () => {
      const scene = createSearcherScene();
      const query: SearchQuery = {
        keywords: ['城市街道', '夜晚'],
        type: 'video',
        duration: { min: 8, max: 12 },
        mood: 'tense',
      };
      const results = await searchMaterial(scene, query);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('batchSearch', () => {
    it('should process all scenes in storyboard', async () => {
      const scenes = [
        createSearcherScene({ sceneId: 'scene-001', sceneNumber: 1 }),
        createSearcherScene({ sceneId: 'scene-002', sceneNumber: 2 }),
        createSearcherScene({ sceneId: 'scene-003', sceneNumber: 3 }),
      ];
      const storyboard = createMockStoryboard(scenes);
      const results = await batchSearch(storyboard);
      expect(results).toHaveLength(3);
    });

    it('should return MaterialMatch with correct sceneId and sceneNumber', async () => {
      const scene = createSearcherScene({ sceneId: 'scene-xyz', sceneNumber: 5 });
      const storyboard = createMockStoryboard([scene]);
      const results = await batchSearch(storyboard);
      expect(results[0].sceneId).toBe('scene-xyz');
      expect(results[0].sceneNumber).toBe(5);
    });

    it('should return fallback ai_generate when no matches found', async () => {
      const storyboard = createMockStoryboardWithSearcher();
      const results = await batchSearch(storyboard);
      expect(results[0].fallback).toBe('ai_generate');
      expect(results[0].matches).toHaveLength(0);
      expect(results[0].confidence).toBe(0);
    });

    it('should respect maxResultsPerScene option', async () => {
      const storyboard = createMockStoryboardWithSearcher();
      const results = await batchSearch(storyboard, { maxResultsPerScene: 2 });
      expect(results).toHaveLength(1);
    });

    it('should handle storyboard with empty scenes', async () => {
      // Create a truly empty storyboard with no scenes
      const emptyStoryboard: Storyboard = {
        scriptId: 'script-001',
        title: '空故事板',
        totalDuration: 0,
        scenes: [],
        characters: [],
        metadata: { generatedAt: Date.now(), style: 'anime' },
      };
      const results = await batchSearch(emptyStoryboard);
      expect(results).toHaveLength(0);
    });
  });
});
