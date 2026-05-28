'use client';

/**
 * AntD-compatible UI Components
 *
 * This file re-exports components from both shadcn/ui and custom AntD-compatible wrappers.
 * Individual components have been split into separate files for better code organization.
 *
 * @deprecated Import from individual component files directly for tree-shaking
 */

// ============================================================
// Re-export from shadcn/ui components
// ============================================================

import * as React from 'react';
import { useForm as useRhfForm, type UseFormReturn as RhfUseFormReturn } from 'react-hook-form';

import { Alert as LegacyAlert } from '@/components/ui/alert';
import {
  LegacyAvatar,
  type LegacyAvatarProps,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Card as AntdCard, CardMeta, type CardMetaProps } from '@/components/ui/card';
import { Collapse, CollapsePanel } from '@/components/ui/collapse';
import { ColorPicker, type ColorPickerProps } from '@/components/ui/color-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Divider } from '@/components/ui/divider';
import { Dropdown } from '@/components/ui/dropdown';
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Empty as ShadcnEmpty } from '@/components/ui/empty';
import { Row, Col, type RowProps, type ColProps } from '@/components/ui/grid';
import { Input as ShadcnInput, type InputProps as ShadcnInputProps } from '@/components/ui/input';
import { InputNumber, type InputNumberProps } from '@/components/ui/input-number';
import { List as ShadcnList, ListItem } from '@/components/ui/list';
import { message } from '@/components/ui/message';
import { Modal, type ModalProps } from '@/components/ui/modal';
import { Option, type OptionProps } from '@/components/ui/option';
import { Popconfirm, type PopconfirmProps } from '@/components/ui/popconfirm';
import { Progress as ShadcnProgress } from '@/components/ui/progress';
import {
  Radio,
  RadioGroup,
  RadioButton,
  type RadioGroupProps,
  type RadioOption,
} from '@/components/ui/radio-group';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AntDSelect,
} from '@/components/ui/select';
import { Space, SpaceItem } from '@/components/ui/space';
import { Spin, type SpinProps } from '@/components/ui/spin';
import { Tag as ShadcnTag } from '@/components/ui/tag';
import { TextArea, Textarea, type TextAreaProps } from '@/components/ui/textarea';
import {
  Text as ShadcnText,
  Title as ShadcnTitle,
  Paragraph as ShadcnParagraph,
} from '@/components/ui/typography';
import { Upload, type UploadProps } from '@/components/ui/upload';
import { cn } from '@/shared/utils/class-names';

// ============================================================
// AntD-compatible Form (wraps react-hook-form + shadcn)
// ============================================================

// Form values type
export type FormValues = Record<string, unknown>;

// Validation rule type (simplified)
interface ValidationRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean | Promise<boolean>;
}

interface FormProps {
  form?: RhfUseFormReturn<FormValues>;
  layout?: 'vertical' | 'horizontal' | 'inline';
  onFinish?: (values: FormValues) => void;
  initialValues?: FormValues;
  className?: string;
  children?: React.ReactNode;
  Item?: typeof FormItem;
}

function Form({
  form,
  layout = 'vertical',
  onFinish,
  initialValues,
  className,
  children,
}: FormProps) {
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (form) {
          form.handleSubmit((data) => {
            onFinish?.(data as FormValues);
          })();
        }
        if (onFinish) {
          const formData = new FormData(e.currentTarget);
          const values: Record<string, any> = {};
          formData.forEach((v, k) => {
            values[k] = v;
          });
          // Merge with initialValues if form has them
          if (form && initialValues) {
            Object.assign(values, initialValues);
          }
          onFinish(values);
        }
      }}
      style={{
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: layout === 'horizontal' ? '1rem' : 0,
      }}
    >
      {/* react-hook-form needs special handling, fall through for now */}
      {children}
    </form>
  );
}

// Form.Item as a property on Form - defined after FormItem declaration
interface FormItemProps {
  name?: string | string[];
  label?: React.ReactNode;
  rules?: ValidationRule[];
  dependencies?: string[];
  children: React.ReactNode;
  className?: string;
}

function FormItem({ label, children, className }: FormItemProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      {children}
    </div>
  );
}

// Form with Item property using compound component pattern
interface FormWithItem extends React.FC<FormProps> {
  Item: typeof FormItem;
}

const FormWithItem: FormWithItem = Object.assign(Form as FormWithItem, {
  Item: FormItem,
});

// ============================================================
// AntD-compatible Select with options prop
// ============================================================
interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface LegacySelectProps {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  options?: SelectOption[];
  mode?: 'multiple' | 'tags';
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

function LegacySelect({
  value,
  defaultValue,
  onChange,
  options,
  mode,
  placeholder,
  style,
  className,
  disabled,
  children,
}: LegacySelectProps) {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    (defaultValue as string | string[]) || (mode === 'tags' ? [] : '')
  );

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const handleValueChange = (newValue: string) => {
    if (mode === 'tags') {
      // For tags mode, add to existing tags
      const current = Array.isArray(internalValue) ? internalValue : [];
      const updated = [...current, newValue];
      setInternalValue(updated);
      onChange?.(updated);
    } else {
      setInternalValue(newValue);
      onChange?.(newValue as string);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (mode === 'tags') {
      const updated = (internalValue as string[]).filter((t) => t !== tagToRemove);
      setInternalValue(updated);
      onChange?.(updated);
    }
  };

  if (mode === 'tags') {
    const tags = Array.isArray(internalValue) ? internalValue : [];
    return (
      <div className={cn('flex flex-col gap-1', className)} style={style}>
        <div className="flex flex-wrap gap-1 min-h-[38px] p-1 border border-input rounded-md bg-background">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-destructive ml-1"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                e.preventDefault();
                const newTag = e.currentTarget.value.trim();
                if (!(internalValue as string[]).includes(newTag)) {
                  handleValueChange(newTag);
                }
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
        {options && (
          <select
            className="hidden"
            onChange={(e) => {
              if (e.target.value) handleValueChange(e.target.value);
            }}
          >
            <option value="">选择预设</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <ShadcnSelect
      value={value as string}
      defaultValue={defaultValue as string}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger style={style} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
        {children}
      </SelectContent>
    </ShadcnSelect>
  );
}

// Add .Group and .Button as static properties to Radio for style usage

// ============================================================
// AntD-compatible Radio.Group with button style
// ============================================================

// ============================================================
// AntD-compatible List
// ============================================================
interface ListGridSettings {
  gutter?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  column?: number;
}

interface ListItemProps {
  children?: React.ReactNode;
  className?: string;
}

function ListItemWrapper({ children, className }: ListItemProps) {
  return <div className={cn('py-2 border-b last:border-b-0', className)}>{children}</div>;
}

interface ListWrapperProps<T = any> {
  size?: 'small' | 'middle' | 'large';
  className?: string;
  children?: React.ReactNode;
  grid?: ListGridSettings;
  dataSource?: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  locale?: { emptyText?: React.ReactNode };
}

function ListWrapper({
  size: _size,
  className,
  children,
  grid,
  dataSource,
  renderItem,
  locale,
}: ListWrapperProps<any>) {
  // If dataSource and renderItem are provided, map over them
  if (dataSource && renderItem) {
    if (dataSource.length === 0) {
      return (
        <div className={cn('py-4 text-center text-sm text-muted-foreground', className)}>
          {locale?.emptyText ?? '暂无数据'}
        </div>
      );
    }
    const items = dataSource.map((item, index) => renderItem(item, index));

    // Apply grid layout if specified
    if (grid) {
      const colCount = grid.column ?? grid.md ?? 3;
      return (
        <div
          className={cn('grid gap-4', className)}
          style={{
            gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
          }}
        >
          {items}
        </div>
      );
    }

    return <div className={className}>{items}</div>;
  }

  return <ShadcnList className={className}>{children}</ShadcnList>;
}

// List with Item property using compound component pattern
interface ListWithItem extends React.FC<ListWrapperProps<any>> {
  Item: typeof ListItemWrapper;
}

const ListWithItem: ListWithItem = Object.assign(ListWrapper as ListWithItem, {
  Item: ListItemWrapper,
});

// ============================================================
// AntD-compatible Table
// ============================================================
interface TableColumn<T = Record<string, unknown>> {
  title?: React.ReactNode;
  dataIndex?: keyof T;
  key?: string;
  width?: number | string;
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
}

interface TableProps<T = Record<string, unknown>> {
  dataSource?: T[];
  columns?: TableColumn<T>[];
  rowKey?: string | ((record: T) => string);
  size?: 'small' | 'middle' | 'large';
  pagination?: boolean | object;
  className?: string;
  onChange?: (pagination: unknown, filters: Record<string, unknown>, sorter: unknown) => void;
}

function LegacyTable({
  dataSource = [],
  columns = [],
  rowKey,
  size = 'middle',
  className,
  ..._props
}: TableProps<Record<string, unknown>>) {
  const getRowKey = (record: Record<string, unknown>, index: number): string => {
    if (typeof rowKey === 'function')
      return (rowKey as (r: Record<string, unknown>) => string)(record);
    if (typeof rowKey === 'string') return String(record[rowKey] ?? index);
    return String(index);
  };

  const sizeClass = size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className={cn('relative w-full overflow-auto', className)}>
      <table className={cn('w-full caption-bottom', sizeClass)}>
        <thead>
          <tr className="border-b">
            {columns.map((col, i) => (
              <th
                key={col.key ?? i}
                style={{ width: col.width }}
                className="text-left font-medium p-2"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4 text-muted-foreground">
                暂无数据
              </td>
            </tr>
          ) : (
            dataSource.map((record, rowIndex) => (
              <tr
                key={getRowKey(record, rowIndex)}
                className="border-b last:border-b-0 hover:bg-muted/50"
              >
                {columns.map((col, colIndex) => {
                  const value = col.dataIndex
                    ? (record as Record<string, unknown>)[col.dataIndex as string]
                    : undefined;
                  return (
                    <td key={col.key ?? colIndex} className="p-2">
                      {col.render
                        ? col.render(
                            value as string | number | Record<string, unknown>,
                            record as Record<string, unknown>,
                            rowIndex
                          )
                        : (value as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// AntD-compatible Table
// ============================================================

export {
  FormWithItem as Form,
  FormItem,
  LegacySelect as Select,
  RadioGroup,
  Radio,
  RadioButton,
  Modal,
  ShadcnInput as Input,
  InputNumber,
  Divider,
  Row,
  Col,
  Collapse,
  CollapsePanel,
  AntdCard as Card,
  CardMeta,
  Option,
  TextArea,
  Textarea,
  message,
  ColorPicker,
  Upload,
  LegacyAvatar as Avatar,
  AvatarImage,
  AvatarFallback,
  ShadcnText as Text,
  ShadcnTitle as Title,
  ShadcnParagraph as Paragraph,
  useRhfForm as useForm,
  Button,
  ListWrapper as ListWithItem,
  ListItem,
  ShadcnTag as Tag,
  LegacyTable as Table,
  ShadcnEmpty as Empty,
  ShadcnProgress as Progress,
  Space,
  SpaceItem,
  Spin,
  LegacyAlert as Alert,
  Popconfirm,
  Dropdown,
};
