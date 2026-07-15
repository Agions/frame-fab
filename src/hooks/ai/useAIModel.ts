/**
 * AI model selection/configuration facade hooks.
 *
 * Re-exports the model selection and recommendation hooks so that AI feature
 * code can depend on a single module instead of reaching into
 * `src/core/hooks/` directly. No logic lives here.
 */

export { useModel, useRecommendedModel, type UseModelReturn } from '@/core/hooks/useModel';
