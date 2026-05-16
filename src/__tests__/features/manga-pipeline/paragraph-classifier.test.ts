import {
  classifyParagraph,
  classifyParagraphs,
  ParagraphType,
} from '../../../features/manga-pipeline/steps/step1-script-generation/parser/classifier';

describe('ParagraphClassifier', () => {
  it('should classify dialogue with speaker', () => {
    const result = classifyParagraph('主角：你好啊', 0);
    expect(result.type).toBe('dialogue');
    expect(result.speaker).toBe('主角');
  });

  it('should classify dialogue with quotes', () => {
    const result = classifyParagraph('"你好"', 0);
    expect(result.type).toBe('dialogue');
  });

  it('should classify inner monologue', () => {
    const result = classifyParagraph('我心想：这是什么情况', 0);
    expect(result.type).toBe('inner_monologue');
  });

  it('should classify action', () => {
    const result = classifyParagraph('主角推开门走了进去', 0);
    expect(result.type).toBe('action');
  });

  it('should classify narration as default', () => {
    const result = classifyParagraph('这是一个晴朗的早晨', 0);
    expect(result.type).toBe('narration');
  });

  it('should batch classify paragraphs', () => {
    const text = `主角走进房间
主角：你好
我心想：他是谁`;
    const results = classifyParagraphs(text);
    expect(results).toHaveLength(3);
  });

  it('should filter empty lines', () => {
    const results = classifyParagraphs('第一段\n\n\n第三段');
    expect(results).toHaveLength(2);
  });
});
