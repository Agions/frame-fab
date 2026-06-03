/**
 * Shim: backward compat for `@/components/ui/skeleton`.
 * Real location: `@/shared/components/ui/Skeleton.tsx`
 *
 * Adds `Skeleton` named export as alias for the default skeleton.
 */
export * from '@/shared/components/ui/Skeleton';
export { default, SkeletonComponent as Skeleton } from '@/shared/components/ui/Skeleton';
