import {
  buildScriptAnalysisPrompt,
  parseScriptAnalysisResponse,
  type ScriptAnalysisInput,
} from '@/core/ai/chains/script-analysis.chain';

describe('script-analysis.chain', () => {
  describe('buildScriptAnalysisPrompt', () => {
    it('should build prompt for novel type', () => {
      const input: ScriptAnalysisInput = {
        content: '这是一个测试小说内容',
        type: 'novel',
        genre: '都市',
      };

      const messages = buildScriptAnalysisPrompt(input);

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('剧本分析师');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toContain('分析以下小说内容');
      expect(messages[1].content).toContain('这是一个测试小说内容');
    });

    it('should build prompt for script type', () => {
      const input: ScriptAnalysisInput = {
        content: '这是一个测试剧本内容',
        type: 'script',
      };

      const messages = buildScriptAnalysisPrompt(input);

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].content).toContain('分析以下剧本');
    });

    it('should include genre in user prompt when provided', () => {
      const input: ScriptAnalysisInput = {
        content: '小说内容',
        type: 'novel',
        genre: '悬疑',
      };

      const messages = buildScriptAnalysisPrompt(input);

      expect(messages[1].content).toContain('小说内容');
    });

    it('should request all required fields in prompt', () => {
      const input: ScriptAnalysisInput = {
        content: '内容',
        type: 'novel',
      };

      const messages = buildScriptAnalysisPrompt(input);
      const userContent = messages[1].content;

      expect(userContent).toContain('标题');
      expect(userContent).toContain('故事梗概');
      expect(userContent).toContain('主要角色');
      expect(userContent).toContain('场景设定');
      expect(userContent).toContain('预估时长');
      expect(userContent).toContain('目标受众');
    });

    it('should handle empty content', () => {
      const input: ScriptAnalysisInput = {
        content: '',
        type: 'script',
      };

      const messages = buildScriptAnalysisPrompt(input);

      expect(messages).toHaveLength(2);
      expect(messages[1].content).toContain('分析以下剧本');
    });
  });

  describe('parseScriptAnalysisResponse', () => {
    it('should parse JSON wrapped in code blocks', () => {
      const codeBlock = '```json\n{\n  "title": "测试标题",\n  "synopsis": "这是一个测试摘要",\n  "characters": [\n    {\n      "name": "张三",\n      "description": "主角",\n      "personality": "勇敢"\n    }\n  ],\n  "scenes": [\n    {\n      "description": "场景描述",\n      "location": "室内",\n      "timeOfDay": "白天",\n      "keyElements": ["元素1", "元素2"]\n    }\n  ],\n  "suggestedDuration": "30分钟",\n  "targetAudience": "青年"\n}\n```';
      const result = parseScriptAnalysisResponse(codeBlock);

      expect(result.title).toBe('测试标题');
      expect(result.synopsis).toBe('这是一个测试摘要');
      expect(result.characters).toHaveLength(1);
      expect(result.characters?.[0].name).toBe('张三');
      expect(result.scenes).toHaveLength(1);
      expect(result.scenes?.[0].location).toBe('室内');
      expect(result.suggestedDuration).toBe('30分钟');
      expect(result.targetAudience).toBe('青年');
    });

    it('should parse raw JSON without code blocks', () => {
      const raw = '{"title": "直接JSON", "synopsis": "无包裹的JSON", "characters": [], "scenes": [], "suggestedDuration": "10分钟", "targetAudience": "大众"}';

      const result = parseScriptAnalysisResponse(raw);

      expect(result.title).toBe('直接JSON');
      expect(result.synopsis).toBe('无包裹的JSON');
    });

    it('should parse JSON with json language identifier in code block', () => {
      const codeBlock = '```json\n{"title": "JSON标签", "synopsis": "内容"}\n```';

      const result = parseScriptAnalysisResponse(codeBlock);

      expect(result.title).toBe('JSON标签');
      expect(result.synopsis).toBe('内容');
    });

    it('should fall back to raw synopsis when JSON parsing fails', () => {
      const raw = '这不是有效的JSON，只是一个普通文本回复。';

      const result = parseScriptAnalysisResponse(raw);

      expect(result.synopsis).toBe(raw);
      expect(result.title).toBeUndefined();
    });

    it('should handle malformed JSON gracefully', () => {
      const raw = '```json\n{"title": "部分有效", invalid json here}\n```';

      const result = parseScriptAnalysisResponse(raw);

      expect(result.synopsis).toBe(raw);
    });

    it('should handle empty string input', () => {
      const result = parseScriptAnalysisResponse('');

      expect(result.synopsis).toBe('');
    });

    it('should handle partial JSON with missing fields', () => {
      const raw = '{"title": "部分字段"}';

      const result = parseScriptAnalysisResponse(raw);

      expect(result.title).toBe('部分字段');
      expect(result.synopsis).toBeUndefined();
    });

    it('should handle JSON with extra whitespace', () => {
      const raw = '```json\n  \n  {\n    "title": "带空白",\n    "synopsis": "内容"\n  }\n  \n  ```';

      const result = parseScriptAnalysisResponse(raw);

      expect(result.title).toBe('带空白');
      expect(result.synopsis).toBe('内容');
    });
  });
});
