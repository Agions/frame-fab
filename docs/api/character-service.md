# 角色服务

`CharacterService` 负责角色的增删改查、模板管理、数据持久化。

## 概述

角色服务管理视频创作中的角色数据，支持 AI 生成、手动创建、种子机制保证角色一致性。

## 使用示例

```typescript
import { getCharacterService } from '@/core/services/character.service';

const characterService = getCharacterService();

// 获取所有角色
const characters = characterService.getAll();

// 创建新角色
const newCharacter = characterService.create({
  name: '主角小明',
  appearance: {
    style: 'realistic',
    age: 'young adult',
    gender: 'male',
  },
  seed: 'character_seed_123', // 一致性种子
});

// AI 生成角色
const aiCharacter = await characterService.generateCharacter({
  prompt: '一个身穿古装的年轻女性角色',
  style: '古风',
});

// 批量更新角色外观
characterService.batchUpdateAppearance(characters, {
  clothing: '正式套装',
  background: '室内办公室',
});
```

## 核心方法

| 方法 | 说明 |
|------|------|
| `getAll()` | 获取所有角色 |
| `getById(id)` | 根据 ID 获取角色 |
| `create(data)` | 创建新角色 |
| `update(id, data)` | 更新角色 |
| `delete(id)` | 删除角色 |
| `generateCharacter(options)` | AI 生成角色 |
| `batchUpdateAppearance(ids, options)` | 批量更新外观 |
| `save()` | 保存到 localStorage |
| `exportCharacters()` | 导出角色数据 |
