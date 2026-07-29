"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from "lucide-react"
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
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/users/reset-password`,
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
        setMessage(data.message || "Không thể đặt lại mật khẩu. Link có thể đã hết hạn.")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setStatus("error")
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(145deg, #4338ca 0%, #6366f1 45%, #818cf8 80%, #a5b4fc 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #c7d2fe 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #e0e7ff 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/app-admin-assets-logo.png" alt="Sức Khỏe" className="h-10 w-auto drop-shadow-lg" />
          <span className="text-white font-semibold text-xl tracking-wide drop-shadow">Sức Khỏe</span>
        </div>

        {/* Center */}
        <div className="relative z-10 space-y-8">
          <div className="flex justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" style={{animationDuration:"2s"}} />
              <div className="absolute inset-3 rounded-full bg-white/15" />
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Khôi phục<br />truy cập
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-xs mx-auto">
              Tạo mật khẩu mới mạnh mẽ để bảo vệ tài khoản của bạn an toàn hơn.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Mật khẩu từ 8 ký tự trở lên",
              "Bảo mật với mã hóa 256-bit",
              "Khôi phục tài khoản ngay lập tức",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 justify-center">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
                <span className="text-indigo-50 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
            <p className="text-indigo-50 text-sm">
              Cần hỗ trợ?{" "}
              <span className="font-semibold text-white">healthcareblog.support@gmail.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[420px] space-y-8">

          {status === "success" ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-700">
                    <CheckCircle2 className="h-10 w-10 text-indigo-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center border-2 border-white dark:border-slate-950">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-none stroke-current stroke-3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Đổi mật khẩu thành công!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full h-12 rounded-xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                }}
              >
                Đăng Nhập Ngay
              </button>
            </div>
          ) : status === "error" && !userId ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border-2 border-red-200 dark:border-red-800">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Link Không Hợp Lệ
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/auth/forgot-password" className="block w-full">
                  <button className="w-full h-12 rounded-xl font-semibold text-white text-[15px] transition-all duration-200 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                    }}
                  >
                    Gửi Lại Link Khác
                  </button>
                </Link>
                <Link href="/auth/login" className="block w-full">
                  <button className="w-full h-12 rounded-xl font-semibold text-[15px] border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 cursor-pointer">
                    Về Trang Đăng Nhập
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Đặt Lại Mật Khẩu
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-[15px]">
                  Nhập mật khẩu mới an toàn cho tài khoản của bạn.
                </p>
              </div>

              {/* Error Alert */}
              {(error || (status === "error" && message)) && (
                <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error || message}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Mật Khẩu Mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-200 text-[15px]"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff style={{width:"18px",height:"18px"}} /> : <Eye style={{width:"18px",height:"18px"}} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Xác Nhận Mật Khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-200 text-[15px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff style={{width:"18px",height:"18px"}} /> : <Eye style={{width:"18px",height:"18px"}} />}
                    </button>
                  </div>
                  {password && confirmPassword && (
                    <p className={`text-[13px] font-medium mt-1.5 ${password === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {password === confirmPassword ? "✓ Mật khẩu đã khớp" : "✗ Mật khẩu chưa khớp"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isLoading
                      ? "#a5b4fc"
                      : "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                    boxShadow: isLoading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <KeyRound style={{width:"16px",height:"16px"}} />
                      Cập Nhật Mật Khẩu
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to login for both form and error state */}
          {status !== "success" && (
            <div className="flex justify-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#6366f1] dark:hover:text-indigo-400 font-medium transition-colors duration-150 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
