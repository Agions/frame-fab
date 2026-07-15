/**
 * StepNavigation — 流水线步骤导航
 * 显示步骤指示器，允许点击跳转
 */

import { cn } from '@/shared/utils/class-names';

export interface StepItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface StepNavigationProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick: (index: number) => void;
  className?: string;
}

export function StepNavigation({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepNavigationProps) {
  return (
    <nav className={cn('flex items-center gap-2 overflow-x-auto py-4', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <button
            key={step.key}
            onClick={() => onStepClick(index)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive && 'bg-primary text-primary-foreground',
              isCompleted && 'bg-muted text-muted-foreground hover:bg-muted/80',
              !isActive && !isCompleted && 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                isActive
                  ? 'bg-primary-foreground text-primary'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              )}
            >
              {index + 1}
            </span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
