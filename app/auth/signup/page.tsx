"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Heart } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Vui lòng điền tất cả các trường")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }
    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setError("")
        setFormData({ fullName: "", email: "", password: "", confirmPassword: "" })
      } else {
        setError(data.message || "Đăng ký thất bại. Vui lòng thử lại.")
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.")
      console.error("Signup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"]
  const strengthLabels = ["", "Yếu", "Trung bình", "Khá tốt", "Rất mạnh"]
  const strengthTextColors = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-500"]

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(145deg, #065f46 0%, #059669 40%, #10b981 75%, #34d399 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #d1fae5 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/app-admin-assets-logo.png" alt="Sức Khỏe" className="h-10 w-auto drop-shadow-lg" />
          <span className="text-white font-semibold text-xl tracking-wide drop-shadow">Sức Khỏe</span>
        </div>

        {/* Center */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
              <Heart className="h-4 w-4 text-emerald-100" />
              <span className="text-emerald-50 text-sm font-medium">Tham gia cộng đồng</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Bắt đầu<br />hành trình<br />sức khỏe
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-xs">
              Tạo tài khoản miễn phí và khám phá kho kiến thức y tế phong phú.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Miễn phí hoàn toàn",
              "Đặt câu hỏi & nhận tư vấn",
              "Chia sẻ kinh nghiệm sức khỏe",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
                <span className="text-emerald-50 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { val: "10K+", label: "Thành viên" },
            { val: "5K+", label: "Bài viết" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{s.val}</p>
              <p className="text-emerald-100 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-6">

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Đăng Ký
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[15px]">
              Tạo tài khoản mới và tham gia cộng đồng sức khỏe
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 px-4 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">Đăng ký thành công!</p>
                <p className="text-emerald-600 dark:text-emerald-500 text-xs mt-0.5">
                  Vui lòng kiểm tra email của bạn để xác thực tài khoản.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Họ và Tên
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all duration-200 text-[15px]"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all duration-200 text-[15px]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all duration-200 text-[15px]"
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

              {/* Password strength */}
              {formData.password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                          i < passwordStrength ? strengthColors[passwordStrength] : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthTextColors[passwordStrength]}`}>
                    Độ mạnh: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all duration-200 text-[15px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-150 cursor-pointer"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff style={{width:"18px",height:"18px"}} /> : <Eye style={{width:"18px",height:"18px"}} />}
                </button>
              </div>

              {/* Password match */}
              {formData.confirmPassword && (
                <div className={`flex items-center gap-1.5 text-xs font-medium pt-0.5 ${
                  formData.password === formData.confirmPassword
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}>
                  <CheckCircle2 style={{width:"13px",height:"13px"}} />
                  {formData.password === formData.confirmPassword ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isLoading
                    ? "#6ee7b7"
                    : "linear-gradient(135deg, #059669 0%, #065f46 100%)",
                  boxShadow: isLoading ? "none" : "0 4px 20px rgba(5,150,105,0.35)",
                }}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    Đăng Ký
                    <ArrowRight style={{width:"17px",height:"17px"}} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Đã có tài khoản?{" "}
            <Link
              href="/auth/login"
              className="text-[#059669] hover:text-[#065f46] font-semibold transition-colors duration-150"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
