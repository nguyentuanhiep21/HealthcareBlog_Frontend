"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { authUtils } from "@/lib/auth-utils"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginAs, setLoginAs] = useState<'user' | 'admin'>('user')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.token) {
        // Lưu token sử dụng authUtils
        authUtils.setToken(data.token)
        
        // Fetch user info to check admin role
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/user/account`,
          {
            headers: {
              "Authorization": `Bearer ${data.token}`,
              "Content-Type": "application/json",
            },
          }
        )
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          
          // Check if trying to login as admin but not an admin
          if (loginAs === 'admin' && !userData.isAdmin) {
            authUtils.removeToken()
            setError("Tài khoản này không có quyền quản trị viên.")
            return
          }
          
          login()
          
          // Redirect based on role
          if (loginAs === 'admin' && userData.isAdmin) {
            router.push("/admin")
          } else {
            router.push("/user")
          }
        } else {
          setError("Không thể xác thực thông tin người dùng.")
        }
      } else {
        setError(data.message || "Email hoặc mật khẩu không chính xác.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img
              src="/app-admin-assets-logo.png"
              alt="Sức Khỏe"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Đăng Nhập</h1>
          <p className="text-muted-foreground">
            Chào mừng trở lại. Vui lòng đăng nhập vào tài khoản của bạn.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login As Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Đăng nhập với vai trò
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLoginAs('user')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  loginAs === 'user'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                Người dùng
              </button>
              <button
                type="button"
                onClick={() => setLoginAs('admin')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  loginAs === 'admin'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                Quản trị viên
              </button>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="text"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mật Khẩu
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:text-primary/80 font-medium transition"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-input border-border focus:border-primary focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded border-border bg-input cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Ghi nhớ mật khẩu của tôi
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </Button>
        </form>

        {/* Browse as Guest */}
        <div className="pt-2 border-t border-border">
          <Link href="/user" className="block">
            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 text-primary hover:bg-primary/10 font-medium flex items-center justify-center gap-2"
            >
              Xem trang chủ
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/signup"
            className="text-primary hover:text-primary/80 font-medium transition"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
