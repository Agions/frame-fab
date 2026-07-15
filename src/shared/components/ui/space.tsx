'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

// ============================================================
// Space component (flex gap wrapper)
// ============================================================
interface SpaceProps {
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'large' | number;
  align?: 'start' | 'end' | 'center' | 'baseline';
  className?: string;
  children?: React.ReactNode;
  wrap?: boolean;
  style?: React.CSSProperties;
  block?: boolean;
  compact?: boolean;
}

const Space = (({
  direction = 'horizontal',
  size = 'small',
  align,
  className,
  children,
  wrap,
  style,
  block,
  compact,
}: SpaceProps) => {
  const gapMap: Record<string, string> = {
    small: '0.25rem',
    middle: '0.5rem',
    large: '1rem',
  };
  const gap = typeof size === 'number' ? `${size}px` : gapMap[size] || '0.5rem';

  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        wrap && 'flex-wrap',
        block && 'w-full',
        className
      )}
      style={{
        gap: compact ? 0 : gap,
        alignItems:
          align === 'start'
            ? 'flex-start'
            : align === 'end'
              ? 'flex-end'
              : align === 'baseline'
                ? 'baseline'
                : 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}) as unknown as React.FC<SpaceProps> & {
  Item: (props: { children?: React.ReactNode; className?: string }) => React.ReactElement;
  Compact: (props: SpaceCompactProps) => React.ReactElement;
};

function SpaceItem({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 min-w-0', className)}>{children}</div>;
}
(Space as unknown as { Item: typeof SpaceItem }).Item = SpaceItem;

interface SpaceCompactProps {
  block?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SpaceCompact({ block, children, className, style }: SpaceCompactProps) {
  return (
    <div className={cn('flex', block && 'w-full', className)} style={{ gap: 0, ...style }}>
      {children}
    </div>
  );
}
(Space as unknown as { Compact: typeof SpaceCompact }).Compact = SpaceCompact;

export { Space, SpaceItem, SpaceCompact };
export type { SpaceProps, SpaceCompactProps };
