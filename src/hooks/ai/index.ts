/**
 * AI hooks barrel export.
 *
 * Central entry point for AI-related hooks (model selection, cost estimation,
 * task-specific recommendations). Consumers should import from `src/hooks/ai`
 * (or its alias) rather than reaching into sub-modules directly.
 */

export { useModel, useModelCost, type UseModelReturn } from './useAIGeneration';

export { useRecommendedModel } from './useAIModel';
