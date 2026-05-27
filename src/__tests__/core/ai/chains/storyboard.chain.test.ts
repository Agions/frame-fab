import {
  buildStoryboardPrompt,
  parseStoryboardResponse,
  type StoryboardInput,
  type StoryboardOutput,
  type Panel,
} from '@/core/ai/chains/storyboard.chain';

describe('storyboard.chain', () => {
  describe('buildStoryboardPrompt', () => {
    it('should build prompt with default values when optional params not provided', () => {
      const input: StoryboardInput = { script: '这是一个测试剧本' };
      const messages = buildStoryboardPrompt(input);

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toContain('根据以下剧本，生成 8 个分镜');
      expect(messages[1].content).toContain('风格要求：日本漫画风格');
      expect(messages[1].content).toContain('画面比例：横向宽屏');
    });

    it('should build prompt with custom numPanels', () => {
      const input: StoryboardInput = { script: '测试', numPanels: 12 };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('生成 12 个分镜');
    });

    it('should build prompt with manga style', () => {
      const input: StoryboardInput = { script: '测试', style: 'manga' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('日本漫画风格');
    });

    it('should build prompt with anime style', () => {
      const input: StoryboardInput = { script: '测试', style: 'anime' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('日本动画风格');
    });

    it('should build prompt with comic style', () => {
      const input: StoryboardInput = { script: '测试', style: 'comic' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('美式漫画风格');
    });

    it('should build prompt with realistic style', () => {
      const input: StoryboardInput = { script: '测试', style: 'realistic' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('写实风格');
    });

    it('should build prompt with 16:9 aspect ratio', () => {
      const input: StoryboardInput = { script: '测试', aspectRatio: '16:9' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('横向宽屏');
    });

    it('should build prompt with 9:16 aspect ratio', () => {
      const input: StoryboardInput = { script: '测试', aspectRatio: '9:16' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('纵向竖屏');
    });

    it('should build prompt with 1:1 aspect ratio', () => {
      const input: StoryboardInput = { script: '测试', aspectRatio: '1:1' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('方形构图');
    });

    it('should include script content in user prompt', () => {
      const input: StoryboardInput = { script: '这是一个关于勇气和友谊的故事' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('剧本：\n这是一个关于勇气和友谊的故事');
    });

    it('should include all required panel fields in prompt', () => {
      const input: StoryboardInput = { script: '测试' };
      const messages = buildStoryboardPrompt(input);

      const content = messages[1].content;
      expect(content).toContain('画面描述（用于 AI 图像生成的 prompt）');
      expect(content).toContain('对白/字幕内容');
      expect(content).toContain('镜头角度');
      expect(content).toContain('预计时长（秒）');
    });

    it('should include JSON format example in prompt', () => {
      const input: StoryboardInput = { script: '测试' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[1].content).toContain('"panels"');
      expect(messages[1].content).toContain('"panelNumber"');
      expect(messages[1].content).toContain('"description"');
      expect(messages[1].content).toContain('"visualPrompt"');
      expect(messages[1].content).toContain('"dialogue"');
      expect(messages[1].content).toContain('"cameraAngle"');
      expect(messages[1].content).toContain('"duration"');
      expect(messages[1].content).toContain('"totalDuration"');
      expect(messages[1].content).toContain('"estimatedCost"');
    });

    it('should include system prompt with storyboard requirements', () => {
      const input: StoryboardInput = { script: '测试' };
      const messages = buildStoryboardPrompt(input);

      expect(messages[0].content).toContain('分镜师');
      expect(messages[0].content).toContain('故事板');
      expect(messages[0].content).toContain('画面描述');
      expect(messages[0].content).toContain('镜头角度建议');
    });

    it('should build prompt with all custom options combined', () => {
      const input: StoryboardInput = {
        script: '完整剧本内容',
        numPanels: 16,
        style: 'anime',
        aspectRatio: '9:16',
      };
      const messages = buildStoryboardPrompt(input);

      const content = messages[1].content;
      expect(content).toContain('生成 16 个分镜');
      expect(content).toContain('日本动画风格');
      expect(content).toContain('纵向竖屏');
    });
  });

  describe('parseStoryboardResponse', () => {
    it('should parse valid JSON wrapped in ```json``` tags', () => {
      const raw = '```json\n{"panels":[{"panelNumber":1,"description":"开场","visualPrompt":"prompt","dialogue":"对白","cameraAngle":"平拍","duration":5}],"totalDuration":"40s","estimatedCost":"$2.00"}\n```';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(1);
      expect(result.panels[0].panelNumber).toBe(1);
      expect(result.panels[0].description).toBe('开场');
      expect(result.panels[0].visualPrompt).toBe('prompt');
      expect(result.panels[0].dialogue).toBe('对白');
      expect(result.panels[0].cameraAngle).toBe('平拍');
      expect(result.panels[0].duration).toBe(5);
      expect(result.totalDuration).toBe('40s');
      expect(result.estimatedCost).toBe('$2.00');
    });

    it('should parse valid JSON wrapped in ``` tags without json label', () => {
      const raw = '```\n{"panels":[],"totalDuration":"0s","estimatedCost":"unknown"}\n```';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(0);
      expect(result.totalDuration).toBe('0s');
    });

    it('should parse raw JSON without code fences', () => {
      const raw = '{"panels":[{"panelNumber":1,"description":"测试"}],"totalDuration":"30s","estimatedCost":"$1.00"}';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(1);
      expect(result.panels[0].panelNumber).toBe(1);
    });

    it('should return empty panels on JSON parse failure', () => {
      const raw = '这不是有效的JSON';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(0);
      expect(result.totalDuration).toBe('0s');
      expect(result.estimatedCost).toBe('unknown');
    });

    it('should return empty panels on malformed JSON', () => {
      const raw = '```json\n{panels: not valid json}\n```';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(0);
      expect(result.totalDuration).toBe('0s');
      expect(result.estimatedCost).toBe('unknown');
    });

    it('should handle empty string input', () => {
      const result = parseStoryboardResponse('');

      expect(result.panels).toHaveLength(0);
      expect(result.totalDuration).toBe('0s');
      expect(result.estimatedCost).toBe('unknown');
    });

    it('should handle JSON with missing optional fields', () => {
      const raw = '{"panels":[{"panelNumber":1}]}';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(1);
      expect(result.panels[0].panelNumber).toBe(1);
      expect(result.panels[0].description).toBeUndefined();
    });

    it('should parse multiple panels correctly', () => {
      const raw = '{"panels":[{"panelNumber":1,"description":"Panel 1","visualPrompt":"p1","duration":5},{"panelNumber":2,"description":"Panel 2","visualPrompt":"p2","dialogue":"Hi","duration":3},{"panelNumber":3,"description":"Panel 3","visualPrompt":"p3","cameraAngle":"俯拍","duration":4}],"totalDuration":"12s","estimatedCost":"$1.50"}';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(3);
      expect(result.panels[0].dialogue).toBeUndefined();
      expect(result.panels[1].dialogue).toBe('Hi');
      expect(result.panels[2].cameraAngle).toBe('俯拍');
      expect(result.totalDuration).toBe('12s');
      expect(result.estimatedCost).toBe('$1.50');
    });

    it('should handle JSON with trailing commas', () => {
      const raw = '{"panels":[], "totalDuration": "0s",}';
      const result = parseStoryboardResponse(raw);

      // Should fail to parse due to trailing comma
      expect(result.panels).toHaveLength(0);
    });

    it('should handle code fences with extra whitespace', () => {
      const raw = '  ```json  \n  {"panels":[],"totalDuration":"0s","estimatedCost":"$0"}\n  ```  ';
      const result = parseStoryboardResponse(raw);

      expect(result.panels).toHaveLength(0);
    });
  });

  describe('type exports', () => {
    it('should export StoryboardInput interface', () => {
      const input: StoryboardInput = {
        script: 'test',
        numPanels: 8,
        style: 'anime',
        aspectRatio: '16:9',
      };

      expect(input.script).toBe('test');
      expect(input.numPanels).toBe(8);
      expect(input.style).toBe('anime');
      expect(input.aspectRatio).toBe('16:9');
    });

    it('should export Panel interface', () => {
      const panel: Panel = {
        panelNumber: 1,
        description: 'Test panel',
        visualPrompt: 'A test visual prompt',
        dialogue: 'Test dialogue',
        cameraAngle: '平拍',
        duration: 5,
      };

      expect(panel.panelNumber).toBe(1);
      expect(panel.description).toBe('Test panel');
      expect(panel.visualPrompt).toBe('A test visual prompt');
      expect(panel.dialogue).toBe('Test dialogue');
      expect(panel.cameraAngle).toBe('平拍');
      expect(panel.duration).toBe(5);
    });

    it('should export StoryboardOutput interface', () => {
      const output: StoryboardOutput = {
        panels: [],
        totalDuration: '30s',
        estimatedCost: '$2.00',
      };

      expect(output.panels).toEqual([]);
      expect(output.totalDuration).toBe('30s');
      expect(output.estimatedCost).toBe('$2.00');
    });
  });
});
