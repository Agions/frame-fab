/**
 * StepNavigation — top step navigation bar for the project-edit pipeline.
 *
 * Canonical home for the step-strip UI. The step definitions live here so
 * both the nav bar and any step-count logic share a single source of truth.
 */

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/utils/class-names';

export interface StepDefinition {
  key: string;
  title: string;
  icon: LucideIcon;
}

export interface StepNavigationProps {
  steps: StepDefinition[];
  currentStep: number;
  onStepChange: (step: number) => void;
  className?: string;
}

/** Canonical 9-step pipeline order (icon-free — pass icons via `steps`). */
export const PIPELINE_STEP_KEYS = [
  'import',
  'analysis',
  'script',
  'storyboard',
  'character',
  'render',
  'composition',
  'audio',
  'export',
] as const;

export function StepNavigation({
  steps,
  currentStep,
  onStepChange,
  className,
}: StepNavigationProps) {
  return (
    <div className={cn('mb-4', className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
              )}
              onClick={() => onStepChange(index)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepNavigation;
