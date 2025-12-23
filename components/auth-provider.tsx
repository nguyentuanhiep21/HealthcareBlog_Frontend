"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"

export interface UserInfo {
  id: string
  fullName: string
  email: string
  avatarUrl: string
  bio?: string
  phoneNumber?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserInfo | null
  login: () => void
  logout: () => void
  fetchUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Fetch user info from API
  const fetchUserInfo = async () => {
    const token = authUtils.getToken()
    if (!token) {
      setUser(null)
      return
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/user/account`, {
        headers: authUtils.getAuthHeaders(),
      })

      if (response.ok) {
        const userData = await response.json()
        const fullAvatarUrl = userData.avatarUrl 
          ? (userData.avatarUrl.startsWith('http') 
              ? userData.avatarUrl 
              : `${backendUrl}${userData.avatarUrl}`)
          : "/placeholder.svg"

        setUser({
          id: userData.id,
          fullName: userData.fullName,
          email: userData.email,
          avatarUrl: fullAvatarUrl,
          bio: userData.bio,
          phoneNumber: userData.phoneNumber,
        })
      } else {
        // Token invalid or expired
        setUser(null)
        setIsAuthenticated(false)
        authUtils.removeToken()
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
      setUser(null)
    }
  }

  // Load auth state and user info on mount
  useEffect(() => {
    try {
      const hasAuth = authUtils.isAuthenticated()
      setIsAuthenticated(hasAuth)
      
      if (hasAuth) {
        fetchUserInfo()
      }
    } catch (error) {
      console.error("Failed to load auth state from localStorage:", error)
    }
    setMounted(true)
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    // Fetch user info after login
    fetchUserInfo()
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    authUtils.removeToken()
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, fetchUserInfo }}>
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
