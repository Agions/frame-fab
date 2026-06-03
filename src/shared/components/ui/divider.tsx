'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

// ============================================================
// Divider component
// ============================================================
interface DividerProps {
  style?: React.CSSProperties;
  orientation?: 'left' | 'right' | 'center';
  className?: string;
  children?: React.ReactNode;
}

function Divider({ orientation: _orientation = 'left', className, children }: DividerProps) {
  if (children) {
    return (
      <div className={cn('relative my-4', className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">{children}</span>
        </div>
      </div>
    );
  }
  return <div className={cn('my-4 border-t border-border', className)} />;
}

export { Divider };
export type { DividerProps };
