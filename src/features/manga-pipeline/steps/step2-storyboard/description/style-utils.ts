/**
 * 样式预设 + 角色性格/情感/时长工具函数
 */
import { EMOTION_KEYWORDS } from '../../../utils/emotions';
import { ANIME_STYLE, COMIC_STYLE, SKETCH_STYLE } from '../../../utils/prompt-template';

/** 根据风格名获取预设 */
export function getStylePreset(style: string) {
  switch (style) {
    case 'anime':
      return ANIME_STYLE;
    case 'comic':
      return COMIC_STYLE;
    case 'sketch':
      return SKETCH_STYLE;
    default:
      return ANIME_STYLE;
  }
}

/** 根据性格和说话风格推断姿态和表情 */
export function getPersonalityPose(
  personality: string,
  speakingStyle?: string
): { pose: string; expression: string } {
  const p = personality || '';
  const s = speakingStyle || '';

  const isExplicitCasual = s.includes('口语化') || s.includes('Casual') || s.includes('casual');
  const isExplicitFormal =
    (s.includes('正式') && !s.includes('普通')) || s.includes('Formal') || s.includes('formal');

  if (isExplicitCasual) {
    return {
      pose: 'casual pose, relaxed stance, one hand in pocket',
      expression: 'relaxed expression, easy smile',
    };
  }
  if (isExplicitFormal) {
    return {
      pose: 'formal pose, upright posture, hands at sides',
      expression: 'formal expression, composed demeanor',
    };
  }

  if (p.includes('开朗') || p.includes('活泼')) {
    return {
      pose: 'dynamic pose, one hand raised, energetic stance',
      expression: 'bright smile, cheerful expression, open eyes',
    };
  }
  if (p.includes('内向') || p.includes('沉默')) {
    return {
      pose: 'subtle pose, arms crossed, guarded stance',
      expression: 'reserved expression, slight smile, downward gaze',
    };
  }
  if (p.includes('急躁') || p.includes('暴躁')) {
    return {
      pose: 'tense pose, leaning forward, assertive stance',
      expression: 'intense expression, furrowed brow, determined look',
    };
  }
  if (p.includes('谨慎') || p.includes('冷静')) {
    return {
      pose: 'steady pose, hands clasped, balanced stance',
      expression: 'serene expression, composed look, alert eyes',
    };
  }

  return { pose: 'natural pose, relaxed stance', expression: 'neutral expression, relaxed look' };
}

/** 获取情感关键词 */
export function getEmotionKeyword(emotion?: string): string {
  return EMOTION_KEYWORDS[emotion || ''] || 'balanced lighting, natural atmosphere';
}

/** 根据场景类型和内容长度估算时长 */
export function estimateDuration(sceneType: string, contentLength: number): number {
  const base: Record<string, number> = { 对话: 8, 动作: 12, 追逐: 15, 对峙: 10, 情感: 10, 独白: 6 };
  const baseVal = base[sceneType] || 8;
  return baseVal + Math.min(Math.floor(contentLength / 50) * 1, 5);
}
