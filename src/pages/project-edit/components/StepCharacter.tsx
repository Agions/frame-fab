/**
 * Step 4: 角色设计
 *
 * 通过 useStepCharacterContext() 获取 characters/onChange，
 * 不再依赖父组件层层传递 props。
 */
import { User } from 'lucide-react';
import { lazy } from 'react';
import { useParams } from 'react-router-dom';

import { useProject } from '@/core/hooks/useProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { useStepCharacterContext } from '../context/selectors';
import styles from '../ProjectEdit.module.less';

import { StepActions } from './StepActions';

const CharacterDesigner = lazy(() =>
  import('@/components/ai').then((m) => ({ default: m.CharacterDesigner }))
);

/** @deprecated 内部改用 Context selector，保留类型以兼容旧引用。 */
export interface StepCharacterProps {
  characters?: import('@/shared/types').Character[];
  projectId?: string;
  onChange?: (characters: import('@/shared/types').Character[]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function StepCharacter() {
  const { characters, onChange } = useStepCharacterContext();
  const { projectId } = useParams();
  const { setCurrentStep } = useProject();

  return (
    <Card className={styles.stepCard}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          角色设计
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          为故事中的角色创建和管理形象档案，确保视觉一致性。
        </p>
        <div className={styles.characterDesignerContainer}>
          <CharacterDesigner characters={characters} onChange={onChange} projectId={projectId} />
        </div>
        <StepActions onPrev={() => setCurrentStep(3)} onNext={() => setCurrentStep(5)} />
      </CardContent>
    </Card>
  );
}

export default StepCharacter;
