/**
 * 角色三视图模板（解决角色一致性核心问题）
 */
import { buildCharacterPrompt } from './prompt-builders';
import { STYLE_MAP, ANIME_STYLE } from './style-presets';

export interface CharacterView {
  angle: 'front' | 'side' | 'full-body';
  prompt: string;
  description: string;
}

/** 生成角色三视图提示词 */
export function buildCharacterReferencePrompts(
  characterName: string,
  appearance: string,
  outfit: string,
  style: string = 'anime'
): CharacterView[] {
  const preset = STYLE_MAP[style] || ANIME_STYLE;
  return [
    {
      angle: 'front',
      description: '正面标准姿态',
      prompt: buildCharacterPrompt({
        subject: characterName,
        appearance,
        pose: 'standing pose, front view, hands relaxed at sides',
        outfit,
        style: preset,
        emotion: 'neutral expression',
        lighting: 'soft front lighting',
      }),
    },
    {
      angle: 'side',
      description: '侧面/3/4侧姿态',
      prompt: buildCharacterPrompt({
        subject: characterName,
        appearance,
        pose: 'standing pose, side profile, 3/4 view',
        outfit,
        style: preset,
        emotion: 'neutral expression',
        lighting: 'side lighting, dramatic shadows',
      }),
    },
    {
      angle: 'full-body',
      description: '全身姿态',
      prompt: buildCharacterPrompt({
        subject: characterName,
        appearance,
        pose: 'full body standing pose, showing complete outfit',
        outfit,
        style: preset,
        emotion: 'confident expression',
        lighting: 'balanced lighting',
      }),
    },
  ];
}
