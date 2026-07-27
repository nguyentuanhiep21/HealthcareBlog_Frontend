"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { authUtils } from "@/lib/auth-utils"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailNotVerified(false)

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    const isAdminLoginMode = isAdminLogin
    setIsLoading(true)
    authUtils.removeToken()

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await response.json()

      if (response.ok && data.token) {
        authUtils.setToken(data.token)
        await login()

        if (isAdminLoginMode) {
          if (email.toLowerCase() === 'admin@healthcareblog.com') {
            router.push("/admin")
          } else {
            setError("Tài khoản này không phải tài khoản quản trị viên. Vui lòng sử dụng tài khoản admin.")
            authUtils.removeToken()
          }
        } else {
          router.push("/user")
        }
      } else {
        const message = data.message || ""
        if (message.includes("Email chưa được xác thực")) {
          setEmailNotVerified(true)
          setShowVerificationDialog(true)
        } else {
          setError(message || "Email hoặc mật khẩu không chính xác.")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerificationEmail = async () => {
    if (!email) {
      setError("Vui lòng nhập email của bạn")
      return
    }

    setIsResendingEmail(true)
    setResendSuccess(false)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/User/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      )

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        setError("Lỗi kết nối với server. Vui lòng đảm bảo backend đang chạy đúng.")
        setIsResendingEmail(false)
        return
      }

      const data = await response.json()
      if (response.ok && data.success) {
        setResendSuccess(true)
      } else {
        setError(data.message || "Không thể gửi lại email. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Resend verification email error:", error)
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      setIsResendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(145deg, #0e7490 0%, #0891b2 40%, #06b6d4 75%, #22d3ee 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a5f3fc 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #ecfeff 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/app-admin-assets-logo.png" alt="Sức Khỏe" className="h-10 w-auto drop-shadow-lg" />
          <span className="text-white font-semibold text-xl tracking-wide drop-shadow">Sức Khỏe</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
              <Shield className="h-4 w-4 text-cyan-200" />
              <span className="text-cyan-100 text-sm font-medium">An toàn & Bảo mật</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Chào mừng<br />trở lại!
            </h2>
            <p className="text-cyan-100 text-lg leading-relaxed max-w-xs">
              Đăng nhập để truy cập kho kiến thức sức khỏe và kết nối với cộng đồng.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "Hàng nghìn bài viết chất lượng",
              "Cộng đồng sức khỏe tích cực",
              "Cập nhật thông tin y tế mới nhất",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
                <span className="text-cyan-50 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
            <p className="text-cyan-50 text-sm italic leading-relaxed">
              "Sức khỏe là tài sản quý giá nhất. Hãy cùng nhau bảo vệ và nâng cao sức khỏe cộng đồng."
            </p>
            <p className="text-cyan-200 text-xs mt-3 font-medium">— HealthcareBlog Team</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[420px] space-y-8">

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Đăng Nhập
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[15px]">
              Chào mừng trở lại. Vui lòng đăng nhập vào tài khoản của bạn.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  id="email"
                  type="text"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-transparent transition-all duration-200 text-[15px]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Mật Khẩu
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#0891b2] hover:text-[#0e7490] font-medium transition-colors duration-150"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-transparent transition-all duration-200 text-[15px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-150 cursor-pointer"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff style={{width:"18px",height:"18px"}} /> : <Eye style={{width:"18px",height:"18px"}} />}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 accent-[#0891b2] cursor-pointer"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  Ghi nhớ mật khẩu của tôi
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  id="admin-login"
                  type="checkbox"
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#0891b2] cursor-pointer"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  Đăng nhập với tư cách quản trị viên
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isLoading
                  ? "#64b5c8"
                  : "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                boxShadow: isLoading ? "none" : "0 4px 20px rgba(8,145,178,0.35)",
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng Nhập
                  <ArrowRight style={{width:"17px",height:"17px"}} />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/signup"
              className="text-[#0891b2] hover:text-[#0e7490] font-semibold transition-colors duration-150"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-amber-50 border border-amber-200 p-4">
                <AlertCircle className="h-10 w-10 text-amber-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900 dark:text-white">
              Email Chưa Được Xác Thực
            </DialogTitle>
            <DialogDescription className="text-center pt-1 text-slate-500">
              Email của bạn chưa được xác thực. Vui lòng xác thực email trước để tiếp tục.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!resendSuccess ? (
              <>
                <p className="text-sm text-slate-500 text-center">
                  Chúng tôi sẽ gửi lại email xác thực đến{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                </p>
                <button
                  onClick={handleResendVerificationEmail}
                  disabled={isResendingEmail}
                  className="w-full h-11 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}
                >
                  {isResendingEmail ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </>
                  ) : "Gửi Lại Email Xác Thực"}
                </button>
              </>
            ) : (
              <div className="space-y-3 text-center py-2">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-50 border border-green-200 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-600">Email xác thực đã được gửi!</p>
                <p className="text-xs text-slate-500">
                  Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để xác thực email.
                </p>
                <button
                  onClick={() => setShowVerificationDialog(false)}
                  className="w-full h-11 rounded-xl font-semibold text-white text-sm transition-all duration-200 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}
                >
                  Đã Hiểu
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
