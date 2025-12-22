"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/user/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
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
            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-green-600 dark:text-green-500">
                  Email đã được gửi!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Vui lòng kiểm tra hộp thư của bạn ({email}) và làm theo hướng dẫn để đặt lại mật khẩu.
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-500/80 mt-2">
                  Không thấy email? Kiểm tra thư mục spam hoặc thử gửi lại.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
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
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
            >
              {isLoading ? "Đang gửi..." : "Gửi Link Đặt Lại Mật Khẩu"}
            </Button>
          </form>
        )}

        {/* Back to Login */}
        <div className="flex justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>

        {/* Resend option when success */}
        {success && (
          <div className="pt-4 border-t border-border">
            <Button
              type="button"
              onClick={() => { setSuccess(false); setEmail(""); }}
              variant="outline"
              className="w-full h-10"
            >
              Gửi Lại Email
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
