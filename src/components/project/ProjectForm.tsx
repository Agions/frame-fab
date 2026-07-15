import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from '@/shared/components/ui/toast';
import type { ProjectData } from '@/shared/types';
import { cn } from '@/shared/utils/class-names';

export interface ProjectFormProps {
  initialValues?: Partial<ProjectData>;
  onSubmit: (values: Partial<ProjectData>) => Promise<void>;
  loading?: boolean;
  className?: string;
}

function ProjectForm({ initialValues, onSubmit, loading = false, className }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<ProjectData>>({
    defaultValues: initialValues,
  });

  const handleFormSubmit = async (values: Partial<ProjectData>) => {
    try {
      await onSubmit(values);
      toast.success('保存成功');
    } catch (_error) {
      toast.error('保存失败');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('flex flex-col gap-4', className)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pf-name">项目名称</Label>
        <Input
          id="pf-name"
          type="text"
          placeholder="请输入项目名称"
          {...register('name', { required: '请输入项目名称' })}
        />
        {errors.name && <span className="text-destructive text-sm">{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pf-description">项目描述</Label>
        <Textarea
          id="pf-description"
          placeholder="请输入项目描述"
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <span className="text-destructive text-sm">{errors.description.message}</span>
        )}
      </div>

      <Button type="submit" disabled={loading} className="self-start">
        {loading ? '保存中...' : '保存'}
      </Button>
    </form>
  );
}

export default ProjectForm;
