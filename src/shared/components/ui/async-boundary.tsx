/**
 * AsyncBoundary — 异步状态三态组件
 * ==================================
 * 统一处理 Loading / Empty / Error 三种异步状态。
 * 替代各 feature 中散落的重复三态逻辑。
 */

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
  error?: string;
}

interface AsyncBoundaryProps<T> {
  state: AsyncState<T>;
  loading?: React.ReactNode;
  empty?: React.ReactNode;
  error?: (message: string, onRetry?: () => void) => React.ReactNode;
  loadingThreshold?: number;
  children: React.ReactNode;
}

function DefaultEmpty() {
  return (
    <Card className="flex items-center justify-center p-12 text-center">
      <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="mt-3 text-sm text-muted-foreground">暂无数据</p>
    </Card>
  );
}

function DefaultError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center border-destructive/50">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-destructive/10 p-3">
          <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-foreground">加载失败</p>
          <p className="text-sm text-muted-foreground mt-1">{message || '未知错误'}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            重试
          </Button>
        )}
      </div>
    </Card>
  );
}

export function AsyncBoundary<T>({
  state,
  loading,
  empty,
  error,
  children,
}: AsyncBoundaryProps<T>) {
  const { status, error: errorMessage } = state;

  if (status === 'loading') {
return <>{loading ?? <DefaultLoading />}</>;
  }

  if (status === 'error') {
    if (error) {
      return <>{error(errorMessage ?? '加载失败', undefined)}</>;
    }
    return <DefaultError message={errorMessage ?? '加载失败'} />;
  }

  const isEmpty =
    !state.data ||
    (Array.isArray(state.data) && state.data.length === 0);

  if (status === 'idle' || isEmpty) {
    return <>{empty ?? <DefaultEmpty />}</>;
  }

  return <>{children}</>;
}

function DefaultLoading() {
  return (
    <Card className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </Card>
  );
}