/**
 * project.slice.ts — 项目列表领域切片
 * 职责：项目列表 CRUD + 过滤/排序
 */

import { v4 as uuid } from 'uuid';

import { storageService } from '@/core/services';
import type { ProjectData } from '@/core/types';

type SetState = (...args: any[]) => void;
type GetState = () => any;

export function createProjectSlice(set: SetState, get: GetState) {
  return {
    createProject: (partial: Partial<ProjectData>): ProjectData => {
      const now = new Date().toISOString();
      const project: ProjectData = {
        id: uuid(),
        name: partial.name ?? '新项目',
        description: partial.description ?? '',
        content: partial.content ?? '',
        status: partial.status ?? 'draft',
        createdAt: now,
        updatedAt: now,
      };
      set((s: any) => ({ projects: [...s.projects, project] }));
      return project;
    },

    updateProject: (id: string, updates: Partial<ProjectData>) => {
      set((s: any) => ({
        projects: s.projects.map((p: ProjectData) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
      }));
    },

    deleteProject: (id: string) => {
      set((s: any) => ({ projects: s.projects.filter((p: ProjectData) => p.id !== id) }));
    },

    filteredProjects: (): ProjectData[] => {
      const { projects, searchQuery, filterStatus, sortBy, sortOrder } = get();
      let result = [...projects];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        );
      }

      if (filterStatus !== 'all') {
        result = result.filter((p) => p.status === filterStatus);
      }

      result.sort((a, b) => {
        const aVal = a[sortBy] ?? '';
        const bVal = b[sortBy] ?? '';
        return sortOrder === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });

      return result;
    },

    recentProjects: (): ProjectData[] => {
      return [...get().projects]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);
    },

    exportProject: (id: string): string => {
      const project = get().projects.find((p: ProjectData) => p.id === id);
      return project ? JSON.stringify(project) : '';
    },

    importProject: (json: string): ProjectData | null => {
      try {
        const project = JSON.parse(json) as ProjectData;
        project.id = uuid();
        project.updatedAt = new Date().toISOString();
        set((s: any) => ({ projects: [...s.projects, project] }));
        return project;
      } catch {
        return null;
      }
    },

    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setFilterStatus: (status: any) => set({ filterStatus: status }),
    setSortBy: (sortBy: any) => set({ sortBy }),
    setSortOrder: (order: any) => set({ sortOrder: order }),
  };
}
