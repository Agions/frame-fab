<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/logo-horizontal.svg" />
  <img src="public/logo-horizontal.svg" alt="Story Weaver · AI 漫剧创作平台" width="480" />
</picture>

<br/>

# Story Weaver

> **输入一本小说，AI 自动把它拍成一部漫剧——你只需要按"开始"。**

[![CI](https://img.shields.io/github/actions/workflow/status/Agions/story-weaver/test.yml?style=for-the-badge&label=CI&logo=github)](https://github.com/Agions/story-weaver/actions)
[![License](https://img.shields.io/github/license/Agions/story-weaver?style=for-the-badge&color=45B8AC)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tauri](https://img.shields.io/badge/Tauri-2.1-FFC131?style=for-the-badge&logo=tauri)](https://tauri.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Version](https://img.shields.io/badge/version-v2.2.4-6366F1?style=for-the-badge)](https://github.com/Agions/story-weaver/releases)

[**📖 在线文档**](https://agions.github.io/story-weaver/) · [**📥 下载桌面端**](https://github.com/Agions/story-weaver/releases) · [**🐛 报告问题**](https://github.com/Agions/story-weaver/issues/new)

</div>

---

## 核心能力

| 特性                 | 描述                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| 🎬 **双模式工作流**  | Manual 七步半自动（逐步审批）+ Autonomous 全自动 Pipeline                    |
| 🧠 **多模型编排**    | ProviderRegistry + Fallback Chain，7+ 文字模型 / 4+ 图像 / 3+ TTS 自动降级   |
| 🔄 **断点续传**      | 30s 自动 Checkpoint，崩溃后可恢复                                            |
| 🎙️ **Edge TTS 免费** | 无需 API Key 即可获得 200+ 语音                                              |
| ✅ **质量自修复**    | Self-Review Loop 自动重试（≤3 次）                                           |
| 🏗️ **分层架构**      | components → hooks → services → types → utils 单向依赖 + ESLint 强制层级边界 |

---

## 快速开始

### 方式 1：下载桌面端

| 平台    | 架构      | 下载                                                                                   |
| ------- | --------- | -------------------------------------------------------------------------------------- |
| macOS   | Universal | [Story Weaver.app](https://github.com/Agions/story-weaver/releases/latest)             |
| Windows | x64       | [story-weaver_x64-setup.exe](https://github.com/Agions/story-weaver/releases/latest)   |
| Windows | ARM64     | [story-weaver_arm64-setup.exe](https://github.com/Agions/story-weaver/releases/latest) |
| Linux   | x64       | [story-weaver_amd64.deb](https://github.com/Agions/story-weaver/releases/latest)       |

### 方式 2：源码运行

```bash
git clone https://github.com/Agions/story-weaver.git
cd story-weaver
pnpm install
pnpm tauri dev
```

配置 `.env.local`（至少一个文字模型）：

```bash
VITE_ZHIPU_API_KEY=your_key     # 智谱 GLM-5（推荐）
VITE_ANTHROPIC_API_KEY=your_key # Claude 3.5（备选）
VITE_MINIMAX_API_KEY=your_key   # MiniMax M2.5
VITE_SEEDDREAM_API_KEY=your_key # Seedream 5.0（图像）
```

---

## 技术栈

| 类别     | 技术                                           |
| -------- | ---------------------------------------------- |
| 前端     | React 19 · TypeScript 5 · Vite 6 · Tailwind v4 |
| UI       | shadcn/ui (Radix UI)                           |
| 桌面端   | Tauri 2.1 · Rust · FFmpeg                      |
| 状态管理 | Zustand                                        |
| AI       | ProviderRegistry（Strategy + Fallback）        |
| 测试     | Jest 30 · React Testing Library                |
| 文档     | VitePress · Diátaxis 四象限                    |

---

## 架构概览

```
┌────────────────────────────────────────────────────┐
│  Frontend (React 19 + TypeScript)                  │
│  components/ → hooks/ → services/ → types/ → utils/│
└───────────────────────┬────────────────────────────┘
                        │  IPC (tauri::invoke)
┌───────────────────────┴────────────────────────────┐
│  Tauri 2.1 (Rust)                                  │
│  commands/ · services/ · models/ · utils/          │
│  Pipeline Engine · QualityGate · Checkpoint        │
└───────────────────────┬────────────────────────────┘
                        │  HTTPS
┌───────────────────────┴────────────────────────────┐
│  AI Providers                                      │
│  GLM-5 · Kimi · Seedream · Kling · TTS            │
└────────────────────────────────────────────────────┘
```

详见 [架构设计](https://agions.github.io/story-weaver/developer-guide/architecture)。

---

## 项目结构

```
frame-fab/
├── src/                  # 前端源码
│   ├── components/       # UI 层（ai · media · pipeline · project · home · common）
│   ├── hooks/            # 业务钩子（pipeline · ai · media）
│   ├── services/         # 核心服务（pipeline · ai · media）
│   ├── types/            # 类型定义（pipeline · ai · media）
│   ├── utils/            # 工具函数（environment · logger）
│   └── app/              # 应用入口与路由
├── src-tauri/            # Tauri Rust 后端
│   ├── src/commands/     # Tauri 命令（video · app · file）
│   ├── src/services/     # 业务逻辑（FFmpeg · video · config）
│   └── capabilities/     # 安全权限配置
├── docs/                 # VitePress 在线文档（23 篇）
├── public/               # 静态资源（logo · favicon）
└── .github/workflows/    # CI/CD（test · release）
```

---

## 文档入口

| 入口                                                                           | 适合谁             |
| ------------------------------------------------------------------------------ | ------------------ |
| [快速开始](https://agions.github.io/story-weaver/getting-started/quick-start)  | 第一次使用         |
| [用户手册](https://agions.github.io/story-weaver/user-guide/)                  | 创作者（双模式）   |
| [API 参考](https://agions.github.io/story-weaver/api/)                         | 开发者（核心服务） |
| [架构设计](https://agions.github.io/story-weaver/developer-guide/architecture) | 架构师             |

---

## 性能亮点

- **React.memo** — 列表项、卡片组件全面 memo 化，避免无效重渲染
- **useMemo / useCallback** — 派生状态与回调函数缓存，稳定引用
- **React.lazy** — 模型选择器、动画库按需加载，减少首屏体积
- **Virtuoso 虚拟滚动** — 分镜列表万级帧数不卡顿
- **30s Checkpoint** — 30 秒自动持久化，崩溃断点续传

---

## 贡献

欢迎 PR！Fork → 分支 → 提交 → PR。完整规范见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 许可证

MIT License · © 2024-2026 [Agions](https://github.com/Agions)
