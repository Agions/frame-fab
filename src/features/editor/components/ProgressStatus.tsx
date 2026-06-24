/**
 * 通用进度显示组件 — 消除 AIAssistant 字幕/智能剪辑两个 tab 进度文案 12L 重复。
 * 接收 4 段阶段文案（<30 / 30-60 / 60-90 / >=90），统一渲染进度条和阶段文案。
 */
import { Progress } from '@/shared/components/ui/progress';

interface ProgressStatusProps {
  progress: number;
  stages: [string, string, string, string]; // [analyzing, recognizing, generating, finishing]
  className?: {
    progressContainer?: string;
    progressStatus?: string;
  };
}

export function ProgressStatus({ progress, stages, className }: ProgressStatusProps) {
  return (
    <div className={className?.progressContainer}>
      <Progress value={progress} />
      <div className={className?.progressStatus}>
        {progress < 30 && stages[0]}
        {progress >= 30 && progress < 60 && stages[1]}
        {progress >= 60 && progress < 90 && stages[2]}
        {progress >= 90 && stages[3]}
      </div>
    </div>
  );
}
