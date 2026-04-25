/**
 * Step 5: 场景渲染
 */
import { Card, Typography, Space, Button } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { CheckCircleOutlined } from '@ant-design/icons';

import type { StoryboardFrame } from '@/features/storyboard/components/StoryboardEditor';

import styles from '../ProjectEdit.module.less';

const RenderCenter = lazy(() => import('@/components/business/RenderCenter'));

export interface StepContentRenderProps {
  storyboardFrames: StoryboardFrame[];
  projectId: string | undefined;
  onApplyRenderedFrame: (frameId: string, imageUrl: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const StepContentRender: React.FC<StepContentRenderProps> = ({
  storyboardFrames,
  projectId,
  onApplyRenderedFrame,
  onPrev,
  onNext,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <CheckCircleOutlined /> 场景渲染
    </Title>
    <Paragraph>
      渲染漫画场景，包括背景、道具和光影效果。
    </Paragraph>
    <div className={styles.renderCenterContainer}>
      <RenderCenter
        frames={storyboardFrames}
        projectId={projectId}
        onApplyRenderedFrame={onApplyRenderedFrame}
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

export default StepContentRender;
