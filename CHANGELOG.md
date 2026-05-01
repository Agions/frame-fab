# Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] - 2026-04-27

### 🗑️ UI 组件库迁移
- **antd 完全移除**: 62 个 antd 组件引用 → 0
- **@ant-design/icons 完全移除**: 14 个引用 → 0
- **迁移至 shadcn/ui**: 基于 Radix UI + Tailwind CSS 的全新组件系统
- **CSS 清理**: 移除 197 行 antd 相关 CSS

### 🎉 Major Rebranding
- **Project Renamed**: ManGaAI → **PanelFlow**
- **Version Bump**: v2.1.0 → v3.0.0
- **Complete Rebrand**: New logo, brand identity, all configurations updated

### ✨ New Features
- Professional tool-style UI redesign
- Enhanced workflow system
- Improved code architecture

### 🔧 Configuration Updates
- Package name: `manga-ai` → `PanelFlow`
- Tauri identifier: `com.mangaai.app` → `com.PanelFlow.app`
- Window title updated to PanelFlow branding

### 📝 Documentation
- Complete README rewrite in English
- Added comprehensive project structure documentation
- Updated AI model support (2026 latest models)

## [2.0.0] - 2026-02-22

### 🎉 Project Rename
- Project name unified to **ManGaAI**
- New brand identity and ASCII Art Logo
- All configurations, code comments, and documentation updated

### ✨ Workflow Engine Upgrade
- **Step 6 Scene Rendering**: Complete implementation
- **Step 7 Dynamic Composition**: Camera movement system, Ken Burns effects, transitions
- **Step 8 Voiceover & BGM**: Dialogue collection, character voice mapping, ambient BGM
- **Step 9 Export**: Timeline orchestration, multi-track composition, export settings

### 📝 Documentation Rewrite
- README.md fully rewritten with professional formatting
- 9-step workflow documented with input → process → output
- Mermaid tech architecture diagrams
- Quick start guide

### 🔧 Code Improvements
- Storage key prefix updated to `PanelFlow_`
- Tauri bundle identifier: `com.PanelFlow.app`
- Version bumped to 2.0.0

## [1.1.0] - 2026-02-17

### Renamed
- **Project Name**: Nova → **ManGaAI**
  - New ASCII art logo
  - Updated all documentation references
  - GitHub: https://github.com/Agions/PanelFlow

### Added
- **8-Step Drama Workflow**: Novel → Script → Storyboard → Character → Scene → Animation → Voiceover → Export
- **Novel Parser**: Automatic novel-to-script conversion with character extraction
- **Storyboard Generator**: AI-powered panel generation from script scenes
- **Character Consistency**: Character appearance and personality management
- **Drama Style System**: Genre/tone/pacing/art style management
- **Vision Service**: Advanced scene detection, object detection, emotion analysis
- **Novel Service**: Parse novels, convert to scripts, generate storyboards

### Updated
- **LLM Models (2026 Latest)**:
  - Baidu ERNIE 4.0
  - Alibaba Qwen 2.5
  - Moonshot Kimi K2.5
  - Zhipu GLM-5
  - MiniMax M2.5

### Technical
- Added `useNovel` hook for novel parsing
- Added `useConsistency` hook for character management
- Added `novel.service.ts` for novel-to-script conversion
- Added `consistency.service.ts` for character consistency

## [1.0.0] - 2026-02-17

### Added
- Initial release of **PanelFlow**
- AI-powered video content creation platform
- Support for 8 major AI providers
- Professional video upload and analysis
- AI script generation with multiple styles
- Video export with subtitle support
- Multi-language support
- Dark mode support
- Local storage management
- FFmpeg integration

### Features
- **Model Selector**: Smart AI model selection with cost estimation
- **Novel Parser**: Upload and parse novels (TXT/EPUB/PDF)
- **Script Generator**: AI-powered script generation
- **Storyboard Generator**: Automatic storyboard creation
- **Character Designer**: AI character generation with consistency
- **Project Management**: Complete project lifecycle management
- **Storage Service**: Persistent local storage

### Technical
- React 18 + TypeScript + Vite
- Ant Design 5 + Framer Motion
- Tauri for desktop application
- Zustand for state management
- Modular architecture with service layer

## [0.1.0] - 2026-02-16

### Added
- Project initialization
- Basic project structure
- TypeScript configuration
- Development environment setup
