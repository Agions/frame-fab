/**
 * 视频编辑器类型定义
 */
export interface TimelineClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'video' | 'audio' | 'image';
  source?: string;
  volume?: number;
  speed?: number;
}

export interface EditorState {
  projectId: string | null;
  projectName: string;
  currentTime: number;
  duration: number;
  zoom: number;
  isPlaying: boolean;
  playbackRate: number;
  selectedClipId: string | null;
  clips: TimelineClip[];
  history: TimelineClip[][];
  historyIndex: number;
}

export interface EditorOperations {
  seek: (time: number) => void;
  setZoom: (zoom: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaybackRate: (rate: number) => void;
  addClip: (clip: TimelineClip) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  selectClip: (clipId: string | null) => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  loadProject: (projectId: string, projectName: string, clips?: TimelineClip[]) => void;
  exportProject: () => TimelineClip[];
}
