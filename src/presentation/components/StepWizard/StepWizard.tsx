/**
 * StepWizard — 向导式创作流
 * 可视化步骤条：创意→剧本→资产→分镜→合成，用户可自由点击跳转
 * 每步有草稿自动保存，支持进度持久化
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  FileText,
  Palette,
  Layers,
  Clapperboard,
  Sparkles,
  Check,
  Lock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import styles from './StepWizard.module.css';

// ============================================
// Types
// ============================================

export interface WizardStep {
  id: string;
  label: string;
  icon: ReactNode;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error' | 'locked';
  progress?: number;
  canNavigateTo?: boolean;
  autoSaveInterval?: number; // ms
}

export interface StepWizardProps {
  steps: WizardStep[];
  currentStepId: string;
  onStepChange: (stepId: string) => void;
  onStepComplete?: (stepId: string, data: unknown) => void;
  onSaveDraft?: (stepId: string, data: unknown) => void;
  children?: ReactNode; // Step content renderer
}

// ============================================
// Step Wizard
// ============================================

export function StepWizard({
  steps,
  currentStepId,
  onStepChange,
  onStepComplete,
  onSaveDraft,
  children,
}: StepWizardProps): React.ReactElement {
  const [expanded, setExpanded] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-save draft every N seconds
  useEffect(() => {
    const currentStep = steps.find((s) => s.id === currentStepId);
    const interval = currentStep?.autoSaveInterval ?? 30000; // Default 30s

    if (interval > 0 && onSaveDraft) {
      saveTimerRef.current = setInterval(() => {
        onSaveDraft(currentStepId, getCurrentStepData());
      }, interval);
    }

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [currentStepId, steps, onSaveDraft]);

  const handleStepClick = useCallback(
    (step: WizardStep) => {
      if (step.canNavigateTo !== false && step.status !== 'locked') {
        onStepChange(step.id);
      }
    },
    [onStepChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, step: WizardStep) => {
      if ((e.key === 'Enter' || e.key === ' ') && step.canNavigateTo !== false) {
        e.preventDefault();
        onStepChange(step.id);
      }
    },
    [onStepChange]
  );

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const overallProgress = Math.round((completedSteps / (steps.length - 1)) * 100);

  return (
    <div className={styles.wizard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.expandButton}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? '折叠步骤条' : '展开步骤条'}
          >
            {expanded ? <ChevronRight /> : <ChevronLeft />}
          </button>
          <div className={styles.headerInfo}>
            <h2 className={styles.wizardTitle}>创作流程</h2>
            <span className={styles.stepCount}>
              步骤 {steps.findIndex((s) => s.id === currentStepId) + 1} / {steps.length}
            </span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.overallProgress} role="status" aria-label={`总进度 ${overallProgress}%`}>
            <Progress value={overallProgress} className={styles.progressBar} />
            <span className={styles.progressLabel}>{overallProgress}%</span>
          </div>
        </div>
      </header>

      {/* Step Indicator Bar */}
      <nav
        className={`${styles.stepBar} ${expanded ? styles.expanded : styles.collapsed}`}
        aria-label="创作流程步骤"
      >
        <ol className={styles.stepList} role="list">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = step.status === 'completed';
            const isLocked = step.status === 'locked';
            const isError = step.status === 'error';

            return (
              <li key={step.id}>
                <div
                  className={`
                    ${styles.stepItem}
                    ${isActive ? styles.active : ''}
                    ${isCompleted ? styles.completed : ''}
                    ${isLocked ? styles.locked : ''}
                    ${isError ? styles.error : ''}
                  `}
                  onClick={() => handleStepClick(step)}
                  onKeyDown={(e) => handleKeyDown(e, step)}
                  tabIndex={isLocked ? -1 : 0}
                  role="button"
                  aria-current={isActive ? 'step' : undefined}
                  aria-disabled={isLocked}
                  aria-label={`${step.label}${isCompleted ? '，已完成' : isLocked ? '，已锁定' : isActive ? '，当前步骤' : ''}`}
                >
                  {/* Connector line */}
                  {index > 0 && (
                    <div
                      className={`${styles.connector} ${isCompleted || isActive ? styles.connectorActive : ''}`}
                      aria-hidden="true"
                    />
                  )}

                  {/* Step indicator */}
                  <div className={styles.stepIndicator}>
                    {isCompleted ? (
                      <Check size={14} aria-hidden="true" />
                    ) : isLocked ? (
                      <Lock size={14} aria-hidden="true" />
                    ) : isError ? (
                      <AlertCircle size={14} aria-hidden="true" />
                    ) : (
                      <span className={styles.stepNumber}>{index + 1}</span>
                    )}
                  </div>

                  {/* Step content */}
                  {expanded && (
                    <div className={styles.stepContent}>
                      <span className={styles.stepLabel}>{step.label}</span>
                      {step.description && (
                        <span className={styles.stepDescription}>{step.description}</span>
                      )}
                      {step.progress !== undefined && isActive && (
                        <div className={styles.stepProgress}>
                          <Progress value={step.progress} className={styles.miniProgress} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className={styles.content} role="region" aria-label={`当前步骤: ${currentStepId}`}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// Step Content Wrapper (use inside StepWizard)
// ============================================

export interface StepContentProps {
  stepId: string;
  children: ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export function StepContent({
  stepId,
  children,
  onNext,
  onPrevious,
  onSave,
  isSaving = false,
  nextLabel = '下一步',
  previousLabel = '上一步',
}: StepContentProps): React.ReactElement {
  return (
    <div className={styles.stepContentWrapper} data-step={stepId}>
      <div className={styles.stepBody}>{children}</div>
      <footer className={styles.stepFooter}>
        <div className={styles.footerLeft}>
          {onSave && (
            <Button variant="ghost" onClick={onSave} loading={isSaving}>
              保存草稿
            </Button>
          )}
        </div>
        <div className={styles.footerRight}>
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              <ChevronLeft size={16} />
              {previousLabel}
            </Button>
          )}
          {onNext && (
            <Button variant="default" onClick={onNext}>
              {nextLabel}
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

// ============================================
// Default Steps Config
// ============================================

export const DEFAULT_STEPS: WizardStep[] = [
  {
    id: 'creative',
    label: '创意',
    icon: <Sparkles size={16} />,
    description: '输入故事概念和创作方向',
    status: 'pending',
    autoSaveInterval: 15000,
  },
  {
    id: 'script',
    label: '剧本',
    icon: <FileText size={16} />,
    description: '生成剧本和场景对话',
    status: 'pending',
    autoSaveInterval: 30000,
  },
  {
    id: 'asset',
    label: '资产',
    icon: <Palette size={16} />,
    description: '生成角色和场景素材',
    status: 'pending',
    autoSaveInterval: 30000,
  },
  {
    id: 'storyboard',
    label: '分镜',
    icon: <Layers size={16} />,
    description: '设计分镜和画面构图',
    status: 'pending',
    autoSaveInterval: 20000,
  },
  {
    id: 'composite',
    label: '合成',
    icon: <Clapperboard size={16} />,
    description: '渲染和导出最终视频',
    status: 'pending',
    autoSaveInterval: 0,
  },
];

// ============================================
// Helpers
// ============================================

function getCurrentStepData(): unknown {
  // Placeholder: in production, collect form data from context
  return {};
}

export default StepWizard;