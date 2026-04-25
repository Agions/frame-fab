/**
 * Step 4: 角色设计
 */
import { Card, Typography, Space, Button } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { UserOutlined } from '@ant-design/icons';

import type { Character } from '@/core/types';

import styles from '../ProjectEdit.module.less';

const CharacterDesigner = lazy(() => import('@/features/character/components/CharacterDesigner'));

export interface StepContentCharacterProps {
  characters: Character[];
  projectId: string | undefined;
  onChange: (characters: Character[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

const StepContentCharacter: React.FC<StepContentCharacterProps> = ({
  characters,
  projectId,
  onChange,
  onPrev,
  onNext,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <UserOutlined /> 角色设计
    </Title>
    <Paragraph>
      为故事中的角色创建和管理形象档案，确保视觉一致性。
    </Paragraph>
    <div className={styles.characterDesignerContainer}>
      <CharacterDesigner
        characters={characters}
        onChange={onChange}
        projectId={projectId}
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

export default StepContentCharacter;
