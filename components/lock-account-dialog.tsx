'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Calendar, Lock, X } from 'lucide-react'

interface LockAccountDialogProps {
  isOpen: boolean
  userName: string
  onCancel: () => void
  onConfirm: (unlockDate: Date | null) => void
  isProcessing?: boolean
}

export function LockAccountDialog({
  isOpen,
  userName,
  onCancel,
  onConfirm,
  isProcessing = false,
}: LockAccountDialogProps) {
  const [unlockDate, setUnlockDate] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleConfirm = () => {
    setError('')

    // Nếu không chọn ngày, đây là khóa vĩnh viễn (sẽ được handle ở handlePermanentLock)
    // Nhưng nếu submit form thường mà không có date thì báo lỗi
    if (!unlockDate) {
      setError('Vui lòng chọn ngày mở khóa hoặc bấm "Khóa vĩnh viễn"')
      return
    }

    const selectedDate = new Date(unlockDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Kiểm tra ngày có hợp lệ không
    if (selectedDate <= now) {
      setError('Ngày mở khóa phải sau hôm nay')
      return
    }

    // Kiểm tra không quá 365 ngày
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 1)
    if (selectedDate > maxDate) {
      setError('Ngày mở khóa không thể quá 1 năm kể từ hôm nay')
      return
    }

    onConfirm(selectedDate)
    setUnlockDate('')
    setError('')
  }

  const handlePermanentLock = () => {
    onConfirm(null)
    setUnlockDate('')
    setError('')
  }

  const handleClose = () => {
    if (isProcessing) return
    onCancel()
    setUnlockDate('')
    setError('')
  }

  if (!isOpen) return null

  // Tính min date (ngày mai)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Tính max date (1 năm từ hôm nay)
  const maxDateObj = new Date()
  maxDateObj.setFullYear(maxDateObj.getFullYear() + 1)
  const maxDateStr = maxDateObj.toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        {!isProcessing && (
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col space-y-5 pt-2">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
              <Lock className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Khóa tài khoản</h2>
              <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">
                Khóa tài khoản của <span className="font-semibold text-slate-800 dark:text-slate-200">"{userName}"</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4 flex gap-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[14px] text-blue-800 dark:text-blue-200 leading-relaxed">
                Chọn ngày mở khóa bên dưới, hoặc bấm <strong>Khóa vĩnh viễn</strong> để chặn hoàn toàn.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unlock-date" className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                Ngày mở khóa (tuỳ chọn)
              </Label>
              <Input
                id="unlock-date"
                type="date"
                value={unlockDate}
                onChange={(e) => {
                  setUnlockDate(e.target.value)
                  setError('')
                }}
                min={minDate}
                max={maxDateStr}
                disabled={isProcessing}
                className="w-full h-12 rounded-2xl border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {unlockDate && !error && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-sm font-medium">
                <CheckIcon className="h-4 w-4 shrink-0" />
                <p>Mở khóa tự động vào {new Date(unlockDate).toLocaleDateString('vi-VN')}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing || !unlockDate}
                className="flex-1 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {isProcessing ? 'Đang xử lý...' : 'Khóa có thời hạn'}
              </Button>
            </div>
            
            <Button
              type="button"
              variant="destructive"
              onClick={handlePermanentLock}
              disabled={isProcessing}
              className="w-full h-12 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              Khóa vĩnh viễn
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
