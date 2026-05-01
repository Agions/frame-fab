import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PanelFlow',
  description: 'AI驱动的专业视频脚本创作平台 — 从创意到成品的完整AI工作流',
  srcDir: '.',
  srcExclude: ['plans/**', 'ui-redesign/**', 'landing.html', 'index.html'],
  lang: 'zh-CN',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0a0a0f' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap' }],
  ],
  themeConfig: {
    siteTitle: 'PanelFlow',
    nav: [
      { text: '快速开始', link: '/getting-started/quick-start' },
      { text: '用户指南', link: '/user-guide/workflow-overview' },
      { text: '开发指南', link: '/developer-guide/architecture' },
      { text: 'API', link: '/api/overview' },
      {
        text: '资源',
        items: [
          { text: '更新日志', link: 'https://github.com/Agions/PanelFlow/blob/main/CHANGELOG.md' },
          { text: 'GitHub', link: 'https://github.com/Agions/PanelFlow' },
          { text: '问题反馈', link: 'https://github.com/Agions/PanelFlow/issues' },
        ],
      },
    ],
    sidebar: {
      '/getting-started/': [
        {
          text: '入门指南',
          items: [
            { text: '快速开始', link: '/getting-started/quick-start' },
            { text: '安装', link: '/getting-started/installation' },
            { text: '配置', link: '/getting-started/configuration' },
          ],
        },
      ],
      '/user-guide/': [
        {
          text: '用户指南',
          items: [
            { text: '工作流程概述', link: '/user-guide/workflow-overview' },
            { text: '导入与分析', link: '/user-guide/import-analysis' },
            { text: '脚本生成', link: '/user-guide/script-generation' },
            { text: '分镜头设计', link: '/user-guide/storyboard-design' },
            { text: '角色设计', link: '/user-guide/character-design' },
            { text: '渲染与导出', link: '/user-guide/rendering-export' },
          ],
        },
      ],
      '/developer-guide/': [
        {
          text: '开发者指南',
          items: [
            { text: '架构', link: '/developer-guide/architecture' },
            { text: '项目结构', link: '/developer-guide/project-structure' },
            { text: '服务', link: '/developer-guide/services' },
            { text: '组件', link: '/developer-guide/components' },
            { text: '状态管理', link: '/developer-guide/state-management' },
            { text: '测试', link: '/developer-guide/testing' },
          ],
        },
      ],
      '/deployment/': [
        {
          text: '部署',
          items: [
            { text: '构建与部署', link: '/deployment/build' },
            { text: '环境变量', link: '/deployment/environment' },
            { text: '云部署', link: '/deployment/cloud' },
            { text: 'Docker', link: '/deployment/docker' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概述', link: '/api/overview' },
            { text: 'AI 服务', link: '/api/ai-service' },
            { text: '图像生成', link: '/api/image-generation' },
            { text: 'TTS 服务', link: '/api/tts-service' },
            { text: '流水线引擎', link: '/api/pipeline-service' },
            { text: '视频分析', link: '/api/video-analysis-service' },
            { text: '字幕服务', link: '/api/subtitle-service' },
            { text: '协同服务', link: '/api/collaboration-service' },
            { text: '评审导出', link: '/api/review-export-service' },
            { text: '评测服务', link: '/api/evaluation-service' },
            { text: '质量门禁', link: '/api/quality-gate-service' },
            { text: '成本服务', link: '/api/cost-service' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Agions/PanelFlow' },
    ],
    footer: {
      message: 'MIT License © 2026 Agions',
      copyright: 'PanelFlow v3.0.0 — AI驱动的视频脚本创作平台',
    },
    search: {
      provider: 'local',
    },
  },
  markdown: {
    lineNumbers: false,
  },
  vite: {
    build: {
      rollupOptions: {
        external: [],
      },
    },
  },
})
