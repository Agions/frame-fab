/**
 * useProject Hook
 * 项目状态管理
 */

import { useState, useCallback, useEffect } from 'react';

import { tauriService } from '@/core/services';
import { toast } from '@/shared/components/ui/toast';
import type { ProjectData } from '@/shared/types/project';
import { handleAsyncError } from '@/shared/utils/async';

export type { ProjectData } from '@/shared/types/project';

export interface UseProjectReturn {
  project: ProjectData | null;
  loading: boolean;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updateProject: (data: Partial<ProjectData>) => void;
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  resetProject: () => void;
}

export function useProject(_projectId?: string): UseProjectReturn {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // 加载项目
  const loadProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const projectText = await tauriService.readText(id);
      const projectData = JSON.parse(projectText) as ProjectData;
      setProject(projectData);

      // 根据数据恢复 step
      const scriptVal = projectData.scripts?.[0] ?? (projectData as { script?: string }).script;
      if (scriptVal) setCurrentStep(2);
      else if (projectData.content) setCurrentStep(1);
    } catch (err) {
      handleAsyncError(err, '加载项目失败');
      setError('加载项目失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存项目
  const saveProject = useCallback(async () => {
    if (!project) return;
    setSaving(true);
    try {
      const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString(),
      };
      await tauriService.writeText(project.id, JSON.stringify(updatedProject, null, 2));
      setProject(updatedProject);
      toast.success('项目已保存');
    } catch (err) {
      handleAsyncError(err, '保存项目失败', { toastMessage: '保存失败' });
    } finally {
      setSaving(false);
    }
  }, [project]);

  // 更新项目数据
  const updateProject = useCallback((data: Partial<ProjectData>) => {
    setProject((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  // 重置项目
  const resetProject = useCallback(() => {
    setProject(null);
    setError(null);
    setCurrentStep(0);
  }, []);

  // 自动加载
  useEffect(() => {
    if (_projectId) {
      loadProject(_projectId);
    }
  }, [_projectId, loadProject]);

  return {
    project,
    loading,
    saving,
    setSaving,
    error,
    setError,
    currentStep,
    setCurrentStep,
    updateProject,
    saveProject,
    loadProject,
    resetProject,
  };
}
