/**
 * 交互反馈 Hook（facade）
 *
 * 按职责拆分为 8 个独立 hook，本文件仅做 re-export 保持向后兼容。
 */

export { useLoading } from './useLoading';
export type { UseLoadingOptions, UseLoadingReturn } from './useLoading';

export { useAsync } from './useAsync';
export type { UseAsyncOptions, UseAsyncReturn } from './useAsync';

export { usePolling } from './usePolling';
export type { UsePollingOptions, UsePollingReturn } from './usePolling';

export { useMessage } from './useMessage';
export type { UseMessageOptions, UseMessageReturn } from './useMessage';

export { useModalConfirm } from './useModalConfirm';
export type { UseModalConfirmOptions, UseModalConfirmReturn } from './useModalConfirm';

export { useTabs } from './useTabs';
export type { UseTabsOptions, UseTabsReturn } from './useTabs';

export { useCollapse } from './useCollapse';
export type { UseCollapseOptions, UseCollapseReturn } from './useCollapse';

export { useStepper } from './useStepper';
export type { UseStepperOptions, UseStepperReturn } from './useStepper';
