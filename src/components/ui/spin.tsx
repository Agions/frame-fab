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

const Spin = ({
  size = 'default',
  tip,
  className,
  spinning = true,
  indicator,
  children,
}: SpinProps) => {
  const sizeMap = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const spinnerSize = sizeMap[size] || sizeMap.default;

  if (!spinning) return children ? <>{children}</> : null;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      {indicator || (
        <div
          className={cn(
            'border-2 border-primary border-t-transparent rounded-full animate-spin',
            spinnerSize
          )}
        />
      )}
      {tip && <div className="text-sm text-muted-foreground">{tip}</div>}
    </div>
  );
};

export { Spin };
export type { SpinProps };
