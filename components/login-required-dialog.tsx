"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginRequiredDialogProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function LoginRequiredDialog({
  isOpen,
  onClose,
  message = "Chức năng yêu cầu đăng nhập, vui lòng đăng nhập hoặc đăng ký nếu chưa có tài khoản",
}: LoginRequiredDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="relative z-50 bg-card border border-border rounded-lg shadow-lg max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Yêu cầu đăng nhập</h2>
        </div>

        <p className="text-sm text-muted-foreground">{message}</p>

        <div className="space-y-2">
          <Link href="/auth/login" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              Đăng Nhập
            </Button>
          </Link>
          <Link href="/auth/signup" className="block">
            <Button
              variant="outline"
              className="w-full border-border hover:bg-secondary font-medium"
            >
              Đăng Ký
            </Button>
          </Link>
        </div>

        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Tiếp tục duyệt
        </Button>
      </div>
    </div>
  )
}
