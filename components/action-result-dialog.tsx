"use client"

import { Button } from "@/components/ui/button"

interface ActionResultDialogProps {
  isOpen: boolean
  title?: string
  message: string
  isSuccess: boolean
  onClose: () => void
}

export function ActionResultDialog({ isOpen, title, message, isSuccess, onClose }: ActionResultDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-2">{title || "Thông báo"}</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button className="w-full" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
