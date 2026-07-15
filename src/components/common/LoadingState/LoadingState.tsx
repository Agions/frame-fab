/**
 * LoadingState — cross-domain reusable loading indicator.
 *
 * Consolidates duplicated loading/placeholder patterns found across the codebase:
 *   - `src/shared/components/ui/loading.tsx` — `Loading` (tip/size/fullscreen) + `PageSkeleton`
 *   - `src/shared/components/ui/spin.tsx` — `Spin` (spinning indicator + tip + children)
 *   - `src/app/index.tsx` — inline `PageLoader` (border spinner + text)
 *   - `src/features/home/components/ProjectGrid.tsx` — inline `<div>Loading...</div>`
 *   - `src/features/project/components/ProjectListView.tsx` — inline card Skeletons
 *
 * Two modes:
 *   - "spinner" — animated icon + optional tip + optional label (default).
 *   - "skeleton" — animated block placeholders for content-shaped loading.
 *
 * The spinner mode is the most common need; the skeleton mode covers the card/list
 * placeholder shapes seen in ProjectListView and other list screens.
 */

import { Loader2 } from 'lucide-react';
import React from 'react';

import { cn } from '@/shared/utils/class-names';

export interface LoadingStateProps {
  /** Visual mode. Defaults to "spinner". */
  mode?: 'spinner' | 'skeleton';
  /** Tip text shown below the spinner (spinner mode only). */
  tip?: string;
  /** Extra label / children rendered below the tip (spinner mode). */
  label?: React.ReactNode;
  /** Spinner size preset. Defaults to "default". */
  size?: 'small' | 'default' | 'large';
  /** Fullscreen overlay with backdrop (spinner mode only). Defaults to false. */
  fullscreen?: boolean;
  /** Number of skeleton blocks to render (skeleton mode only). Defaults to 3. */
  count?: number;
  /** Additional className merged onto the root container. */
  className?: string;
}

const spinnerSizeMap = { small: 16, default: 24, large: 40 } as const;

export function LoadingState({
  mode = 'spinner',
  tip = '加载中...',
  label,
  size = 'default',
  fullscreen = false,
  count = 3,
  className,
}: LoadingStateProps) {
  if (mode === 'skeleton') {
    return (
      <div className={cn('space-y-3 animate-pulse', className)} aria-busy="true" role="status">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  // ----- spinner mode -----
  const iconSize = spinnerSizeMap[size];

  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)} role="status">
      <Loader2
        className="animate-spin text-primary"
        style={{ width: iconSize, height: iconSize }}
        aria-hidden="true"
      />
      {tip && <p className="text-sm text-muted-foreground">{tip}</p>}
      {label}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
}

export default LoadingState;
