/**
 * script.slice.ts — 脚本操作切片
 *
 * 【v3.3 代码审查 — 类型收窄】
 * 原 SetState = (...args: any[]) => void / GetState = () => any 削弱类型安全。
 * 改为精确的 ScriptSliceFields + 推断 set callback。
 */

import type { Script, ProjectData } from '@/shared/types';

type ScriptSliceFields = {
  projects: ProjectData[];
};

type ScriptSetState = (
  partial: Partial<ScriptSliceFields> | ((state: ScriptSliceFields) => Partial<ScriptSliceFields>)
) => void;

type ScriptGetState = () => ScriptSliceFields;

export function createScriptSlice(set: ScriptSetState, _get: ScriptGetState) {
  return {
    addScript: (projectId: string, script: Script) => {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, scripts: [...(p.scripts ?? []), script] } : p
        ),
      }));
    },

    updateScript: (projectId: string, scriptId: string, updates: Partial<Script>) => {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                scripts: (p.scripts ?? []).map((sc) =>
                  sc.id === scriptId ? { ...sc, ...updates } : sc
                ),
              }
            : p
        ),
      }));
    },

    deleteScript: (projectId: string, scriptId: string) => {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, scripts: (p.scripts ?? []).filter((sc) => sc.id !== scriptId) }
            : p
        ),
      }));
    },
  };
}
