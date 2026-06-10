/**
 * 提示词质量检查
 */

/** 检查 prompt 长度、风格关键词、镜头描述 */
export function validatePrompt(prompt: string): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (prompt.length < 20) warnings.push('Prompt 太短，可能缺乏细节');
  if (prompt.length > 500) warnings.push('Prompt 过长，可能被截断');
  const styleKeywords = ['style', 'anime', 'comic', 'art'];
  if (!styleKeywords.some((k) => prompt.toLowerCase().includes(k))) warnings.push('缺少风格关键词');
  const cameraKeywords = ['shot', 'camera', 'view', 'angle', 'close-up', 'wide'];
  if (!cameraKeywords.some((k) => prompt.toLowerCase().includes(k)))
    warnings.push('缺少镜头描述，可能影响生成效果');
  return { ok: warnings.length === 0, warnings };
}
