import { createContext, useContext } from 'react';

import type { ProjectEditContextValue } from './project-edit-state';

export const ProjectEditContext = createContext<ProjectEditContextValue | null>(null);

/** 在 ProjectEditProvider 内部使用，获取完整的 state + actions。 */
export function useProjectEdit(): ProjectEditContextValue {
  const ctx = useContext(ProjectEditContext);
  if (!ctx) {
    throw new Error('useProjectEdit must be used within ProjectEditProvider');
  }
  return ctx;
}
