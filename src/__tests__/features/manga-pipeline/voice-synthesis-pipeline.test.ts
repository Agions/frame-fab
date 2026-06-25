import { createMockScript } from '@/__tests__/fixtures';

import {
  VoiceSynthesisPipeline,
  VoiceSynthesisResult,
} from '../../../features/manga-pipeline/steps/step4-voice-synthesis/pipeline-controller';

describe('voice-synthesis-pipeline', () => {
  // 注入 2 个测试角色到公共 Script fixture (与 v2.x inline 等价)
  const _createMockScriptWithCharacters = () =>
    createMockScript({
      characters: [
        {
          id: 'char1',
          name: '小明',
          appearance: '',
          personality: '开朗',
          speakingStyle: '',
          voiceSuggestion: '',
          relationships: [],
          firstAppearance: '',
        },
        {
          id: 'char2',
          name: '老张',
          appearance: '',
          personality: '沉稳',
          speakingStyle: '',
          voiceSuggestion: '',
          relationships: [],
          firstAppearance: '',
        },
      ],
      metadata: { generatedAt: Date.now(), model: 'test', version: '1.0' },
    });

  describe('VoiceSynthesisPipeline', () => {
    it('should have correct id and name', () => {
      const pipeline = new VoiceSynthesisPipeline();

      expect(pipeline.id).toBe('voice-synthesis');
      expect(pipeline.name).toBe('Voice Synthesis');
    });

    it('should implement PipelineStep interface', () => {
      const pipeline = new VoiceSynthesisPipeline();

      expect(typeof pipeline.process).toBe('function');
      expect(typeof pipeline.getCheckpoint).toBe('function');
      expect(typeof pipeline.restore).toBe('function');
    });

    it('should process script and return voice synthesis result', async () => {
      const pipeline = new VoiceSynthesisPipeline();
      const script = _createMockScriptWithCharacters();

      const result = await pipeline.process({ script });

      expect(result.voiceSynthesis).toBeDefined();
    });

    it('should include voice assignments in result', async () => {
      const pipeline = new VoiceSynthesisPipeline();
      const script = _createMockScriptWithCharacters();

      const result = (await pipeline.process({ script })) as any;
      const voiceSynthesis = result.voiceSynthesis;

      expect(voiceSynthesis.voiceAssignments).toBeDefined();
      expect(Array.isArray(voiceSynthesis.voiceAssignments)).toBe(true);
      expect(voiceSynthesis.voiceAssignments.length).toBe(script.characters.length);
    });

    it('should include dialogue segments in result', async () => {
      const pipeline = new VoiceSynthesisPipeline();
      const script = _createMockScriptWithCharacters();

      const result = (await pipeline.process({ script })) as any;
      const voiceSynthesis = result.voiceSynthesis;

      expect(voiceSynthesis.dialogueSegments).toBeDefined();
      expect(Array.isArray(voiceSynthesis.dialogueSegments)).toBe(true);
      expect(voiceSynthesis.dialogueSegments.length).toBeGreaterThan(0);
    });

    it('should include bgm selections in result', async () => {
      const pipeline = new VoiceSynthesisPipeline();
      const script = _createMockScriptWithCharacters();

      const result = (await pipeline.process({ script })) as any;
      const voiceSynthesis = result.voiceSynthesis;

      expect(voiceSynthesis.bgmSelections).toBeDefined();
      expect(Array.isArray(voiceSynthesis.bgmSelections)).toBe(true);
      expect(voiceSynthesis.bgmSelections.length).toBe(script.scenes.length);
    });

    it('should include total duration in result', async () => {
      const pipeline = new VoiceSynthesisPipeline();
      const script = _createMockScriptWithCharacters();

      const result = (await pipeline.process({ script })) as any;
      const voiceSynthesis = result.voiceSynthesis;

      expect(typeof voiceSynthesis.totalDuration).toBe('number');
      expect(voiceSynthesis.totalDuration).toBeGreaterThan(0);
    });

    it('should include metadata in result', async () => {
      const pipeline = new VoiceSynthesisPipeline();
      const script = _createMockScriptWithCharacters();

      const result = (await pipeline.process({ script })) as any;
      const voiceSynthesis = result.voiceSynthesis;

      expect(voiceSynthesis.metadata).toBeDefined();
      expect(voiceSynthesis.metadata.generatedAt).toBeDefined();
      expect(voiceSynthesis.metadata.ttsEngine).toBe('edge-tts');
      expect(voiceSynthesis.metadata.voiceCount).toBe(script.characters.length);
    });

    it('should include script in result', async () => {
      const pipeline = new VoiceSynthesisPipeline();
      const script = _createMockScriptWithCharacters();

      const result = (await pipeline.process({ script })) as any;
      const voiceSynthesis = result.voiceSynthesis;

      expect(voiceSynthesis.script).toBe(script);
    });
  });

  describe('VoiceSynthesisResult interface', () => {
    it('should have correct structure', () => {
      const result: VoiceSynthesisResult = {
        script: createMockScript(),
        voiceAssignments: [],
        dialogueSegments: [],
        bgmSelections: [],
        totalDuration: 100,
        metadata: {
          generatedAt: Date.now(),
          ttsEngine: 'edge-tts',
          voiceCount: 2,
          synthesizedCount: 0,
          failedCount: 0,
        },
      };

      expect(result.script).toBeDefined();
      expect(result.voiceAssignments).toBeDefined();
      expect(result.dialogueSegments).toBeDefined();
      expect(result.bgmSelections).toBeDefined();
      expect(result.totalDuration).toBe(100);
      expect(result.metadata.ttsEngine).toBe('edge-tts');
    });
  });

  describe('checkpoint functionality', () => {
    it('should return null checkpoint initially', () => {
      const pipeline = new VoiceSynthesisPipeline();

      expect(pipeline.getCheckpoint()).toBeNull();
    });

    it('should restore checkpoint state', () => {
      const pipeline = new VoiceSynthesisPipeline();
      const state = {
        stepId: 'voice-synthesis',
        completed: true,
        data: { someData: 'test' },
        timestamp: Date.now(),
      };

      pipeline.restore(state);

      expect(pipeline.getCheckpoint()).toEqual(state);
    });
  });
});
