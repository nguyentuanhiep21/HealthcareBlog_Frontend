"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"

export function UserAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authUtils.getToken()
      
      if (!token) {
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/user/account`,
          {
            headers: authUtils.getAuthHeaders(),
          }
        )

        if (response.ok) {
          const userData = await response.json()
          
          // Block admin from accessing user pages
          if (userData.email?.toLowerCase() === 'admin@healthcareblog.com') {
            router.push("/admin")
            return
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
      
      setIsChecking(false)
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
