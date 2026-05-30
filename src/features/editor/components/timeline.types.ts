/**
 * Timeline types — 共享类型定义
 */

export interface TimelineClip {
  id: string;
  startTime: number;
  endTime: number;
  type: 'video' | 'audio' | 'text';
  content?: string;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  clips: TimelineClip[];
}

export interface TimelineProps {
  currentTime: number;
  duration: number;
  tracks: Track[];
  onTimeUpdate: (time: number) => void;
}