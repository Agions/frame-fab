---
title: 三步跑通
description: 3 步跑通你的第一个 AI 漫剧
category: getting-started
version: '>=2.2'
---

# 三步跑通

> 本教程带你从零完成第一个 AI 漫剧创作。

---

## 步骤 1：导入小说

启动应用后，点击首页「开始创建」进入编辑器。

在 **IMPORT** 步骤中：

- 直接粘贴小说文本（支持中文/英文）
- 或导入 `.txt` / `.md` 文件

```text
示例输入（《三体》节选）：
文化大革命如火如荼地进行，天文学家叶文洁在期间屡遭劫难...
```

系统自动完成：

- 章节切分
- 文本清理（去除空行、特殊字符）
- 长度评估

::: tip
单次输入建议 ≤ 5000 字。长篇小说建议分章节导入。
:::

## 步骤 2：AI 分析 + 剧本生成

进入 **ANALYSIS** 步骤，选择 AI Provider（推荐 OpenAI GPT-4 或智谱 GLM）：

| Provider   | 特点       | 推荐场景 |
| ---------- | ---------- | -------- |
| OpenGPT-4  | 高质量     | 剧本创作 |
| Claude 4   | 长文本     | 小说分析 |
| 智谱 GLM-5 | 中文优化   | 中文小说 |
| Kimi K2.5  | 超长上下文 | 整本分析 |

点击「开始分析」，系统自动执行：

1. **故事结构解析**（起承转合）
2. **人物清单提取**（主角/配角识别）
3. **场景识别**（场景 + 镜头规划）

完成后自动进入 **SCRIPT** 步骤，生成结构化剧本。

## 步骤 3：生成 + 导出

在 **COMPOSITION** 步骤：

1. 选择输出格式（MP4 / WebM）
2. 选择质量档位（720p / 1080p / 4K）
3. 点击「开始合成」

系统执行 9 步流水线：

```
IMPORT → ANALYSIS → SCRIPT → CHARACTER → STORYBOARD → RENDER → VIDEO_EDITING → AUDIO_SYNTHESIS → COMPOSITION
```

::: tip Quality Gate
每步完成后自动评分（角色一致性 ≥ 0.85、视觉质量 ≥ 0.80、脚本对齐 ≥ 0.90），不合格自动重试 ≤ 3 次。
:::

完成后获得成片视频文件。

---

[了解工作流详情 →](/user-guide/workflow-overview) | [配置 API Key →](/getting-started/configuration)
