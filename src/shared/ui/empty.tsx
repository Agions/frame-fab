import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

interface EmptyProps {
  description?: React.ReactNode;
  className?: string;
  image?: React.ReactNode;
  children?: React.ReactNode;
}

const Empty = (props: EmptyProps) => {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-8 text-center', props.className)}
    >
      {props.image ?? <div className="mb-4 text-4xl opacity-20">📭</div>}
      {props.description && <p className="text-sm text-muted-foreground">{props.description}</p>}
      {props.children}
    </div>
  );
};

(Empty as any).PRESENTED_IMAGE_SIMPLE = null;

export { Empty };
export type { EmptyProps };
