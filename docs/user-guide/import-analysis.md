# 导入与分析

如何在 PanelFlow 中导入和分析源内容。

## 支持的格式

### 小说文件

**支持**：`.txt`、`.md`（Markdown）

**最佳实践**：
- 使用 UTF-8 编码
- 使用空行或 `# 章节` 标题分隔章节
- 在对话前包含角色名称（例如：`小明：今天天气真好！`）

**示例**：
```markdown
# 第一章：相遇

阳光明媚的早晨，小明走在校园里。

小明：今天天气真好！

突然，一个女孩从转角出现。
```

### 脚本格式（JSON）

**模式**：
```json
{
  "title": "脚本标题",
  "scenes": [
    {
      "id": "scene_1",
      "description": "场景描述",
      "dialogue": [
        { "character": "小明", "text": "你好！", "emotion": "happy" }
      ]
    }
  ]
}
```

### AI 提示词

**最佳实践**：
- 具体说明场景和角色
- 包含所需基调（戏剧性、喜剧性等）
- 指定大致长度

**示例提示词**：
```
写一个2分钟的戏剧场景，侦探在一张旧照片中发现隐藏的线索。
包含两个角色在昏暗办公室里的对话。
```

## 导入流程

### Web 界面

1. 点击工作流面板上的 **导入**
2. 选择输入类型：小说 / 脚本 / 提示词
3. 上传文件或输入文本
4. 点击 **分析**

### API 使用

```typescript
import { novelAnalyzer } from '@/core/services';

const result = await novelAnalyzer.parseNovelContent(novelText, {
  maxChapters: 50,
  detectCharacters: true,
  detectEmotions: true,
  generatePrompts: true,
});

// 结果包含：
// - metadata: { title, author, wordCount, chapterCount }
// - chapters: 解析的章节数组
// - scenes: 检测到的场景数组
// - characters: 检测到的角色数组
// - statistics: 字数、对话比例等
```

## 分析功能

### 自动检测

| 功能 | 描述 |
|---------|-------------|
| 章节检测 | 识别章节边界 |
| 场景分割 | 将内容分割为场景 |
| 角色提取 | 识别并命名角色 |
| 情感检测 | 分析情感基调 |
| 对话提取 | 提取角色对话 |

### 输出元数据

```typescript
interface NovelMetadata {
  title: string;           // 检测到或用户提供的标题
  author?: string;          // 作者（如果可检测）
  genre?: string;          // 类型分类
  wordCount: number;       // 总字数
  chapterCount: number;    // 章节数
  language: string;        // 主要语言
}
```

## 故障排除

### 导入失败

1. **文件过大**：拆分为较小的章节
2. **编码错误**：转换为 UTF-8
3. **格式无法识别**：检查文件扩展名

### 分析结果不佳

1. 添加更明确的章节/部分标记
2. 使用一致的角色命名
3. 在注释中添加场景描述

## 下一步

导入和分析后：
- [脚本生成](script-generation.md) - 生成结构化脚本
- [工作流概览](workflow-overview.md) - 返回工作流
