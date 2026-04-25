/**
 * Step 6: 动态合成
 */
import { Card, Typography, Space, Button } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { PlayCircleOutlined } from '@ant-design/icons';

import type { CompositionProject } from '@/core/types';
import type { StoryboardFrame } from '@/features/storyboard/components/StoryboardEditor';

import styles from '../ProjectEdit.module.less';

const CompositionStudio = lazy(() => import('@/components/business/CompositionStudio'));

export interface StepContentCompositionProps {
  storyboardFrames: StoryboardFrame[];
  projectId: string | undefined;
  onCompositionChange: (comp: CompositionProject) => void;
  onPrev: () => void;
  onNext: () => void;
}

const StepContentComposition: React.FC<StepContentCompositionProps> = ({
  storyboardFrames,
  projectId,
  onCompositionChange,
  onPrev,
  onNext,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <PlayCircleOutlined /> 动态合成
    </Title>
    <Paragraph>
      为分镜添加动画效果和镜头运动，让画面动起来。
    </Paragraph>
    <div className={styles.compositionStudioContainer}>
      <CompositionStudio
        frames={storyboardFrames}
        projectId={projectId}
        onCompositionChange={onCompositionChange}
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

export default StepContentComposition;
