# 角色设计

为您的视频设计和管理角色。

## 概述

PanelFlow 中的角色设计专注于 AI 生成图像的视觉一致性和表情管理。

## 角色结构

```typescript
interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'extra';
  description: string;           // 外貌描述
  appearance: CharacterAppearance;
  clothing: ClothingItem[];
  expressions: CharacterExpression[];
  consistency: CharacterConsistency;  // 用于 AI 生成
  voice?: TTSVoice;                  // 语音设置
  tags: string[];
}
```

## 外观属性

```typescript
interface CharacterAppearance {
  gender: 'male' | 'female' | 'neutral';
  age: number;                       // 1-120
  hairStyle: string;                 // 例如："短发"、"长发"、"马尾"
  hairColor: string;                 // 十六进制颜色
  eyeColor: string;                  // 十六进制颜色
  skinTone: string;                 // 十六进制颜色
  height: 'short' | 'average' | 'tall';
  build: 'slim' | 'average' | 'athletic' | 'heavy';
  distinctiveFeatures?: string[];    // 例如：["眼镜"、"疤痕"]
}
```

## 一致性管理

对于 AI 图像生成以保持一致的角色外观：

```typescript
interface CharacterConsistency {
  seed: number;                      // 生成的随机种子
  weights?: Record<string, number>;   // 特征权重
  referenceImages: string[];         // 参考图片 URL
}
```

### 保持一致性

1. **设置种子**：锁定随机种子以获得可重复的结果
2. **添加参考**：上传参考图片
3. **定义权重**：调整特征重要性（例如：{ "face": 0.9, "hair": 0.7 }）

## 角色模板

PanelFlow 包含预设角色模板：

| 模板 | 描述 |
|----------|-------------|
| `professional_male` | 商务装束、短发 |
| `professional_female` | 商务装束、各种发型 |
| `casual_youth` | 现代休闲装 |
| `fantasy_hero` | 史诗奇幻角色 |
| `sci_fi_crew` | 科幻太空船员 |
| `historical` | 时代适当的服装 |

## 角色设计器界面

### 左侧面板：角色列表
- 查看所有角色
- 按角色筛选
- 按名称搜索

### 中间：角色预览
- 生成的角色的图片
- 表情变体

### 右侧面板：编辑器
- 外观编辑器
- 服装选择器
- 表情管理器
- 语音配置

## API 使用

```typescript
import { getCharacterService } from '@/features/character';

const service = getCharacterService();

// 创建角色
const character = service.create({
  name: '小明',
  role: 'protagonist',
  appearance: {
    gender: 'male',
    age: 25,
    hairStyle: '短发',
    hairColor: '#000000',
    // 更多属性...
  },
});

// 从模板创建
const templateCharacter = service.createFromTemplate('professional_male', {
  name: 'John Doe',
  appearance: { age: 30 },
});

// 更新参考图片
service.updateReferenceImage(character.id, newImageUrl);

// 锁定一致性
service.lockConsistency(character.id, true);
```

## 最佳实践

1. **一致的参考**：使用 3+ 参考图片以获得最佳一致性
2. **清晰的描述**：详细的描述有助于 AI 生成
3. **表情多样性**：为每个角色创建 4-6 个表情变体
4. **语音匹配**：将 TTS 语音与角色性格匹配

## 下一步

角色设计后：
- [渲染与导出](rendering-export.md) - 生成最终视频
- [故事板设计](storyboard-design.md) - 返回故事板
