/**
 * ErrorBoundary — cross-domain React error boundary.
 *
 * Consolidates the error-boundary pattern currently living only in
 * `src/app/components/ErrorBoundary.tsx` (which only the global app shell uses).
 * Bringing it to `common/` lets feature/section trees wrap subtrees (pipeline
 * steps, panels, lazy routes) without duplicating a class boundary each time.
 *
 * Improvements over the app-level version:
 *   - Tailwind classes replace the inline CSS-var styles (consistent theming).
 *   - `fallback` render-prop for custom recovery UI; falls back to a default card.
 *   - `onReset` callback so consumers can clear local state on "retry".
 *   - Renders nothing when healthy (`children`), identical lifecycle otherwise.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { logger } from '@/core/utils/logger';
import { telemetry } from '@/infrastructure/telemetry/telemetry';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Logical name used in logs + telemetry (e.g. "StepRender", "ProjectPanel"). */
  name?: string;
  /** Optional custom UI override. Receives the caught error + reset handler. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /**
   * Called when the user triggers a reset (reload or "try again").
   * Use to clear upstream state before the render retries.
   */
  onReset?: () => void;
  /** When true, re-throws in test environments so tests fail loudly. */
  rethrowInTest?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (
      this.props.rethrowInTest &&
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'test'
    ) {
      throw error;
    }

    const name = this.props.name ?? 'ErrorBoundary';

    telemetry.trackError({
      error,
      metadata: {
        boundaryName: name,
        componentStack: errorInfo.componentStack,
      },
    });

    logger.error('[ErrorBoundary] Caught error', {
      boundaryName: name,
      error: error.message,
      stack: error.stack,
    });
  }

  handleReset = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    this.props.onReset?.();
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback takes priority.
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      const message = this.state.error.message || '应用程序遇到了一个意外错误';

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-64 items-center justify-center p-6"
        >
          <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive text-2xl">
              ⚠
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">出了点问题</h2>
            <p className="mb-6 break-words text-sm text-muted-foreground">{message}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
              >
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex h-10 items-center justify-center rounded-[10px] border-2 border-border/80 bg-background px-5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:border-primary/40 active:scale-[0.98]"
              >
                重新加载
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
