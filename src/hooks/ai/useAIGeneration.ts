/**
 * AI generation facade hooks.
 *
 * Re-exports the model selection and cost-estimation hooks used when running
 * AI generation tasks (e.g. script generation). Consumers should import from
 * `src/hooks/ai` rather than reaching into `src/core/hooks/` directly.
 * No logic lives here.
 */

export { useModel, useModelCost, type UseModelReturn } from '@/core/hooks/useModel';
