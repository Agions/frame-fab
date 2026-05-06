"use client"

import * as React from "react"
import { useForm as useRhfForm } from 'react-hook-form';

// ============================================================
// useForm hook (AntD-compatible wrapper around react-hook-form)
// ============================================================
interface UseFormReturn<T = Record<string, unknown>> {
  getValues: () => T;
  setFieldsValue: (values: Partial<T>) => void;
  validateFields: () => Promise<T>;
  resetFields: () => void;
  submit: () => void;
}

function useForm<T = Record<string, unknown>>(): [T, UseFormReturn<T>] {
  const methods = useRhfForm<T>();
  const form: UseFormReturn<T> = {
    getValues: () => methods.getValues() as T,
    setFieldsValue: (values) => {
      Object.entries(values).forEach(([key, value]) => {
        methods.setValue(key as keyof T, value as T[keyof T]);
      });
    },
    validateFields: async () => {
      try {
        const isValid = await methods.trigger();
        if (isValid) return methods.getValues() as T;
        throw new Error('validation failed');
      } catch {
        throw new Error('validation failed');
      }
    },
    resetFields: () => methods.reset(),
    submit: () => methods.handleSubmit(() => {})(),
  };
  return [{} as T, form];
}

export { useForm, type UseFormReturn }
