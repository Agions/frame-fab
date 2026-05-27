/**
 * 成本面板
 * 包含导出评审记录按钮 + CostDashboard
 */

import React, { Suspense } from 'react';

import CostDashboardBase from '@/components/business/CostDashboard';
import { Spin, Button } from '@/components/ui/ui-components';

const CostDashboard = CostDashboardBase;
import { Download } from 'lucide-react';

export interface CostPanelProps {
  projectId: string | undefined;
  /** 触发导出评审记录的回调 */
  onExportReviewNotes: () => void;
}

export const CostPanel: React.FC<CostPanelProps> = ({ projectId, onExportReviewNotes }) => {
  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Button icon={<Download />} onClick={onExportReviewNotes}>
          导出评审记录
        </Button>
      </div>
      <Suspense fallback={<Spin />}>
        <CostDashboard projectId={projectId} />
      </Suspense>
    </>
  );
};
