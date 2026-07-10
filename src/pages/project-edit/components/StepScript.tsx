/**
 * Step 2: 编辑剧本
 *
 * 通过 useStepScriptContext() 获取 scriptText/onSaveScript，
 * 不再依赖父组件层层传递 props。
 */
import { Edit } from 'lucide-react';
import { lazy, useMemo, useState } from 'react';

import { useProject } from '@/core/hooks/useProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { VideoSegment } from '@/shared/types/script';

import { useStepScriptContext } from '../context/selectors';
import styles from '../ProjectEdit.module.less';

import { StepActions } from './StepActions';

const ScriptEditor = lazy(() => import('@/features/script/components/ScriptEditor'));

/** @deprecated 内部改用 Context selector，保留类型以兼容旧引用。 */
export interface StepScriptProps {
  onExport?: (format: string) => void;
  onSave?: (segments: VideoSegment[]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function StepScript() {
  const { onSaveScript } = useStepScriptContext();
  const { setCurrentStep } = useProject();
  const [segments, setSegments] = useState<VideoSegment[]>([]);

  const handleSegmentsChange = useMemo(() => {
    return (updated: VideoSegment[]) => {
      setSegments(updated);
      onSaveScript(updated);
    };
  }, [onSaveScript]);

  return (
    <Card className={styles.stepCard}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          编辑剧本
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          编辑和优化AI生成的剧本内容，可以添加、删除或修改片段。
        </p>

        <ScriptEditor segments={segments} onSegmentsChange={handleSegmentsChange} videoPath="" />

        <StepActions onPrev={() => setCurrentStep(1)} onNext={() => setCurrentStep(3)} />
      </CardContent>
    </Card>
  );
}

export default StepScript;
