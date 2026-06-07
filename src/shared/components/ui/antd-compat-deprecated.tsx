'use client';

/**
 * @deprecated AntD-compatible UI Components (DEPRECATED 2026-06-04)
 *
 * Renamed from `ui-components.tsx` to reflect that this is an AntD-compatibility
 * shim layer that should not be used in new code. The AntD Form bridge was
 * already removed in PR #7 (commit dc98671); the remaining re-exports exist
 * only for backward compatibility with 7 legacy callers (CompositionStudio,
 * CostPanel, ScriptGenerator, AudioEditorPanel, ProjectDetailPage, etc.).
 *
 * New code SHOULD import directly from shadcn/ui primitives:
 *   - Button  → '@/shared/components/ui/button'
 *   - Card    → '@/shared/components/ui/card'
 *   - Modal   → '@/shared/components/ui/modal'
 *   - Spin    → '@/shared/components/ui/spin'
 *   - Empty   → '@/shared/components/ui/Empty'
 *   - Space   → '@/shared/components/ui/space'
 *   - Divider → '@/shared/components/ui/divider'
 *   - Grid (Row/Col) → '@/shared/components/ui/grid'
 *   - Input   → '@/shared/components/ui/input'
 *   - InputNumber → '@/shared/components/ui/input-number'
 *   - Select  → '@/shared/components/ui/select' (use onValueChange, not onChange)
 *   - Radio   → '@/shared/components/ui/radio-group'
 *   - List    → '@/shared/components/ui/list'
 *   - Table   → '@/shared/components/ui/table'
 *   - Tag     → '@/shared/components/ui/tag'
 *   - Text/Typography → '@/shared/components/ui/typography'
 *   - Alert/Avatar/Collapse/ColorPicker/Message/Option/Popconfirm/Progress/Upload
 *     → '@/shared/components/ui/<name>'
 *
 * Tracking issue: PR #8 will migrate 7 callers + delete this file + delete
 * the backward-compat shim at `src/components/ui/ui-components.tsx`.
 */

// ============================================================
// Re-export from shadcn/ui components
// ============================================================

import * as React from 'react';

import { Alert as LegacyAlert } from '@/shared/components/ui/alert';
import {
  LegacyAvatar,
  type LegacyAvatarProps,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui/avatar';
import { Button, type ButtonProps } from '@/shared/components/ui/button';
import { Card as AntdCard, CardMeta, type CardMetaProps } from '@/shared/components/ui/card';
import { Collapse, CollapsePanel } from '@/shared/components/ui/collapse';
import { ColorPicker, type ColorPickerProps } from '@/shared/components/ui/color-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Divider } from '@/shared/components/ui/divider';
import { Dropdown } from '@/shared/components/ui/dropdown';
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/shared/components/ui/dropdown-menu';
import ShadcnEmpty from '@/shared/components/ui/Empty';
import { Row, Col, type RowProps, type ColProps } from '@/shared/components/ui/grid';
import { Input as ShadcnInput, type InputProps as ShadcnInputProps } from '@/shared/components/ui/input';
import { InputNumber, type InputNumberProps } from '@/shared/components/ui/input-number';
import { List as ShadcnList, ListItem } from '@/shared/components/ui/list';
import { message } from '@/shared/components/ui/message';
import { Modal, type ModalProps } from '@/shared/components/ui/modal';
import { Option, type OptionProps } from '@/shared/components/ui/option';
import { Popconfirm, type PopconfirmProps } from '@/shared/components/ui/popconfirm';
import { Progress as ShadcnProgress } from '@/shared/components/ui/progress';
import {
  Radio,
  RadioGroup,
  RadioButton,
  type RadioGroupProps,
  type RadioOption,
} from '@/shared/components/ui/radio-group';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AntDSelect,
} from '@/shared/components/ui/select';
import { Space, SpaceItem } from '@/shared/components/ui/space';
import { Spin, type SpinProps } from '@/shared/components/ui/spin';
import { Tag as ShadcnTag } from '@/shared/components/ui/tag';
import { TextArea, Textarea, type TextAreaProps } from '@/shared/components/ui/textarea';
import {
  Text as ShadcnText,
  Title as ShadcnTitle,
  Paragraph as ShadcnParagraph,
} from '@/shared/components/ui/typography';
import { Upload, type UploadProps } from '@/shared/components/ui/upload';
import { cn } from '@/shared/utils/class-names';

// ============================================================
// AntD Form 兼容层已废弃 (2026-06-04 form refactor)：
// - <Form>/<FormItem>/useForm 桥接 react-hook-form 的设计是过度工程
// - 项目不需要 AntD 兼容 + 不需要 AntD 结构配置
// - 替代方案：ScriptGenerator / GlobalSettingsForm / FrameEditForm / ProjectEdit
//   改用原生受控 state (useState) 或 shadcn 原生 <form> + useForm 直接从 react-hook-form
// - 保留的非 Form 组件（Modal/Spin/Space/Empty/Button/Card/Input 等）继续 re-export
//
// 如未来需要表单能力，直接从 'react-hook-form' 导入 useForm，不要再过此桥接层。

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
