/**
 * Cross-domain shared UI components.
 *
 * Consolidates duplicated patterns (empty states, loading indicators, error
 * boundaries, step shells) so feature modules import from one place instead of
 * re-implementing locally. Feature-local versions are intentionally left in
 * place — they are cleaned up in a later migration task (C9).
 */

export { EmptyState } from './EmptyState/EmptyState';
export type { EmptyStateProps } from './EmptyState/EmptyState';

export { LoadingState } from './LoadingState/LoadingState';
export type { LoadingStateProps } from './LoadingState/LoadingState';

export { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary/ErrorBoundary';

export { StepLayout } from './StepLayout/StepLayout';
export type { StepLayoutProps } from './StepLayout/StepLayout';
