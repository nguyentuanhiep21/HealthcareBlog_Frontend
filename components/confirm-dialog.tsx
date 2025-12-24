"use client"

import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{description}</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              className={`flex-1 ${isDestructive ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
