/**
 * 消息提示 Hook
 */
import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

import { toast } from '@/shared/components/ui';

export interface UseMessageOptions {
  maxCount?: number;
  duration?: number;
}

export interface UseMessageReturn {
  success: (content: string, duration?: number) => void;
  error: (content: string, duration?: number) => void;
  info: (content: string, duration?: number) => void;
  warning: (content: string, duration?: number) => void;
  loading: (content: string, duration?: number) => void;
}

export const useMessage = (_options?: UseMessageOptions): UseMessageReturn => {
  const success = useCallback((content: string, duration = 3) => {
    toast.success(content, duration);
  }, []);

  const error = useCallback((content: string, duration = 4) => {
    toast.error(content, duration);
  }, []);

  const info = useCallback((content: string, duration = 3) => {
    toast.info(content, duration);
  }, []);

  const warning = useCallback((content: string, duration = 4) => {
    toast.warning(content, duration);
  }, []);

  const loading = useCallback((content: string, _duration = 0) => {
    const id = sonnerToast.loading(content);
    return () => {
      sonnerToast.dismiss(id);
    };
  }, []);

  return { success, error, info, warning, loading };
};
