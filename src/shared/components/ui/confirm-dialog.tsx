/**
 * Confirm Dialog Component
 *
 * Modal dialog for confirmation flows. Supports both controlled
 * (with `open`/`onOpenChange`) and imperative (`useConfirm` hook) usage.
 */
import * as React from 'react'

export interface ConfirmDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  content?: React.ReactNode
  children?: React.ReactNode
  onOk?: () => void | Promise<void>
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  okText?: string
  cancelText?: string
  className?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open = false,
  onOpenChange,
  title,
  description,
  content,
  children,
  onOk,
  onConfirm,
  onCancel,
  okText = '确定',
  cancelText = '取消',
  className,
}) => {
  if (!open) return null
  const handleOk = () => {
    ;(onOk || onConfirm)?.()
    onOpenChange?.(false)
  }
  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className || ''}`}
      onClick={handleCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md min-w-[320px]"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}
        {content}
        {children}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={handleCancel} className="px-4 py-2 text-sm">
            {cancelText}
          </button>
          <button onClick={handleOk} className="px-4 py-2 text-sm bg-primary text-white rounded">
            {okText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

// ============================================
// useConfirm hook
// ============================================
import { useState } from 'react'

export interface UseConfirmOptions {
  title?: string
  content?: string
  description?: string
  okText?: string
  cancelText?: string
}

export interface UseConfirmReturn {
  confirm: (options?: UseConfirmOptions) => Promise<boolean>
  ConfirmDialog: React.FC<ConfirmDialogProps>
}

export const useConfirm = (_defaultOptions?: UseConfirmOptions): UseConfirmReturn => {
  const [open, setOpen] = useState(false)
  const [, setOpts] = useState<UseConfirmOptions>({})
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null)

  const confirm = (options: UseConfirmOptions = {}): Promise<boolean> => {
    setOpts(options)
    setOpen(true)
    return new Promise<boolean>((resolve) => setResolver(() => resolve))
  }

  const handleOk = () => {
    setOpen(false)
    resolver?.(true)
    setResolver(null)
  }
  const handleCancel = () => {
    setOpen(false)
    resolver?.(false)
    setResolver(null)
  }

  const ConfirmDialogComponent: React.FC<ConfirmDialogProps> = (props) => {
    return <ConfirmDialog open={open} onOk={handleOk} onCancel={handleCancel} {...props} />
  }

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
