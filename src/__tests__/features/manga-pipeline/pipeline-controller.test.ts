import { ScriptGenerationPipeline } from '../../../features/manga-pipeline/steps/step1-script-generation/pipeline-controller';

describe('ScriptGenerationPipeline', () => {
  it('should create pipeline instance', () => {
    const pipeline = new ScriptGenerationPipeline();
    expect(pipeline.id).toBe('script-generation');
    expect(pipeline.name).toBe('AI Script Generation');
  });

  it('should process text and generate script', async () => {
    const pipeline = new ScriptGenerationPipeline();
    const text = `第一章
主角走进咖啡厅，主角：来一杯咖啡。
配角：好的，请稍等。
主角伤心地叹了口气。

第二章
配角：咖啡来了。
主角：谢谢。`;

    const result = await pipeline.process({ text, title: '测试剧本' }) as { scriptGeneration: { script: { title: string }; metadata: { chaptersCount: number } } };
    expect(result.scriptGeneration).toBeDefined();
    expect(result.scriptGeneration.script).toBeDefined();
    expect(result.scriptGeneration.metadata.chaptersCount).toBe(2);
  });

  it('should return evaluation score', async () => {
    const pipeline = new ScriptGenerationPipeline();
    const text = `第一章
主角走进咖啡厅，主角：你好！
`;

    const result = await pipeline.process({ text }) as { scriptGeneration: { metadata: { evaluationScore: number; grade: string } } };
    expect(result.scriptGeneration.metadata.evaluationScore).toBeGreaterThanOrEqual(0);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.scriptGeneration.metadata.grade);
  });

  it('should use default title if not provided', async () => {
    const pipeline = new ScriptGenerationPipeline();
    const text = `第一章
内容`;
    const result = await pipeline.process({ text }) as { scriptGeneration: { script: { title: string } } };
    expect(result.scriptGeneration.script.title).toBe('未命名剧本');
  });
});