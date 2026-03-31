"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const userIdParam = searchParams.get("userId")
    const tokenParam = searchParams.get("token")

    if (!userIdParam || !tokenParam) {
      setStatus("error")
      setMessage("Link đặt lại mật khẩu không hợp lệ.")
    } else {
      setUserId(userIdParam)
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/user/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            token: token,
            newPassword: password,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setMessage(data.message || "Mật khẩu đã được đặt lại thành công!")
      } else {
        setStatus("error")
        setMessage(data.message || "Không thể đặt lại mật khẩu. Email có thể đã hết hạn.")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setStatus("error")
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex justify-center">
              <img
                src="/app-admin-assets-logo.png"
                alt="Sức Khỏe"
                className="h-16 w-auto"
              />
            </div>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-500/10 p-3">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Đặt Lại Mật Khẩu Thành Công!
              </h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Đăng Nhập Ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "error" && !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex justify-center">
              <img
                src="/app-admin-assets-logo.png"
                alt="Sức Khỏe"
                className="h-16 w-auto"
              />
            </div>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-3">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Link Không Hợp Lệ
              </h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="pt-4 space-y-3">
                <Link href="/auth/forgot-password">
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                    Gửi Lại Link Đặt Lại Mật Khẩu
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full h-11">
                    Về Trang Đăng Nhập
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img
              src="/app-admin-assets-logo.png"
              alt="Sức Khỏe"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Đặt Lại Mật Khẩu</h1>
          <p className="text-muted-foreground">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {status === "error" && message && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật Khẩu Mới
            </label>
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
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Xác Nhận Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 bg-input border-border focus:border-primary focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password && confirmPassword && (
              <p className={`text-xs ${password === confirmPassword ? "text-green-600 dark:text-green-500" : "text-destructive"}`}>
                {password === confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
          >
            {isLoading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Nhớ mật khẩu?{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary/80 font-medium transition"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
