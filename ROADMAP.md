# Roadmap · 路线图

> frame-fab 的版本演进计划。所有时间都是目标，**实际发布以 GitHub Releases 为准**。

---

## ✅ 已完成

### v3.0 · 代码审查 + 死代码清理（2026-06）

- 🧹 ESLint 0 errors（修 `video-analysis.service.ts:93` `no-useless-catch`）
- 🧹 Zustand 5 个 slice 类型收窄（`any` → 精确联合类型：project/video/script/currentProject/export）
- 🧹 `src` 中 `any` 数量 35 → 0（剩余 `any` 全部在 `__tests__/` 注释/mock 类型中）
- 🧹 清误导性 TODO 12 处（ScriptEditor / AIModelSelector / 节点分类色）
- 🧹 死代码清理 Round 17-19：-289 行（logger.d.ts + 15 unused exports + 3 adapter files + run_ffmpeg_vec + dead link）
- 🆕 测试 1381 用例全绿（80 套），0 regression

### v3.0 · 品牌升级（2026-06）

- 🎨 Logo 资产全面升级 v2.0（三帧胶片条带 + 三圈光圈 + 装饰点）
- 📘 新增 `BRAND_GUIDELINES.md`（Logo/色彩/字体规范）
- 🖼️ OG Image 重设计（含 4 个特性徽章）
- 📝 README v3.0 重写（聚焦 5 步 Pipeline + 21 服务 + 80/1381 tests 真实数据）

### v3.0 · 性能 + 沙箱化 + 安全（2026-Q3）

- ⚡ Vite build 30.1s → 14.6s（terser → esbuild，51% 提升）
- ⚡ Vite 构建缓存优化（vendor chunks 9 类已合理）
- ⚡ AutoPipelineEngine 集成测试覆盖（6 场景端到端）
- 🔒 Tauri Capability 最小化（capabilities/default.json 移除 11 个未用 permission）
- 🔒 Rust IPC 参数校验加固（path traversal 白名单 + null byte 防护）
- 🔒 CSP 收紧（移除 `script-src 'unsafe-inline'`；`frame-src` 加 `blob:`）
- 🔒 安全测试补充（path traversal / null byte / 白名单 3 套 9 用例）

### v3.0 · docs 主题与排版细化（2026-06）

- 🎨 主题/排版细化：a11y focus / 打印样式 / 表格斑马纹 / 外链图标 / 章节锚点
- 📱 响应式 3 档（Tablet 960px / Mobile 640px / Ultra-wide 1600px）
- 🔗 CI 死链检查（`docs-links.yml` + 集成到 `docs.yml`）
- 🛠️ `pnpm docs:check-links` 本地一键验证

### v2.4 · 大文件拆分重构（2026-06）

- 🧱 44 个大文件 → 195+ 子模块
- 🧹 删除 4 个死代码文件（301 行）
- ✅ tsc 干净 + 80 套 / 1381 测试零 regression

### v2.3 · mega cleanup（2026-06）

- 🧹 死代码清理 -6,400 LOC
- 🔁 重复代码合并 -1,200 LOC
- 📂 命名规范化（Pages kebab-case）

### v2.2 · 正式化（2026-Q1）

- 仓库改名 frame-fab
- 描述中文化
- 自主流水线正式化
- ADR 决策记录体系
- 性能基准报告

### v2.1 · 8-Phase 架构重构（2025-Q4）

- Rust 模块化
- 服务重组
- 5 个全局 Store 收敛

### v2.0 · 基础七步工作流（2025-Q3）

- Manual 模式（七步半自动）
- 端到端小说→漫剧流水线

---

## 🔄 进行中

### v3.4 · 多模态融合（2026-Q4 目标）

- 🎵 音乐 AI 生成（接入 Suno/Udio API）
- 🔊 音效 AI 生成
- 🎬 视频背景音乐智能匹配
- 📱 移动端预览 App（iOS/Android）

### v4.0 · 全自动漫剧工坊（2027-Q1 目标）

- 🤖 Agent 化：用户说"我要拍一部科幻漫剧"，系统自动规划/调度
- 🎨 风格迁移：参考视频风格一键应用到新作品
- 🌍 国际化 2.0：英文/日文 UI + 多语种 TTS
- 📊 数据看板：制作工时/Token 消耗/质量趋势

---

## 🎯 长期愿景

**frame-fab 致力于成为开源 AI 漫剧创作的事实标准**：

- ✅ **桌面优先**（隐私 + 性能 + 控制力）
- ✅ **多模型编排**（不绑定任何 Provider）
- ✅ **可扩展架构**（用户可加自己的 Step/Provider）
- ✅ **完全开源**（MIT 协议，100% 透明）
- ✅ **创作者友好**（让创作者专注于故事本身）

我们相信：**未来 5 年，AI 漫剧创作工具的终极形态 = frame-fab + 你自己的创意**。

---

## 贡献到路线图

- 💡 [Discussions · Ideas](https://github.com/Agions/frame-fab/discussions)
- 📋 [Issues · Feature](https://github.com/Agions/frame-fab/issues?q=is%3Aopen+is%3Aissue+label%3A%22feature+request%22)
- 🗳️ [GitHub Projects](https://github.com/Agions/frame-fab/projects)（即将开放）

如有疑问或建议，欢迎在 Discussions 讨论喵～(=^･ω･^=)
