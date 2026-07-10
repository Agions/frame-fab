/**
 * Step 0: 导入小说/剧本
 *
 * 通过 useStepImportContext() 获取 content/loading/onContentLoad/onRemove，
 * 不再依赖父组件层层传递 props。
 */
import { FileText } from 'lucide-react';
import { lazy } from 'react';

import { useProject } from '@/core/hooks/useProject';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { useStepImportContext } from '../context/selectors';
import styles from '../ProjectEdit.module.less';

const NovelImporter = lazy(() => import('@/features/script/components/NovelImporter'));

/** @deprecated 内部改用 Context selector，保留类型以兼容旧引用。 */
export interface StepImportProps {
  content?: string;
  loading?: boolean;
  onContentLoad?: (
    newContent: string,
    metadata: import('@/features/script/components/NovelImporter').ScriptImportMetadata
  ) => void;
  onRemove?: () => void;
  onNext?: () => void;
}

function StepImport() {
  const { content, loading, onContentLoad, onRemove } = useStepImportContext();
  const { setCurrentStep } = useProject();

  return (
    <Card className={styles.stepCard}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          导入小说/剧本
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          请导入小说或剧本文件，支持 TXT、MD、DOCX 格式。您也可以直接粘贴内容。
        </p>
        <NovelImporter
          initialContent={content}
          onContentLoad={onContentLoad}
          onRemove={onRemove}
          loading={loading}
        />
        <div className={styles.stepActions}>
          <Button variant="default" onClick={() => setCurrentStep(1)} disabled={!content}>
            下一步
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default StepImport;
