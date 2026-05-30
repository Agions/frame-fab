/**
 * AsyncBoundary — 异步状态三态组件
 * ==================================
 * 统一处理 Loading / Empty / Error 三种异步状态。
 * 替代各 feature 中散落的重复三态逻辑。
 *
 * 使用方式：
 * ```tsx
 * <AsyncBoundary
 *   state={fetchState}
 *   loading={<Spinner />}
 *   error={(msg) => <ErrorMessage message={msg} onRetry={refetch} />}
 * >
 *   <DataList data={data} />
 * </AsyncBoundary>
 * ```
 */

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Loading } from '@/components/ui/loading';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
  error?: string;
}

interface AsyncBoundaryProps<T> {
  /** 异步状态对象 */
  state: AsyncState<T>;
  /** 自定义 Loading 组件（默认显示 <Loading />） */
  loading?: React.ReactNode;
  /** 自定义 Empty 组件（默认显示 <Empty />） */
  empty?: React.ReactNode;
  /** 自定义 Error 组件（默认显示错误消息 + 重试按钮） */
  error?: (message: string, onRetry?: () => void) => React.ReactNode;
  /** Loading 阈值（ms），超过则显示 loading，< 0 则禁用 */
  loadingThreshold?: number;
  /** 子组件（当状态为 success 时渲染） */
  children: React.ReactNode;
}

/**
 * 默认 Empty 视图
 */
function DefaultEmpty() {
  return (
    <Card className="flex items-center justify-center p-12 text-center">
      <Empty
        title="暂无数据"
        description="暂无任何内容，请稍后再试"
        icon={
          <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        }
      />
    </Card>
  );
}

/**
 * 默认 Error 视图
 */
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

/**
 * AsyncBoundary — 三态组件
 */
export function AsyncBoundary<T>({
  state,
  loading,
  empty,
  error,
  children,
}: AsyncBoundaryProps<T>) {
  const { status, error: errorMessage } = state;

  if (status === 'loading') {
    return <>{loading ?? <Loading />}</>;
  }

  if (status === 'error') {
    if (error) {
      return <>{error(errorMessage ?? '加载失败', /* onRetry would be passed if we had a refetch callback */)}</>;
    }
    return <DefaultError message={errorMessage ?? '加载失败'} />;
  }

  // status === 'idle' or 'success'
  // 空数据检查（data 是 undefined/null/空数组）
  const isEmpty =
    status === 'idle' ||
    state.data === undefined ||
    state.data === null ||
    (Array.isArray(state.data) && state.data.length === 0);

  if (isEmpty) {
    return <>{empty ?? <DefaultEmpty />}</>;
  }

  return <>{children}</>;
}

// ========== Helper Hooks ==========

/**
 * 快速构建 AsyncState 的工具函数
 */
export function createAsyncState<T>(options: {
  status: AsyncStatus;
  data?: T;
  error?: string;
}): AsyncState<T> {
  return options;
}

/**
 * Loading 状态的 factory
 */
export function loadingState<T>(): AsyncState<T> {
  return { status: 'loading' };
}

/**
 * Success 状态的 factory
 */
export function successState<T>(data: T): AsyncState<T> {
  return { status: 'success', data };
}

/**
 * Error 状态的 factory
 */
export function errorState<T>(error: string): AsyncState<T> {
  return { status: 'error', error };
}

/**
 * Idle 状态的 factory
 */
export function idleState<T>(): AsyncState<T> {
  return { status: 'idle' };
}