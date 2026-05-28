/**
 * 专业空状态组件
 */

import { FolderOpen, File, Plus } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  type?: 'default' | 'project' | 'file';
}

const EmptyState = ({ title, description, action, type = 'default' }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      {type === 'project' && <FolderOpen className="h-12 w-12 text-muted-foreground" />}
      {type === 'file' && <File className="h-12 w-12 text-muted-foreground" />}
      <div className="text-center">
        <div className="text-lg font-medium">{title || '暂无内容'}</div>
        {description && <div className="text-sm text-muted-foreground mt-1">{description}</div>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          <Plus className="h-4 w-4 mr-1" />
          {action.text}
        </Button>
      )}
    </div>
  );
};

export { EmptyState };
export default EmptyState;
