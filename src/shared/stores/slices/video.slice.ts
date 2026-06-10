/**
 * video.slice.ts — 视频操作切片
 *
 * 【v3.3 代码审查 — 类型收窄】
 * 原 SetState = (...args: any[]) => void / GetState = () => any 削弱类型安全。
 * 改为精确的 VideoSliceFields + 推断 set callback。
 */

import type { VideoInfo, ProjectData } from '@/shared/types';

/** slice 关注的 state 字段：projects（含内嵌 videos） */
type VideoSliceFields = {
  projects: ProjectData[];
};

type VideoSetState = (
  partial: Partial<VideoSliceFields> | ((state: VideoSliceFields) => Partial<VideoSliceFields>)
) => void;

type VideoGetState = () => VideoSliceFields;

export function createVideoSlice(set: VideoSetState, _get: VideoGetState) {
  return {
    addVideo: (projectId: string, video: VideoInfo) => {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, videos: [...(p.videos ?? []), video] } : p
        ),
      }));
    },

    removeVideo: (projectId: string, videoId: string) => {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, videos: (p.videos ?? []).filter((v) => v.id !== videoId) }
            : p
        ),
      }));
    },
  };
}
