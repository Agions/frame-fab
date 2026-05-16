'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

// ============================================================
// AntD-compatible Spin (loading spinner)
// ============================================================
interface SpinProps {
  size?: 'small' | 'default' | 'large';
  tip?: React.ReactNode;
  className?: string;
  spinning?: boolean;
  indicator?: React.ReactNode;
  children?: React.ReactNode;
}

function Spin({
  size = 'default',
  tip,
  className,
  spinning = true,
  indicator,
  children,
}: SpinProps) {
  const sizeMap = { small: '1rem', default: '1.5rem', large: '2rem' };
  const spinnerSize = sizeMap[size];

  if (!spinning) return <>{children}</>;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      {indicator ?? (
        <span
          className="inline-block animate-spin"
          style={{ fontSize: spinnerSize, lineHeight: spinnerSize }}
        >
          ⟳
        </span>
      )}
      {tip && <span className="text-sm text-muted-foreground">{tip}</span>}
    </div>
  );
}

export { Spin };
export type { SpinProps };
