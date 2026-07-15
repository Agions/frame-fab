/**
 * GenerationResult — 生成结果展示容器
 */

import { cn } from '@/shared/utils/class-names';

interface GenerationResultProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  empty?: boolean;
  emptyMessage?: string;
  status?: 'idle' | 'generating' | 'done' | 'error';
  extra?: React.ReactNode;
}

export function GenerationResult({
  title,
  children,
  className,
  empty = false,
  emptyMessage = '暂无生成结果',
  status,
  extra,
}: GenerationResultProps) {
  const statusColor =
    status === 'done'
      ? 'border-green-300 bg-green-50'
      : status === 'error'
        ? 'border-red-300 bg-red-50'
        : status === 'generating'
          ? 'border-blue-300 bg-blue-50'
          : '';
  return (
    <div className={cn('rounded-lg border bg-card p-4', statusColor, className)}>
      {(title || extra) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h4 className="text-sm font-semibold">{title}</h4>}
          {extra}
        </div>
      )}
      {empty ? <p className="text-sm text-muted-foreground">{emptyMessage}</p> : children}
    </div>
  );
}
