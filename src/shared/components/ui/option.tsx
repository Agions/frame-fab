'use client';

import * as React from 'react';

// ============================================================
// Option component (for Select children)
// ============================================================
interface OptionProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  key?: string;
}

const Option = ({ children, ...props }: OptionProps) => <option {...props}>{children}</option>;

export { Option, type OptionProps };
