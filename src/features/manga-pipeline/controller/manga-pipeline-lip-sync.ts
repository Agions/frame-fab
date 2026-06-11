/**
 * 唇形同步 (Lip Sync) 应用模块
 * =============================
 * 接收 KeyframePipelineResult，对所有"有音频 + 有首帧"的场景进行唇形同步。
 *
 * - 批量并发：LIP_SYNC_CONCURRENCY 个场景为一组
 * - 异步轮询：若返回 status=processing，则每 2s 轮询一次，最多 30 次
 * - 容错：单场景失败不影响整体，warn log 后继续
 */
import { lipSyncService } from '@/core/services/audio/lip-sync.service';
import { logger } from '@/core/utils/logger';
import { delay } from '@/shared/utils/timing';

import type { KeyframePipelineResult } from '../steps/step5-keyframe/pipeline-controller';

import {
  LIP_SYNC_CONCURRENCY,
  LIP_SYNC_POLL_INTERVAL_MS,
  LIP_SYNC_POLL_MAX_ATTEMPTS,
  LIP_SYNC_PROGRESS_START,
  LIP_SYNC_PROGRESS_END,
} from './manga-pipeline-constants';

/** 进度回调签名 (controller 把子步骤进度回传 UI) */
export type LipSyncProgressCallback = (progress: number, subStepName: string) => void;

/**
 * 应用唇形同步到 keyframeResult 的所有场景。
 *
 * - 跳过没有 audioUrl 或没有 keyframes 的场景
 * - 替换场景首帧 imageUrl 为同步后的视频 URL
 * - 单场景失败：warn log 后继续
 */
export async function applyLipSyncToKeyframes(
  keyframeResult: KeyframePipelineResult,
  onProgress?: LipSyncProgressCallback
): Promise<void> {
  if (!keyframeResult?.keyframeScenes) return;

  const scenesWithAudio = keyframeResult.keyframeScenes.filter(
    (scene) => scene.audioUrl && scene.keyframes.length > 0
  );

  if (scenesWithAudio.length === 0) {
    logger.info('[MangaPipeline] 无需唇形同步的场景（无配音）');
    return;
  }

  logger.info(`[MangaPipeline] 开始唇形同步，共 ${scenesWithAudio.length} 个场景`);

  for (let i = 0; i < scenesWithAudio.length; i += LIP_SYNC_CONCURRENCY) {
    const batch = scenesWithAudio.slice(i, i + LIP_SYNC_CONCURRENCY);
    // lip-sync 阶段占 KEYFRAME 步的 LIP_SYNC_PROGRESS_START~END
    const lipProgress =
      LIP_SYNC_PROGRESS_START +
      Math.round((i / scenesWithAudio.length) * (LIP_SYNC_PROGRESS_END - LIP_SYNC_PROGRESS_START));
    onProgress?.(lipProgress, `唇同步 ${i + 1}/${scenesWithAudio.length}`);

    await Promise.allSettled(
      batch.map(async (scene) => {
        try {
          const sourceImageUrl = scene.keyframes[0].startFrame.imageUrl;
          if (!scene.audioUrl) {
            logger.warn(`Scene ${scene.sceneId} has no audioUrl, skipping lip sync`);
            return;
          }

          const result = await lipSyncService.syncLip(sourceImageUrl, scene.audioUrl);

          // 异步任务轮询
          if (result.status === 'processing' && result.taskId) {
            let attempts = 0;
            while (result.status === 'processing' && attempts < LIP_SYNC_POLL_MAX_ATTEMPTS) {
              await delay(LIP_SYNC_POLL_INTERVAL_MS);
              const statusResult = await lipSyncService.getLipSyncStatus(result.taskId);
              result.url = statusResult.url || result.url;
              result.status = statusResult.status;
              attempts++;
            }
          }

          if (result.url) {
            scene.keyframes[0].startFrame.imageUrl = result.url;
            logger.info(`[MangaPipeline] 场景 ${scene.sceneNumber} 唇形同步完成`);
          }
        } catch (err) {
          logger.warn(`[MangaPipeline] 场景 ${scene.sceneNumber} 唇形同步失败: ${err}`);
        }
      })
    );
  }
}
