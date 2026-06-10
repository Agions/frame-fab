/**
 * 分镜场景分割与兜底分镜构造
 * @module core/services/storyboard-scene-splitter
 *
 * 提取自 `StoryboardService.generateFallbackFrames` + `splitContentIntoScenes`。
 *
 * 注意：原 `splitContentIntoScenes` 在 `slice().join(' ')` 后使用了
 *   `sceneContent ?? \`场景 ${i + 1}\``
 * 这里的 `??` 在类型层面是必要的（TS 推断为 `string | undefined`），
 * 运行时 slice+join 永远得到 string，`??` 不会触发——但保留以保证行为字节级一致。
 */

import { createStoryboardFrame } from './storyboard-frame-factory';
import type { StoryboardFrame } from './storyboard-types';

/**
 * 把脚本内容拆成 `count` 个场景文本
 *
 * 规则（与原实现完全一致）：
 *   1. 按 `\n+` 切段，去掉空段
 *   2. 若段落数 ≤ count：返回每段
 *   3. 否则按 `ceil(段落数/count)` 等分；最后一段用 `场景 N` 兜底
 */
export function splitContentIntoScenes(content: string, count: number): string[] {
  const paragraphs = content.split(/\n+/).filter((p) => p.trim());

  if (paragraphs.length <= count) {
    return paragraphs.map((p) => p.trim());
  }

  const scenes: string[] = [];
  const chunkSize = Math.ceil(paragraphs.length / count);

  for (let i = 0; i < count; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, paragraphs.length);
    const sceneContent = paragraphs.slice(start, end).join(' ');
    scenes.push(sceneContent || `场景 ${i + 1}`);
  }

  return scenes;
}

/**
 * AI 生成失败时的兜底分镜：均匀切分内容为 N 个分镜
 *
 * 字段默认值与 createStoryboardFrame 一致（composition='中心构图'、cameraType='medium'、duration=5）。
 * 行为与原 `generateFallbackFrames` 完全一致。
 */
export function generateFallbackFrames(
  script: { title: string; content: string },
  count: number
): StoryboardFrame[] {
  const scenes = splitContentIntoScenes(script.content, count);
  return scenes.map((scene, index) =>
    createStoryboardFrame(
      {
        title: `分镜 ${index + 1}`,
        sceneDescription: scene,
        composition: '中心构图',
        cameraType: 'medium',
        dialogue: '',
        duration: 5,
      },
      index
    )
  );
}
