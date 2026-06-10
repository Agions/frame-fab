/**
 * KeyframePipeline - 关键帧驱动流水线（Facade）
 * =============================================
 * 参考 deep-printfilm 的关键帧驱动方法：
 * 1. 生成首帧 (start frame)
 * 2. 生成尾帧 (end frame)
 * 3. 分析运动类型
 * 4. 帧间插值生成
 * 5. 合成视频
 *
 * 拆分思路（4 个 sibling 模块）：
 * - keyframe-types              7 interface + 2 enum
 * - keyframe-config             2 字典 + suggestMotionType + estimateSceneDuration + 常量
 * - keyframe-prompt-builder     buildFramePrompt + buildVideoPrompt
 * - keyframe-scene-builder      createKeyframeScene + createPlaceholderFrame
 * - pipeline-controller.ts (facade) KeyframePipeline 类（三阶段编排）
 *
 * 调用方不需要修改（MangaPipelineController / lip-sync / visual-consistency）。
 */

import { StepInput, StepOutput } from '@/core/pipeline/step.interface';
import {
  generateVideo,
  type VideoGenerationOptions,
} from '@/core/services/ai/image/image-generation.service';
import { logger } from '@/core/utils/logger';

import { BasePipelineController } from '../../base/BasePipelineController';

import {
  suggestMotionType,
  DEFAULT_KEYFRAME_STYLE,
  DEFAULT_KEYFRAME_ASPECT_RATIO,
  DEFAULT_FRAMES_PER_SCENE,
  DEFAULT_KEYFRAME_DURATION,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_VIDEO_MODEL,
  KEYFRAME_SEMAPHORE_CONCURRENCY,
} from './keyframe-config';
import { buildVideoPrompt } from './keyframe-prompt-builder';
import { createKeyframeScene } from './keyframe-scene-builder';
import {
  MotionType,
  CameraMovement,
  type KeyframeScene,
  type KeyframePipelineResult,
  type KeyframePipelineInput,
} from './keyframe-types';

// 类型 re-export 保持旧 import 路径
export {
  MotionType,
  CameraMovement,
  type GeneratedFrame,
  type KeyframePair,
  type KeyframeScene,
  type KeyframePipelineInput,
  type CharacterVideoReference,
  type KeyframePipelineResult,
} from './keyframe-types';
export { CAMERA_MOVEMENT_GUIDES, MOTION_TYPE_SUGGESTIONS } from './keyframe-config';

export { suggestMotionType, estimateSceneDuration } from './keyframe-config';
export { createKeyframeScene } from './keyframe-scene-builder';
export { buildFramePrompt, buildVideoPrompt } from './keyframe-prompt-builder';

// ============================================================================
// 内部：简单信号量（限制并发数）
// ============================================================================

interface Semaphore {
  count: number;
  queue: (() => void)[];
  acquire(): Promise<void>;
  release(): void;
}

function createSemaphore(max: number): Semaphore {
  const sem: Semaphore = {
    count: 0,
    queue: [],
    async acquire() {
      if (this.count < max) {
        this.count++;
        return;
      }
      await new Promise<void>((resolve) => this.queue.push(resolve));
    },
    release() {
      this.count--;
      const next = this.queue.shift();
      if (next) {
        this.count++;
        next();
      }
    },
  };
  return sem;
}

// ============================================================================
// KeyframePipeline 类（三阶段编排）
// ============================================================================

/**
 * KeyframePipeline - 关键帧驱动流水线（并发生成版）
 *
 * 优化点：
 * 1. 多个场景并发生成（非串行等待）
 * 2. 首帧+尾帧并发生成
 * 3. 集成角色一致性约束到帧和视频生成
 */
export class KeyframePipeline extends BasePipelineController {
  id = 'keyframe-pipeline';
  name = 'Keyframe-Driven Generation';

  protected subSteps = ['分析场景', '生成关键帧', '分析运动', '合成视频'];

  protected async _doProcess(input: StepInput): Promise<StepOutput> {
    const {
      scenes,
      style = DEFAULT_KEYFRAME_STYLE,
      aspectRatio = DEFAULT_KEYFRAME_ASPECT_RATIO,
      characterReferences,
      dialogueSegments,
    } = input as StepInput & KeyframePipelineInput;

    this.updateProgress(0, '分析场景');

    // ========== 阶段1：并发生成所有场景的关键帧 ==========
    const sceneCount = scenes.length;
    const semaphore = createSemaphore(KEYFRAME_SEMAPHORE_CONCURRENCY);
    let completedCount = 0;

    const keyframeScenePromises = scenes.map((scene) =>
      (async () => {
        await semaphore.acquire();
        try {
          const result = await createKeyframeScene(scene, {
            frameCount: DEFAULT_FRAMES_PER_SCENE,
            defaultDuration: DEFAULT_KEYFRAME_DURATION,
            style,
            aspectRatio,
            imageOptions: { model: DEFAULT_IMAGE_MODEL },
            characterReferences,
            dialogueSegments,
          });
          completedCount++;
          this.updateProgress(
            5 + (completedCount / sceneCount) * 35,
            `生成关键帧（${completedCount}/${sceneCount}）`
          );
          return result;
        } finally {
          semaphore.release();
        }
      })()
    );

    const keyframeSceneResults = await Promise.allSettled(keyframeScenePromises);

    // 检查是否有失败
    const failures = keyframeSceneResults
      .map((r, i) => (r.status === 'rejected' ? i : null))
      .filter((i): i is number => i !== null);

    if (failures.length > 0) {
      const msg = failures.map((i) => `场景${i + 1}失败`).join(', ');
      throw new Error(`关键帧生成部分失败: ${msg}`);
    }

    const keyframeScenes = keyframeSceneResults.map(
      (r) => (r as PromiseFulfilledResult<KeyframeScene>).value
    );

    // ========== 阶段2：分析运动类型 ==========
    this.updateProgress(42, '分析运动');
    keyframeScenes.forEach((scene) => {
      scene.keyframes.forEach((kf) => {
        kf.motionType = suggestMotionType(scene.description, undefined);
        kf.cameraMovement = CameraMovement.STATIC;
      });
    });

    // ========== 阶段3：并发生成视频片段 ==========
    this.updateProgress(45, '生成视频');

    const videoPromises = keyframeScenes.map((scene, i) =>
      Promise.all(
        scene.keyframes.map(async (kf) => {
          this.updateProgress(
            45 + ((i + 1) / keyframeScenes.length) * 45,
            `合成场景 ${i + 1} 视频`
          );

          const videoResult = await generateVideo(
            buildVideoPrompt(scene, kf, characterReferences),
            {
              model: DEFAULT_VIDEO_MODEL,
              duration: kf.duration,
              referenceImage: kf.startFrame.imageUrl,
              characterReferences: characterReferences,
              aspectRatio: aspectRatio as VideoGenerationOptions['aspectRatio'],
            }
          );

          kf.startFrame.imageUrl = videoResult.url || kf.startFrame.imageUrl;
          return videoResult;
        })
      )
    );

    await Promise.allSettled(videoPromises).then((results) => {
      const failures = results
        .map((r, i) => (r.status === 'rejected' ? i : null))
        .filter((i): i is number => i !== null);

      if (failures.length > 0) {
        logger.warn(`[KeyframePipeline] ${failures.length} 个视频生成失败`);
      }
    });

    this.updateProgress(95, '后处理');

    const totalDuration = keyframeScenes.reduce((sum, scene) => sum + scene.totalDuration, 0);

    this.updateProgress(100, '完成');

    const result: KeyframePipelineResult = {
      keyframeScenes,
      totalDuration,
      metadata: {
        totalFrames: keyframeScenes.reduce((sum, s) => sum + s.keyframes.length * 2, 0),
        totalKeyframes: keyframeScenes.reduce((sum, s) => sum + s.keyframes.length, 0),
        estimatedVideoDuration: totalDuration,
        style,
        generatedAt: Date.now(),
      },
    };

    return { keyframePipeline: result } as StepOutput;
  }
}
