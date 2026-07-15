/**
 * Pipeline hooks barrel export.
 *
 * Central entry point for hooks that orchestrate the multi-step pipeline.
 * Consumers should import from `src/hooks/pipeline` (or its alias)
 * rather than reaching into sub-modules directly.
 */

export {
  useProject,
  projectReducer,
  initialProjectState,
  createProjectSetters,
} from './usePipeline';

export type { UseProjectReturn, ProjectState, ProjectAction, ProjectSetters } from './usePipeline';

export { ProjectEditContext, useProjectEdit, ProjectEditProvider } from './useStepContext';

export type { ProjectEditContextValue, ProjectEditProviderProps } from './useStepContext';
