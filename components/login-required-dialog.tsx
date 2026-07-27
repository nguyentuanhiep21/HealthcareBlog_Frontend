"use client"

import Link from "next/link"
import { ShieldAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginRequiredDialogProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function LoginRequiredDialog({
  isOpen,
  onClose,
  message = "Vui lòng đăng nhập hoặc đăng ký tài khoản để sử dụng tính năng này.",
}: LoginRequiredDialogProps) {
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

        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="h-16 w-16 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-2">
            <ShieldAlert className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yêu cầu đăng nhập</h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <Link href="/auth/login" className="block w-full">
              <Button className="w-full h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[15px] shadow-sm transition-all hover:shadow-md">
                Đăng Nhập
              </Button>
            </Link>
            
            <Link href="/auth/signup" className="block w-full">
              <Button
                variant="outline"
                className="w-full h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-slate-700 dark:text-slate-300 font-semibold text-[15px] transition-all"
              >
                Tạo tài khoản mới
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
