/**
 * Preview Types
 * Types for the preview panel system
 */

export interface Frame {
  id: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: number;
  startTime?: number;
  endTime?: number;
  caption?: string;
  metadata?: Record<string, unknown>;
  overlay?: string;
}

export interface PreviewOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playbackRate?: number;
  quality?: 'low' | 'medium' | 'high';
  showControls?: boolean;
  zoom?: number;
}