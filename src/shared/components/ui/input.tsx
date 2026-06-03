import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

export interface InputProps extends Omit<
  React.ComponentProps<'input'>,
  'size' | 'prefix' | 'suffix'
> {
  icon?: React.ReactNode;
  allowClear?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  inputSize?: 'large' | 'small' | 'middle';
}

const sizeClassMap = { large: 'h-11', small: 'h-8', middle: 'h-10' };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      icon,
      allowClear,
      prefix,
      suffix,
      inputSize = 'middle',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState('');
    const effectiveValue = value ?? internalValue;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setInternalValue(e.target.value);
      onChange?.(e);
    };
    const handleClear = () => {
      if (value === undefined) setInternalValue('');
      if (onChange) {
        const synthetic = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
        onChange(synthetic);
      }
    };

    return (
      <div className="relative flex items-center border border-input rounded-md bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
        {icon && <span className="mr-2 text-muted-foreground">{icon}</span>}
        {prefix && <span className="mr-2 text-muted-foreground shrink-0">{prefix}</span>}
        <input
          type={type}
          className={cn(
            'flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground',
            sizeClassMap[inputSize],
            className
          )}
          ref={ref}
          value={effectiveValue}
          onChange={handleChange}
          {...props}
        />
        {suffix && <span className="ml-2 text-muted-foreground shrink-0">{suffix}</span>}
        {allowClear && effectiveValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
            className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
