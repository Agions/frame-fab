/**
 * script.slice.ts — 脚本操作切片
 */

import type { ScriptData } from '@/core/types';

type SetState = (...args: any[]) => void;
type GetState = () => any;

export function createScriptSlice(set: SetState, _get: GetState) {
  return {
    addScript: (projectId: string, script: ScriptData) => {
      set((s: any) => ({
        projects: s.projects.map((p: any) =>
          p.id === projectId ? { ...p, scripts: [...(p.scripts ?? []), script] } : p
        ),
      }));
    },

    updateScript: (projectId: string, scriptId: string, updates: Partial<ScriptData>) => {
      set((s: any) => ({
        projects: s.projects.map((p: any) =>
          p.id === projectId
            ? {
                ...p,
                scripts: (p.scripts ?? []).map((sc: ScriptData) =>
                  sc.id === scriptId ? { ...sc, ...updates } : sc
                ),
              }
            : p
        ),
      }));
    },

    deleteScript: (projectId: string, scriptId: string) => {
      set((s: any) => ({
        projects: s.projects.map((p: any) =>
          p.id === projectId
            ? { ...p, scripts: (p.scripts ?? []).filter((sc: ScriptData) => sc.id !== scriptId) }
            : p
        ),
      }));
    },
  };
}
