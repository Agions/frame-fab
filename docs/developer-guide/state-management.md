<!--
  PlotCraft 状态管理 — Animated & Professional Edition
-->
<style>
@keyframes flowGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scanLight { 0% { left: -100%; } 100% { left: 200%; } }
@keyframes h2Underline { from { width: 0; } to { width: 60px; } }
@keyframes breathe { 0%, 100% { box-shadow: 0 0 15px rgba(255,107,53,0.3); } 50% { box-shadow: 0 0 35px rgba(255,107,53,0.7); } }
@keyframes footerGlow { 0%, 100% { text-shadow: 0 0 10px rgba(69,184,172,0.4); } 50% { text-shadow: 0 0 30px rgba(69,184,172,0.9), 0 0 60px rgba(69,184,172,0.4); } }
.breadcrumb { font-size: 0.82em; color: rgba(255,255,255,0.4); margin-bottom: 18px; animation: fadeIn 0.6s ease-out; }
.breadcrumb a { color: #45B8AC; text-decoration: none; transition: color 0.3s ease; }
.breadcrumb a:hover { color: #FF6B35; }
.hero-banner { font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(-45deg, #0a0a0f, #1a1a2e, #16213e, #0f3460, #1a1a2e); background-size: 400% 400%; animation: flowGradient 12s ease infinite; padding: 20px 18px; border-radius: 12px; text-align: center; margin-bottom: 28px; border: 1px solid rgba(255,107,53,0.25); position: relative; overflow: hidden; }
.hero-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(255,107,53,0.05) 0%, rgba(69,184,172,0.05) 100%); pointer-events: none; }
.hero-title { font-size: 1.8em; font-weight: 800; color: #fff; margin: 0 0 6px; letter-spacing: 1px; animation: slideUp 0.6s ease-out; }
.hero-subtitle { color: rgba(255,255,255,0.7); font-size: 1em; margin: 0; animation: slideUp 0.7s ease-out 0.15s both; }
.h2-section { position: relative; margin-top: 34px; margin-bottom: 14px; font-size: 1.4em; font-weight: 700; color: #e8e8e8; padding-bottom: 8px; animation: slideUp 0.6s ease-out; }
.h2-section::after { content: ''; position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, #FF6B35, #45B8AC, #FF6B35); background-size: 200% 100%; animation: flowGradient 3s ease infinite, h2Underline 0.8s ease-out forwards; border-radius: 2px; }
pre { background: linear-gradient(135deg, #0d0d14, #1a1a2e); border: 1px solid rgba(255,107,53,0.2); border-radius: 10px; padding: 16px 20px; overflow-x: auto; animation: slideUp 0.6s ease-out; position: relative; }
pre::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent); animation: scanLight 6s ease-in-out infinite; pointer-events: none; border-radius: 10px; }
code { color: #e8e8e8; font-size: 0.88em; font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace; }
:not(pre) > code { background: rgba(255,107,53,0.1); padding: 2px 7px; border-radius: 4px; color: #FF6B35; }
table { width: 100%; border-collapse: collapse; margin: 10px 0 22px; animation: fadeIn 0.8s ease-out; }
thead tr { background: linear-gradient(90deg, rgba(255,107,53,0.15), rgba(69,184,172,0.1)); }
th { padding: 10px 14px; text-align: left; font-size: 0.88em; color: #FF6B35; border-bottom: 2px solid rgba(255,107,53,0.3); font-weight: 700; }
td { padding: 9px 14px; font-size: 0.88em; color: rgba(255,255,255,0.78); border-bottom: 1px solid rgba(255,255,255,0.06); }
tr { transition: background 0.25s ease; animation: slideUp 0.4s ease-out both; }
tbody tr:nth-child(1) { animation-delay: 0.05s; } tbody tr:nth-child(2) { animation-delay: 0.1s; } tbody tr:nth-child(3) { animation-delay: 0.15s; } tbody tr:nth-child(4) { animation-delay: 0.2s; } tbody tr:nth-child(5) { animation-delay: 0.25s; }
tbody tr:hover { background: rgba(255,107,53,0.08); } tr:last-child td { border-bottom: none; }
.store-arch { background: linear-gradient(135deg, rgba(10,10,15,0.95), rgba(22,33,62,0.9)); border: 1px solid rgba(255,107,53,0.2); border-radius: 12px; padding: 18px 22px; overflow-x: auto; margin: 10px 0 20px; animation: slideUp 0.6s ease-out; position: relative; }
.store-arch pre { background: transparent; border: none; padding: 0; font-size: 0.82em; line-height: 1.7; color: rgba(255,255,255,0.82); }
.store-arch::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.015), transparent); animation: scanLight 8s ease-in-out infinite; pointer-events: none; border-radius: 12px; }
.hint-block { background: rgba(69,184,172,0.08); border-left: 3px solid #45B8AC; border-radius: 0 8px 8px 0; padding: 10px 16px; margin: 14px 0; animation: slideUp 0.5s ease-out; }
.hint-block p { margin: 0; font-size: 0.88em; color: rgba(255,255,255,0.75); }
.best-practices { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 10px 0 20px; }
.bp-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; animation: slideUp 0.4s ease-out both; transition: border-color 0.3s ease, transform 0.3s ease; }
.bp-item:hover { border-color: rgba(255,107,53,0.35); transform: translateY(-2px); }
.bp-num { font-weight: 700; font-size: 0.85em; color: #FF6B35; margin-bottom: 3px; }
.bp-text { font-size: 0.8em; color: rgba(255,255,255,0.6); margin: 0; }
.separator { border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,107,53,0.3), rgba(69,184,172,0.3), transparent); margin: 26px 0; animation: fadeIn 1s ease-out; }
.footer-section { text-align: center; padding: 22px 16px 8px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 30px; animation: fadeIn 1s ease-out; }
.footer-text { color: rgba(255,255,255,0.5); font-size: 0.85em; animation: footerGlow 3s ease-in-out infinite; }
.footer-tagline { color: rgba(255,255,255,0.35); font-size: 0.8em; margin-top: 6px; animation: breathe 4s ease-in-out infinite; }
</style>

<div class="breadcrumb">← [文档首页](https://agions.github.io/PlotCraft) · [开发指南](../developer-guide/architecture.md) · 组件 →</div>

<div class="hero-banner"><div class="hero-title">📊 状态管理</div><div class="hero-subtitle">PlotCraft 中基于 Zustand 的状态管理</div></div>

## 存储架构

<div class="store-arch"><pre>
<span style="color:#45B8AC">shared/stores/</span>
├── <span style="color:#e8e8e8">app.store.ts</span>         # 全局应用状态
├── <span style="color:#e8e8e8">project.store.ts</span>     # 当前项目状态
├── <span style="color:#e8e8e8">workflow.store.ts</span>    # 工作流编辑器状态
├── <span style="color:#e8e8e8">storyboard.store.ts</span>  # 分镜状态
├── <span style="color:#e8e8e8">character.store.ts</span>   # 角色状态
└── <span style="color:#e8e8e8">ui.store.ts</span>          # UI 状态 (弹窗、Toast)
</pre></div>

### 存储架构

| 存储 | 用途 | 持久化 |
|------|------|--------|
| `appStore` | UI 状态（主题、通知） | 否 |
| `projectStore` | 项目数据 | 是（localStorage） |
| `workflowStore` | 工作流状态 | 是（localStorage） |
| `userStore` | 用户偏好 | 是（localStorage） |
| `videoEditorStore` | 时间线/编辑器状态 | 否 |

### 数据流

```
用户操作 → Hook → 存储更新 → 组件重渲染
                    ↓
              副作用（API 调用等）
                    ↓
              存储更新（包含结果）
```

## Zustand 存储

### AppStore

全局应用状态。

```typescript
interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh';
  isOnline: boolean;
  isLoading: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
}
```

**用法:**
```typescript
import { useAppStore } from '@/shared/stores';

function ThemeToggle() {
  const { theme, setTheme } = useAppStore();
  return <button onClick={() => setTheme('dark')}>深色</button>;
}
```

### ProjectStore

当前项目数据。

```typescript
interface ProjectState {
  project: Project | null;
  isDirty: boolean;
  createProject: (data: ProjectData) => void;
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  updateProject: (updates: Partial<Project>) => void;
}
```

### WorkflowStore

工作流编辑器状态。

```typescript
interface WorkflowState {
  nodes: WorkflowNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  zoom: number;
  isRunning: boolean;
  addNode: (node: WorkflowNode) => void;
  removeNode: (id: string) => void;
  execute: () => Promise<void>;
}
```

## 持久化

存储可以持久化到 localStorage：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      project: null,
      isDirty: false,
      createProject: (data) => {
        set({ project: { id: uuid(), ...data }, isDirty: true });
      },
    }),
    {
      name: 'plotcraft-project',
      partialize: (state) => ({ project: state.project }),
    }
  )
);
```

## 最佳实践

<div class="best-practices">
  <div class="bp-item"><div class="bp-num">1. 就近原则</div><div class="bp-text">状态保持在使用它的地方附近</div></div>
  <div class="bp-item"><div class="bp-num">2. 规范化</div><div class="bp-text">规范化嵌套数据结构</div></div>
  <div class="bp-item"><div class="bp-num">3. 不可变性</div><div class="bp-text">不要直接修改状态</div></div>
  <div class="bp-item"><div class="bp-num">4. 持久化</div><div class="bp-text">只持久化必要的数据</div></div>
  <div class="bp-item"><div class="bp-num">5. 类型安全</div><div class="bp-text">始终定义 TypeScript 接口</div></div>
</div>

<div class="hint-block"><p>💡 <strong>开发工具</strong>：Zustand 集成 Redux DevTools，可在浏览器中调试状态变化。</p></div>

<hr class="separator">
<div class="footer-section"><div class="footer-text">PlotCraft 文档 · AI 驱动的专业视频脚本创作平台</div><div class="footer-tagline">_💫 将你的故事转化为专业级视频内容_</div></div>
