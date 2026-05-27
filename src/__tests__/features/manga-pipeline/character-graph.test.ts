import { buildCharacterGraph } from '../../../features/manga-pipeline/steps/step1-script-generation/analyzer/character-graph';
import { ClassifiedParagraph } from '../../../features/manga-pipeline/steps/step1-script-generation/parser/classifier';
import { StoryEvent } from '../../../features/manga-pipeline/steps/step1-script-generation/parser/event-extractor';

describe('CharacterGraph', () => {
  it('should extract characters from paragraphs', () => {
    const paragraphs: ClassifiedParagraph[] = [
      { type: 'dialogue', content: '主角：你好', speaker: '主角', originalIndex: 0 },
      { type: 'dialogue', content: '配角：嗨', speaker: '配角', originalIndex: 1 },
    ];
    const events: StoryEvent[] = [];
    const graph = buildCharacterGraph(events, paragraphs);
    expect(graph.characters).toContain('主角');
    expect(graph.characters).toContain('配角');
  });

  it('should infer enemy relation from tense events', () => {
    const events: StoryEvent[] = [
      {
        id: 'e1',
        description: '争吵',
        involvedCharacters: ['A', 'B'],
        emotionalTone: 'angry',
      },
    ];
    const paragraphs: ClassifiedParagraph[] = [];
    const graph = buildCharacterGraph(events, paragraphs);
    const relation = graph.relations.find(
      (r) => (r.from === 'A' && r.to === 'B') || (r.from === 'B' && r.to === 'A')
    );
    expect(relation?.type).toBe('enemy');
  });

  it('should infer romantic relation from happy events', () => {
    const events: StoryEvent[] = [
      {
        id: 'e1',
        description: '一起吃饭',
        involvedCharacters: ['A', 'B'],
        emotionalTone: 'happy',
      },
    ];
    const paragraphs: ClassifiedParagraph[] = [];
    const graph = buildCharacterGraph(events, paragraphs);
    const relation = graph.relations.find(
      (r) => (r.from === 'A' && r.to === 'B') || (r.from === 'B' && r.to === 'A')
    );
    expect(relation?.type).toBe('romantic');
  });

  it('should track character appearance count', () => {
    const events: StoryEvent[] = [];
    const paragraphs: ClassifiedParagraph[] = [
      { type: 'dialogue', content: 'A：嗨', speaker: 'A', originalIndex: 0 },
      { type: 'dialogue', content: 'A：你在吗', speaker: 'A', originalIndex: 1 },
    ];
    const graph = buildCharacterGraph(events, paragraphs);
    expect(graph.characterInfo['A'].appearanceCount).toBe(2);
  });
});
