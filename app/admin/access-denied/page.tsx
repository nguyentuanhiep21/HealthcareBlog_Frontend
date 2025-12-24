'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Truy cập bị từ chối</h1>
          <p className="text-muted-foreground">
            Bạn không có quyền truy cập vào khu vực quản trị. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/user">
            <Button>Về trang chủ</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Đăng nhập lại</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
