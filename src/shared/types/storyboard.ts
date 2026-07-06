/**
 * 分镜领域类型 — 唯一 source of truth
 */
export interface StoryboardFrame {
  id: string;
  title: string;
  sceneDescription: string;
  composition: string;
  cameraType: string;
  dialogue: string;
  duration: number;
  imageUrl?: string;
}
