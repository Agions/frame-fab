/**
 * 项目管理 Hook（自包含实现）
 *
 * 不依赖 project-storage / useProject.reducer / useProjectList，
 * 内部用 useState + localStorage 完成项目 CRUD。
 */

import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { ProjectData, VideoInfo, Script, ProjectSettings, TaskStatus } from '@/shared/types';

const PROJECTS_STORAGE_KEY = 'framefab_projects';

function loadProjects(): ProjectData[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProjectData[]) : [];
  } catch {
    return [];
  }
}

function persistProjects(projects: ProjectData[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore quota errors
  }
}

const DEFAULT_SETTINGS: ProjectSettings = {
  videoQuality: 'high',
  outputFormat: 'mp4',
  resolution: '1080p',
  frameRate: 30,
  audioCodec: 'aac',
  videoCodec: 'h264',
  subtitleEnabled: true,
};

export interface UseProjectReturn {
  project: ProjectData | null;
  projects: ProjectData[];
  recentProjects: ProjectData[];
  createProject: (name: string, description?: string) => ProjectData;
  loadProject: (projectId: string) => Promise<boolean>;
  saveProject: () => Promise<boolean>;
  updateProject: (updates: Partial<ProjectData>) => void;
  deleteProject: (projectId: string) => Promise<boolean>;
  duplicateProject: (projectId: string) => Promise<ProjectData | null>;
  setVideo: (videoInfo: VideoInfo) => void;
  removeVideo: () => void;
  setScript: (script: Script) => void;
  updateScript: (updates: Partial<Script>) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  taskStatus: TaskStatus | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  resetProject: () => void;
}

export function useProject(_projectId?: string): UseProjectReturn {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>(() => loadProjects());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const taskStatus: TaskStatus | null = null;

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  }, [projects]);

  const createProject = useCallback((name: string, description?: string): ProjectData => {
    const now = new Date().toISOString();
    const newProject: ProjectData = {
      id: uuidv4(),
      name: name || '未命名项目',
      description,
      status: 'draft',
      settings: { ...DEFAULT_SETTINGS },
      videos: [],
      scripts: [],
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => {
      const next = [newProject, ...prev];
      persistProjects(next);
      return next;
    });
    setProject(newProject);
    setHasUnsavedChanges(false);
    return newProject;
  }, []);

  const loadProject = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const all = loadProjects();
      const loaded = all.find((p) => p.id === id) || null;
      if (loaded) {
        setProject(loaded);
        setHasUnsavedChanges(false);
        return true;
      } else {
        setError('项目不存在');
        return false;
      }
    } catch {
      setError('加载项目失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProject = useCallback(async (): Promise<boolean> => {
    if (!project) return false;
    setIsSaving(true);
    try {
      const updated = { ...project, updatedAt: new Date().toISOString() };
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? updated : p));
        persistProjects(next);
        return next;
      });
      setProject(updated);
      setHasUnsavedChanges(false);
      return true;
    } catch {
      setError('保存项目失败');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [project]);

  const updateProject = useCallback(
    (updates: Partial<ProjectData>) => {
      if (!project) return;
      setProject((prev) => (prev ? { ...prev, ...updates } : null));
      setHasUnsavedChanges(true);
    },
    [project]
  );

  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setProjects((prev) => {
          const next = prev.filter((p) => p.id !== id);
          persistProjects(next);
          return next;
        });
        if (project?.id === id) setProject(null);
        return true;
      } catch {
        setError('删除项目失败');
        return false;
      }
    },
    [project]
  );

  const duplicateProject = useCallback(async (id: string): Promise<ProjectData | null> => {
    const source = loadProjects().find((p) => p.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const duplicated: ProjectData = {
      ...source,
      id: uuidv4(),
      name: `${source.name} (副本)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => {
      const next = [duplicated, ...prev];
      persistProjects(next);
      return next;
    });
    return duplicated;
  }, []);

  const setVideo = useCallback(
    (videoInfo: VideoInfo) => {
      updateProject({ videos: [videoInfo] });
    },
    [updateProject]
  );

  const removeVideo = useCallback(() => {
    updateProject({ videos: [] });
  }, [updateProject]);

  const setScript = useCallback(
    (script: Script) => {
      updateProject({ scripts: [script] });
    },
    [updateProject]
  );

  const updateScript = useCallback(
    (updates: Partial<Script>) => {
      if (!project?.scripts?.[0]) return;
      updateProject({
        scripts: [{ ...project.scripts[0], ...updates, updatedAt: new Date().toISOString() }],
      });
    },
    [project, updateProject]
  );

  const updateSettings = useCallback(
    (settings: Partial<ProjectSettings>) => {
      if (!project) return;
      updateProject({
        settings: { ...project.settings, ...settings } as ProjectSettings,
      });
    },
    [project, updateProject]
  );

  const resetProject = useCallback(() => {
    setProject(null);
    setHasUnsavedChanges(false);
    setError(null);
    setCurrentStep(0);
  }, []);

  return {
    project,
    projects,
    recentProjects,
    createProject,
    loadProject,
    saveProject,
    updateProject,
    deleteProject,
    duplicateProject,
    setVideo,
    removeVideo,
    setScript,
    updateScript,
    updateSettings,
    taskStatus,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    currentStep,
    setCurrentStep,
    saving: isSaving,
    setSaving: setIsSaving,
    setError,
    resetProject,
  };
}
