'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Calendar } from 'lucide-react'

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

    // Nếu không chọn ngày, hỏi xác nhận khóa vĩnh viễn
    if (!unlockDate) {
      setError('Vui lòng chọn ngày mở khóa hoặc để trống để khóa vĩnh viễn')
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
    // Khóa vĩnh viễn (unlockDate = null)
    onConfirm(null)
    setUnlockDate('')
    setError('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel()
      setUnlockDate('')
      setError('')
    }
  }

  // Tính min date (ngày mai)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Tính max date (1 năm từ hôm nay)
  const maxDateObj = new Date()
  maxDateObj.setFullYear(maxDateObj.getFullYear() + 1)
  const maxDateStr = maxDateObj.toISOString().split('T')[0]

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Khóa tài khoản</DialogTitle>
          <DialogDescription>
            Khóa tài khoản của <span className="font-semibold text-foreground">"{userName}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Chọn ngày mở khóa hoặc để trống để khóa vĩnh viễn
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="unlock-date" className="text-sm font-medium">
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
              className="w-full"
              placeholder="Chọn ngày mở khóa"
            />
            <p className="text-xs text-muted-foreground">
              Nếu để trống, tài khoản sẽ bị khóa vĩnh viễn cho đến khi admin mở khóa
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {unlockDate && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Tài khoản sẽ được mở khóa vào {new Date(unlockDate).toLocaleDateString('vi-VN')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handlePermanentLock}
            disabled={isProcessing}
            className="flex-1"
          >
            Khóa vĩnh viễn
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={isProcessing || !unlockDate}
            className="flex-1"
          >
            {isProcessing ? 'Đang xử lý...' : 'Khóa với hạn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
