"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email) {
      setError("Vui lòng nhập email")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/users/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.message || "Không thể gửi email. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
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
          {/* Lock animation graphic */}
          <div className="flex justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{animationDuration:"3s"}} />
              <div className="absolute inset-3 rounded-full bg-white/15" />
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Đặt lại<br />mật khẩu
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-xs mx-auto">
              Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu ngay lập tức.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Link có hiệu lực trong 30 phút",
              "Email được gửi ngay lập tức",
              "Bảo mật tuyệt đối",
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


          {!success ? (
            <>
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Quên Mật Khẩu?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-[15px]">
                  Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
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
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-200 text-[15px]"
                      required
                    />
                  </div>
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
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send style={{width:"16px",height:"16px"}} />
                      Gửi Link Đặt Lại Mật Khẩu
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
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
                  Email đã được gửi!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed">
                  Chúng tôi đã gửi link đặt lại mật khẩu đến
                </p>
                <p className="font-semibold text-slate-900 dark:text-white text-[15px]">{email}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lưu ý</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Link có hiệu lực trong <span className="font-semibold text-slate-900 dark:text-white">30 phút</span>.
                  Không thấy email? Kiểm tra thư mục spam.
                </p>
              </div>

              <button
                onClick={() => { setSuccess(false); setEmail("") }}
                className="w-full h-12 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 cursor-pointer"
              >
                Gửi Lại Email
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="flex justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#6366f1] dark:hover:text-indigo-400 font-medium transition-colors duration-150 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
