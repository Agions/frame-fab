/**
 * 角色立绘生成（含三视图 + 角色一致性 token）
 */
import {
  buildCharacterReferencePrompts,
  buildCharacterPrompt,
  type CharacterView,
} from '../../../utils/prompt-template';
import { CharacterCard } from '../../step1-script-generation/types/character';

import { getStylePreset, getPersonalityPose } from './style-utils';

export interface CharacterIllustration {
  characterId: string;
  name: string;
  prompt: string;
  negativePrompt: string;
  pose: string;
  expression: string;
  outfit: string;
  referenceViews: CharacterView[];
  referencePrompt: string;
  style: string;
}

export interface CharacterIllustrationInput {
  character: CharacterCard;
  style?: string;
  generateReferenceViews?: boolean;
}

/** 生成角色立绘（支持新旧两种调用签名） */
export function generateCharacterIllustration(
  input: CharacterIllustrationInput
): CharacterIllustration;
export function generateCharacterIllustration(
  character: CharacterCard,
  style?: string
): CharacterIllustration;
export function generateCharacterIllustration(
  characterOrInput: CharacterCard | CharacterIllustrationInput,
  style?: string
): CharacterIllustration {
  let input: CharacterIllustrationInput;
  if ('id' in characterOrInput && 'name' in characterOrInput) {
    input = { character: characterOrInput, style };
  } else {
    input = characterOrInput as CharacterIllustrationInput;
  }
  const { character, style: s = 'anime', generateReferenceViews = true } = input;

  const preset = getStylePreset(s);
  const isDefaultAppearance = character.appearance === '普通外貌，着装简洁';

  const prompt = buildCharacterPrompt({
    subject: character.name,
    appearance: isDefaultAppearance ? undefined : character.appearance,
    pose: getPersonalityPose(character.personality, character.speakingStyle).pose,
    emotion: getPersonalityPose(character.personality, character.speakingStyle).expression,
    outfit: isDefaultAppearance ? undefined : character.appearance,
    style: preset,
  });

  const referenceViews = generateReferenceViews
    ? buildCharacterReferencePrompts(
        character.name,
        character.appearance !== '普通外貌，着装简洁'
          ? character.appearance
          : 'ordinary appearance',
        character.appearance,
        s
      )
    : [];

  const referencePrompt = buildCharacterReferenceToken(character, referenceViews);
  const personalityPose = getPersonalityPose(character.personality, character.speakingStyle);

  return {
    characterId: character.id,
    name: character.name,
    prompt,
    negativePrompt: preset.negativePrompt,
    pose: personalityPose.pose,
    expression: personalityPose.expression,
    outfit: character.appearance,
    referenceViews,
    referencePrompt,
    style: s,
  };
}

function buildCharacterReferenceToken(
  character: CharacterCard,
  referenceViews: CharacterView[]
): string {
  const parts: string[] = [
    character.name,
    character.appearance !== '普通外貌，着装简洁' ? character.appearance : '',
    getPersonalityPose('').expression,
  ].filter(Boolean);
  if (referenceViews.length > 0) {
    parts.push('(use character reference for consistent appearance)');
  }
  return parts.join(', ');
}
