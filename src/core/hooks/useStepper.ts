/**
 * 步进器 Hook
 */
import { useState, useCallback } from 'react';

export interface UseStepperOptions {
  initial?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}

export interface UseStepperReturn {
  value: number;
  setValue: (value: number) => void;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useStepper = (options: UseStepperOptions = {}): UseStepperReturn => {
  const { initial = 0, min = 0, max = 100, step = 1, onChange } = options;
  const [value, setValue] = useState(initial);

  const increment = useCallback(() => {
    setValue((prev) => {
      const next = Math.min(prev + step, max);
      onChange?.(next);
      return next;
    });
  }, [step, max, onChange]);

  const decrement = useCallback(() => {
    setValue((prev) => {
      const next = Math.max(prev - step, min);
      onChange?.(next);
      return next;
    });
  }, [step, min, onChange]);

  const reset = useCallback(() => {
    setValue(initial);
    onChange?.(initial);
  }, [initial, onChange]);

  return { value, setValue, increment, decrement, reset };
};
