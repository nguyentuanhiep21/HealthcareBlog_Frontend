"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, X } from "lucide-react"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
        onClick={!isLoading ? onCancel : undefined}
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        {!isLoading && (
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Icon */}
          <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-2 ${
            isDestructive 
              ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" 
              : "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
          }`}>
            {isDestructive ? (
              <AlertTriangle className="h-8 w-8" />
            ) : (
              <Info className="h-8 w-8" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap px-2">
              {description}
            </p>
          </div>

          <div className="flex gap-3 w-full pt-4">
            <Button 
              variant="outline" 
              className="flex-1 h-11 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all" 
              onClick={onCancel} 
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              className={`flex-1 h-11 rounded-full font-semibold shadow-sm transition-all hover:shadow-md ${
                isDestructive 
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Đang xử lý...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
