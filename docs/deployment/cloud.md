<!--
  PlotCraft 云端部署 — Animated & Professional Edition
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
.platform-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 10px 0 20px; }
.platform-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; animation: slideUp 0.4s ease-out both; transition: transform 0.3s ease, border-color 0.3s ease; }
.platform-card:hover { transform: translateY(-3px); border-color: rgba(255,107,53,0.35); }
.platform-name { font-weight: 700; font-size: 0.9em; color: #FF6B35; margin-bottom: 4px; }
.platform-desc { font-size: 0.78em; color: rgba(255,255,255,0.6); margin: 0; }
.check-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 10px 0 20px; }
.check-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 12px; animation: slideUp 0.4s ease-out both; transition: border-color 0.3s ease; }
.check-item:hover { border-color: rgba(255,107,53,0.3); }
.check-text { font-size: 0.82em; color: rgba(255,255,255,0.65); margin: 0; }
.separator { border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,107,53,0.3), rgba(69,184,172,0.3), transparent); margin: 26px 0; animation: fadeIn 1s ease-out; }
.footer-section { text-align: center; padding: 22px 16px 8px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 30px; animation: fadeIn 1s ease-out; }
.footer-text { color: rgba(255,255,255,0.5); font-size: 0.85em; animation: footerGlow 3s ease-in-out infinite; }
.footer-tagline { color: rgba(255,255,255,0.35); font-size: 0.8em; margin-top: 6px; animation: breathe 4s ease-in-out infinite; }
</style>

<div class="breadcrumb">← [文档首页](https://agions.github.io/PlotCraft) · [部署指南](./build.md) · 环境 →</div>

<div class="hero-banner"><div class="hero-title">☁️ 云端部署</div><div class="hero-subtitle">将 PlotCraft 部署到云平台</div></div>

## 支持的平台

<div class="platform-grid">
  <div class="platform-card"><div class="platform-name">Vercel</div><div class="platform-desc">推荐 · 一键部署</div></div>
  <div class="platform-card"><div class="platform-name">Netlify</div><div class="platform-desc">静态托管</div></div>
  <div class="platform-card"><div class="platform-name">AWS Amplify</div><div class="platform-desc">AWS 生态</div></div>
  <div class="platform-card"><div class="platform-name">Cloudflare Pages</div><div class="platform-desc">边缘加速</div></div>
  <div class="platform-card"><div class="platform-name">Railway</div><div class="platform-desc">现代部署</div></div>
  <div class="platform-card"><div class="platform-name">Render</div><div class="platform-desc">简单托管</div></div>
</div>

## Vercel

```bash
npm i -g vercel
vercel
vercel --prod
```

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Netlify

```bash
npm i -g netlify-cli
netlify deploy --dir=dist --prod
```

## Cloudflare Pages

```bash
npm i -g wrangler
wrangler pages project create plotcraft
wrangler pages deploy dist
```

## 安全注意事项

<div class="check-grid">
  <div class="check-item"><div class="check-text">✅ HTTPS 已启用（所有平台都提供）</div></div>
  <div class="check-item"><div class="check-text">✅ API 密钥在环境变量中，不在代码中</div></div>
  <div class="check-item"><div class="check-text">✅ API 端点已配置速率限制</div></div>
  <div class="check-item"><div class="check-text">✅ CORS 配置正确</div></div>
  <div class="check-item"><div class="check-text">✅ 客户端包中无敏感数据</div></div>
</div>

## 监控

| 类型 | 服务 |
|------|------|
| 运行时间 | Better Uptime, Pingometer |
| 性能 | Vercel Analytics, Datadog |
| 错误跟踪 | Sentry, LogRocket |

<hr class="separator">
<div class="footer-section"><div class="footer-text">PlotCraft 文档 · AI 驱动的专业视频脚本创作平台</div><div class="footer-tagline">_💫 将你的故事转化为专业级视频内容_</div></div>
