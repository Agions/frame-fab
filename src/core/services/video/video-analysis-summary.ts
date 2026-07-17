/**
 * 视频摘要生成
 * @module core/services/video/video-analysis-summary
 *
 * 提取自原 `VideoAnalysisService.generateSummary` + 私有 `generateDefaultSummary` +
 * 私有 `groupByCategory`。
 * 行为字节级一致：AI 失败时回退到基于视频信息 + 场景数 + 物体类别的默认摘要。
 */

import { aiService } from '@/core/services/ai/text/ai-service';
import { logger } from '@/core/utils/logger';
import { formatTime } from '@/shared/utils';
import type {
  ObjectDetection,
  VideoAnalysis,
  VideoInfo,
} from '@/shared/types';

/**
 * 按 category 分组物体（与原 groupByCategory 字节级一致）
 *
 * @returns [category, ObjectDetection[]] 数组（Map.entries() 顺序）
 */
export function groupObjectsByCategory(
  objects: ObjectDetection[]
): [string, ObjectDetection[]][] {
  const groups = new Map<string, ObjectDetection[]>();

  objects.forEach((obj) => {
    const list = groups.get(obj.category) ?? [];
    list.push(obj);
    groups.set(obj.category, list);
  });

  return Array.from(groups.entries());
}

/**
 * 构造 AI 摘要 prompt（与原 generateSummary 内联字符串字面量字节级一致）
 */
export function buildSummaryPrompt(
  videoInfo: VideoInfo,
  analysis: Partial<VideoAnalysis>
): string {
  const sceneLines =
    analysis.scenes?.map((s) => `- ${s.type}: ${s.description}`).join('\n') || '无';

  const objectLines =
    groupObjectsByCategory(analysis.objects ?? [])
      .map(([cat, objs]) => `- ${cat}: ${objs.length}个`)
      .join('\n') || '无';

  return `请为以下视频生成一个简洁的内容摘要：

视频信息：
- 时长：${formatTime(videoInfo.duration!)}
- 分辨率：${videoInfo!.width}x${videoInfo!.height}
- 格式：${videoInfo.format}

场景分析：
${sceneLines}

物体识别：
${objectLines}

请生成 2-3 句话的内容摘要。`;
}

/**
 * 生成默认摘要（当 AI 失败时回退）
 *
 * 行为与原 generateDefaultSummary 字节级一致：
 *   - 包含时长 / 分辨率
 *   - 包含场景数
 *   - 若 objectCategories 有内容则追加"主要元素包括 X、Y、Z"
 */
export function generateDefaultSummary(
  videoInfo: VideoInfo,
  analysis: Partial<VideoAnalysis>
): string {
  const sceneCount = analysis.scenes?.length ?? 0;
  const objectTypes = Object.keys(analysis.stats?.objectCategories ?? {});

  return (
    `视频时长 ${formatTime(videoInfo.duration!)}，分辨率 ${videoInfo.width}x${videoInfo.height}。` +
    `包含 ${sceneCount} 个场景${objectTypes.length > 0 ? `，主要元素包括 ${objectTypes.slice(0, 3).join('、')}` : ''}。`
  );
}

/**
 * AI 生成视频内容摘要（失败时回退到默认摘要）
 *
 * @param videoInfo 视频元信息
 * @param analysis 当前分析结果
 * @param ai AiServiceLike（默认走全局 aiService；测试可注入 mock）
 */
export async function generateSummary(
  videoInfo: VideoInfo,
  analysis: Partial<VideoAnalysis>,
  ai: typeof aiService = aiService
): Promise<string> {
  try {
    return await ai.generate(buildSummaryPrompt(videoInfo, analysis), {
      model: 'gpt-3.5-turbo',
      provider: 'openai',
    });
  } catch (error) {
    logger.error('生成摘要失败:', error);
    return generateDefaultSummary(videoInfo, analysis);
  }
}
