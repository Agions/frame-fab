/**
 * Pipeline facade for the step context provider.
 *
 * Re-exports `ProjectEditContext` and the `useProjectEdit` hook from the
 * ProjectEdit page context so pipeline steps can depend on a single module.
 * No logic lives here — it is only a re-export facade for stability.
 */

export {
  ProjectEditContext,
  useProjectEdit,
  ProjectEditProvider,
  type ProjectEditContextValue,
  type ProviderProps as ProjectEditProviderProps,
} from '@/pages/project-edit/context/ProjectEditContext';
