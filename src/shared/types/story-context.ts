/**
 * Story Context — Strictly-typed pipeline context
 *
 * Replaces Map<string, unknown> with exact typed accessors.
 * Each domain variable has a dedicated getter/setter with compile-time type safety.
 *
 * Usage:
 *   const ctx = createStoryContext('workflow-123');
 *   ctx.setScripts(scripts);
 *   const scripts = ctx.getScripts(); // string[] | undefined (strict)
 */

import type { PipelineStepId, StepCheckpoint } from '@/core/pipeline/pipeline.types';
import type { AudioSynthesisOutput } from '@/core/pipeline/step-audio-synthesis';
import type { CompositionOutput } from '@/core/pipeline/step-composition';
import type { RenderOutput } from '@/core/pipeline/step-render';
import type { StoryboardOutput } from '@/core/pipeline/step-storyboard';
import { logger } from '@/core/utils/logger';

import type { NovelScene, Character } from './novel';
import type { Script } from './script';

// ========== Domain Types ==========

export interface StoryScript {
  id: string;
  title: string;
  content: string;
  segments: Array<{
    id: string;
    startTime: number;
    endTime: number;
    content: string;
    type: 'narration' | 'dialogue' | 'action' | 'transition';
  }>;
}

export interface StoryCharacter {
  id: string;
  name: string;
  appearance: Record<string, string>;
  consistency: {
    seed?: number;
    referenceImages?: string[];
  };
}

export interface RenderedFrame {
  frameId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  qualityScore?: number;
  renderTime: number;
}

// ========== StoryContext Interface ==========

export interface StoryContext {
  readonly workflowId: string;
  readonly projectId?: string;

  // ---- Import ----
  getChapters: () =>
    | Array<{ id: string; title: string; content: string; order: number }>
    | undefined;
  setChapters: (
    chapters: Array<{ id: string; title: string; content: string; order: number }>
  ) => void;
  getProjectMetadata: () => { title?: string; author?: string; genre?: string } | undefined;
  setProjectMetadata: (metadata: { title?: string; author?: string; genre?: string }) => void;

  // ---- Analysis ----
  getScenes: () => NovelScene[] | undefined;
  setScenes: (scenes: NovelScene[]) => void;

  // ---- Script ----
  getScripts: () => StoryScript[] | undefined;
  setScripts: (scripts: StoryScript[]) => void;

  // ---- Character ----
  getCharacters: () => StoryCharacter[] | undefined;
  setCharacters: (characters: StoryCharacter[]) => void;

  // ---- Storyboard ----
  getFrames: () => StoryboardOutput['frames'] | undefined;
  setFrames: (frames: StoryboardOutput['frames']) => void;

  // ---- Render ----
  getRenderedFrames: () => RenderedFrame[] | undefined;
  setRenderedFrames: (frames: RenderedFrame[]) => void;
  getFailedFrames: () => string[] | undefined;
  setFailedFrames: (frameIds: string[]) => void;

  // ---- Audio ----
  getDialogueAudio: () => AudioSynthesisOutput['dialogueAudio'] | undefined;
  setDialogueAudio: (audio: AudioSynthesisOutput['dialogueAudio']) => void;
  getSelectedBgm: () => string | undefined;
  setSelectedBgm: (bgm: string) => void;

  // ---- Composition ----
  getComposedVideoUrl: () => string | undefined;
  setComposedVideoUrl: (url: string) => void;

  // ---- Generic accessors (for variables not yet typed) ----
  getVariable: <T>(key: string) => T | undefined;
  setVariable: <T>(key: string, value: T) => void;

  // ---- Checkpoint ----
  getCheckpoint: (stepId: PipelineStepId) => StepCheckpoint | undefined;
  saveCheckpoint: (checkpoint: StepCheckpoint) => void;

  // ---- Logging ----
  log: (msg: string, level?: 'debug' | 'info' | 'warn' | 'error') => void;
}

// ========== Factory ==========

export function createStoryContext(workflowId: string, projectId?: string): StoryContext {
  // Internal storage
  const chapters = new Map<string, unknown>();

  const log = (msg: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info') => {
    const prefix = `[StoryContext][${workflowId}]`;
    if (level === 'error') logger.error(`${prefix} ${msg}`);
    else if (level === 'warn') logger.warn(`${prefix} ${msg}`);
    else logger.info(`${prefix} ${msg}`);
  };

  return {
    get workflowId() {
      return workflowId;
    },
    get projectId() {
      return projectId;
    },

    // ---- Import ----
    getChapters: () =>
      chapters.get('chapters') as StoryContext['getChapters'] extends () => infer R ? R : never,
    setChapters: (chs) => {
      chapters.set('chapters', chs);
    },

    getProjectMetadata: () =>
      chapters.get('projectMetadata') as StoryContext['getProjectMetadata'] extends () => infer R
        ? R
        : never,
    setProjectMetadata: (m) => {
      chapters.set('projectMetadata', m);
    },

    // ---- Analysis ----
    getScenes: () => chapters.get('scenes') as NovelScene[] | undefined,
    setScenes: (s) => {
      chapters.set('scenes', s);
    },

    // ---- Script ----
    getScripts: () => chapters.get('scripts') as StoryScript[] | undefined,
    setScripts: (s) => {
      chapters.set('scripts', s);
    },

    // ---- Character ----
    getCharacters: () => chapters.get('characters') as StoryCharacter[] | undefined,
    setCharacters: (c) => {
      chapters.set('characters', c);
    },

    // ---- Storyboard ----
    getFrames: () => chapters.get('frames') as StoryboardOutput['frames'] | undefined,
    setFrames: (f) => {
      chapters.set('frames', f);
    },

    // ---- Render ----
    getRenderedFrames: () => chapters.get('renderedFrames') as RenderedFrame[] | undefined,
    setRenderedFrames: (f) => {
      chapters.set('renderedFrames', f);
    },
    getFailedFrames: () => chapters.get('failedFrames') as string[] | undefined,
    setFailedFrames: (ids) => {
      chapters.set('failedFrames', ids);
    },

    // ---- Audio ----
    getDialogueAudio: () =>
      chapters.get('dialogueAudio') as AudioSynthesisOutput['dialogueAudio'] | undefined,
    setDialogueAudio: (a) => {
      chapters.set('dialogueAudio', a);
    },
    getSelectedBgm: () => chapters.get('selectedBgm') as string | undefined,
    setSelectedBgm: (b) => {
      chapters.set('selectedBgm', b);
    },

    // ---- Composition ----
    getComposedVideoUrl: () => chapters.get('composedVideoUrl') as string | undefined,
    setComposedVideoUrl: (u) => {
      chapters.set('composedVideoUrl', u);
    },

    // ---- Generic ----
    getVariable: <T>(key: string) => chapters.get(key) as T | undefined,
    setVariable: <T>(key: string, value: T) => {
      chapters.set(key, value);
    },

    // ---- Checkpoint (stateless stub — real impl in PipelineEngine) ----
    getCheckpoint: () => undefined,
    saveCheckpoint: () => {
      log(
        '[StoryContext] saveCheckpoint called but not implemented — delegating to PipelineEngine'
      );
    },

    log,
  };
}

export type { PipelineStepId, StepCheckpoint } from '@/core/pipeline/pipeline.types';
