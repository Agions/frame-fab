"use client"

import * as React from "react"

import { cn } from "@/shared/utils/class-names"

// ============================================================
// AntD-compatible Space (spacing between elements)
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

const SpaceItem: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex-1 min-w-0", className)}>{children}</div>
);

interface SpaceCompactProps {
  block?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const SpaceCompact: React.FC<SpaceCompactProps> = ({ block, children, className }) => (
  <div
    className={cn("flex", block && 'w-full', className)}
    style={{ gap: 0 }}
  >
    {children}
  </div>
);

const Space: React.FC<SpaceProps> = ({
  direction = 'horizontal',
  size = 'small',
  align,
  className,
  children,
  wrap,
  style,
  block,
  compact,
}) => {
  const gapMap: Record<string, string> = {
    small: '0.25rem',
    middle: '0.5rem',
    large: '1rem',
  };
  const gap = typeof size === 'number' ? `${size}px` : gapMap[size] || '0.5rem';
  
  return (
    <div
      className={cn("flex", direction === 'vertical' ? 'flex-col' : 'flex-row', wrap && 'flex-wrap', block && 'w-full', className)}
      style={{
        gap: compact ? 0 : gap,
        alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align === 'baseline' ? 'baseline' : 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Add static properties for AntD compatibility
(Space as unknown as React.FC<SpaceProps> & { Item: React.FC<{ children?: React.ReactNode; className?: string }>; Compact: React.FC<SpaceCompactProps> }).Item = SpaceItem;
(Space as unknown as React.FC<SpaceProps> & { Item: React.FC<{ children?: React.ReactNode; className?: string }>; Compact: React.FC<SpaceCompactProps> }).Compact = SpaceCompact;

export { Space, SpaceItem, SpaceCompact }
export type { SpaceProps, SpaceCompactProps }
