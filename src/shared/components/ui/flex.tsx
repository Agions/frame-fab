/**
 * Flex 布局原子组件
 * 替代重复的 Tailwind flex 类组合
 */

import { cn } from '@/shared/utils/class-names';

type GapSize = 'sm' | 'md' | 'lg';

const gapClass: Record<GapSize, string> = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-4',
};

interface FlexProps {
  children: React.ReactNode;
  className?: string;
  gap?: GapSize;
  justify?: 'start' | 'between' | 'center' | 'end';
  direction?: 'row' | 'col';
}

export const Flex = ({
  children,
  className,
  gap = 'md',
  justify,
  direction = 'row',
}: FlexProps) => {
  const justifyClass =
    justify === 'between'
      ? 'justify-between'
      : justify === 'center'
        ? 'justify-center'
        : justify === 'end'
          ? 'justify-end'
          : undefined;
  const directionClass = direction === 'col' ? 'flex-col' : undefined;

  return (
    <div
      className={cn('flex items-center', gapClass[gap], justifyClass, directionClass, className)}
    >
      {children}
    </div>
  );
};
