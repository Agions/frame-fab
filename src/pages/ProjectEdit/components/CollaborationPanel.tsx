/**
 * 协作面板：镜头评论 + 版本管理
 * 用于 Step 3 分镜设计
 */
import { Input, Button, List, Select, Space, Alert, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;
import type { FrameComment, StoryboardVersion, VersionDiffSummary } from '@/core/services';
import { collaborationService } from '@/core/services';
import type { StoryboardFrame } from '@/features/storyboard/components/StoryboardEditor';

import styles from '../ProjectEdit.module.less';

export interface CollaborationPanelProps {
  projectId: string | undefined;
  selectedFrame: StoryboardFrame | null;
  commentDraft: string;
  versionLabel: string;
  compareLeftVersionId: string | undefined;
  compareRightVersionId: string | undefined;
  versionDiff: VersionDiffSummary | null;
  storyboardVersions: StoryboardVersion[];
  onCommentDraftChange: (v: string) => void;
  onAddComment: () => void;
  onSaveVersion: () => void;
  onCompareVersions: () => void;
  onRollback: () => void;
  onLeftVersionChange: (v: string | undefined) => void;
  onRightVersionChange: (v: string | undefined) => void;
  onVersionLabelChange: (v: string) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectId,
  selectedFrame,
  commentDraft,
  versionLabel,
  compareLeftVersionId,
  compareRightVersionId,
  versionDiff,
  storyboardVersions,
  onCommentDraftChange,
  onAddComment,
  onSaveVersion,
  onCompareVersions,
  onRollback,
  onLeftVersionChange,
  onRightVersionChange,
  onVersionLabelChange,
}) => {
  const comments = projectId
    ? collaborationService.listComments(projectId, selectedFrame?.id)
    : [];

  return (
    <div className={styles.collaborationPanel}>
      {/* 镜头评论 */}
      <div className={styles.collabSection}>
        <Title level={5}>镜头评论</Title>
        <Space.Compact className={styles.commentInputWrap}>
          <Input
            value={commentDraft}
            onChange={(e) => onCommentDraftChange(e.target.value)}
            placeholder={selectedFrame ? `对 ${selectedFrame.title} 添加评论` : '先选中一个分镜'}
            disabled={!selectedFrame}
          />
          <Button
            type="primary"
            onClick={onAddComment}
            disabled={!selectedFrame || !commentDraft.trim()}
          >
            添加
          </Button>
        </Space.Compact>
        <List
          size="small"
          dataSource={comments}
          locale={{ emptyText: '暂无评论' }}
          renderItem={(item: FrameComment) => (
            <List.Item>
              <div>
                <div>{item.content}</div>
                <span style={{ color: '#999', fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* 版本管理 */}
      <div className={styles.collabSection}>
        <Title level={5}>版本管理</Title>
        <Space className={styles.versionRow} wrap>
          <Input
            value={versionLabel}
            onChange={(e) => onVersionLabelChange(e.target.value)}
            placeholder="版本标签（可选）"
            style={{ width: 220 }}
            onPressEnter={() => onSaveVersion()}
          />
          <Button onClick={onSaveVersion}>保存快照</Button>
        </Space>
        <Space className={styles.versionRow} wrap>
          <Select
            placeholder="选择版本A"
            value={compareLeftVersionId}
            onChange={onLeftVersionChange}
            style={{ width: 180 }}
            options={storyboardVersions.map(v => ({ value: v.id, label: v.label }))}
            allowClear
          />
          <Select
            placeholder="选择版本B"
            value={compareRightVersionId}
            onChange={onRightVersionChange}
            style={{ width: 180 }}
            options={storyboardVersions.map(v => ({ value: v.id, label: v.label }))}
            allowClear
          />
          <Button onClick={onCompareVersions}>版本差异</Button>
          <Button danger onClick={onRollback}>回滚到版本A</Button>
        </Space>
        {versionDiff && (
          <Alert
            type={versionDiff.changeCount > 0 ? 'info' : 'success'}
            showIcon
            message={`差异字段数: ${versionDiff.changeCount}`}
            description={versionDiff.changedKeys.slice(0, 6).join(', ') || '无差异'}
          />
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;
