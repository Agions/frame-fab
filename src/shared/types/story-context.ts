/**
 * Story Context — type re-exports
 *
 * Source of truth for StoryboardFrame: @/features/storyboard/components/StoryboardEditor
 */

export type { StoryboardFrame } from '@/features/storyboard/components/StoryboardEditor';

// Re-export types needed by consumers of StoryContext
export type { PipelineStepId, StepCheckpoint } from '@/core/pipeline/pipeline.types';
