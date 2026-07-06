/**
 * ProjectDetail 计算属性
 */
import { useMemo } from 'react';

import type { EvaluationScores } from '@/core/services';
import { qualityGateService } from '@/core/services';
import type { ProjectData } from '@/shared/types';
import type { StoryboardFrame } from '@/shared/types/storyboard';

/** 从项目数据派生分镜帧列表 */
export function useStoryboardFrames(project: ProjectData | null): StoryboardFrame[] {
  return useMemo<StoryboardFrame[]>(
    () => (Array.isArray(project?.storyboardFrames) ? project.storyboardFrames : []),
    [project?.storyboardFrames]
  );
}

/** 从项目数据派生评估摘要 */
export function useEvaluationSummary(project: ProjectData | null): EvaluationScores | undefined {
  return useMemo(
    () => project?.evaluationReport?.summary ?? project?.evaluationSummary,
    [project?.evaluationReport, project?.evaluationSummary]
  );
}

/** 计算导出质量门禁 */
export function useExportQualityGate(
  storyboardFrames: StoryboardFrame[],
  evaluationSummary: EvaluationScores | undefined
) {
  return useMemo(
    () => qualityGateService.evaluate({ storyboardFrames, evaluationSummary }),
    [storyboardFrames, evaluationSummary]
  );
}

/** 根据选中帧 ID 查找对应帧 */
export function useSelectedFrame(
  storyboardFrames: StoryboardFrame[],
  selectedFrameId: string | undefined
): StoryboardFrame | null {
  return useMemo<StoryboardFrame | null>(
    () => storyboardFrames.find((frame) => frame.id === selectedFrameId) ?? null,
    [storyboardFrames, selectedFrameId]
  );
}
