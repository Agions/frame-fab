/**
 * Step 2: 编辑剧本
 */
import { Card, Typography, Space, Button } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { EditOutlined } from '@ant-design/icons';

import styles from '../ProjectEdit.module.less';

const ScriptEditor = lazy(() => import('@/features/script/components/ScriptEditor'));

export interface StepContentScriptProps {
  onExport: (format: string) => void;
  onSave: (segments: unknown) => void;
  onPrev: () => void;
  onNext: () => void;
}

const StepContentScript: React.FC<StepContentScriptProps> = ({
  onExport,
  onPrev,
  onNext,
  onSave,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <EditOutlined /> 编辑剧本
    </Title>
    <Paragraph>
      编辑和优化AI生成的剧本内容，可以添加、删除或修改片段。
    </Paragraph>

    <ScriptEditor
      videoPath=""
      initialSegments={[]}
      onSave={onSave}
      onExport={onExport}
    />

    <div className={styles.stepActions}>
      <Space>
        <Button onClick={onPrev}>上一步</Button>
        <Button type="primary" onClick={onNext}>下一步</Button>
      </Space>
    </div>
  </Card>
);

export default StepContentScript;
