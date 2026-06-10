/**
 * Keyframe Pipeline 常量 + 运动分析工具
 * =====================================
 * 字典：CAMERA_MOVEMENT_GUIDES + MOTION_TYPE_SUGGESTIONS
 * 工具：suggestMotionType (场景描述→运动类型) + estimateSceneDuration
 * 单一职责：配置字典 + 纯函数。
 */
import { MotionType, CameraMovement, type KeyframeScene } from './keyframe-types';

/** 相机运动指南 (CameraMovement → 中文指引) */
export const CAMERA_MOVEMENT_GUIDES: Record<CameraMovement, string[]> = {
  [CameraMovement.STATIC]: ['固定镜头', '保持画面稳定'],
  [CameraMovement.TRACKING]: ['跟拍', '跟随角色移动'],
  [CameraMovement.DOLLY]: ['推拉镜头', '向前或向后移动'],
  [CameraMovement.PAN]: ['水平摇镜', '左或右横扫'],
  [CameraMovement.TILT]: ['垂直摇镜', '上或下移动'],
  [CameraMovement.ZOOM_IN]: ['推进', '放大主体'],
  [CameraMovement.ZOOM_OUT]: ['拉远', '缩小主体'],
};

/** 运动类型建议 (MotionType → 适用场景) */
export const MOTION_TYPE_SUGGESTIONS: Record<MotionType, string[]> = {
  [MotionType.FADE]: ['场景切换', '时间流逝', '回忆'],
  [MotionType.SLIDE]: ['角色入场', '场景过渡'],
  [MotionType.ZOOM]: ['强调', '聚焦'],
  [MotionType.PAN]: ['环境展示', '跟随动作'],
  [MotionType.ROTATE]: ['旋转效果', '眩晕感'],
  [MotionType.CROSSFADE]: ['场景融合', '梦境效果'],
};

/** 默认帧持续时间 (秒) */
export const DEFAULT_KEYFRAME_DURATION = 3;

/** 默认并发上限 (防止 API 过载) */
export const KEYFRAME_SEMAPHORE_CONCURRENCY = 3;

/** 默认图片生成模型 */
export const DEFAULT_IMAGE_MODEL = 'seedream-5.0' as const;

/** 默认视频生成模型 */
export const DEFAULT_VIDEO_MODEL = 'seedance-2.0' as const;

/** 默认风格 */
export const DEFAULT_KEYFRAME_STYLE = 'anime';

/** 默认画面比例 */
export const DEFAULT_KEYFRAME_ASPECT_RATIO = '16:9';

/** 默认帧数 (每场景 2 帧：首帧+尾帧) */
export const DEFAULT_FRAMES_PER_SCENE = 2;

/**
 * 分析场景特征，推荐合适的运动类型。
 *
 * 优先级：中文关键词 > 英文关键词 > 情绪映射 > 默认 CROSSFADE
 */
export function suggestMotionType(sceneDescription: string, emotion?: string): MotionType {
  const desc = sceneDescription.toLowerCase();

  if (desc.includes('淡') || desc.includes('fade') || desc.includes('回忆')) {
    return MotionType.FADE;
  }
  if (desc.includes('入场') || desc.includes('enter') || desc.includes('进来')) {
    return MotionType.SLIDE;
  }
  if (desc.includes('放大') || desc.includes('zoom') || desc.includes('聚焦')) {
    return MotionType.ZOOM;
  }
  if (desc.includes('跟') || desc.includes('跟踪') || desc.includes('track')) {
    return MotionType.PAN;
  }
  if (desc.includes('旋转') || desc.includes('rotate') || desc.includes('spin')) {
    return MotionType.ROTATE;
  }
  if (desc.includes('融合') || desc.includes('梦幻') || desc.includes('dream')) {
    return MotionType.CROSSFADE;
  }

  // 根据情绪默认选择
  if (emotion === 'tense' || emotion === 'angry') {
    return MotionType.ZOOM;
  }
  if (emotion === 'sad') {
    return MotionType.FADE;
  }

  return MotionType.CROSSFADE;
}

/** 估算关键帧场景总时长 */
export function estimateSceneDuration(scene: KeyframeScene): number {
  return scene.keyframes.reduce((sum, kf) => sum + kf.duration, 0);
}
