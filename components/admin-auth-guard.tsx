'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Authenticated but not admin - show access denied
    if (user && !user.isAdmin) {
      router.push('/admin/access-denied')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or not admin - show nothing (will redirect)
  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  // Authenticated and is admin - show content
  return <>{children}</>
}
