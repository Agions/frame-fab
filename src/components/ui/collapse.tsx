'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/class-names';

// ============================================================
// Collapse (Accordion wrapper)
// ============================================================
interface CollapseItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

interface CollapseProps {
  activeKey?: string | string[];
  defaultActiveKey?: string | string[];
  onChange?: (key: string | string[]) => void;
  accordion?: boolean;
  className?: string;
  children?: React.ReactNode;
  items?: CollapseItem[];
  ghost?: boolean;
}

interface CollapsePanelProps {
  key?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}

function CollapsePanel({ header: _header, children: _children }: CollapsePanelProps) {
  return null;
}

function CollapseBase({
  activeKey,
  defaultActiveKey,
  onChange,
  accordion,
  className,
  children,
  items,
  ghost,
}: CollapseProps) {
  const getDefaultActiveKey = () => {
    if (defaultActiveKey === undefined) return [];
    return Array.isArray(defaultActiveKey) ? defaultActiveKey : [defaultActiveKey];
  };

  const [activeKeys, setActiveKeys] = React.useState<Set<string>>(new Set(getDefaultActiveKey()));

  React.useEffect(() => {
    if (activeKey !== undefined) {
      setActiveKeys(new Set(Array.isArray(activeKey) ? activeKey : [activeKey]));
    }
  }, [activeKey]);

  const toggleKey = (key: string) => {
    let newKeys: Set<string>;
    if (accordion) {
      newKeys = activeKeys.has(key) ? new Set() : new Set([key]);
    } else {
      newKeys = new Set(activeKeys);
      if (newKeys.has(key)) newKeys.delete(key);
      else newKeys.add(key);
    }
    setActiveKeys(newKeys);
    const result = accordion ? [...newKeys][0] || '' : [...newKeys];
    const emptyResult: string | string[] = Array.isArray(activeKey) ? [] : '';
    onChange?.(newKeys.size === 0 ? emptyResult : (result as string | string[]));
  };

  // Parse children to extract panels OR use items prop
  const panels: { key: string; header: React.ReactNode; children: React.ReactNode }[] = [];
  if (items) {
    panels.push(
      ...items.map((item) => ({ key: item.key, header: item.label, children: item.children }))
    );
  } else {
    React.Children.forEach(children, (child) => {
      if (child && React.isValidElement(child) && (child.props as { key?: string }).key) {
        const childProps = child.props as {
          key?: string;
          header?: React.ReactNode;
          children?: React.ReactNode;
        };
        panels.push({
          key: String(childProps.key ?? ''),
          header: childProps.header ?? '',
          children: childProps.children ?? null,
        });
      }
    });
  }

  return (
    <div className={cn('flex flex-col rounded-md', ghost ? '' : 'border', className)}>
      {panels.map((panel) => {
        const isOpen = activeKeys.has(panel.key);
        return (
          <div key={panel.key} className="border-b last:border-b-0">
            <button
              type="button"
              onClick={() => toggleKey(panel.key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:underline bg-background"
            >
              <span>{panel.header}</span>
              <span className={cn('transition-transform', isOpen ? 'rotate-180' : '')}>▼</span>
            </button>
            {isOpen && <div className="px-4 pb-4 text-sm">{panel.children}</div>}
          </div>
        );
      })}
    </div>
  );
}
(CollapseBase as unknown as { Panel: typeof CollapsePanel }).Panel = CollapsePanel;
const Collapse = CollapseBase as unknown as ((props: CollapseProps) => JSX.Element) & {
  Panel: (props: CollapsePanelProps) => JSX.Element;
};

export { Collapse, CollapsePanel };
export type { CollapseProps, CollapsePanelProps };
