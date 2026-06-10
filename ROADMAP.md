# Roadmap · 路线图

> frame-fab 的版本演进计划。所有时间都是目标，**实际发布以 GitHub Releases 为准**。

---

## ✅ 已完成

### v3.0 · 品牌升级（2026-06）

- 🎨 Logo 资产全面升级 v2.0（三帧胶片条带 + 三圈光圈 + 装饰点）
- 📘 新增 `BRAND_GUIDELINES.md`（Logo/色彩/字体规范）
- 🖼️ OG Image 重设计（含 4 个特性徽章）
- 📝 README v2.0（聚焦快速开始 + 品牌信息条）

### v3.1 · docs 主题与排版细化（2026-06）

- 🎨 主题/排版细化：a11y focus / 打印样式 / 表格斑马纹 / 外链图标 / 章节锚点
- 📱 响应式 3 档（Tablet 960px / Mobile 640px / Ultra-wide 1600px）
- 🔗 CI 死链检查（`docs-links.yml` + 集成到 `docs.yml`）
- 🛠️ `pnpm docs:check-links` 本地一键验证
- 🐛 修复 8 个隐藏死链

### v3.2 · 性能优化（2026-06）

- ⚡ **Vite build 30.1s → 14.6s**（terser → esbuild，51% 提升）
- ✅ AutoPipelineEngine 集成测试（6 场景：happy path / 依赖图 / 异常 / 重试 / disabled / 耗时）
- 🧪 测试覆盖 1375 → 1381 用例，80 套全绿

### v2.4 · 大文件拆分重构（2026-06）

- 🧱 44 个大文件 → 195+ 子模块
- 🧹 删除 4 个死代码文件（301 行）
- ✅ tsc 干净 + 79 套 / 1375 测试零 regression

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

### v3.2 · 性能优化（2026-Q3 目标）

- ⚡ ✅ `pnpm vite build` 提速（**30.1s → 14.6s，51% 提升**）— terser → esbuild
- ⚡ ✅ Vite 构建缓存优化（vendor chunks 9 类已合理）
- ⚡ 🟡 manga-pipeline 测试提速（4s→2s）— **本机 2 核硬约束未达成**（ts-jest transform 摊销），详见 `docs/dev/v3.2-perf-baseline.md`
- ⚡ ✅ AutoPipelineEngine 集成测试覆盖（**6 场景端到端**）— happy path / 依赖图 / 异常中断 / 重试 / disabled / 耗时
- 🆕 ✅ 测试数 1375 → 1381（+6 集成），tsc 干净，0 regression

### v3.1 · 沙箱化与安全强化（2026-Q3 目标）

- 🔒 ✅ Tauri Capability 最小化（capabilities/default.json 移除 11 个未用 permission：clipboard-manager × 4、shell × 1、global-shortcut × 6）
- 🔒 ✅ Rust IPC 参数校验加固（`commands/file.rs` `list_app_data_files` 加白名单防 path traversal；`utils/path_validator.rs` `validate_temp_path` 修复永远拒绝 bug）
- 🔒 ✅ CSP 收紧（移除 `script-src 'unsafe-inline'`；`frame-src` 加 `blob:`）
- 🔒 ✅ 安全测试补充（path traversal / null byte / 白名单 3 套 9 用例）
- 🔒 🟡 用户态 WebView 沙箱强化（受限于 Tauri 2 内置 WebView 已是 OS-sandbox，**已无需额外配置**）
- 🆕 ✅ SECURITY.md 加 4.1-4.4 实施详情章节

---

## 📋 规划中

### v3.3 · 多模态融合（2026-Q4 目标）

- 🎵 音乐 AI 生成（接入 Suno/Udio API）
- 🔊 音效 AI 生成
- 🎬 视频背景音乐智能匹配
- 📱 移动端预览 App（iOS/Android）

### v3.4 · 协同与模板（2026-Q4 目标）

- 👥 协同编辑（基于 CRDT/Y.js）
- 🎭 角色一致性 v2（基于 IP-Adapter）
- 🛒 模板市场（用户共享分镜/角色模板）
- ☁️ 跨设备同步（自托管 + 云可选）

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
