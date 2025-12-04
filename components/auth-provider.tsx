"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedAuthState = localStorage.getItem("isAuthenticated")
      if (savedAuthState === "true") {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Failed to load auth state from localStorage:", error)
    }
    setMounted(true)
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    try {
      localStorage.setItem("isAuthenticated", "true")
    } catch (error) {
      console.error("Failed to save auth state to localStorage:", error)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem("isAuthenticated")
    } catch (error) {
      console.error("Failed to remove auth state from localStorage:", error)
    }
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
