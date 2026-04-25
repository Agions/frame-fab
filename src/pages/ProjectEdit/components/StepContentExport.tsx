/**
 * Step 8: 视频导出
 */
import { Card, Typography, Space, Button, message } from 'antd';
import React, { lazy } from 'react';

const { Title, Paragraph } = Typography;
import { ExportOutlined } from '@ant-design/icons';

import type { EvaluationScores , QualityGateIssue } from '@/core/services';
import type { ExportSettings } from '@/core/types';

import styles from '../ProjectEdit.module.less';

import QualityGateAlert from './QualityGateAlert';


const VideoExporter = lazy(() => import('@/features/video/components/VideoExporter'));

export interface StepContentExportProps {
  exportPreset: '9:16' | '16:9' | '1:1';
  exportSettings: Partial<ExportSettings>;
  projectId: string | undefined;
  projectName: string;
  storyboardFrameCount: number;
  qualityGateIssues: QualityGateIssue[];
  qualityGatePassed: boolean;
  saving: boolean;
  onPresetChange: (preset: '9:16' | '16:9' | '1:1') => void;
  onExport: (settings: ExportSettings) => void;
  onLocateIssue: (issue: QualityGateIssue) => void;
  onSave: () => void;
  onPrev: () => void;
}

const StepContentExport: React.FC<StepContentExportProps> = ({
  exportPreset,
  exportSettings,
  projectId,
  projectName,
  storyboardFrameCount,
  qualityGateIssues,
  qualityGatePassed,
  saving,
  onPresetChange,
  onExport,
  onLocateIssue,
  onSave,
  onPrev,
}) => (
  <Card className={styles.stepCard}>
    <Title level={4}>
      <ExportOutlined /> 视频导出
    </Title>
    <Paragraph>
      导出最终视频脚本视频。
    </Paragraph>

    <div className={styles.exportPresetBar}>
      <Space>
        <Button
          type={exportPreset === '9:16' ? 'primary' : 'default'}
          onClick={() => onPresetChange('9:16')}
        >
          竖屏 9:16
        </Button>
        <Button
          type={exportPreset === '16:9' ? 'primary' : 'default'}
          onClick={() => onPresetChange('16:9')}
        >
          横屏 16:9
        </Button>
        <Button
          type={exportPreset === '1:1' ? 'primary' : 'default'}
          onClick={() => onPresetChange('1:1')}
        >
          方屏 1:1
        </Button>
      </Space>
    </div>

    <div className={styles.exporterContainer}>
      <QualityGateAlert
        issues={qualityGateIssues}
        passed={qualityGatePassed}
        onLocateIssue={onLocateIssue}
      />
      <VideoExporter
        projectId={projectId}
        projectName={projectName}
        estimatedDuration={Math.max(storyboardFrameCount * 5, 60)}
        initialSettings={exportSettings}
        onExport={async (settings) => {
          if (!qualityGatePassed) {
            message.error('质量闸门未通过，已阻止导出。请先修复阻断项。');
            return;
          }
          onExport(settings);
          message.success(`已按 ${exportPreset} 预设完成导出任务`);
        }}
      />
    </div>

    <div className={styles.stepActions}>
      <Space>
        <Button onClick={onPrev}>上一步</Button>
        <Button type="primary" onClick={onSave} loading={saving}>
          保存项目
        </Button>
      </Space>
    </div>
  </Card>
);

export default StepContentExport;
