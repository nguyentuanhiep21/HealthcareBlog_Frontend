"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const userId = searchParams.get("userId")
      const token = searchParams.get("token")

      if (!userId || !token) {
        setStatus("error")
        setMessage("Link xác thực không hợp lệ. Vui lòng kiểm tra lại email của bạn.")
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/user/verify-email?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
          }
        )

        // Kiểm tra Content-Type để đảm bảo nhận JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Response is not JSON:", await response.text())
          setStatus("error")
          setMessage("Lỗi kết nối với server. Vui lòng đảm bảo backend đang chạy đúng.")
          return
        }

        const data = await response.json()

        if (response.ok && data.success) {
          setStatus("success")
          setMessage("Email đã được xác thực thành công!")
        } else {
          // Kiểm tra nếu email đã được xác thực trước đó
          const errorMessage = data.message?.toLowerCase() || ""
          if (errorMessage.includes("already verified") || errorMessage.includes("đã được xác thực")) {
            setStatus("success")
            setMessage("Email đã được xác thực trước đó. Bạn có thể đăng nhập ngay!")
          } else {
            setStatus("error")
            setMessage("Xác thực email thất bại. Link có thể đã hết hạn hoặc không hợp lệ.")
          }
        }
      } catch (error) {
        setStatus("error")
        if (error instanceof SyntaxError) {
          setMessage("Backend đang trả về HTML thay vì JSON. Vui lòng kiểm tra CORS và đảm bảo backend chạy đúng cổng HTTPS.")
        } else {
          setMessage("Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau.")
        }
        console.error("Verify email error:", error)
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/app-admin-assets-logo.png"
              alt="Sức Khỏe"
              className="h-16 w-auto"
            />
          </div>

          {/* Status Icon & Message */}
          <div className="text-center space-y-4">
            {status === "loading" && (
              <>
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Đang xác thực...
                </h1>
                <p className="text-muted-foreground">
                  Vui lòng đợi trong giây lát
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Xác Thực Thành Công!
                </h1>
                <p className="text-muted-foreground">
                  {message}
                </p>
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => router.push("/auth/login")}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    Đăng Nhập Ngay
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Bạn có thể đăng nhập với tài khoản đã được xác thực
                  </p>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <XCircle className="h-16 w-16 text-destructive" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Xác Thực Thất Bại
                </h1>
                <p className="text-muted-foreground">
                  {message}
                </p>
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => router.push("/auth/signup")}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    Đăng Ký Lại
                  </Button>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full h-11"
                    >
                      Về Trang Đăng Nhập
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
