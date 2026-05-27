/**
 * ConfirmDialog — 确认对话框（基于 Modal 封装，DRY版）
 *
 * 改造前：每个需要确认的地方都写了大量 Dialog JSX
 * 改造后：ConfirmDialog 统一处理 info/success/warning/error/confirm 五种类型
 */

import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import styles from './ConfirmDialog.module.css';

export type ConfirmType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface ConfirmDialogProps {
  open: boolean;
  type?: ConfirmType;
  title?: string;
  message?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  width?: number | string;
  centered?: boolean;
  destroyOnClose?: boolean;
  className?: string;
}

const iconMap: Record<ConfirmType, React.ReactNode> = {
  info:     <Info size={24} className={styles.iconInfo} />,
  success:  <CheckCircle size={24} className={styles.iconSuccess} />,
  warning:  <AlertTriangle size={24} className={styles.iconWarning} />,
  error:    <AlertCircle size={24} className={styles.iconError} />,
  confirm:  <AlertTriangle size={24} className={styles.iconWarning} />,
};

export function ConfirmDialog({
  open,
  type = 'confirm',
  title,
  message,
  okText = '确定',
  cancelText = '取消',
  onOk,
  onCancel,
  loading = false,
  maskClosable = false,
  closable = true,
  width = 420,
  centered = true,
  destroyOnClose = true,
  className,
}: ConfirmDialogProps) {
  const [localLoading, setLocalLoading] = useState(false);

  const handleOk = useCallback(async () => {
    if (!onOk) return;
    setLocalLoading(true);
    try {
      const result = onOk();
      if (result instanceof Promise) await result;
    } finally {
      setLocalLoading(false);
    }
  }, [onOk]);

  const titleText = title ?? (
    type === 'info'     ? '提示' :
    type === 'success'  ? '成功' :
    type === 'warning'  ? '警告' :
    type === 'error'    ? '错误' : '确认操作'
  );

  return (
    <Modal
      open={open}
      onClose={onCancel ?? (() => {})}
      title={titleText}
      width={width}
      centered={centered}
      maskClosable={maskClosable}
      closable={closable}
      destroyOnClose={destroyOnClose}
      className={className}
      footer={
        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading || localLoading}
          >
            {cancelText}
          </button>
          <button
            className={[styles.okBtn, type === 'error' ? styles.destructive : ''].join(' ')}
            onClick={handleOk}
            disabled={loading || localLoading}
          >
            {(loading || localLoading) ? '处理中...' : okText}
          </button>
        </div>
      }
    >
      <div className={styles.body}>
        {iconMap[type]}
        <p className={styles.message}>{message}</p>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;