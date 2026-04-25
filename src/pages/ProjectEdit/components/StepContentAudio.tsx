/**
 * Step 7: 配音配乐
 */
import { Card, Typography, Space, Button } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { SoundOutlined } from '@ant-design/icons';

import type { AudioTrackConfig } from '@/features/audio/components/AudioEditor';
import type { StoryboardFrame } from '@/features/storyboard/components/StoryboardEditor';

import styles from '../ProjectEdit.module.less';

const AudioEditor = lazy(() => import('@/features/audio/components/AudioEditor'));

export interface StepContentAudioProps {
  audioConfig: AudioTrackConfig;
  audioEditorKey: string;
  audioGenerating: boolean;
  scriptText: string;
  storyboardFrames: StoryboardFrame[];
  onConfigChange: (config: AudioTrackConfig) => void;
  onGenerateVoices: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const StepContentAudio: React.FC<StepContentAudioProps> = ({
  audioConfig,
  audioEditorKey,
  audioGenerating,
  scriptText,
  storyboardFrames,
  onConfigChange,
  onGenerateVoices,
  onPrev,
  onNext,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <SoundOutlined /> 配音配乐
    </Title>
    <Paragraph>
      添加配音和背景音乐。
    </Paragraph>
    <div className={styles.audioActions}>
      <Button
        type="primary"
        onClick={onGenerateVoices}
        loading={audioGenerating}
        disabled={!scriptText}
      >
        一键生成配音
      </Button>
    </div>
    <div className={styles.audioContainer}>
      <AudioEditor
        key={audioEditorKey}
        initialConfig={audioConfig}
        onConfigChange={onConfigChange}
        videoDuration={Math.max(storyboardFrames.length * 5, 60)}
      />
    </div>
    <div className={styles.stepActions}>
      <Space>
        <Button onClick={onPrev}>上一步</Button>
        <Button type="primary" onClick={onNext}>下一步</Button>
      </Space>
    </div>
  </Card>
);

export default StepContentAudio;
