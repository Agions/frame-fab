'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

// ============================================================
// AntD-compatible Divider
// ============================================================

interface DividerProps {
  orientation?: 'left' | 'right' | 'center';
  className?: string;
  children?: React.ReactNode;
}

const Divider = ({ orientation = 'center', className, children }: DividerProps) => {
  return (
    <div className={cn('flex items-center w-full my-2', className)}>
      {children ? (
        <>
          <span
            className={cn(
              'flex-shrink-0 h-px bg-border flex-1',
              orientation === 'left' && 'mr-4',
              orientation === 'right' && 'ml-4 order-3',
              orientation === 'center' && 'mx-4'
            )}
          />
          <span
            className={cn(
              'flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap',
              orientation === 'left' && 'order-1',
              orientation === 'center' && 'order-2',
              orientation === 'right' && 'order-3'
            )}
          >
            {children}
          </span>
          <span
            className={cn(
              'flex-shrink-0 h-px bg-border flex-1',
              orientation === 'left' && 'ml-4 order-3',
              orientation === 'right' && 'mr-4 order-1',
              orientation === 'center' && 'mx-4 order-3'
            )}
          />
        </>
      ) : (
        <span className="w-full h-px bg-border" />
      )}
    </div>
  );
};

export { Divider };
export type { DividerProps };
