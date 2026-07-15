---
layout: home
title: Story Weaver
titleTemplate: false

hero:
  name: 'Story Weaver'
  text: 'AI 漫剧创作平台'
  tagline: '输入一本小说，AI 自动把它拍成一部漫剧——你只需要按「开始」'
  image:
    src: /logo.svg
    alt: Story Weaver
  actions:
    - theme: brand
      text: 快速开始 →
      link: /getting-started/installation
    - theme: alt
      text: 架构设计
      link: /developer-guide/architecture
    - theme: alt
      text: GitHub ⭐
      link: https://github.com/Agions/story-weaver

features:
  - icon: 🎬
    title: 9 步智能流水线
    details: 从小说导入到视频输出的端到端自动化，每步都有 Quality Gate 自检
  - icon: 🧠
    title: 多模型 AI 编排
    details: 7  Provider（OpenAI/Anthropic/Google/智谱/阿里/百度/Mock），智能 Fallback
  - icon: ⚡
    title: 桌面原生性能
    details: Tauri 2.1 + React 19 + Vite 6，30 MB 包体积，冷启动 < 1s
  - icon: 🔄
    title: 质量自修复
    details: Self-Review Loop 自动重试（≤3 次）+ 30s 自动 Checkpoint 断点续传
  - icon: 🎙️
    title: 一站式音视频
    details: TTS 配音、字幕生成/嵌入、FFmpeg 合成，MP4/WebM/MOV 多格式输出
  - icon: 🏗️
    title: 分层架构
    details: 'features-core-shared 单向依赖 + ESLint 强制层级边界'
---

<!-- 为什么选择 -->

<div class="vp-section-header">
  <h2 class="vp-section-title">为什么选择 Story Weaver？</h2>
  <p class="vp-section-sub">市面上唯一的<strong>开源桌面端</strong> AI 漫剧创作平台。数据完全本地、MIT 协议、无云端锁定。</p>
</div>

<div class="vp-why-grid">
  <div class="vp-why-card">
    <div class="vp-why-icon">🔒</div>
    <div class="vp-why-title">100% 本地</div>
    <div class="vp-why-desc">所有 AI 推理在本地完成，作品永不离开你的设备。无订阅、无云服务锁定。</div>
  </div>
  <div class="vp-why-card">
    <div class="vp-why-icon">🤖</div>
    <div class="vp-why-title">全自动化</div>
    <div class="vp-why-desc">Autonomous 模式下，导入小说 → 等待 15-30 分钟 → 得到成片。</div>
  </div>
  <div class="vp-why-card">
    <div class="vp-why-icon">🛠️</div>
    <div class="vp-why-title">可编排</div>
    <div class="vp-why-desc">Manual 模式下暂停等待审批，可注入自定义 Prompt、替换中间结果。</div>
  </div>
</div>

<!-- 工作流 -->

<div class="vp-section-header">
  <h2 class="vp-section-title">9 步智能创作流水线</h2>
  <p class="vp-section-sub">从原始文本到成片的端到端自动化流程</p>
</div>

<div class="vp-workflow">
  <div class="vp-step">
    <div class="vp-step-num">1</div>
    <div class="vp-step-body">
      <div class="vp-step-title">导入 <code>IMPORT</code></div>
      <div class="vp-step-desc">小说文本 / 剧本文件 → 章节切分 + 文本清理</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">2</div>
    <div class="vp-step-body">
      <div class="vp-step-title">AI 分析 <code>ANALYSIS</code></div>
      <div class="vp-step-desc">故事结构解析 + 人物清单 + 场景识别</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">3</div>
    <div class="vp-step-body">
      <div class="vp-step-title">剧本生成 <code>SCRIPT</code></div>
      <div class="vp-step-desc">结构化视频剧本（分镜 + 旁白 + 对白）</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">4</div>
    <div class="vp-step-body">
      <div class="vp-step-title">角色设计 <code>CHARACTER</code></div>
      <div class="vp-step-desc">角色设定卡 + AI 生成参考图</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">5</div>
    <div class="vp-step-body">
      <div class="vp-step-title">分镜设计 <code>STORYBOARD</code></div>
      <div class="vp-step-desc">分镜脚本 + 逐帧参考图</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">6</div>
    <div class="vp-step-body">
      <div class="vp-step-title">场景渲染 <code>RENDER</code></div>
      <div class="vp-step-desc">关键帧图像生成 + 一致性保持</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">7</div>
    <div class="vp-step-body">
      <div class="vp-step-title">视频剪辑 <code>VIDEO_EDITING</code></div>
      <div class="vp-step-desc">镜头拼接 + 转场效果 + 字幕叠加</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">8</div>
    <div class="vp-step-body">
      <div class="vp-step-title">配音合成 <code>AUDIO_SYNTHESIS</code></div>
      <div class="vp-step-desc">TTS 配音 + 唇形同步 + 字幕生成</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
  <div class="vp-step">
    <div class="vp-step-num">9</div>
    <div class="vp-step-body">
      <div class="vp-step-title">合成导出 <code>COMPOSITION</code></div>
      <div class="vp-step-desc">FFmpeg 多轨合成 → MP4 / WebM / MOV</div>
    </div>
    <div class="vp-step-arrow">→</div>
  </div>
</div>

<!-- 数据 -->

<div class="vp-section-header">
  <h2 class="vp-section-title">项目数据</h2>
</div>

<div class="vp-stats-row">
  <div class="vp-stat">
    <div class="vp-stat-num">55K+</div>
    <div class="vp-stat-label">代码行数</div>
    <div class="vp-stat-sub">TypeScript + React</div>
  </div>
  <div class="vp-stat">
    <div class="vp-stat-num">879</div>
    <div class="vp-stat-label">测试用例</div>
    <div class="vp-stat-sub">Jest + Testing Library</div>
  </div>
  <div class="vp-stat">
    <div class="vp-stat-num">9</div>
    <div class="vp-stat-label">流水线步骤</div>
    <div class="vp-stat-sub">端到端自动化</div>
  </div>
  <div class="vp-stat">
    <div class="vp-stat-num">7</div>
    <div class="vp-stat-label">AI Provider</div>
    <div class="vp-stat-sub">完整 Fallback</div>
  </div>
</div>

<!-- CTA -->

<div class="vp-cta">
  <h2 class="vp-cta-title">准备开始创作？</h2>
  <p class="vp-cta-sub">3 步跑通你的第一个 AI 漫剧</p>
  <div class="vp-cta-actions">
    <a href="/getting-started/installation" class="vp-cta-btn vp-cta-btn-brand">安装指南 →</a>
    <a href="/getting-started/quick-start" class="vp-cta-btn">快速开始</a>
    <a href="/user-guide/workflow-overview" class="vp-cta-btn">了解工作流</a>
  </div>
</div>
