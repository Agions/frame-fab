'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

// ============================================================
// AntD-compatible Radio.Group with button style
// ============================================================
interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  optionType?: 'default' | 'button';
  buttonStyle?: 'solid' | 'outline';
  children?: React.ReactNode;
  options?: RadioOption[];
  className?: string;
  disabled?: boolean;
}

function RadioGroup({
  value,
  defaultValue,
  onChange,
  optionType,
  buttonStyle,
  children,
  options,
  className,
  disabled,
}: RadioGroupProps) {
  if (optionType === 'button') {
    return (
      <div className={cn('flex flex-wrap gap-1', className)} role="radiogroup">
        {(options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled || disabled}
            onClick={() => !disabled && onChange?.(opt.value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded border transition-colors',
              (value ?? defaultValue) === opt.value
                ? buttonStyle === 'solid'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-primary/10 text-primary border-primary'
                : 'bg-background text-foreground border-input hover:bg-accent',
              (opt.disabled || disabled) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {opt.label}
          </button>
        ))}
        {children}
      </div>
    );
  }

  // Propagate disabled to all RadioGroupItem children
  const patchedChildren = React.Children.map(children, (child) => {
    if (
      React.isValidElement(child) &&
      (child.type as React.ComponentType<unknown>) === RadioGroupItem
    ) {
      return React.cloneElement(child as React.ReactElement<RadioGroupItemProps>, {
        disabled: disabled || child.props.disabled,
      });
    }
    return child;
  });

  return (
    <div className={cn('flex flex-col gap-1', className)} role="radiogroup">
      {(options ?? []).map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={(value ?? defaultValue) === opt.value}
            onChange={() => !disabled && onChange?.(opt.value)}
            disabled={opt.disabled || disabled}
            className="accent-primary"
          />
          <span className="text-sm">{opt.label}</span>
        </label>
      ))}
      {patchedChildren}
    </div>
  );
}

interface RadioButtonProps {
  value?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

function RadioButton({ children, ...props }: RadioButtonProps) {
  return <RadioGroup {...props} options={[{ value: props.value ?? '', label: children ?? '' }]} />;
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

function RadioGroupItem({ value, id, children, ...props }: RadioGroupItemProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" htmlFor={id}>
      <input type="radio" id={id} value={value} {...props} className="accent-primary" />
      <span className="text-sm">{children}</span>
    </label>
  );
}

function Radio(props: React.ComponentPropsWithoutRef<'input'>) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" {...props} className="accent-primary" />
      <span className="text-sm">{props.children}</span>
    </label>
  );
}

(Radio as unknown as { Group: typeof RadioGroup; Button: typeof RadioButton }).Group = RadioGroup;
(Radio as unknown as { Group: typeof RadioGroup; Button: typeof RadioButton }).Button = RadioButton;

export { Radio, RadioGroup, RadioButton, RadioGroupItem };
export type { RadioGroupProps, RadioButtonProps, RadioOption, RadioGroupItemProps };
