/**
 * Keyframe Pipeline Prompt 构建器
 * ===============================
 * 两个 prompt builder：帧 prompt (首帧/尾帧) + 视频 prompt。
 * 两者都做"场景描述 + 运动/帧类型 + 角色约束"组合——统一在一个地方维护。
 * 单一职责：prompt 字符串构建，无 AI 调用。
 */
import {
  MotionType,
  CameraMovement,
  type KeyframeScene,
  type KeyframePair,
  type CharacterVideoReference,
  type KeyframePipelineInput,
} from './keyframe-types';

/**
 * 运动类型 → 英文运动描述 (视频 prompt 用)
 */
const MOTION_HINT: Record<MotionType, string> = {
  [MotionType.FADE]: 'fade in/out transition',
  [MotionType.SLIDE]: 'smooth sliding motion',
  [MotionType.ZOOM]: 'zoom effect',
  [MotionType.PAN]: 'pan camera movement',
  [MotionType.ROTATE]: 'rotate camera movement',
  [MotionType.CROSSFADE]: 'crossfade transition',
};

/**
 * 帧类型 → 英文帧位置描述
 */
const FRAME_TYPE_HINT: Record<'start' | 'end', string> = {
  start: '起始画面, character in standing pose, stable composition',
  end: 'ending frame, motion continues naturally from previous scene',
};

/**
 * 构建帧提示词（集成角色一致性约束）。
 *
 * 用于首帧/尾帧图片生成：
 * 1. 场景描述 + 地点
 * 2. 帧类型（start: 稳定构图 / end: 动作延续）
 * 3. 角色约束（在场景描述中提及的角色 → 注入 reference prompt）
 * 4. 帧序号标记
 */
export function buildFramePrompt(
  scene: KeyframePipelineInput['scenes'][0],
  frameIndex: number,
  frameType: 'start' | 'end',
  characterReferences?: CharacterVideoReference[]
): string {
  const basePrompt = `${scene.description}, ${scene.location}`;
  const frameHint = FRAME_TYPE_HINT[frameType];

  // 角色一致性约束（注入真实 reference prompt）
  let charHint = '';
  if (characterReferences && characterReferences.length > 0) {
    const sceneChars = characterReferences.filter((c) =>
      scene.description?.toLowerCase().includes(c.name.toLowerCase())
    );
    if (sceneChars.length > 0) {
      const charTokens = sceneChars.map((c) => `${c.name}: ${c.referencePrompt}`).join(' | ');
      charHint = `maintain consistent character appearance: ${charTokens}`;
    }
  }

  const parts = [basePrompt, frameHint, charHint, `第${frameIndex + 1}帧`].filter(Boolean);
  return parts.join(', ');
}

/**
 * 构建视频生成提示词（集成角色一致性绑定）。
 *
 * 用于视频生成（keyframe pair → video）：
 * 1. 场景描述
 * 2. 运动类型描述（英文）
 * 3. 相机运动
 * 4. 角色约束（如果有）
 */
export function buildVideoPrompt(
  scene: KeyframeScene,
  kf: KeyframePair,
  characterReferences?: CharacterVideoReference[]
): string {
  const parts: string[] = [
    scene.description,
    MOTION_HINT[kf.motionType],
    `camera ${scene.cameraMovement || CameraMovement.STATIC}`,
  ];

  // 注入角色约束（如果有）
  if (characterReferences && characterReferences.length > 0) {
    const charPrompts = characterReferences
      .map((c) => `${c.name}: ${c.referencePrompt}`)
      .join(' | ');
    parts.push(`maintain character consistency: ${charPrompts}`);
  }

  return parts.join(', ');
}
