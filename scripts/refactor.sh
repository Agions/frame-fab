#!/bin/bash
# Nova 项目重构脚本

set -e

echo "🚀 开始 Nova 项目重构..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 项目目录: $PROJECT_ROOT"

# Phase 1: 创建新目录结构
create_directory_structure() {
    echo -e "${YELLOW}Phase 1: 创建新目录结构...${NC}"
    
    # 创建 @nova 目录
    mkdir -p src/@nova/{core/{api,services,hooks,stores,types,constants,utils},components/{common,business,layout},pages}
    
    # 创建 legacy 目录
    mkdir -p src/legacy
    
    echo -e "${GREEN}✅ 目录结构创建完成${NC}"
}

# Phase 2: 迁移类型定义
migrate_types() {
    echo -e "${YELLOW}Phase 2: 迁移类型定义...${NC}"
    
    # 创建新的类型文件
    cat > src/@nova/core/types/index.ts << 'EOF'
/**
 * Nova 核心类型定义
 */

// AI 相关
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  maxTokens: number;
  pricing: {
    input: number;
    output: number;
  };
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

// 小说相关
export interface Novel {
  id: string;
  title: string;
  author?: string;
  content: string;
  summary: string;
  characters: NovelCharacter[];
  chapters: NovelChapter[];
  totalWords: number;
  createdAt: string;
}

export interface NovelCharacter {
  name: string;
  description: string;
  importance: 'main' | 'supporting' | 'minor';
}

export interface NovelChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
}

// 剧本相关
export interface Script {
  id: string;
  title: string;
  novelId?: string;
  scenes: ScriptScene[];
  characters: string[];
  totalDuration: number;
  createdAt: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  location: string;
  time: string;
  characters: string[];
  action: string;
  dialogue: Dialogue[];
  description: string;
  duration: number;
}

export interface Dialogue {
  character: string;
  text: string;
  emotion?: string;
}

// 分镜相关
export interface Storyboard {
  id: string;
  sceneId: string;
  panelNumber: number;
  shotType: ShotType;
  angle: CameraAngle;
  movement: CameraMovement;
  description: string;
  characters: string[];
  background: string;
  lighting: string;
  mood: string;
  duration: number;
  prompt: string;
}

export type ShotType = 'wide' | 'medium' | 'close' | 'extreme_close' | 'over_shoulder';
export type CameraAngle = 'eye_level' | 'high' | 'low' | 'dutch';
export type CameraMovement = 'static' | 'pan' | 'tilt' | 'zoom' | 'track';

// 角色相关
export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: CharacterAppearance;
  personality: string[];
  referenceImages: string[];
  voice?: CharacterVoice;
}

export interface CharacterAppearance {
  gender: string;
  age: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  clothing: string;
  features: string[];
}

export interface CharacterVoice {
  type: string;
  pitch: string;
  speed: string;
  emotion: string;
}

// 漫剧相关
export interface Drama {
  id: string;
  title: string;
  scriptId: string;
  status: 'draft' | 'processing' | 'completed';
  scenes: DramaScene[];
  audio?: DramaAudio;
  exportUrl?: string;
  createdAt: string;
}

export interface DramaScene {
  id: string;
  storyboardId: string;
  imageUrl: string;
  animation: AnimationConfig;
  duration: number;
}

export interface AnimationConfig {
  type: string;
  params: Record<string, any>;
}

export interface DramaAudio {
  voiceover: string;
  backgroundMusic?: string;
  soundEffects: string[];
}

// 项目相关
export interface Project {
  id: string;
  name: string;
  description?: string;
  novel?: Novel;
  script?: Script;
  storyboards?: Storyboard[];
  characters?: Character[];
  drama?: Drama;
  status: 'draft' | 'processing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// 通用类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
EOF
    
    echo -e "${GREEN}✅ 类型定义创建完成${NC}"
}

# Phase 3: 创建核心服务
create_core_services() {
    echo -e "${YELLOW}Phase 3: 创建核心服务...${NC}"
    
    # AI 服务
    cat > src/@nova/core/services/ai.service.ts << 'EOF'
/**
 * AI 服务
 * 统一的 AI 模型调用
 */

import type { AIModel, AIResponse } from '../types';

export class AIService {
  async generate(
    model: AIModel,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse> {
    // TODO: 实现 AI 调用
    throw new Error('Not implemented');
  }

  async streamGenerate(
    model: AIModel,
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // TODO: 实现流式生成
    throw new Error('Not implemented');
  }
}

export const aiService = new AIService();
EOF

    # 小说服务
    cat > src/@nova/core/services/novel.service.ts << 'EOF'
/**
 * 小说服务
 * 小说解析和剧本生成
 */

import type { Novel, Script, NovelParseResult } from '../types';
import { aiService } from './ai.service';

export class NovelService {
  async parseNovel(content: string): Promise<NovelParseResult> {
    // TODO: 实现小说解析
    throw new Error('Not implemented');
  }

  async generateScript(novel: Novel): Promise<Script> {
    // TODO: 实现剧本生成
    throw new Error('Not implemented');
  }
}

export const novelService = new NovelService();
EOF

    # 剧本服务
    cat > src/@nova/core/services/script.service.ts << 'EOF'
/**
 * 剧本服务
 * 剧本管理和编辑
 */

import type { Script, ScriptScene } from '../types';

export class ScriptService {
  async saveScript(script: Script): Promise<void> {
    // TODO: 实现保存
    throw new Error('Not implemented');
  }

  async getScript(id: string): Promise<Script | null> {
    // TODO: 实现获取
    throw new Error('Not implemented');
  }

  async updateScene(scriptId: string, scene: ScriptScene): Promise<void> {
    // TODO: 实现场景更新
    throw new Error('Not implemented');
  }
}

export const scriptService = new ScriptService();
EOF

    # 分镜服务
    cat > src/@nova/core/services/storyboard.service.ts << 'EOF'
/**
 * 分镜服务
 * 分镜生成和管理
 */

import type { Storyboard, ScriptScene } from '../types';

export class StoryboardService {
  async generateStoryboard(scene: ScriptScene): Promise<Storyboard[]> {
    // TODO: 实现分镜生成
    throw new Error('Not implemented');
  }

  async saveStoryboard(storyboard: Storyboard): Promise<void> {
    // TODO: 实现保存
    throw new Error('Not implemented');
  }
}

export const storyboardService = new StoryboardService();
EOF

    # 角色服务
    cat > src/@nova/core/services/character.service.ts << 'EOF'
/**
 * 角色服务
 * 角色设计和管理
 */

import type { Character } from '../types';

export class CharacterService {
  async createCharacter(name: string, description: string): Promise<Character> {
    // TODO: 实现角色创建
    throw new Error('Not implemented');
  }

  async updateCharacter(character: Character): Promise<void> {
    // TODO: 实现角色更新
    throw new Error('Not implemented');
  }

  async getCharacters(): Promise<Character[]> {
    // TODO: 实现获取角色列表
    throw new Error('Not implemented');
  }
}

export const characterService = new CharacterService();
EOF

    # 漫剧服务
    cat > src/@nova/core/services/drama.service.ts << 'EOF'
/**
 * 漫剧服务
 * 漫剧生成和导出
 */

import type { Drama, Script, Storyboard } from '../types';

export class DramaService {
  async createDrama(script: Script, storyboards: Storyboard[]): Promise<Drama> {
    // TODO: 实现漫剧创建
    throw new Error('Not implemented');
  }

  async renderScene(dramaId: string, sceneId: string): Promise<string> {
    // TODO: 实现场景渲染
    throw new Error('Not implemented');
  }

  async exportDrama(dramaId: string): Promise<string> {
    // TODO: 实现导出
    throw new Error('Not implemented');
  }
}

export const dramaService = new DramaService();
EOF

    # 服务导出
    cat > src/@nova/core/services/index.ts << 'EOF'
export { aiService, AIService } from './ai.service';
export { novelService, NovelService } from './novel.service';
export { scriptService, ScriptService } from './script.service';
export { storyboardService, StoryboardService } from './storyboard.service';
export { characterService, CharacterService } from './character.service';
export { dramaService, DramaService } from './drama.service';
EOF

    echo -e "${GREEN}✅ 核心服务创建完成${NC}"
}

# Phase 4: 创建 Hooks
create_hooks() {
    echo -e "${YELLOW}Phase 4: 创建 Hooks...${NC}"
    
    cat > src/@nova/core/hooks/index.ts << 'EOF'
export { useNovel } from './useNovel';
export { useScript } from './useScript';
export { useStoryboard } from './useStoryboard';
export { useCharacter } from './useCharacter';
export { useDrama } from './useDrama';
export { useAI } from './useAI';
export { useProject } from './useProject';
EOF

    echo -e "${GREEN}✅ Hooks 创建完成${NC}"
}

# Phase 5: 更新配置
update_configs() {
    echo -e "${YELLOW}Phase 5: 更新配置文件...${NC}"
    
    # 更新 tsconfig.json
    if [ -f tsconfig.json ]; then
        # 备份原配置
        cp tsconfig.json tsconfig.json.backup
        
        echo -e "${GREEN}✅ tsconfig.json 已备份${NC}"
    fi
    
    echo -e "${GREEN}✅ 配置文件更新完成${NC}"
}

# Phase 6: 迁移旧代码
migrate_legacy() {
    echo -e "${YELLOW}Phase 6: 迁移旧代码到 legacy...${NC}"
    
    # 移动旧目录到 legacy
    for dir in src/services src/hooks src/store src/types src/features src/shared; do
        if [ -d "$dir" ]; then
            target="src/legacy/$(basename $dir)"
            mkdir -p "$(dirname $target)"
            mv "$dir" "$target"
            echo "Moved $dir -> $target"
        fi
    done
    
    echo -e "${GREEN}✅ 旧代码迁移完成${NC}"
}

# 主执行流程
main() {
    echo "========================================"
    echo "  Nova 项目重构脚本"
    echo "========================================"
    echo ""
    
    # 确认执行
    read -p "确定要开始重构吗? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "已取消"
        exit 0
    fi
    
    # 创建备份分支
    echo ""
    echo "🔄 创建备份分支..."
    git checkout -b refactor/nova-migration 2>/dev/null || git checkout refactor/nova-migration
    
    # 执行各阶段
    create_directory_structure
    migrate_types
    create_core_services
    create_hooks
    update_configs
    migrate_legacy
    
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ 重构完成!${NC}"
    echo "========================================"
    echo ""
    echo "下一步:"
    echo "1. 检查新目录结构: ls -la src/@nova/"
    echo "2. 更新 tsconfig.json 路径别名"
    echo "3. 逐步迁移业务代码"
    echo "4. 测试功能是否正常"
    echo ""
    echo "分支: refactor/nova-migration"
}

# 运行主函数
main "$@"
