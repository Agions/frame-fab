# frame-fab v3.0 精品漫剧 Demo

> 用 mmx 全栈制作的 23.5 秒精品漫剧, 展示 frame-fab 的端到端能力

## 🎬 最终成品

[`assets/frame-fab-demo-v3.mp4`](assets/frame-fab-demo-v3.mp4) — 23.5 秒 / 1364×768 / H.264 + AAC / 7.1 MB

## 📖 故事梗概

> 深夜的城市,一位青年漫画家独自坐在窗前。空白的手稿,是无数个不眠之夜的开始。
> 突然,一道光从虚空中凝聚,那是他梦寐以求的灵感。笔尖落下,墨线流淌,角色从纸上活了过来。
> 这不是魔法,这是 AI 漫剧创作的力量。
> **frame-fab,把你的故事,变成一部专业漫剧。**

## 🎨 4 镜分镜

| 镜头   | 内容                       | 文件                             | 评分               |
| ------ | -------------------------- | -------------------------------- | ------------------ |
| Shot 1 | 青年回眸,窗外赛博朋克都市  | `hero/storyboard/shot-1_001.jpg` | ⭐ 8.5/10          |
| Shot 2 | AI 光球出现,墨线在纸上涌现 | `hero/storyboard/shot-2_001.jpg` | ⭐ 5.5/10 (有乱码) |
| Shot 3 | 漫画角色从书页跃出         | `hero/storyboard/shot-3_001.jpg` | ⭐ 8.5/10          |
| Shot 4 | 完成的漫剧在巨型屏幕上展示 | `hero/storyboard/shot-4_001.jpg` | ⭐ 8/10            |

## 🛠️ 制作流程 (mmx 全栈)

```bash
# Step 1: 生成 4 张分镜首帧
mmx image generate --prompt "..." --aspect-ratio 16:9 --width 1920 --height 1080 ...

# Step 2: 基于首帧生成 4 段视频
mmx video generate --prompt "..." --first-frame shot-1.jpg --async
mmx video download --file-id <id> --out clip-1.mp4

# Step 3: 生成中文旁白 + SRT 字幕
mmx speech synthesize --text "..." --language zh --out narration.mp3 --subtitles

# Step 4: 生成背景音乐
mmx music generate --prompt "Cinematic anime bgm..." --instrumental --model music-2.6 --out bgm.mp3

# Step 5: FFmpeg 合成最终视频
ffmpeg -i merged.mp4 -i mixed_audio.m4a \
       -vf "subtitles=subtitles.srt:..." \
       -c:v libx264 -crf 20 -c:a copy \
       frame-fab-demo-v3.mp4
```

## ⚠️ 已知瑕疵 (透明记录)

| 问题                             | 原因                              | 修复方案                   |
| -------------------------------- | --------------------------------- | -------------------------- |
| Shot 2 画面有乱码                | mmx image AI 生成文字崩坏常见问题 | 手动 inpaint 或换镜头重做  |
| 分辨率 1364×768 (非 1920×1080)   | mmx Hailuo-2.3 默认输出尺寸       | 用 upscale 模型二次升频    |
| Shot 4 屏幕显示 Angel Beats 角色 | AI 幻觉,引用了既有番剧            | 重写 prompt 强调"原创角色" |

## 🔄 复现命令

完整复现脚本见 [`scripts/reproduce-demo.sh`](scripts/reproduce-demo.sh)。

## 📊 完整时间线

| 时间     | 动作                           | 耗时   |
| -------- | ------------------------------ | ------ |
| 0:00     | image gen shot-1 (并行 4 张)   | ~30s   |
| 0:30     | video gen 4 tasks 提交 (async) | ~5s    |
| 0:35     | speech synthesize 旁白         | ~3s    |
| 0:38     | music generate BGM             | ~110s  |
| 2:28     | video tasks 完成 (后台)        | ~2 min |
| 2:33     | 下载 4 段视频                  | ~5s    |
| 2:38     | FFmpeg 拼接 + 烧字幕 + 混音    | ~40s   |
| **3:18** | **最终成品完成**               | —      |

## 🎯 价值

这个 demo 验证了:

- ✅ mmx 多模态能力 (image / video / speech / music) 协同工作
- ✅ frame-fab 端到端流程的最小可运行示例
- ✅ 23.5 秒内可生产"看似精品"的漫剧内容

注意: 这只是单镜 demo。 真实漫剧需:

- 5-10 分钟完整剧情
- 20+ 镜头 + 复杂转场
- 多角色一致性 (frame-fab ProviderRegistry 价值所在)
- 专业配音 (多角色音色)
