import { detectConflicts } from '../../../features/manga-pipeline/steps/step1-script-generation/analyzer/conflict';
import { NarrativeStructure } from '../../../features/manga-pipeline/steps/step1-script-generation/analyzer/narrative-structure';
import { StoryEvent } from '../../../features/manga-pipeline/steps/step1-script-generation/parser/event-extractor';

describe('ConflictDetector', () => {
  it('should detect interpersonal conflict', () => {
    const events: StoryEvent[] = [
      { id: 'e1', description: '两人争吵', involvedCharacters: ['A', 'B'], emotionalTone: 'angry' },
      { id: 'e2', description: '关系破裂', involvedCharacters: ['A', 'B'], emotionalTone: 'tense' },
    ];
    const narrative: NarrativeStructure = {
      arc: 'rising',
      estimatedDuration: 10,
      keyPlotPoints: [],
      arcSegments: [],
    };
    const result = detectConflicts(events, narrative);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts[0].type).toBe('interpersonal');
  });

  it('should calculate total suspense', () => {
    const events: StoryEvent[] = [
      { id: 'e1', description: '震惊', involvedCharacters: ['A'], emotionalTone: 'surprising' },
      { id: 'e2', description: '紧张', involvedCharacters: ['A'], emotionalTone: 'tense' },
    ];
    const narrative: NarrativeStructure = {
      arc: 'rising',
      estimatedDuration: 5,
      keyPlotPoints: [],
      arcSegments: [],
    };
    const result = detectConflicts(events, narrative);
    expect(result.totalSuspense).toBe(4);
  });

  it('should return highest suspense scene', () => {
    const events: StoryEvent[] = [
      { id: 'e1', description: '普通场景', involvedCharacters: ['A'], emotionalTone: 'neutral' },
      {
        id: 'e2',
        description: '咖啡厅冲突',
        involvedCharacters: ['A'],
        emotionalTone: 'surprising',
        sceneLocation: '咖啡厅',
      },
    ];
    const narrative: NarrativeStructure = {
      arc: 'rising',
      estimatedDuration: 5,
      keyPlotPoints: [],
      arcSegments: [],
    };
    const result = detectConflicts(events, narrative);
    expect(result.highestSuspenseScene).toBe('咖啡厅');
  });

  it('should return empty for peaceful story', () => {
    const events: StoryEvent[] = [
      { id: 'e1', description: '散步', involvedCharacters: ['A'], emotionalTone: 'happy' },
    ];
    const narrative: NarrativeStructure = {
      arc: 'introduction',
      estimatedDuration: 5,
      keyPlotPoints: [],
      arcSegments: [],
    };
    const result = detectConflicts(events, narrative);
    expect(result.conflicts.length).toBe(0);
  });
});
