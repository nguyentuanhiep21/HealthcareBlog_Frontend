"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, Home, Bookmark, User, Settings, Users, HeartPulse, LogOut, LogIn, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useAuth } from "@/components/auth-provider"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import Image from "next/image"

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/user/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          {/* Left Section: Menu + Logo + Search */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Menu Button */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-10 w-10 text-slate-700 dark:text-slate-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-[22px] w-[22px]" />
              </Button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute left-0 top-12 w-64 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/user"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Home className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        Trang chủ
                      </Link>
                      
                      {isAuthenticated ? (
                        <Link
                          href="/user/saved"
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Bookmark className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          Đã lưu
                        </Link>
                      ) : (
                        <button
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full text-left"
                          onClick={() => {
                            setIsMenuOpen(false)
                            setShowLoginDialog(true)
                          }}
                        >
                          <Bookmark className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          Đã lưu
                        </button>
                      )}
                      
                      {isAuthenticated ? (
                        <Link
                          href="/user/following"
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                          Đang theo dõi
                        </Link>
                      ) : (
                        <button
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full text-left"
                          onClick={() => {
                            setIsMenuOpen(false)
                            setShowLoginDialog(true)
                          }}
                        >
                          <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                          Đang theo dõi
                        </button>
                      )}
                      
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                      
                      <Link
                        href="/user/meal-suggestions"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HeartPulse className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                        Đánh giá sức khỏe
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logo/Brand */}
            <Link href="/user" className="flex items-center hover:opacity-90 transition-opacity">
              <Image src="/care-logo.png" alt="Health Care Logo" width={288} height={96} className="h-14 lg:h-16 w-auto object-contain" />
            </Link>

            {/* Search Bar - hidden on mobile, shown on md+ */}
            <form onSubmit={handleSearch} className="hidden md:block relative w-64 lg:w-80 ml-4 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              <Input
                type="search"
                placeholder="Tìm kiếm bài viết, bác sĩ..."
                className="pl-10 h-11 bg-slate-100/70 dark:bg-slate-900/70 border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 rounded-full transition-all text-[15px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          {/* Mobile Search Button (Visible only on small screens) */}
          <div className="md:hidden flex-1 flex justify-end px-2">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => {
                // Here we could implement a mobile search overlay, but for now we'll just redirect to an empty search page or focus search
                router.push("/user/search")
            }}>
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Section: Notification + Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Notification Bell - Only show if authenticated */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Avatar with Dropdown or Login Button */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  className="rounded-full overflow-hidden p-0 border-0 bg-transparent cursor-pointer ring-2 ring-transparent hover:ring-teal-500/30 transition-all focus:outline-none"
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                >
                  <img
                    src={avatarError || !user?.avatarUrl ? "/placeholder.svg" : user.avatarUrl}
                    alt={user?.fullName || "User"}
                    className="h-[38px] w-[38px] rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                </button>

                {isAvatarMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAvatarMenuOpen(false)} />
                    <div className="absolute right-0 top-12 w-60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                      
                      {/* User Info Header */}
                      <div className="px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.email || "Người dùng"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Link
                          href="/user/profile/me"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          onClick={() => setIsAvatarMenuOpen(false)}
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          Trang cá nhân
                        </Link>
                        <Link
                          href="/user/settings"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          onClick={() => setIsAvatarMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 text-slate-400" />
                          Cài đặt hệ thống
                        </Link>
                        <Link
                          href="/user/change-password"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          onClick={() => setIsAvatarMenuOpen(false)}
                        >
                          <KeyRound className="h-4 w-4 text-slate-400" />
                          Đổi mật khẩu
                        </Link>
                        
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="ml-2">
                <Button className="h-10 px-5 gap-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm transition-all hover:shadow-md">
                  <LogIn className="h-4 w-4" />
                  Đăng Nhập
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Login Required Dialog */}
      <LoginRequiredDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        message="Bạn cần đăng nhập để truy cập chức năng này"
      />
    </nav>
  )
}
