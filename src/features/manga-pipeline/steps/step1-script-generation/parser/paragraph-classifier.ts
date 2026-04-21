export type ParagraphType = 'dialogue' | 'narration' | 'action' | 'inner_monologue';

export interface ClassifiedParagraph {
  type: ParagraphType;
  content: string;
  speaker?: string;
  originalIndex: number;
}

/**
 * 判断段落类型
 * - 对话：含引号「」"" 或以"XX："开头
 * - 动作：含动作词（走、跑、笑、哭、转头、推门等）
 * - 内心独白：含"我想""我心想""内心"等标记
 * - 叙述：其他
 */
export function classifyParagraph(text: string, index: number): ClassifiedParagraph {
  const trimmed = text.trim();

  // 空行
  if (!trimmed) {
    return { type: 'narration', content: trimmed, originalIndex: index };
  }

  // 内心独白检测（优先检查，明确标记开头）
  if (/^(我心想|我想|内心|自言自语|不由得)/.test(trimmed)) {
    return { type: 'inner_monologue', content: trimmed, originalIndex: index };
  }

  // 对话检测：引号开头
  if (/^["""「『]/.test(trimmed) || /^[A-Za-z\u4e00-\u9fa5]+：/.test(trimmed)) {
    const speakerMatch = trimmed.match(/^([A-Za-z\u4e00-\u9fa5]+)：/);
    return {
      type: 'dialogue',
      content: trimmed,
      speaker: speakerMatch?.[1],
      originalIndex: index,
    };
  }

  // 动作检测
  // 1. 句首是动作词
  const actionStartPatterns = [
    /^走进?/,
    /^来到?/,
    /^进入?/,
    /^跑[向进]?/,
    /^走[向进出]?/,
    /^推/,
    /^拉/,
    /^拿/,
    /^抓/,
    /^打/,
    /^踢/,
    /^撞/,
    /^举起?/,
    /^放下?/,
    /^打开/,
    /^关闭/,
    /^转身/,
    /^回头/,
    /^抬头/,
    /^低头/,
    /^点头/,
    /^摇头/,
    /^迈步/,
    /^冲出?/,
    /^趴/,
    /^蹲/,
    /^躺/,
    /^站/,
  ];
  const startsWithAction = actionStartPatterns.some(p => p.test(trimmed));
  
  // 2. 包含"XX推开门"、"XX走进"等动作结构（人名/代词 + 动作词）
  const hasActionStructure = /(推开|走进|走进?|来到|进入|跑向|跑进|冲出|举起|放下|打开|关闭|转身|回头|抬头|低头|点头|摇头|迈步)./.test(trimmed);
  
  // 3. 动作情感词（表情/情绪动作）
  const hasEmotionAction = /[哭笑生气愤怒惊讶愣]/.test(trimmed) && trimmed.length < 30;
  
  if (startsWithAction || hasActionStructure || hasEmotionAction) {
    return { type: 'action', content: trimmed, originalIndex: index };
  }

  return { type: 'narration', content: trimmed, originalIndex: index };
}

/**
 * 批量分类段落
 */
export function classifyParagraphs(text: string): ClassifiedParagraph[] {
  const lines = text.split('\n');
  return lines
    .map((line, i) => classifyParagraph(line, i))
    .filter(p => p.content.trim().length > 0);
}