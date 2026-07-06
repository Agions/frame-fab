/**
 * 音频领域类型 — 唯一 source of truth
 */
export interface AudioTrackConfig {
  voiceTracks?: AudioTrack[];
  backgroundMusic?: BackgroundMusicTrack[];
  soundEffects?: SoundEffectTrack[];
}

export interface AudioTrack {
  id: string;
  name: string;
  filePath?: string;
  fileUrl?: string;
  duration: number;
  volume: number;
}

export interface BackgroundMusicTrack {
  id: string;
  name: string;
  filePath?: string;
  fileUrl?: string;
  duration: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
  startTime?: number;
}

export interface SoundEffectTrack {
  id: string;
  name: string;
  filePath?: string;
  duration: number;
  volume: number;
  startTime: number;
}
