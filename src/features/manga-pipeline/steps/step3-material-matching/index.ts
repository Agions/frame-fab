// Services
export { searchMaterial, batchSearch } from './services/material-searcher';
export type { MaterialMatch, MaterialItem, SearchQuery } from './services/material-searcher';
export { groupMaterials } from './services/smart-grouper';
export type { MaterialGroup, GroupingOptions } from './services/smart-grouper';
export { createAIGenerationPlan } from './services/ai-materials';
export type { AIGenerationPlan, BatchGenerationPlan } from './services/ai-materials';

// Pipeline
export { MaterialMatchingPipeline } from './pipeline-controller';
export type { MaterialMatchingResult } from './pipeline-controller';
