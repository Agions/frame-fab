/**
 * Modal — 通用模态框组件（DRY版）
 *
 * 改造前：ConfirmDialog、AlertDialog、ImagePreviewModal 各写了一套 Dialog 逻辑
 * 改造后：Modal 作为底层组件，ConfirmDialog 基于 Modal 封装
 */

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  centered?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  destroyOnClose?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520,
  centered = false,
  maskClosable = true,
  closable = true,
  destroyOnClose = false,
  className,
}: ModalProps) {
  // ESC 关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open && destroyOnClose) return null;

  return (
    <div
      className={[styles.overlay, open ? styles.visible : ''].join(' ')}
      onClick={maskClosable ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={[
          styles.panel,
          centered ? styles.centered : '',
          className ?? '',
        ].join(' ')}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div className={styles.header}>
            {title && <h2 id="modal-title" className={styles.title}>{title}</h2>}
            {closable && (
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;