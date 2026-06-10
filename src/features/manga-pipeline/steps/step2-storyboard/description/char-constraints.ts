/**
 * 角色约束（用于场景生成时注入角色一致性信息）
 */
import type { CharacterIllustration } from './char-illustration';

export interface EnhancedCharacterConstraint {
  characterId: string;
  name: string;
  appearance: string;
  outfit: string;
  pose: string;
  expression: string;
  referencePrompt: string;
  referenceImageUrls?: { front?: string; side?: string; fullBody?: string };
}

/** 从 CharacterIllustration 构建场景约束 */
export function buildCharacterConstraints(
  illustrations: CharacterIllustration[]
): EnhancedCharacterConstraint[] {
  return illustrations.map((illust) => ({
    characterId: illust.characterId,
    name: illust.name,
    appearance: extractField(illust.prompt, 'appearance') || illust.outfit,
    outfit: illust.outfit,
    pose: illust.pose,
    expression: illust.expression,
    referencePrompt: illust.referencePrompt,
  }));
}

function extractField(prompt: string, field: string): string | undefined {
  const match = prompt.match(new RegExp(`${field}:\\s*([^,]+)`));
  return match?.[1]?.trim();
}
