"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, X } from "lucide-react"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-full max-w-sm bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Icon */}
          <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-2 ${
            isSuccess 
              ? "bg-emerald-50 dark:bg-emerald-900/30" 
              : "bg-rose-50 dark:bg-rose-900/30"
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title || "Thông báo"}
            </h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              {message}
            </p>
          </div>

          <div className="w-full pt-4">
            <Button 
              className={`w-full h-12 rounded-full font-semibold shadow-sm transition-all hover:shadow-md ${
                isSuccess
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white"
              }`} 
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
