/**
 * 视频编辑器 Hook
 * 提供基础的视频编辑状态管理
 */

import { useState, useCallback } from 'react';

import { toast } from '@/shared/components/ui';

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
  // 项目信息
  projectId: string | null;
  projectName: string;
  
  // 时间轴
  currentTime: number;
  duration: number;
  zoom: number;
  
  // 播放状态
  isPlaying: boolean;
  playbackRate: number;
  
  // 选中状态
  selectedClipId: string | null;
  
  // 素材
  clips: TimelineClip[];
  
  // 历史记录
  history: TimelineClip[][];
  historyIndex: number;
}

export interface EditorOperations {
  // 时间轴操作
  seek: (time: number) => void;
  setZoom: (zoom: number) => void;
  
  // 播放控制
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaybackRate: (rate: number) => void;
  
  // 剪辑操作
  addClip: (clip: TimelineClip) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  
  // 选中操作
  selectClip: (clipId: string | null) => void;
  
  // 历史操作
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  // 项目操作
  loadProject: (projectId: string, projectName: string, clips?: TimelineClip[]) => void;
  exportProject: () => TimelineClip[];
}

export const useEditor = (): { state: EditorState; operations: EditorOperations } => {
  // 编辑器状态
  const [state, setState] = useState<EditorState>({
    projectId: null,
    projectName: '未命名项目',
    currentTime: 0,
    duration: 0,
    zoom: 1,
    isPlaying: false,
    playbackRate: 1,
    selectedClipId: null,
    clips: [],
    history: [[]],
    historyIndex: 0,
  });

  // 保存历史记录
  const saveHistory = useCallback(() => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...prev.clips]);
      
      // 限制历史记录长度
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // 计算总时长
  const updateDuration = useCallback((clips: TimelineClip[]) => {
    if (clips.length === 0) return 0;
    const maxEndTime = Math.max(...clips.map(c => c.endTime));
    return maxEndTime;
  }, []);

  // 时间轴操作
  const seek = useCallback((time: number) => {
    setState(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(time, prev.duration)),
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(zoom, 10)),
    }));
  }, []);

  // 播放控制
  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  // 剪辑操作
  const addClip = useCallback((clip: TimelineClip) => {
    setState(prev => {
      const newClips = [...prev.clips, clip];
      return {
        ...prev,
        clips: newClips,
        duration: updateDuration(newClips),
      };
    });
    saveHistory();
  }, [saveHistory, updateDuration]);

  const removeClip = useCallback((clipId: string) => {
    setState(prev => {
      const newClips = prev.clips.filter(c => c.id !== clipId);
      return {
        ...prev,
        clips: newClips,
        duration: updateDuration(newClips),
        selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId,
      };
    });
    saveHistory();
  }, [saveHistory, updateDuration]);

  const updateClip = useCallback((clipId: string, updates: Partial<TimelineClip>) => {
    setState(prev => {
      const newClips = prev.clips.map(c =>
        c.id === clipId ? { ...c, ...updates } : c
      );
      return {
        ...prev,
        clips: newClips,
        duration: updateDuration(newClips),
      };
    });
    saveHistory();
  }, [saveHistory, updateDuration]);

  const splitClip = useCallback((clipId: string, splitTime: number) => {
    setState(prev => {
      const clip = prev.clips.find(c => c.id === clipId);
      if (!clip || splitTime <= clip.startTime || splitTime >= clip.endTime) {
        return prev;
      }

      const newClip: TimelineClip = {
        ...clip,
        id: `${clip.id}_split_${Date.now()}`,
        startTime: splitTime,
        duration: clip.endTime - splitTime,
      };

      const updatedClip: TimelineClip = {
        ...clip,
        endTime: splitTime,
        duration: splitTime - clip.startTime,
      };

      const newClips = prev.clips.map(c =>
        c.id === clipId ? updatedClip : c
      ).concat(newClip);

      return {
        ...prev,
        clips: newClips,
        duration: updateDuration(newClips),
      };
    });
    saveHistory();
  }, [saveHistory, updateDuration]);

  // 选中操作
  const selectClip = useCallback((clipId: string | null) => {
    setState(prev => ({ ...prev, selectedClipId: clipId }));
  }, []);

  // 历史操作
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      const clips = prev.history[newIndex];
      return {
        ...prev,
        clips,
        historyIndex: newIndex,
        duration: updateDuration(clips),
      };
    });
  }, [updateDuration]);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      const clips = prev.history[newIndex];
      return {
        ...prev,
        clips,
        historyIndex: newIndex,
        duration: updateDuration(clips),
      };
    });
  }, [updateDuration]);

  // 项目操作
  const loadProject = useCallback((projectId: string, projectName: string, clips: TimelineClip[] = []) => {
    setState({
      projectId,
      projectName,
      currentTime: 0,
      duration: updateDuration(clips),
      zoom: 1,
      isPlaying: false,
      playbackRate: 1,
      selectedClipId: null,
      clips,
      history: [clips],
      historyIndex: 0,
    });
    toast.success(`已加载项目: ${projectName}`);
  }, [updateDuration]);

  const exportProject = useCallback(() => {
    return state.clips;
  }, [state.clips]);

  const operations: EditorOperations = {
    seek,
    setZoom,
    play,
    pause,
    togglePlay,
    setPlaybackRate,
    addClip,
    removeClip,
    updateClip,
    splitClip,
    selectClip,
    undo,
    redo,
    saveHistory,
    loadProject,
    exportProject,
  };

  return { state, operations };
};

export default useEditor;
