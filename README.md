# PanelFlow

**AI驱动的专业视频脚本创作平台** — 将小说、剧本或提示词转化为专业级视频内容

<div align="center">

**7+ AI Models · 7-Step Workflow · MIT License**

</div>

---

<div align="center">

[![Version](https://img.shields.io/badge/Version-3.0.0-FF6B35?style=flat-square&logo=package&logoColor=white)](https://github.com/Agions/PanelFlow/releases)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-9+-CB3837?style=flat-square&logo=npm&logoColor=white)](https://npmjs.com)
[![Coverage](https://img.shields.io/badge/Coverage-33%25-45B8AC?style=flat-square&logo=checkmarx&logoColor=white)](https://github.com/Agions/PanelFlow/actions)
[![License](https://img.shields.io/badge/License-MIT-45B8AC?style=flat-square&logo=license&logoColor=white)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![CI](https://img.shields.io/github/actions/workflow/status/Agions/PanelFlow/ci.yml?style=flat-square&label=CI)](https://github.com/Agions/PanelFlow/actions)
[![Docs](https://img.shields.io/badge/Docs-在线访问-7B68EE?style=flat-square&logo=book&logoColor=white)](https://agions.github.io/PanelFlow)
[![Stars](https://img.shields.io/badge/Stars-⭐-f6c90e?style=flat-square&logo=star&logoColor=white)](https://github.com/Agions/PanelFlow/stargazers)
[![Issues](https://img.shields.io/badge/Issues-问题反馈-d5362b?style=flat-square&logo=github&logoColor=white)](https://github.com/Agions/PanelFlow/issues)

</div>

---

## ✨ 八大核心功能

| 功能 | 描述 |
|:---:|------|
| 📥 **智能导入** | 小说/剧本/提示词，自动编码检测，智能章节切分 |
| 🤖 **多模型AI** | 7+ 模型支持，文字/图像/语音，按需切换模型 |
| 🎬 **智能分镜** | AI自动生成，多比例支持，可视化编辑 |
| 🎭 **角色一致性** | 种子机制，参考图锁定，批量零走样 |
| 👄 **唇形同步** | TTS语音对齐，多语言支持，情感语气调节 |
| ⚡ **可视化工作流** | 类n8n引擎，拖拽连接，条件分支循环 |
| 🖼️ **批量渲染** | 多模型并行，引擎/光照/调色，2K直出+AI 4K |
| 📤 **一键导出** | 多格式支持，画质可配置，自动化合成 |

---

## 🔄 八步工作流

```
📥 导入 ──▶ 🧠 AI分析 ──▶ 📝 脚本生成 ──▶ 🎬 分镜设计
                                               │
                    ┌──────────────────────────┤
                    │                          │
                    ▼                          ▼
              🖼️ 批量渲染  ◀──  🎭 角色设计
                    │
                    ▼
              🎞️ 合成视频
                    │
                    ▼
               📤 导出
```

| 步骤 | 功能 | 关键配置 |
|:---:|------|----------|
| 📥 导入 | 小说/剧本/提示词 | 编码检测、智能分章 |
| 🧠 AI分析 | 识别章节结构、角色、场景 | 多模型并行 |
| 📝 脚本生成 | AI生成结构化视频脚本 | 模型选择、集数配置 |
| 🎬 分镜设计 | 自动生成分镜图 | 比例、分辨率 |
| 🎭 角色设计 | AI创建角色保持一致 | 风格、一致性强度 |
| 🖼️ 批量渲染 | 多模型并行渲染场景 | 引擎、光照、调色 |
| 🎞️ 合成视频 | 合成轨道编辑、镜头拼接 | 转场、时长 |
| 📤 导出 | 一键合成视频 | 格式、画质 |

---

## 🚀 快速开始

### Web 开发（推荐）

**macOS/Linux：**

```bash
git clone https://github.com/Agions/PanelFlow.git
cd PanelFlow
npm install
npm run dev
```

**Windows：**

```powershell
# 使用 winget 安装 Node.js
winget install OpenJS.NodeJS

git clone https://github.com/Agions/PanelFlow.git
cd PanelFlow
npm install
npm run dev
```

应用运行在 `http://localhost:5173`

---

### 桌面应用（Tauri 2.0）

**macOS：**

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Rust 编译依赖
brew install rust cmake protobuf llvm
brew installwebkit2gtk python3 gtkmm3 libsoup3

# 构建桌面应用
npm install
npm run tauri build
```

**Linux（Ubuntu/Debian）：**

```bash
sudo apt update && sudo apt install -y \
  rustc cargo cmake ninja-build libgtk-3-dev libwebkitgtk-6.0-dev

npm install
npm run tauri build
```

**Windows：**

安装 [Rust](https://rustup.rs/) + [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)，然后：

```powershell
npm install
npm run tauri build
```

> 💡 需要配置 `.env` 文件中的 API Key 才能使用 AI 功能，详见[配置指南](https://agions.github.io/PanelFlow/getting-started/configuration)

---

## 🛠️ 技术栈

| 类别 | 技术 |
|:---:|------|
| **前端框架** | React 18 · TypeScript 5 · Vite |
| **UI 组件** | Ant Design 5 · CSS Modules |
| **状态管理** | Zustand |
| **动画** | Framer Motion |
| **桌面端** | Tauri 2.0 (Rust) |
| **国际化** | i18next |
| **测试** | Jest · Vitest |
| **文档** | VitePress |

---

## 🤖 支持的AI模型

### 文字生成

| 提供商 | 模型 | 发布日期 |
|-------|------|----------|
| 智谱 | GLM-5 | 2026年2月 |
| MiniMax | M2.5 | 2026年2月 |
| 月之暗面 | Kimi K2.5 | 2026年 |
| 字节跳动 | Doubao 2.0 | 2026年 |
| 阿里云 | Qwen 2.5 | 2026年 |
| 百度 | ERNIE 4.0 | 2026年 |

### 图像生成

| 提供商 | 模型 | 特性 | 发布日期 |
|-------|------|------|----------|
| 字节跳动 | Seedream 5.0 | 2K直出、AI 4K增强 | 2026年2月10日 |
| 快手 | Kling 1.6 | 图像+视频生成 | 2026年 |
| 生数科技 | Vidu 2.0 | 图像+视频生成 | 2026年 |

### 视频生成

| 提供商 | 模型 | 特性 | 发布日期 |
|-------|------|------|----------|
| 字节跳动 | Seedance 2.0 | 文/图/视频输入、镜头一致 | 2026年2月12日 |
| 快手 | Kling 1.6 | AI视频生成 | 2026年 |
| 生数科技 | Vidu 2.0 | AI视频生成 | 2026年 |

### 语音合成

| 提供商 | 模型/服务 | 特性 |
|-------|----------|------|
| 阿里云 | CosyVoice 2.0 | 开源、3秒克隆、方言/情感支持 |
| 阿里云 | KAN-TTS | 神经网络、多语言 |
| 百度 | TTS | 中文优化 |
| 科大讯飞 | TTS | 多语言支持 |

---

## 📁 项目结构

```
PanelFlow/
├── src/                      # React 前端源码
│   ├── features/             # 功能模块（ai/audio/character/editor...）
│   ├── components/          # 组件（ui/layout/business）
│   ├── core/                # 核心（services/stores/config/hooks/types）
│   └── pages/               # 页面
├── src-tauri/               # Tauri 桌面端（Rust）
├── public/                  # 静态资源
├── docs/                    # VitePress 文档
└── scripts/                 # 构建脚本
```

---

## 📚 文档

| 文档 | 说明 |
|:---|:---|
| [🚀 快速开始](https://agions.github.io/PanelFlow/getting-started/quick-start) | 5分钟快速上手 |
| [📖 用户指南](https://agions.github.io/PanelFlow/user-guide/workflow-overview) | 完整工作流程 |
| [🔧 开发指南](https://agions.github.io/PanelFlow/developer-guide/architecture) | 架构与开发 |
| [📡 API参考](https://agions.github.io/PanelFlow/api/overview) | API文档 |
| [🚢 部署指南](https://agions.github.io/PanelFlow/deployment/build) | 构建与部署 |

---

如果你觉得 PanelFlow 有帮助，请给我们一个 ⭐

[![Star](https://img.shields.io/badge/点击Star⭐-f6c90e?style=for-the-badge&logo=star&logoColor=white)](https://github.com/Agions/PanelFlow/stargazers)

---

MIT License · © 2026 Agions
