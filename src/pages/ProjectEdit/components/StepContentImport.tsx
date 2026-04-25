/**
 * Step 0: 导入小说/剧本
 */
import { Card, Typography, Button } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { FileTextOutlined } from '@ant-design/icons';

import styles from '../ProjectEdit.module.less';

const NovelImporter = lazy(() => import('@/features/script/components/NovelImporter'));

export interface StepContentImportProps {
  content: string;
  loading: boolean;
  onContentLoad: (newContent: string, metadata: import('@/features/script/components/NovelImporter').NovelMetadata) => void;
  onRemove: () => void;
  onNext: () => void;
}

const StepContentImport: React.FC<StepContentImportProps> = ({
  content,
  loading,
  onContentLoad,
  onRemove,
  onNext,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <FileTextOutlined /> 导入小说/剧本
    </Title>
    <Paragraph>
      请导入小说或剧本文件，支持 TXT、MD、DOCX 格式。您也可以直接粘贴内容。
    </Paragraph>
    <NovelImporter
      initialContent={content}
      onContentLoad={onContentLoad}
      onRemove={onRemove}
      loading={loading}
    />
    <div className={styles.stepActions}>
      <Button
        type="primary"
        onClick={onNext}
        disabled={!content}
      >
        下一步
      </Button>
    </div>
  </Card>
);

export default StepContentImport;
