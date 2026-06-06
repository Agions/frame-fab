#!/bin/bash
# frame-fab v3.0 精品漫剧 Demo 复现脚本
# 需要: mmx-cli 已安装并认证, ffmpeg 可用

set -e
cd "$(dirname "$0")/.."

mkdir -p assets/hero/storyboard assets/video

# ====== Step 1: 生成 4 张分镜 ======
echo ">>> [1/5] 生成 4 张分镜首帧..."
mmx image generate --prompt "A young manga artist sitting at a desk in a dim studio at night, looking at a blank manuscript paper, neon city lights glow through rain-streaked window, melancholic atmosphere, cinematic anime style, soft cinematic lighting, 16:9 aspect ratio, 1920x1080, no text, no letters, no words, no characters overlay, no watermark" \
  --aspect-ratio 16:9 --n 1 --width 1920 --height 1080 \
  --out-dir assets/hero/storyboard --out-prefix shot-1 --quiet --non-interactive

mmx image generate --prompt "A glowing golden-orange orb of light materializes above the blank manuscript, radiating soft pink and purple light particles, anime style with cinematic lighting, magical AI spirit appearance, the artist's hand reaching toward it, sparkles and data streams flowing, 16:9 aspect ratio, 1920x1080, no text, no letters, no words, no characters overlay, no watermark" \
  --aspect-ratio 16:9 --n 1 --width 1920 --height 1080 \
  --out-dir assets/hero/storyboard --out-prefix shot-2 --quiet --non-interactive

mmx image generate --prompt "An overhead cinematic shot of a manga manuscript on the desk coming to life, ink lines and color blossoming from the page, characters and scenes emerging from paper, swirls of indigo purple and pink, the artist's face lit with wonder, anime style with rich cinematic colors, 16:9 aspect ratio, 1920x1080, no text, no letters, no words, no characters overlay, no watermark" \
  --aspect-ratio 16:9 --n 1 --width 1920 --height 1080 \
  --out-dir assets/hero/storyboard --out-prefix shot-3 --quiet --non-interactive

mmx image generate --prompt "Wide cinematic shot of the artist standing back, looking at a large glowing screen displaying a finished anime short drama episode, multiple character panels, vivid colors, the city night sky in background with aurora-like data streams, sense of achievement, anime style, cinematic, 16:9 aspect ratio, 1920x1080, no text, no letters, no words, no characters overlay, no watermark" \
  --aspect-ratio 16:9 --n 1 --width 1920 --height 1080 \
  --out-dir assets/hero/storyboard --out-prefix shot-4 --quiet --non-interactive

# ====== Step 2: 基于首帧生成 4 段视频 (并行) ======
echo ">>> [2/5] 提交 4 个视频生成任务..."
cd assets/video
mmx video generate --prompt "Cinematic anime scene, the young artist slowly turns his head from the window toward the desk, neon city lights reflecting on the window, melancholic mood, slow camera push-in, film grain, 6 seconds, smooth motion" \
  --first-frame ../hero/storyboard/shot-1_001.jpg --async --quiet --non-interactive > _task1.json
# ... (类似 task 2/3/4)
# 等待完成 + 拿 file_id
for n in 1 2 3 4; do
  TASK_ID=$(cat _task${n}.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('taskId', ''))")
  echo "Task $n: $TASK_ID 等待完成..."
  while true; do
    STATUS=$(mmx video task get --task-id "$TASK_ID" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('status', ''))")
    [ "$STATUS" = "Success" ] && break
    [ "$STATUS" = "failed" ] && echo "Task $n failed" && exit 1
    sleep 15
  done
  FILE_ID=$(mmx video task get --task-id "$TASK_ID" | python3 -c "import sys, json; print(json.load(sys.stdin).get('file_id', ''))")
  mmx video download --file-id "$FILE_ID" --out "clip-$n.mp4"
done

# ====== Step 3: 旁白 + 字幕 ======
echo ">>> [3/5] 生成中文旁白 + 字幕..."
cd ..
mmx speech synthesize \
  --text "深夜的城市,一位青年独自坐在窗前。空白的手稿,是无数个不眠之夜的开始。突然,一道光从虚空中凝聚,那是他梦寐以求的灵感。笔尖落下,墨线流淌,角色从纸上活了过来。这不是魔法,这是 AI 漫剧创作的力量。frame-fab,把你的故事,变成一部专业漫剧。" \
  --language zh --out assets/video/narration.mp3 --subtitles --quiet --non-interactive

# ====== Step 4: 背景音乐 ======
echo ">>> [4/5] 生成背景音乐..."
mmx music generate \
  --prompt "Cinematic anime background music, melancholic piano intro transitioning to inspirational electronic beat, hopeful and dreamy atmosphere, 30 seconds, suitable for manga creation story" \
  --instrumental --model music-2.6 --bpm 90 \
  --out assets/video/bgm.mp3 --quiet --non-interactive

# ====== Step 5: FFmpeg 合成 ======
echo ">>> [5/5] FFmpeg 拼接 + 烧字幕 + 混音..."
cd assets/video

# 拼接 4 段视频
cat > concat_list.txt <<EOF
file 'clip-1.mp4'
file 'clip-2.mp4'
file 'clip-3.mp4'
file 'clip-4.mp4'
EOF
ffmpeg -y -f concat -safe 0 -i concat_list.txt -c copy merged.mp4

# 混音
ffmpeg -y -i narration.mp3 -i bgm.mp3 \
  -filter_complex "[1:a]volume=0.25,afade=t=out:st=22:d=2[bgm];[0:a][bgm]amix=inputs=2:duration=longest[aout]" \
  -map "[aout]" -c:a aac -b:a 192k -t 24 mixed_audio.m4a

# 烧字幕 + 合并
cat > subtitles.srt <<EOF
1
00:00:01,000 --> 00:00:06,500
深夜的城市,一位青年独自坐在窗前。

2
00:00:06,500 --> 00:00:11,000
空白的手稿,是无数个不眠之夜的开始。

3
00:00:11,000 --> 00:00:16,500
突然,一道光从虚空中凝聚,那是他梦寐以求的灵感。

4
00:00:16,500 --> 00:00:21,000
笔尖落下,墨线流淌,角色从纸上活了过来。

5
00:00:21,000 --> 00:00:24,500
frame-fab,把你的故事,变成一部专业漫剧。
EOF

ffmpeg -y -i merged.mp4 -i mixed_audio.m4a \
  -vf "subtitles=subtitles.srt:force_style='FontSize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00202020,BorderStyle=3,Outline=2,Shadow=1,MarginV=60'" \
  -c:v libx264 -preset medium -crf 20 -c:a copy -shortest -movflags +faststart \
  frame-fab-demo-v3.mp4

echo "✅ 完成: assets/video/frame-fab-demo-v3.mp4"
