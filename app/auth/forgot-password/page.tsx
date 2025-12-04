"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ForgotPasswordStep = "email" | "otp" | "reset" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<ForgotPasswordStep>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Vui lòng nhập email")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    // Move to OTP step regardless of validation
    setStep("otp")
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    // Move to reset step regardless of OTP
    setStep("reset")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    // Show success and redirect
    setStep("success")
    setTimeout(() => router.push("/auth/login"), 2000)
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
          <h1 className="text-3xl font-bold text-foreground">Quên Mật Khẩu</h1>
          <p className="text-muted-foreground">
            Chúng tôi sẽ giúp bạn đặt lại mật khẩu
          </p>
        </div>

        {/* Success State */}
        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Mật khẩu đã đặt lại</h2>
              <p className="text-muted-foreground text-sm">
                Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập với mật khẩu mới.
              </p>
            </div>
          </div>
        )}

        {/* Email Step */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Nhập Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Chúng tôi sẽ gửi mã xác nhận tới email của bạn
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
            >
              {isLoading ? "Đang gửi..." : "Gửi Mã Xác Nhận"}
            </Button>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-foreground">
                Mã Xác Nhận
              </label>
              <p className="text-xs text-muted-foreground">
                Vui lòng nhập mã xác nhận được gửi tới {email}
              </p>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest bg-input border-border focus:border-primary focus:ring-primary font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
              >
                {isLoading ? "Đang xác nhận..." : "Xác Nhận"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("email")}
                className="w-full h-10 text-primary hover:bg-primary/10"
              >
                Quay Lại
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Chưa nhận được mã?{" "}
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-medium transition"
              >
                Gửi lại
              </button>
            </p>
          </form>
        )}

        {/* Reset Password Step */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                Mật Khẩu Mới
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-input border-border focus:border-primary focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground">
                Mật khẩu phải có ít nhất 8 ký tự
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Xác Nhận Mật Khẩu
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-input border-border focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
              >
                {isLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("otp")}
                className="w-full h-10 text-primary hover:bg-primary/10"
              >
                Quay Lại
              </Button>
            </div>
          </form>
        )}

        {/* Back to Login */}
        {step !== "success" && (
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium transition text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay về trang đăng nhập
          </Link>
        )}
      </div>
    </div>
  )
}
