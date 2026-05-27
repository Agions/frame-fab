import { createCharacterCardStorage } from '../../../features/manga-pipeline/steps/step1-script-generation/script-writer/char-card-storage';
import { CharacterCard } from '../../../features/manga-pipeline/steps/step1-script-generation/types/character';

describe('CharacterCardStorage', () => {
  const storage = createCharacterCardStorage();

  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load character cards', async () => {
    const cards: CharacterCard[] = [
      {
        id: 'char_1',
        name: '主角',
        appearance: '普通外貌',
        personality: '开朗',
        speakingStyle: '口语化',
        voiceSuggestion: '年轻女声',
        relationships: [],
        firstAppearance: '咖啡厅',
      },
    ];
    await storage.save(cards);
    const loaded = await storage.load();
    expect(loaded).not.toBeNull();
    expect(loaded![0].name).toBe('主角');
  });

  it('should return null for empty storage', async () => {
    const loaded = await storage.load();
    expect(loaded).toBeNull();
  });

  it('should clear storage', async () => {
    const cards: CharacterCard[] = [
      {
        id: 'char_1',
        name: '主角',
        appearance: '普通外貌',
        personality: '开朗',
        speakingStyle: '口语化',
        voiceSuggestion: '年轻女声',
        relationships: [],
        firstAppearance: '咖啡厅',
      },
    ];
    await storage.save(cards);
    await storage.clear();
    const loaded = await storage.load();
    expect(loaded).toBeNull();
  });
});
