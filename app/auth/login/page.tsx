"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Bypass validation if credentials are "test"
    if (email === "test" && password === "test") {
      await new Promise((resolve) => setTimeout(resolve, 500))
      login()
      router.push("/user")
      return
    }

    // Simulate API call for other credentials
    await new Promise((resolve) => setTimeout(resolve, 800))
    setError("Email hoặc mật khẩu không chính xác. Hãy nhập 'test' cho cả hai trường.")
    setIsLoading(false)
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
