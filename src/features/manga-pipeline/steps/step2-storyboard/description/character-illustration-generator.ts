import { CharacterCard } from '../../step1-script-generation/types/character';

export interface CharacterIllustration {
  characterId: string;
  name: string;
  prompt: string;
  negativePrompt: string;
  pose: string;       // 姿态建议
  expression: string;  // 表情建议
  outfit: string;      // 服装描述
}

export function generateCharacterIllustration(
  character: CharacterCard,
  style: string = 'anime'
): CharacterIllustration {
  const promptParts: string[] = [];

  // 名字
  promptParts.push(`character name: ${character.name}`);

  // 外貌
  if (character.appearance && character.appearance !== '普通外貌，着装简洁') {
    promptParts.push(`appearance: ${character.appearance}`);
  }

  // 性格 → 表情/姿态
  const personalityPrompts = getPersonalityPosePrompts(character.personality);
  promptParts.push(personalityPrompts.pose);
  promptParts.push(personalityPrompts.expression);

  // 服装风格
  promptParts.push(`outfit style: casual elegant`);

  // 说话风格 → 语言习惯标签
  if (character.speakingStyle.includes('口语化')) {
    promptParts.push('casual pose, relaxed posture');
  } else if (character.speakingStyle.includes('正式')) {
    promptParts.push('formal pose, straight posture');
  }

  const promptTemplate = style === 'anime'
    ? `anime style, ${promptParts.join(', ')}, detailed illustration, high quality`
    : `digital art style, ${promptParts.join(', ')}, detailed illustration`;

  return {
    characterId: character.id,
    name: character.name,
    prompt: promptTemplate,
    negativePrompt: 'realistic, photo, 3d render, low quality, blurry, deformed',
    pose: personalityPrompts.pose,
    expression: personalityPrompts.expression,
    outfit: character.appearance,
  };
}

function getPersonalityPosePrompts(personality: string): { pose: string; expression: string } {
  if (personality.includes('开朗') || personality.includes('活泼')) {
    return {
      pose: 'dynamic pose, one hand raised, energetic stance',
      expression: 'bright smile, cheerful expression, open eyes',
    };
  }
  if (personality.includes('内向') || personality.includes('沉默')) {
    return {
      pose: 'subtle pose, arms crossed, guarded stance',
      expression: 'reserved expression, slight smile, downward gaze',
    };
  }
  if (personality.includes('急躁') || personality.includes('暴躁')) {
    return {
      pose: 'tense pose, leaning forward, assertive stance',
      expression: 'intense expression, furrowed brow, determined look',
    };
  }
  if (personality.includes('谨慎') || personality.includes('冷静')) {
    return {
      pose: 'steady pose, hands clasped, balanced stance',
      expression: 'serene expression, composed look, alert eyes',
    };
  }
  return {
    pose: 'natural pose, relaxed stance',
    expression: 'neutral expression, relaxed look',
  };
}
