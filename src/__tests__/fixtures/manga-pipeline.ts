/**
 * Manga-pipeline 测试 Fixtures (v3.0)
 *
 * 集中 manga-pipeline 特性测试用的工厂函数, 消除 5+ 文件 inline 重复定义.
 *
 * 来源 (C1 dedup):
 * - createMockScene       src/__tests__/features/manga-pipeline/{ai-material-generator,material-searcher,material-matching-pipeline}.test.ts
 * - createMockStoryboard  src/__tests__/features/manga-pipeline/{material-matching-pipeline,material-searcher}.test.ts
 * - createMockScript      src/__tests__/features/manga-pipeline/{dialogue-tts-generator,voice-synthesis-pipeline}.test.ts
 * - createMockMaterialItem    src/__tests__/features/manga-pipeline/smart-grouper.test.ts
 * - createMockMaterialMatch   src/__tests__/features/manga-pipeline/smart-grouper.test.ts
 * - createMockVoiceAssignments src/__tests__/features/manga-pipeline/dialogue-tts-generator.test.ts
 */

import type { Script } from '@/features/manga-pipeline/steps/step1-script-generation/types/script';
import type {
  StoryboardScene,
  Storyboard,
} from '@/features/manga-pipeline/steps/step2-storyboard/composer';
import type { SceneDescription } from '@/features/manga-pipeline/steps/step2-storyboard/description/scene-describer';
import type {
  MaterialItem,
  MaterialMatch,
} from '@/features/manga-pipeline/steps/step3-material-matching/services/grouper';
import type { VoiceAssignment } from '@/features/manga-pipeline/steps/step4-voice-synthesis/services/assigner';

/**
 * 标准测试场景描述
 */
const defaultSceneDescription: SceneDescription = {
  sceneId: 'scene-001',
  sceneNumber: 1,
  prompt: 'anime style, location: 城市街道, dark atmosphere',
  negativePrompt: 'realistic, photo, low quality',
  styleHint: '动漫风格',
  aspectRatio: '16:9',
  duration: 10,
} as SceneDescription;

/**
 * 创建模拟 StoryboardScene
 * 默认场景 (动漫风格, 城市街道, 10s, 16:9), 支持 overrides 覆盖任意字段.
 */
export const createMockScene = (overrides: Partial<StoryboardScene> = {}): StoryboardScene => ({
  sceneId: 'scene-001',
  sceneNumber: 1,
  description: defaultSceneDescription,
  status: 'pending',
  ...overrides,
});

/**
 * 创建模拟 Storyboard (含 1 个默认场景)
 */
export const createMockStoryboard = (scenes: StoryboardScene[] = []): Storyboard => ({
  scriptId: 'script-001',
  title: '测试故事板',
  totalDuration: 30,
  scenes: scenes.length > 0 ? scenes : [createMockScene()],
  characters: [],
  metadata: {
    generatedAt: Date.now(),
    style: 'anime',
  },
});

/**
 * 创建模拟 Script (含 2 个测试场景)
 * 默认不包含 characters 字段 — 调用方用 overrides.characters 注入.
 */
export const createMockScript = (overrides: Partial<Script> = {}): Script => ({
  id: 'script1',
  title: '测试剧本',
  sourceText: '这是一段测试文本',
  estimatedDuration: 5,
  scenes: [
    {
      id: 'scene1',
      sceneNumber: 1,
      location: '室内',
      timeOfDay: '下午',
      characters: ['小明', '老张'],
      type: '对话',
      cameraHint: '中景',
      transition: '切换',
      emotion: 'happy',
      content: '小明：今天天气真好啊！老张：是啊，很适合出去走走。',
      videoNote: '',
      bgmSuggestion: '',
    },
    {
      id: 'scene2',
      sceneNumber: 2,
      location: '室外',
      timeOfDay: '傍晚',
      characters: ['小明'],
      type: '独白',
      cameraHint: '近景',
      transition: '淡入',
      emotion: 'sad',
      content: '小明：想起以前的事情，真是感慨万千。',
      videoNote: '',
      bgmSuggestion: '',
    },
  ],
  ...overrides,
});

/**
 * 创建模拟 MaterialItem (material matching)
 */
export const createMockMaterialItem = (id: string): MaterialItem => ({
  id,
  type: 'video',
  source: 'pixabay',
  tags: ['tag1', 'tag2'],
});

/**
 * 创建模拟 MaterialMatch (含 1 个默认 MaterialItem)
 */
export const createMockMaterialMatch = (overrides: Partial<MaterialMatch> = {}): MaterialMatch => ({
  sceneId: 'scene-001',
  sceneNumber: 1,
  emotion: 'neutral',
  matches: [createMockMaterialItem('mat-001')],
  fallback: 'stock footage',
  confidence: 0.8,
  ...overrides,
});

/**
 * 创建模拟 VoiceAssignment[] (含 2 个角色: 小明 + 老张)
 */
export const createMockVoiceAssignments = (): VoiceAssignment[] => [
  {
    characterId: 'char1',
    characterName: '小明',
    voiceId: 'zh-CN-XiaoxiaoNeural',
    voiceName: '晓晓（年轻女声）',
    pitch: 2,
    speed: 1.1,
    volume: 1.0,
  },
  {
    characterId: 'char2',
    characterName: '老张',
    voiceId: 'zh-CN-YunyangNeural',
    voiceName: '云扬（专业男声）',
    pitch: -1,
    speed: 0.9,
    volume: 1.0,
  },
];
