# PlotCraft 漫剧流水线 设计方案

**日期：** 2026-04-21
**项目：** PlotCraft（AI 漫剧生成完整成片工具）
**版本：** v3.0.0 → 规划中

---

## 一、目标定位

### 核心愿景
**小说进去、视频出来** — 全自动化 AI 漫剧生产流水线，从创意到成品的完整闭环。

### 流水线全景图

```
小说原文（TXT/文档）
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Step 1：AI 脚本生成                             │
│  · 叙事结构分析 + 场景拆分                       │
│  · 多角色对话生成（性格/语调一致）               │
│  · 输出：剧本 + 角色卡 + 分镜标注               │
└─────────────────────────────────────────────────┘
    │
    ▼ （每步完成后进入下一步）
┌─────────────────────────────────────────────────┐
│  Step 2：分镜画面生成                           │
│  · 场景描述 → 分镜图生成（AI 绘图）            │
│  · 角色立绘（风格统一）                         │
│  · 氛围图/概念图                               │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Step 3：素材匹配                               │
│  · 分镜 → 视频素材库 匹配                      │
│  · 素材不足时 → AI 生成/补全                   │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Step 4：配音合成                               │
│  · 多角色音色分配（性格匹配）                  │
│  · 情感语调控制（对话/旁白/内心独白）          │
│  · BGM 自动匹配（场景氛围）                    │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Step 5：视频剪辑合成                           │
│  · 时间轴编排（素材 + 配音 + 字幕）            │
│  · 转场 + 特效                                 │
│  · 输出：完整漫剧视频                           │
└─────────────────────────────────────────────────┘
```

### 分步迭代策略
每个 Step 独立完成并验证，再进入下一步。当前优先 **Step 1：AI 脚本生成**。

---

## 二、Step 1：AI 脚本生成（当前阶段）

### 2.1 输入处理

**源格式：** TXT / Markdown / Word 文档

**处理流程：**
```
小说原文
    │
    ▼
┌─────────────────────────────────────────────────┐
│  文本解析                                        │
│  · 章节识别                                     │
│  · 段落分类（对话/叙述/动作/内心独白）         │
│  · 关键事件提取                                 │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│  叙事结构分析                                    │
│  · 起承转合识别                                 │
│  · 人物关系图谱                                 │
│  · 核心冲突/悬念 定位                          │
└─────────────────────────────────────────────────┘
```

### 2.2 角色卡生成

**自动识别：** AI 从小说中提取角色信息

**角色卡字段：**
| 字段 | 说明 |
|------|------|
| 姓名 | 角色名 |
| 外貌 | 简短描述（用于生成立绘） |
| 性格 | MBTI / 自定义标签 |
| 说话风格 | 口头禅/语气词/语言习惯 |
| 人物关系 | 与其他角色的关系 |
| 音色建议 | 推荐 TTS 音色类型 |

**输出：** JSON 角色卡列表 + Markdown 可视化

### 2.3 剧本生成

**输出格式：** 混合剧本格式

```yaml
scene_001:
  id: "sc_001"
  location: "咖啡厅"
  time: "白天"
  characters: ["主角", "配角A"]
  type: "对话"  # 对话/动作/内心独白/旁白
  camera: "中景"  # 远景/全景/中景/近景/特写
  transition: "淡入"
  
  content: |
    【主角走进咖啡厅，环顾四周】
    主角：今天约了人谈事情，希望顺利。
    配角A：（挥手）这边这边！

  video_note: |
    镜头从门口推进，主角背影入画，视线引导到配角A挥手
  emotion: "平静"  # 平静/紧张/欢快/悬疑
  bgm_suggestion: "轻柔钢琴曲"
```

### 2.4 核心 AI 模型

| 阶段 | 模型 | 说明 |
|------|------|------|
| 文本解析 | DeepSeek-V3 / Qwen-Max | 叙事结构理解 |
| 角色提取 | DeepSeek-V3 | 角色识别 + 性格分析 |
| 剧本生成 | DeepSeek-V3 + 漫剧 prompt | 结构化剧本输出 |
| 质量评估 | DeepSeek-V3 | 自检剧本逻辑/对话质量 |

---

## 三、架构设计

### 3.1 目录结构

```
src/
├── features/
│   └── manga-pipeline/
│       ├── steps/
│       │   └── step1-script-generation/
│       │       ├── parser/          # 文本解析
│       │       │   ├── chapter-splitter.ts
│       │       │   ├── paragraph-classifier.ts
│       │       │   └── event-extractor.ts
│       │       ├── analyzer/          # 叙事分析
│       │       │   ├── narrative-structure.ts
│       │       │   ├── character-graph.ts
│       │       │   └── conflict-detector.ts
│       │       ├── script-writer/    # 剧本生成
│       │       │   ├── character-card-generator.ts
│       │       │   ├── scene-generator.ts
│       │       │   └── dialogue-generator.ts
│       │       ├── evaluator/       # 质量评估
│       │       │   └── script-evaluator.ts
│       │       ├── types/           # 类型定义
│       │       │   ├── character.ts
│       │       │   ├── scene.ts
│       │       │   └── script.ts
│       │       └── pipeline-controller.ts
│       └── ui/                     # UI 组件
│           ├── ScriptGenerationView.tsx
│           ├── CharacterCard.tsx
│           └── ScriptEditor.tsx
│
├── core/
│   └── pipeline/                    # 通用流水线框架
│       ├── step.interface.ts
│       ├── pipeline-engine.ts
│       └── checkpoint.ts            # 断点续传
│
└── shared/
    ├── ai/
    │   └── providers/
    └── types/
```

### 3.2 流水线框架

```typescript
interface PipelineStep {
  id: string;
  name: string;
  process(input: StepInput): Promise<StepOutput>;
  checkpoint(): CheckpointState;
  restore(state: CheckpointState): void;
}

interface PipelineEngine {
  steps: PipelineStep[];

  async run(input: PipelineInput): Promise<PipelineOutput> {
    let context: PipelineContext = { input, steps: {} };

    for (const step of this.steps) {
      // 断点检查
      if (step.checkpoint()) {
        context = step.restore(step.checkpoint());
        continue;
      }

      // 执行步骤
      const result = await step.process(context);
      context.steps[step.id] = result;

      // 保存断点
      saveCheckpoint(step.id, result);
    }

    return context.output;
  }
}
```

### 3.3 断点续传

```typescript
interface CheckpointState {
  stepId: string;
  completed: boolean;
  data: any;
  timestamp: number;
}

// Tauri FS 持久化
async function saveCheckpoint(stepId: string, data: any): Promise<void>
async function loadCheckpoint(stepId: string): Promise<CheckpointState | null>
async function clearCheckpoint(stepId: string): Promise<void>
```

---

## 四、数据流

### 4.1 Step 1 完整数据流

```
小说原文
    │
    ▼ text input
[ChapterSplitter] → 章节列表
    │
    ▼ chapters
[ParagraphClassifier] → 段落类型标注
    │
    ▼ annotated paragraphs
[NarrativeAnalyzer]
    ├── [NarrativeStructure] → 叙事结构（起承转合）
    ├── [CharacterGraph] → 人物关系图
    └── [ConflictDetector] → 核心冲突/悬念
    │
    ▼ analysis result
[CharacterCardGenerator] → 角色卡列表（JSON）
    │
    ▼ characters + analysis
[SceneGenerator] → 场景列表（带分镜标注）
    │
    ▼ scenes
[DialogueGenerator] → 对话 + 动作 + 旁白
    │
    ▼ full script
[ScriptEvaluator] → 自检评分 + 修改建议
    │
    ▼ final script
ScriptOutput { script, characters, metadata }
```

---

## 五、技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript 5 |
| 桌面框架 | Tauri 2.0 |
| AI 模型 | DeepSeek-V3（脚本生成）、Qwen-Max（质量评估）|
| TTS | Edge-TTS / F5-TTS |
| 状态管理 | React Context + useReducer |
| 存储 | Tauri FS（断点持久化）、localStorage（偏好设置）|
| 样式 | Tailwind CSS |

---

## 六、Next Steps

1. ✅ Brainstorm 完成
2. ⬜ 写 implementation plan（docs/plans/，本地不提交）
3. ⬜ Step 1.1：搭建流水线框架 + 断点续传
4. ⬜ Step 1.2：文本解析（章节拆分 + 段落分类）
5. ⬜ Step 1.3：叙事分析（结构 + 人物关系 + 冲突）
6. ⬜ Step 1.4：角色卡生成
7. ⬜ Step 1.5：剧本生成 + 质量评估
8. ⬜ UI：脚本生成页面 + 角色卡展示 + 剧本编辑器