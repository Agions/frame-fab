/**
 * ProgressBar — 通用进度条组件（DRY版）
 *
 * 改造前：PipelineProgress、AudioEditor、VideoEditor 各有一份进度条实现
 * 改造后：统一 ProgressBar，支持确定/不确定进度，支持步进点
 */

import React, { useEffect, useRef } from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /** 进度值 0-100，不确定进度时传 undefined */
  value?: number;
  /** 是否不确定进度（动画脉冲） */
  indeterminate?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 颜色主题 */
  color?: 'primary' | 'success' | 'warning' | 'error';
  /** 是否显示步进点 */
  steps?: { current: number; total: number; labels?: string[] };
  /** 是否显示百分比文本 */
  showLabel?: boolean;
  /** 标签文本 */
  label?: string;
  /** 动画时长（秒） */
  animated?: boolean;
  /** className */
  className?: string;
}

export function ProgressBar({
  value,
  indeterminate = false,
  size = 'md',
  color = 'primary',
  steps,
  showLabel = false,
  label,
  animated = true,
  className,
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  const pct = value !== undefined ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div className={[styles.container, className ?? ''].join(' ')} role="progressbar">
      {/* 标签行 */}
      {(label || showLabel) && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label ?? `${pct.toFixed(0)}%`}</span>
          {steps && (
            <span className={styles.stepCount}>
              步骤 {steps.current} / {steps.total}
            </span>
          )}
        </div>
      )}

      {/* 进度条轨道 */}
      <div
        ref={ref}
        className={[styles.track, styles[size], styles[color]].join(' ')}
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {indeterminate ? (
          <div className={styles.indeterminate} />
        ) : (
          <div
            className={[styles.fill, animated ? styles.animated : ''].join(' ')}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      {/* 步进点指示器 */}
      {steps && steps.total > 1 && (
        <div className={styles.steps} aria-label={`共 ${steps.total} 步，当前第 ${steps.current} 步`}>
          {Array.from({ length: steps.total }, (_, i) => (
            <div
              key={i}
              className={[
                styles.dot,
                i < steps.current - 1 ? styles.done :
                  i === steps.current - 1 ? styles.current : styles.pending,
              ].join(' ')}
              aria-hidden="true"
            />
          ))}
          {steps.labels && steps.current > 0 && (
            <span className={styles.stepLabel}>
              {steps.labels[steps.current - 1] ?? ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;