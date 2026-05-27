import { analyzeNarrativeStructure } from '../../../features/manga-pipeline/steps/step1-script-generation/analyzer/narrative';
import { StoryEvent } from '../../../features/manga-pipeline/steps/step1-script-generation/parser/event-extractor';

describe('NarrativeStructure', () => {
  it('should return empty structure for no events', () => {
    const result = analyzeNarrativeStructure([], 1);
    expect(result.arc).toBe('introduction');
    expect(result.estimatedDuration).toBe(0);
  });

  it('should analyze narrative arc based on emotional intensity', () => {
    const events: StoryEvent[] = [
      { id: 'e1', description: '平静开场', involvedCharacters: ['A'], emotionalTone: 'neutral' },
      { id: 'e2', description: '遇到麻烦', involvedCharacters: ['A'], emotionalTone: 'tense' },
      { id: 'e3', description: '冲突升级', involvedCharacters: ['A', 'B'], emotionalTone: 'angry' },
      {
        id: 'e4',
        description: '高潮对峙',
        involvedCharacters: ['A', 'B'],
        emotionalTone: 'surprising',
      },
      { id: 'e5', description: '问题解决', involvedCharacters: ['A'], emotionalTone: 'happy' },
    ];
    const result = analyzeNarrativeStructure(events, 1);
    expect(result.arcSegments).toHaveLength(5);
    expect(result.keyPlotPoints.length).toBeGreaterThan(0);
  });

  it('should estimate duration based on event count', () => {
    const events: StoryEvent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `e${i}`,
      description: `事件${i}`,
      involvedCharacters: ['A'],
      emotionalTone: 'neutral' as const,
    }));
    const result = analyzeNarrativeStructure(events, 1);
    expect(result.estimatedDuration).toBeGreaterThanOrEqual(10);
  });

  it('should return arc segments with correct structure', () => {
    const events: StoryEvent[] = [
      { id: 'e1', description: '开始', involvedCharacters: ['A'], emotionalTone: 'neutral' },
      { id: 'e2', description: '高潮', involvedCharacters: ['A'], emotionalTone: 'surprising' },
    ];
    const result = analyzeNarrativeStructure(events, 1);
    expect(result.arcSegments[0].arc).toBe('introduction');
    expect(result.arcSegments[3].arc).toBe('climax');
  });
});
