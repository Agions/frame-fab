/**
 * features/storyboard/index.ts
 * Storyboard feature exports - Storyboard editing
 */

// Component
export { default as StoryboardEditor } from './components/StoryboardEditor';

// Service
export { getStoryboardService, resetStoryboardService } from '@/core/services/storyboard.service';
export type { StoryboardFrame } from '@/shared/types/storyboard';

// Collaboration panel (extracted from ProjectDetailPage)
export {
  StoryboardCollaborationPanel,
  type StoryboardCollaborationPanelProps,
} from './components/StoryboardCollaborationPanel';
