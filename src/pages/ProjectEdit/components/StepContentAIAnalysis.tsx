/**
 * Step 1: AI 解析内容
 */
import { Card, Typography, Spin, Alert, Input, Space, Button } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { EditOutlined } from '@ant-design/icons';

import type { StoryAnalysis } from '@/core/types';
import type { NovelMetadata } from '@/features/script/components/NovelImporter';

import styles from '../ProjectEdit.module.less';

const NovelImporter = lazy(() => import('@/features/script/components/NovelImporter'));

export interface StepContentAIAnalysisProps {
  content: string;
  novelMetadata: NovelMetadata | null;
  analysisDraft: string;
  analysisState: 'idle' | 'generated' | 'accepted';
  loading: boolean;
  onContentLoad: (newContent: string, metadata: NovelMetadata) => void;
  onRemove: () => void;
  onAnalyze: () => void;
  onAccept: () => void;
  onDraftChange: (v: string) => void;
  onPrev: () => void;
}

const StepContentAIAnalysis: React.FC<StepContentAIAnalysisProps> = ({
  content,
  novelMetadata,
  analysisDraft,
  analysisState,
  loading,
  onContentLoad,
  onRemove,
  onAnalyze,
  onAccept,
  onDraftChange,
  onPrev,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <EditOutlined /> AI解析内容
    </Title>
    <Paragraph>
      使用AI智能分析小说/剧本内容，提取关键信息，生成适合视频脚本展示的剧本。
    </Paragraph>

    <Spin spinning={loading} tip="正在AI解析...">
      <div className={styles.analyzeContent}>
        <NovelImporter
          initialContent={content}
          onContentLoad={onContentLoad}
          onRemove={onRemove}
          loading={false}
        />

        {novelMetadata && (
          <div className={styles.contentInfo}>
            <Title level={5}>内容信息</Title>
            <p>文件名: {novelMetadata.filename}</p>
            <p>字符数: {novelMetadata.charCount.toLocaleString()}</p>
            <p>章节数: {novelMetadata.chapterCount}</p>
            <p>预估章节数: {novelMetadata.estimatedChapters}</p>
          </div>
        )}

        {analysisState !== 'idle' && (
          <div className={styles.analysisPanel}>
            <Title level={5}>结构化解析结果（可编辑）</Title>
            {analysisState === 'accepted' && (
              <Alert type="success" message="当前解析结果已接受，可重跑覆盖" showIcon style={{ marginBottom: 12 }} />
            )}
            <Input.TextArea
              value={analysisDraft}
              rows={14}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder="AI 解析 JSON 结果"
            />
          </div>
        )}
      </div>
    </Spin>

    <div className={styles.stepActions}>
      <Space>
        <Button onClick={onPrev}>上一步</Button>
        {analysisState !== 'idle' && (
          <Button onClick={onAnalyze} loading={loading}>
            重新解析
          </Button>
        )}
        {analysisState === 'generated' || analysisState === 'accepted' ? (
          <Button type="primary" onClick={onAccept} loading={loading}>
            接受并生成剧本
          </Button>
        ) : (
          <Button type="primary" onClick={onAnalyze} loading={loading}>
            开始AI解析
          </Button>
        )}
      </Space>
    </div>
  </Card>
);

export default StepContentAIAnalysis;
