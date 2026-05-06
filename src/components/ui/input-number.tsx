"use client"

import * as React from "react"
import { cn } from "@/shared/utils/class-names"

// ============================================================
// AntD-compatible InputNumber
// ============================================================

interface InputNumberProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix' | 'type'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | undefined) => void;
  size?: 'small' | 'middle' | 'large';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  className,
  size = 'middle',
  prefix,
  suffix,
  disabled,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? 0);
  const currentValue = value !== undefined ? value : internalValue;

  const sizeClasses = {
    small: 'h-7 text-xs',
    middle: 'h-8 text-sm',
    large: 'h-10 text-base',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
    setInternalValue(newValue ?? 0);
    onChange?.(newValue);
  };

  const handleIncrement = () => {
    let newValue = currentValue + step;
    if (max !== undefined) newValue = Math.min(newValue, max);
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleDecrement = () => {
    let newValue = currentValue - step;
    if (min !== undefined) newValue = Math.max(newValue, min);
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn("flex items-center relative", className)}>
      {prefix && <span className="absolute left-3 text-muted-foreground">{prefix}</span>}
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          prefix && "pl-8",
          suffix && "pr-8",
          sizeClasses[size]
        )}
        {...props}
      />
      <div className="absolute right-1 flex flex-col">
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && currentValue >= max)}
          className="w-5 h-3 flex items-center justify-center text-xs hover:bg-accent rounded-t-sm"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && currentValue <= min)}
          className="w-5 h-3 flex items-center justify-center text-xs hover:bg-accent rounded-b-sm"
        >
          −
        </button>
      </div>
      {suffix && <span className="absolute right-3 text-muted-foreground">{suffix}</span>}
    </div>
  );
});

InputNumber.displayName = 'InputNumber';

export { InputNumber }
export type { InputNumberProps }
