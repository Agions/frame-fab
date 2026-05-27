/**
 * 导出面板
 * 包含质量闸门状态展示 + 跳转编辑页按钮
 */

import React from 'react';
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ExportPanelProps {
  projectId: string;
  /** 质量闸门评估结果 */
  qualityGate: {
    passed: boolean;
    issues: Array<{
      code: string;
      level: string;
      title: string;
      detail: string;
      frameIndex?: number;
      field?: string;
      frameId?: string;
    }>;
  };
  onNavigateToEdit: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  projectId: _projectId,
  qualityGate,
  onNavigateToEdit,
}) => {
  const hasBlockingIssues = qualityGate.issues.some(
    (issue) => issue.level === 'error'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>导出状态</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={qualityGate.passed ? 'default' : 'destructive'}>
          {qualityGate.passed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {qualityGate.passed
              ? '质量闸门通过，可进入导出流程'
              : '质量闸门未完全通过'}
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-sm">
              {qualityGate.issues.length > 0 ? (
                qualityGate.issues.map((issue) => (
                  <li key={issue.code} className="flex items-start gap-2">
                    <Badge
                      variant={
                        issue.level === 'error' ? 'destructive' : 'secondary'
                      }
                      className="mt-0.5 shrink-0"
                    >
                      {issue.level === 'error' ? '阻断' : '建议'}
                    </Badge>
                    <span>
                      {issue.title}：{issue.detail}
                      {typeof issue.frameIndex === 'number' && (
                        <span className="text-muted-foreground">
                          {' '}
                          （第 {issue.frameIndex + 1} 镜）
                        </span>
                      )}
                      {issue.field && (
                        <span className="text-muted-foreground">
                          {' '}
                          字段: {issue.field}
                        </span>
                      )}
                    </span>
                  </li>
                ))
              ) : (
                <li>当前分镜与评测摘要均达到默认阈值。</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button
            onClick={onNavigateToEdit}
            disabled={hasBlockingIssues}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            前往编辑页导出视频
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportPanel;
