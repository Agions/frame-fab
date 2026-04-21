# PlotCraft 漫剧流水线 Implementation Plan

**日期：** 2026-04-21
**设计文档：** `docs/plans/2026-04-21-plotcraft-design.md`
**版本：** v3.0.0 → 实施中（当前 Step 1：AI 脚本生成）

---

## Phase 0：流水线框架搭建

### Task 0.1：搭建目录结构

**目标：** 创建 `features/manga-pipeline/` 目录骨架

**步骤：**
1. 创建 `src/features/manga-pipeline/steps/step1-script-generation/` 及子目录
2. 创建 `src/core/pipeline/` 通用流水线框架
3. 创建类型定义文件

**验证：** `find src/features/manga-pipeline -type d | sort`

---

### Task 0.2：流水线框架核心

**文件：** `src/core/pipeline/step.interface.ts`

```typescript
export interface StepInput { [key: string]: any; }
export interface StepOutput { [key: string]: any; }
export interface CheckpointState {
  stepId: string;
  completed: boolean;
  data: any;
  timestamp: number;
}

export interface PipelineStep {
  id: string;
  name: string;
  process(input: StepInput): Promise<StepOutput>;
  getCheckpoint(): CheckpointState | null;
  restore(state: CheckpointState): void;
}
```

**文件：** `src/core/pipeline/pipeline-engine.ts`

```typescript
import { PipelineStep, StepInput, StepOutput } from './step.interface';

export class PipelineEngine {
  private steps: PipelineStep[] = [];
  private onProgress?: (stepId: string, progress: number) => void;

  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  async run(input: StepInput): Promise<StepOutput> {
    let context: StepInput = { ...input };

    for (const step of this.steps) {
      this.onProgress?.(step.id, 0);
      const result = await step.process(context);
      context = { ...context, ...result };
      this.onProgress?.(step.id, 1);
    }

    return context as StepOutput;
  }
}
```

**TDD：** `src/__tests__/core/pipeline.test.ts`

---

### Task 0.3：断点续传（Tauri FS）

**文件：** `src/core/pipeline/checkpoint.ts`

```typescript
import { CheckpointState } from './step.interface';

const CHECKPOINT_PREFIX = 'plotcraft_checkpoint_';

export async function saveCheckpoint(
  stepId: string,
  data: any
): Promise<void> {
  const key = `${CHECKPOINT_PREFIX}${stepId}`;
  const state: CheckpointState = {
    stepId,
    completed: true,
    data,
    timestamp: Date.now(),
  };
  await localStorage.setItem(key, JSON.stringify(state));
}

export async function loadCheckpoint(
  stepId: string
): Promise<CheckpointState | null> {
  const key = `${CHECKPOINT_PREFIX}${stepId}`;
  const raw = await localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as CheckpointState;
}

export async function clearCheckpoint(stepId: string): Promise<void> {
  const key = `${CHECKPOINT_PREFIX}${stepId}`;
  await localStorage.removeItem(key);
}
```

**TDD：** `src/__tests__/core/checkpoint.test.ts`

---

## Phase 1：文本解析

### Task 1.1：章节拆分器

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/parser/chapter-splitter.ts`

```typescript
export interface ChapterSplitResult {
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  startLine: number;
  endLine: number;
  content: string;
}

export function splitChapters(text: string): ChapterSplitResult {
  // 识别章节标题（# 第X章 / Chapter X / 第一幕 等）
  // 拆分文本，返回章节列表
  return { chapters: [] };
}
```

**TDD：** `src/__tests__/features/manga-pipeline/chapter-splitter.test.ts`

---

### Task 1.2：段落分类器

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/parser/paragraph-classifier.ts`

```typescript
export type ParagraphType = 'dialogue' | 'narration' | 'action' | 'inner_monologue';

export interface ClassifiedParagraph {
  type: ParagraphType;
  content: string;
  speaker?: string;  // 对话时说话人
}

export function classifyParagraph(text: string): ClassifiedParagraph {
  // 规则判断：
  // 对话：包含引号或：号
  // 动作：以动词开头，描述行为
  // 内心独白：包含我心想/我想等标记
  // 叙述：其他
  return { type: 'narration', content: text };
}
```

**TDD：** `src/__tests__/features/manga-pipeline/paragraph-classifier.test.ts`

---

### Task 1.3：关键事件提取器

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/parser/event-extractor.ts`

```typescript
export interface StoryEvent {
  id: string;
  description: string;
  involvedCharacters: string[];
  emotionalTone: string;
  chapterId?: string;
}

export function extractEvents(
  chapters: Chapter[],
  classifiedParagraphs: ClassifiedParagraph[]
): StoryEvent[] {
  // 从分类后的段落中提取关键事件
  // 返回事件列表
  return [];
}
```

---

## Phase 2：叙事分析

### Task 2.1：叙事结构分析

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/analyzer/narrative-structure.ts`

```typescript
export type StoryArc = 'introduction' | 'rising' | 'climax' | 'falling' | 'resolution';

export interface NarrativeStructure {
  arc: StoryArc;
  estimatedDuration: number;  // 估计时长（分钟）
  keyPlotPoints: string[];
}

export async function analyzeNarrativeStructure(
  events: StoryEvent[]
): Promise<NarrativeStructure> {
  // 基于事件数量/情感强度分布判断叙事弧
  // 返回起承转合定位
  return { arc: 'rising', estimatedDuration: 0, keyPlotPoints: [] };
}
```

**TDD：** `src/__tests__/features/manga-pipeline/narrative-structure.test.ts`

---

### Task 2.2：人物关系图

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/analyzer/character-graph.ts`

```typescript
export interface CharacterRelation {
  from: string;
  to: string;
  type: 'family' | 'friend' | 'enemy' | 'romantic' | 'colleague';
  description?: string;
}

export interface CharacterGraph {
  characters: string[];
  relations: CharacterRelation[];
}

export function buildCharacterGraph(
  events: StoryEvent[],
  paragraphs: ClassifiedParagraph[]
): CharacterGraph {
  // 从事件和对话中提取人物关系
  return { characters: [], relations: [] };
}
```

---

### Task 2.3：冲突/悬念检测

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/analyzer/conflict-detector.ts`

```typescript
export interface Conflict {
  id: string;
  type: 'internal' | 'external' | 'interpersonal';
  description: string;
  involvedCharacters: string[];
  suspenseLevel: number;  // 0-10
}

export async function detectConflicts(
  events: StoryEvent[],
  narrative: NarrativeStructure
): Promise<Conflict[]> {
  // 识别核心冲突
  // 评估悬念等级
  return [];
}
```

---

## Phase 3：角色卡生成

### Task 3.1：角色卡生成器

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/script-writer/character-card-generator.ts`

```typescript
import { CharacterCard } from '../types/character';

export interface CharacterCard {
  id: string;
  name: string;
  appearance: string;     // 外貌描述
  personality: string;      // 性格标签
  speakingStyle: string;   // 说话风格
  voiceSuggestion: string; // 音色建议
  relationships: { name: string; type: string }[];
  firstAppearance: string; // 首次出现场景
}

export async function generateCharacterCards(
  text: string,
  graph: CharacterGraph,
  events: StoryEvent[]
): Promise<CharacterCard[]> {
  // 调用 DeepSeek-V3 API
  // 从文本中提取角色信息
  // 生成角色卡列表
  return [];
}
```

**TDD：** `src/__tests__/features/manga-pipeline/character-card-generator.test.ts`

---

## Phase 4：剧本生成

### Task 4.1：场景生成器

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/script-writer/scene-generator.ts`

```typescript
import { Scene } from '../types/scene';

export interface Scene {
  id: string;
  location: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: string;
  characters: string[];
  type: 'dialogue' | 'action' | 'chase' | 'confrontation' | 'emotional';
  cameraHint: string;  // 运镜建议
  transition: string;   // 转场方式
  emotion: string;
}

export async function generateScenes(
  chapters: Chapter[],
  events: StoryEvent[],
  characters: CharacterCard[]
): Promise<Scene[]> {
  // 将事件分配到场景
  // 每个场景包含运镜/转场/情绪标注
  return [];
}
```

---

### Task 4.2：对话生成器

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/script-writer/dialogue-generator.ts`

```typescript
import { DialogueLine, Script } from '../types/script';

export interface DialogueLine {
  character: string;
  type: 'dialogue' | 'action' | 'narration' | 'inner_monologue';
  content: string;
  emotion?: string;
}

export async function generateDialogue(
  scene: Scene,
  character: CharacterCard
): Promise<DialogueLine[]> {
  // 基于角色性格/说话风格生成对话
  // 确保同一角色在不同场景说话风格一致
  return [];
}
```

---

### Task 4.3：剧本整合

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/script-writer/script-integrator.ts`

```typescript
import { Scene } from '../types/scene';
import { CharacterCard } from '../types/character';
import { Script, ScriptScene } from '../types/script';

export interface Script {
  id: string;
  title: string;
  estimatedDuration: number;  // 分钟
  scenes: ScriptScene[];
  characters: CharacterCard[];
  metadata: {
    generatedAt: number;
    model: string;
    version: string;
  };
}

export async function integrateScript(
  scenes: Scene[],
  characters: CharacterCard[]
): Promise<Script> {
  // 整合所有场景 + 角色 + 元数据
  return { id: '', title: '', estimatedDuration: 0, scenes: [], characters, metadata: { generatedAt: 0, model: '', version: '' } };
}
```

---

## Phase 5：质量评估

### Task 5.1：剧本质量评估

**文件：** `src/features/manga-pipeline/steps/step1-script-generation/evaluator/script-evaluator.ts`

```typescript
export interface EvaluationResult {
  score: number;           // 0-100
  dialogueNaturalness: number;
  characterConsistency: number;
  narrativeLogic: number;
  issues: { severity: 'low' | 'medium' | 'high'; description: string; }[];
  suggestions: string[];
}

export async function evaluateScript(script: Script): Promise<EvaluationResult> {
  // 调用 DeepSeek-V3 做剧本质量评估
  // 检查：对话自然度 / 角色一致性 / 叙事逻辑
  return { score: 0, dialogueNaturalness: 0, characterConsistency: 0, narrativeLogic: 0, issues: [], suggestions: [] };
}
```

---

## Phase 6：UI

### Task 6.1：脚本生成页面

**文件：** `src/features/manga-pipeline/ui/ScriptGenerationView.tsx`

**功能：**
1. 文本输入区（支持粘贴/上传 TXT）
2. 生成按钮 + 进度条
3. 生成结果展示（剧本 + 角色卡）
4. 编辑/修改功能

**TDD：** `src/__tests__/features/manga-pipeline/script-generation.test.tsx`

---

## 执行模式

**Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6**

每个 Phase 按顺序执行，每个 Task = TDD 循环（写测试 → 实现 → commit）

---

## 里程碑

| 里程碑 | 内容 |
|--------|------|
| M0 | 流水线框架搭建完成（目录 + engine + 断点）|
| M1 | Step 1 核心逻辑完成（文本解析 → 叙事分析 → 剧本生成）|
| M2 | 质量评估完成 |
| M3 | UI 集成（脚本生成页面）|
| M4 | 完整测试 + 发布 v3.1.0 |