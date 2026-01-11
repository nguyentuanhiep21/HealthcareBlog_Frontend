/**
 * Auth utilities for consistent token management
 * 
 * IMPORTANT: Always use these functions for token operations
 * to ensure consistency across the application.
 */

const TOKEN_KEY = "authToken"
const AUTH_STATE_KEY = "isAuthenticated"

export const authUtils = {
  /**
   * Get authentication token from localStorage
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Save authentication token to localStorage
   */
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(AUTH_STATE_KEY, "true")
  },

  /**
   * Remove authentication token from localStorage
   */
  removeToken: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(AUTH_STATE_KEY)
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(AUTH_STATE_KEY) === "true" && !!localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders: (): Record<string, string> => {
    const token = authUtils.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }
}
