/**
 * StepContentSwitcher — 步骤内容切换器
 *
 * 根据 currentStep index 渲染对应的步骤子组件。
 * 步骤子组件通过 Context selector hooks 自行获取所需的 state + actions，
 * 无需从 Page 层层传递 53 个 props。
 *
 * 对外仅暴露：
 *   - currentStep: 当前步骤索引
 *   - projectId: 项目 ID（部分步骤需要）
 *   - projectName: 项目名称（导出/保存时需要）
 *   - qualityGateIssues / qualityGatePassed: 质量闸门状态
 *   - saving: 保存中状态
 */

import {
  StepImport,
  StepAnalysis,
  StepScript,
  StepStoryboard,
  StepCharacter,
  StepRender,
  StepComposition,
  StepAudio,
  StepExport,
} from './index';

export interface StepContentSwitcherProps {
  currentStep: number;
}

export function StepContentSwitcher({ currentStep }: StepContentSwitcherProps) {
  switch (currentStep) {
    case 0:
      return <StepImport />;
    case 1:
      return <StepAnalysis />;
    case 2:
      return <StepScript />;
    case 3:
      return <StepStoryboard />;
    case 4:
      return <StepCharacter />;
    case 5:
      return <StepRender />;
    case 6:
      return <StepComposition />;
    case 7:
      return <StepAudio />;
    case 8:
      return <StepExport />;
    default:
      return null;
  }
}
