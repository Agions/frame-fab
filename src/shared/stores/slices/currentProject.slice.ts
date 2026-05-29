/**
 * currentProject.slice.ts — 当前项目切片
 */

type SetState = (...args: any[]) => void;

export function createCurrentProjectSlice(set: SetState) {
  return {
    setCurrentProject: (project: any) => set({ currentProject: project }),
  };
}
