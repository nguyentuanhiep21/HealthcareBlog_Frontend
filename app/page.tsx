"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  HeartPulse, BookOpen, Users, Shield, ChevronRight,
  Star, MessageCircle, TrendingUp, Sparkles, ArrowRight
} from "lucide-react"

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/user")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">

      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/app-admin-assets-logo.png" alt="Sức Khỏe" className="h-8 w-auto" />
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Sức Khỏe</span>
            </Link>

            {/* Nav actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/user"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-150"
              >
                <BookOpen className="h-4 w-4" />
                Khám phá bài viết
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}
              >
                Đăng ký miễn phí
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
          <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full opacity-8"
            style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] rounded-full opacity-8"
            style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">


          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Kết nối & Chia sẻ{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}>
                kiến thức sức khỏe
              </span>
            </span>{" "}
            cùng cộng đồng
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Nơi bạn có thể đặt câu hỏi, chia sẻ kinh nghiệm và cập nhật thông tin y tế đáng tin cậy từ cộng đồng hàng nghìn thành viên tâm huyết.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-base font-bold text-white px-8 py-4 rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                boxShadow: "0 8px 32px rgba(8,145,178,0.3)",
              }}
            >
              Bắt đầu hành trình ngay
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/user"
              className="inline-flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-900 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <BookOpen className="h-5 w-5" />
              Khám phá bài viết
            </Link>
          </div>
        </div>
      </section>


      {/* ─── FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Tại sao chọn Sức Khỏe?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
              Chúng tôi kết hợp kiến thức y tế chuyên sâu với sức mạnh của cộng đồng để mang lại trải nghiệm sức khỏe tốt nhất.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: HeartPulse,
                title: "Thông tin y tế đáng tin cậy",
                desc: "Nội dung được kiểm duyệt bởi cộng đồng và các chuyên gia, đảm bảo tính chính xác và khoa học.",
                color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
                border: "border-rose-100 dark:border-rose-800/50",
              },
              {
                icon: MessageCircle,
                title: "Cộng đồng hỗ trợ nhiệt tình",
                desc: "Hàng nghìn thành viên sẵn sàng chia sẻ kinh nghiệm và hỗ trợ bạn trong hành trình chăm sóc sức khỏe.",
                color: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
                border: "border-teal-100 dark:border-teal-800/50",
              },
              {
                icon: TrendingUp,
                title: "Cập nhật xu hướng sức khỏe",
                desc: "Luôn cập nhật những thông tin y tế mới nhất, giúp bạn không bỏ lỡ bất kỳ kiến thức quan trọng nào.",
                color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
                border: "border-indigo-100 dark:border-indigo-800/50",
              },
              {
                icon: BookOpen,
                title: "Kho bài viết phong phú",
                desc: "Hàng nghìn bài viết về dinh dưỡng, tập luyện, bệnh lý và lối sống lành mạnh từ cộng đồng.",
                color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
                border: "border-amber-100 dark:border-amber-800/50",
              },
              {
                icon: Users,
                title: "Mạng lưới kết nối rộng",
                desc: "Theo dõi những người bạn yêu thích và xây dựng mạng lưới sức khỏe của riêng bạn.",
                color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
                border: "border-emerald-100 dark:border-emerald-800/50",
              },
              {
                icon: Shield,
                title: "An toàn & Bảo mật",
                desc: "Thông tin cá nhân của bạn được bảo vệ bằng công nghệ mã hóa tiên tiến nhất.",
                color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                border: "border-slate-200 dark:border-slate-700",
              },
            ].map(({ icon: Icon, title, desc, color, border }) => (
              <div
                key={title}
                className={`rounded-2xl border ${border} p-6 bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center text-white"
            style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #0c6d86 100%)" }}
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white/90 text-sm font-medium mb-6">
                <HeartPulse className="h-3.5 w-3.5" />
                Tham gia miễn phí hoàn toàn
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
                Sẵn sàng bắt đầu<br />hành trình sức khỏe?
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 text-base font-bold text-teal-700 bg-white px-8 py-4 rounded-xl hover:bg-cyan-50 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  Tạo tài khoản ngay
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/user"
                  className="inline-flex items-center gap-2 text-base font-semibold text-white/90 hover:text-white px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                >
                  <BookOpen className="h-5 w-5" />
                  Xem trước nội dung
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/app-admin-assets-logo.png" alt="Sức Khỏe" className="h-7 w-auto" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Sức Khỏe</span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center">
            © {new Date().getFullYear()} HealthcareBlog. Mọi quyền được bảo lưu.
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Hỗ trợ:{" "}
            <a href="mailto:healthcareblog.support@gmail.com"
              className="text-teal-600 dark:text-teal-400 hover:underline transition-colors">
              healthcareblog.support@gmail.com
            </a>
          </p>
        </div>
      </footer>

    </div>
  )
}
