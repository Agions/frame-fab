/**
 * 分镜服务提示词构造
 * @module core/services/storyboard-prompt-builder
 *
 * 把原 `StoryboardService.buildImagePrompt`（私有）与 `generateFromScript` 内部的
 * 嵌入 prompt 字符串外提为纯函数。便于单测断言 + 后续 prompt 调优无需触碰主类。
 */

import { CAMERA_TYPE_PROMPT_MAP, type ScriptInput, type StoryboardFrame } from './storyboard-types';

/**
 * 构建"根据剧本生成分镜"的 AI prompt
 *
 * 与原 generateFromScript 内部字符串字面量逐行一致。
 * @param script 剧本输入
 * @param frameCount 期望分镜数
 */
export function buildGenerateFromScriptPrompt(
  script: ScriptInput,
  frameCount: number
): string {
  return `
请根据以下剧本内容生成 ${frameCount} 个分镜描述。

剧本标题：${script.title}
剧本内容：
${script.content}

请以 JSON 数组格式返回分镜信息，每个分镜包含：
- title: 分镜标题
- sceneDescription: 场景描述（详细描述画面内容）
- composition: 构图方式（如：中心构图、三分法、对角线等）
- cameraType: 镜头类型（如：wide全景、medium中景、closeup特写、pan横摇、tilt竖摇等）
- dialogue: 对话/旁白内容
- duration: 预计时长（秒）

请确保分镜逻辑连贯，镜头语言丰富。
`;
}

/**
 * 构建分镜图像生成的 prompt
 *
 * 行为与原 `buildImagePrompt` 完全一致：
 *   - parts 顺序为 "场景 → 构图 → 镜头 → 风格"
 *   - 镜头类型查不到时回退到原值（不做翻译）
 *   - 用全角逗号连接
 */
export function buildStoryboardImagePrompt(frame: StoryboardFrame): string {
  const parts: string[] = [];
  parts.push(`场景：${frame.sceneDescription}`);
  parts.push(`构图：${frame.composition}`);
  const cameraLabel = CAMERA_TYPE_PROMPT_MAP[frame.cameraType] ?? frame.cameraType;
  parts.push(`镜头：${cameraLabel}`);
  parts.push('风格：专业视频分镜，画面精美，氛围感强');
  return parts.join('，');
}
