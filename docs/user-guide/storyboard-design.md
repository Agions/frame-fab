# 分镜设计

> 第 5 步：分镜脚本 + 逐帧参考图

## 分镜结构

```json
{
  "frames": [
    {
      "id": "f1",
      "sceneId": "s1",
      "shot": "wide",
      "camera": "static",
      "duration": 5,
      "description": "叶文洁站在红岸基地...",
      "referenceImage": "https://..."
    }
  ]
}
```

## 镜头语言

| 镜头          | 说明 | 适用场景 |
| ------------- | ---- | -------- |
| wide          | 全景 | 场景建立 |
| medium        | 中景 | 对话场景 |
| close-up      | 特写 | 情感表达 |
| over-shoulder | 过肩 | 对话互动 |

## 转场效果

- cut（硬切）
- fade（淡入淡出）
- dissolve（叠化）
- wipe（划变）

[下一步：渲染与导出 →](/user-guide/rendering-export)
