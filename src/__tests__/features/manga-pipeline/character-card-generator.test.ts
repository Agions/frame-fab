import { CharacterGraph } from '../../../features/manga-pipeline/steps/step1-script-generation/analyzer/character-graph';
import { StoryEvent } from '../../../features/manga-pipeline/steps/step1-script-generation/parser/event-extractor';
import { generateCharacterCards } from '../../../features/manga-pipeline/steps/step1-script-generation/script-writer/char-card-writer';

describe('CharacterCardGenerator', () => {
  it('should generate cards for all characters in graph', () => {
    const graph: CharacterGraph = {
      characters: ['主角', '配角'],
      relations: [],
      characterInfo: {
        主角: { appearanceCount: 5 },
        配角: { appearanceCount: 3 },
      },
    };
    const events: StoryEvent[] = [];
    const cards = generateCharacterCards('文本', graph, events);
    expect(cards).toHaveLength(2);
    expect(cards[0].name).toBe('主角');
    expect(cards[1].name).toBe('配角');
  });

  it('should infer personality from emotional events', () => {
    const graph: CharacterGraph = {
      characters: ['A'],
      relations: [],
      characterInfo: { A: { appearanceCount: 3 } },
    };
    const events: StoryEvent[] = [
      { id: 'e1', description: '开心', involvedCharacters: ['A'], emotionalTone: 'happy' },
      { id: 'e2', description: '开心', involvedCharacters: ['A'], emotionalTone: 'happy' },
      { id: 'e3', description: '开心', involvedCharacters: ['A'], emotionalTone: 'happy' },
    ];
    const cards = generateCharacterCards('文本', graph, events);
    expect(cards[0].personality).toContain('开朗');
  });

  it('should infer speaking style', () => {
    const graph: CharacterGraph = {
      characters: ['B'],
      relations: [],
      characterInfo: { B: { appearanceCount: 2 } },
    };
    const events: StoryEvent[] = [
      { id: 'e1', description: 'B：你好呀！', involvedCharacters: ['B'], emotionalTone: 'happy' },
    ];
    const cards = generateCharacterCards('文本', graph, events);
    expect(cards[0].speakingStyle).toContain('口语化');
  });

  it('should assign voice suggestions based on personality', () => {
    const graph: CharacterGraph = {
      characters: ['C'],
      relations: [],
      characterInfo: { C: { appearanceCount: 2 } },
    };
    const events: StoryEvent[] = [
      { id: 'e1', description: '生气', involvedCharacters: ['C'], emotionalTone: 'angry' },
      { id: 'e2', description: '愤怒', involvedCharacters: ['C'], emotionalTone: 'angry' },
    ];
    const cards = generateCharacterCards('文本', graph, events);
    expect(cards[0].voiceSuggestion).toContain('男声');
  });

  it('should include relationships in character card', () => {
    const graph: CharacterGraph = {
      characters: ['A', 'B'],
      relations: [{ from: 'A', to: 'B', type: 'enemy', strength: 0.8 }],
      characterInfo: { A: { appearanceCount: 2 }, B: { appearanceCount: 1 } },
    };
    const events: StoryEvent[] = [];
    const cards = generateCharacterCards('文本', graph, events);
    const cardA = cards.find((c) => c.name === 'A');
    expect(cardA?.relationships).toHaveLength(1);
    expect(cardA?.relationships[0].name).toBe('B');
    expect(cardA?.relationships[0].type).toBe('enemy');
  });

  it('should handle empty character list', () => {
    const graph: CharacterGraph = {
      characters: [],
      relations: [],
      characterInfo: {},
    };
    const cards = generateCharacterCards('文本', graph, []);
    expect(cards).toHaveLength(0);
  });
});
