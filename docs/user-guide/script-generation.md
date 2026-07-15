# 剧本生成

> 第 3 步：将故事分析转化为视频剧本

## 输入

剧本生成依赖 ANALYSIS 步骤的输出：

- 故事结构（起承转合）
- 人物清单
- 场景识别结果

## 输出

结构化视频剧本：

```json
{
  "title": "三体第一集",
  "duration": "3分45秒",
  "segments": [
    {
      "id": "seg_1",
      "type": "narration",
      "text": "文化大革命如火如荼地进行...",
      "duration": 15,
      "emotion": "沉重"
    },
    {
      "id": "seg_2",
      "type": "dialogue",
      "speaker": "叶文洁",
      "text": "我必须做点什么...",
      "duration": 8
    }
  ]
}
```

## 自定义选项

- **风格**：电影感 / 纪录片 / 短视频 / 动画
- **语气**：正式 / 友好 / 幽默 / 严肃
- **长度**：短篇（≤1 min）/ 标准（1-3 min）/ 长篇（3-5 min）
- **语言**：中文 / English / 日语

::: tip
生成后可在 Manual 模式下直接编辑剧本内容，修改后再继续后续步骤。
:::

[下一步：角色设计 →](/user-guide/character-design)
