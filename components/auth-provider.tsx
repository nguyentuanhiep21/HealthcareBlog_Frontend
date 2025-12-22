"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      // Kiểm tra cả token và auth state
      const hasAuth = authUtils.isAuthenticated()
      setIsAuthenticated(hasAuth)
    } catch (error) {
      console.error("Failed to load auth state from localStorage:", error)
    }
    setMounted(true)
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    // authUtils.setToken đã được gọi ở login page
  }

  const logout = () => {
    setIsAuthenticated(false)
    authUtils.removeToken()
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
