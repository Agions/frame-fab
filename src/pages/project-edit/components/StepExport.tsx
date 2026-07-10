/**
 * Step 8: 视频导出
 *
 * 通过 useStepExportContext() 获取 exportPreset/exportSettings/qualityGate 等，
 * 不再依赖父组件层层传递 props。
 */
import { Download } from 'lucide-react';
import { lazy } from 'react';
import { useParams } from 'react-router-dom';

import { useProject } from '@/core/hooks/useProject';
import type { ExportSettings } from '@/features/video/components/VideoExporter';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toast } from '@/shared/components/ui/toast';

import { useStepExportContext } from '../context/selectors';
import styles from '../ProjectEdit.module.less';

import QualityGateAlert from './QualityGateAlert';

const VideoExporter = lazy(() => import('@/features/video/components/VideoExporter'));

/** @deprecated 内部改用 Context selector，保留类型以兼容旧引用。 */
export interface StepExportProps {
  exportPreset?: '9:16' | '16:9' | '1:1';
  exportSettings?: Partial<ExportSettings>;
  projectId?: string;
  projectName?: string;
  storyboardFrameCount?: number;
  qualityGateIssues?: import('@/core/services').QualityGateIssue[];
  qualityGatePassed?: boolean;
  saving?: boolean;
  onPresetChange?: (preset: '9:16' | '16:9' | '1:1') => void;
  onExport?: (settings: Partial<ExportSettings>) => void;
  onLocateIssue?: (issue: import('@/core/services').QualityGateIssue) => void;
  onSave?: () => void;
  onPrev?: () => void;
}

function StepExport() {
  const {
    exportPreset,
    exportSettings,
    framesCount,
    qualityGateIssues,
    qualityGatePassed,
    onPresetChange,
    onExportSettingsChange,
    onSaveProject,
    onLocateIssue,
  } = useStepExportContext();
  const { projectId } = useParams();
  const { project } = useProject();
  const { setCurrentStep } = useProject();

  return (
    <Card className={styles.stepCard}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          视频导出
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">导出最终视频脚本视频。</p>

        <div className={styles.exportPresetBar}>
          <div className="flex gap-2">
            <Button
              variant={exportPreset === '9:16' ? 'default' : 'outline'}
              onClick={() => onPresetChange('9:16')}
            >
              竖屏 9:16
            </Button>
            <Button
              variant={exportPreset === '16:9' ? 'default' : 'outline'}
              onClick={() => onPresetChange('16:9')}
            >
              横屏 16:9
            </Button>
            <Button
              variant={exportPreset === '1:1' ? 'default' : 'outline'}
              onClick={() => onPresetChange('1:1')}
            >
              方屏 1:1
            </Button>
          </div>
        </div>

        <div className={styles.exporterContainer}>
          <QualityGateAlert
            issues={qualityGateIssues}
            passed={qualityGatePassed}
            onLocateIssue={onLocateIssue}
          />
          <VideoExporter
            projectId={projectId}
            projectName={project?.name}
            estimatedDuration={Math.max(framesCount * 5, 60)}
            initialSettings={exportSettings}
            onExport={async (settings) => {
              if (!qualityGatePassed) {
                toast.error('质量闸门未通过，已阻止导出。请先修复阻断项。');
                return;
              }
              onExportSettingsChange(settings);
              toast.success(`已按 ${exportPreset} 预设完成导出任务`);
            }}
          />
        </div>

        <div className={styles.stepActions}>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(7)}>
              上一步
            </Button>
            <Button variant="default" onClick={onSaveProject}>
              保存项目
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StepExport;
