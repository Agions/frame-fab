/**
 * 情感检测服务
 * 提供基于关键词的情感分析功能
 */

import { EmotionType, type NovelScene, type SceneEmotion } from '@/shared/types';

/**
 * 情感检测器
 * 使用关键词匹配方法分析场景情感
 */
class EmotionDetector {
  private readonly emotionKeywords: Record<EmotionType, string[]> = {
    [EmotionType.HAPPY]: ['开心', '高兴', '快乐', '喜悦', '欢笑', '笑容', '欣喜'],
    [EmotionType.SAD]: ['悲伤', '伤心', '难过', '痛苦', '哭泣', '泪', '沮丧'],
    [EmotionType.ANGRY]: ['愤怒', '生气', '恼火', '气愤', '发怒', '怒吼'],
    [EmotionType.FEARFUL]: ['害怕', '恐惧', '惊恐', '畏惧', '胆战心惊'],
    [EmotionType.SURPRISED]: ['惊讶', '吃惊', '意外', '震惊', '错愕'],
    [EmotionType.DISGUSTED]: ['厌恶', '嫌弃', '讨厌', '反感', '恶心'],
    [EmotionType.NEUTRAL]: ['平静', '正常', '平淡'],
    [EmotionType.EXCITED]: ['激动', '兴奋', '狂热', '热血', '澎湃'],
    [EmotionType.TENSE]: ['紧张', '紧绷', '焦虑', '不安', '提心吊胆'],
    [EmotionType.RELAXED]: ['放松', '舒适', '悠闲', '惬意', '轻松'],
    [EmotionType.ROMANTIC]: ['爱慕', '心动', '浪漫', '甜蜜', '温柔', '深情'],
    [EmotionType.MYSTERIOUS]: ['神秘', '诡异', '奇怪', '莫名', '玄妙'],
    [EmotionType.COMEDIC]: ['搞笑', '幽默', '逗', '有趣', '可笑'],
    [EmotionType.DRAMATIC]: ['戏剧', '冲突', '矛盾', '激烈', '高潮'],
    [EmotionType.ACTION]: ['战斗', '搏斗', '冲刺', '飞奔', '猛烈'],
    [EmotionType.CALM]: ['冷静', '沉着', '淡定', '平稳', '安静'],
  };

  /**
   * 检测场景情感
   */
  detectEmotions(scenes: NovelScene[]): void {
    for (const scene of scenes) {
      const emotionCounts = new Map<EmotionType, number>();
      const content = scene.content;

      for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
        for (const keyword of keywords) {
          const count = (content.match(new RegExp(keyword, 'g')) ?? []).length;
          if (count > 0) {
            emotionCounts.set(
              emotion as EmotionType,
              (emotionCounts.get(emotion as EmotionType) ?? 0) + count
            );
          }
        }
      }

      // 转换为 SceneEmotion 数组
      const totalCount = [...emotionCounts.values()].reduce((a, b) => a + b, 0);

      scene.emotions = [...emotionCounts.entries()]
        .map(([type, count]) => ({
          type: type as EmotionType,
          intensity: totalCount > 0 ? count / totalCount : 0,
          dominant: count === Math.max(...emotionCounts.values()),
        }))
        .sort((a, b) => b.intensity - a.intensity)
        .slice(0, 3);
    }
  }
}

export const emotionDetector = new EmotionDetector();
