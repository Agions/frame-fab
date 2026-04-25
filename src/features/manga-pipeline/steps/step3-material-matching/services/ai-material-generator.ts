import { StoryboardScene } from '../../step2-storyboard';

export interface AIGenerationPlan {
  sceneId: string;
  sceneNumber: number;
  prompt: string;
  negativePrompt: string;
  model: 'sdxl' | 'sd3' | 'pix2pix' | 'text2video';
  estimatedTime: number;  // 秒
  priority: 'high' | 'medium' | 'low';
  cost: 'low' | 'medium' | 'high';
}

export interface BatchGenerationPlan {
  totalScenes: number;
  totalEstimatedTime: number;  // 秒
  totalCost: 'low' | 'medium' | 'high';
  scenes: AIGenerationPlan[];
}

/**
 * 为未能匹配到素材的场景生成 AI 制作方案
 */
export function createAIGenerationPlan(
  scenesNeedingMaterial: StoryboardScene[]
): BatchGenerationPlan {
  const plans: AIGenerationPlan[] = scenesNeedingMaterial.map((scene, _index) => {
    // 评估优先级
    const priority = scene.description.duration > 15 ? 'high' 
      : scene.description.duration > 8 ? 'medium' 
      : 'low';
    
    // 估算成本（时长越长成本越高）
    const cost = scene.description.duration > 20 ? 'high'
      : scene.description.duration > 10 ? 'medium'
      : 'low';

    // 估算生成时间
    const baseTime = scene.description.duration * 2;  // 生成时间通常是时长的 2 倍
    const sceneType = extractSceneType(scene);
    const estimatedTime = (sceneType === '动作' || sceneType === '追逐') ? baseTime * 1.5 : baseTime;

    return {
      sceneId: scene.sceneId,
      sceneNumber: scene.sceneNumber,
      prompt: scene.description.prompt,
      negativePrompt: scene.description.negativePrompt,
      model: selectModel(scene, sceneType),
      estimatedTime: Math.round(estimatedTime),
      priority,
      cost,
    };
  });

  // 按优先级排序
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  plans.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // 汇总
  const totalEstimatedTime = plans.reduce((sum, p) => sum + p.estimatedTime, 0);
  const highCostCount = plans.filter(p => p.cost === 'high').length;
  const totalCost: BatchGenerationPlan['totalCost'] = 
    highCostCount > plans.length * 0.5 ? 'high' 
    : highCostCount > plans.length * 0.2 ? 'medium' 
    : 'low';

  return {
    totalScenes: plans.length,
    totalEstimatedTime,
    totalCost,
    scenes: plans,
  };
}

/**
 * 从 prompt 中提取场景类型
 */
function extractSceneType(scene: StoryboardScene): string {
  const match = scene.description.prompt.match(/scene type:\s*([^,]+)/i);
  return match ? match[1].trim() : '';
}

function selectModel(scene: StoryboardScene, sceneType: string): AIGenerationPlan['model'] {
  // 根据场景类型选择模型
  if (sceneType === '动作' || sceneType === '追逐') {
    return 'text2video';  // 动作场景需要视频生成
  }
  if (scene.description.duration > 15) {
    return 'sdxl';  // 长场景用 SDXL 质量更好
  }
  return 'pix2pix';  // 短场景用 pix2pix 更快
}
