/**
 * 视频脚本工作流页面 — 交互式步骤导航
 */

import { Zap, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { toast } from '@/shared/components/ui/toast';

import styles from './WorkflowPage.module.less';

const WORKFLOW_STEPS = [
  { key: 'import', title: '导入', description: '小说/剧本' },
  { key: 'analysis', title: 'AI解析', description: '智能分析' },
  { key: 'script', title: '剧本', description: '生成剧本' },
  { key: 'storyboard', title: '分镜', description: '漫画分镜' },
  { key: 'character', title: '角色', description: '角色形象' },
  { key: 'render', title: '渲染', description: '场景渲染' },
  { key: 'animate', title: '合成', description: '动态效果' },
  { key: 'audio', title: '配音', description: '配音配乐' },
  { key: 'export', title: '导出', description: '视频导出' },
];

const WorkflowPage = () => {
  const navigate = useNavigate();

  const handleStartWorkflow = () => {
    toast.info('开始创建工作流...');
    navigate('/project/new');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold m-0">视频脚本工作流</h2>
        </div>
        <Button variant="default" size="sm" onClick={handleStartWorkflow}>
          <Play className="h-4 w-4 mr-1" />
          开始创建
        </Button>
      </div>

      <Card className={styles.workflowCard}>
        <div className={styles.steps}>
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.key} className={styles.step}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.description}</div>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <p className="text-muted-foreground">
          点击「开始创建」进入编辑器，按步骤完成漫剧创作。每个步骤支持 AI 辅助生成。
        </p>
        <Button variant="default" className="mt-4" onClick={handleStartWorkflow}>
          创建新工作流
        </Button>
      </Card>
    </div>
  );
};

export default WorkflowPage;
