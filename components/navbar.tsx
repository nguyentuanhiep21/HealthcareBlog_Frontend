"use client"

import { useState, useRef } from "react"
import { useClickOutside } from "@/hooks/use-click-outside"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, Home, Bookmark, User, Settings, Users, HeartPulse, LogOut, LogIn, KeyRound, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useAuth } from "@/components/auth-provider"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import Image from "next/image"

export function Navbar({ hideSearch = false, showBackButton = false, fullWidth = false }: { hideSearch?: boolean; showBackButton?: boolean; fullWidth?: boolean } = {}) {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setIsMenuOpen(false))
  useClickOutside(avatarMenuRef, () => setIsAvatarMenuOpen(false))

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
      <div className={fullWidth ? "w-full px-4 sm:px-6" : "max-w-[1400px] mx-auto px-4"}>
        <div className="flex items-center justify-between h-[72px]">
          {/* Left Section: Menu + Logo + Search */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Menu or Back Button */}
            {showBackButton ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-10 w-10 text-slate-700 dark:text-slate-200"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-[22px] w-[22px]" />
              </Button>
            ) : (
              <div className="relative" ref={menuRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-10 w-10 text-slate-700 dark:text-slate-200"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Menu className="h-[22px] w-[22px]" />
                </Button>

                {isMenuOpen && (
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
                )}
              </div>
            )}

            {/* Logo/Brand */}
            <Link href="/user" className="flex items-center hover:opacity-90 transition-opacity">
              <Image src="/care-logo.png" alt="Health Care Logo" width={288} height={96} className="h-20 lg:h-24 w-auto object-contain" />
            </Link>

            {/* Search Bar - hidden on mobile, shown on md+ */}
            {!hideSearch && (
              <form onSubmit={handleSearch} className="hidden md:block relative w-64 lg:w-80 ml-4 group">
                <div className="flex items-center h-11 bg-slate-100/70 dark:bg-slate-900/70 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded-full transition-all px-4 cursor-default">
                  <Search className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-teal-500 transition-colors flex-shrink-0" />
                  <input
                    type="search"
                    placeholder="Tìm kiếm bài viết, bác sĩ..."
                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[15px] ml-2.5 placeholder:text-slate-500 dark:text-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            )}
          </div>
          
          {/* Mobile Search Button (Visible only on small screens) */}
          {!hideSearch && (
            <div className="md:hidden flex-1 flex justify-end px-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => {
                  router.push("/user/search")
              }}>
                <Search className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Right Section: Notification + Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Notification Bell - Only show if authenticated */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Avatar with Dropdown or Login Button */}
            {isAuthenticated ? (
              <div className="relative ml-1" ref={avatarMenuRef}>
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="rounded-full overflow-hidden hover:opacity-80 transition ring-2 ring-transparent hover:ring-slate-200 dark:hover:ring-slate-700"
                >
                  <img
                    src={user?.avatarUrl || "/placeholder.svg"}
                    alt={user?.fullName || "User"}
                    className="h-10 w-10 rounded-full cursor-pointer object-cover"
                  />
                </button>

                {isAvatarMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/user/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-200"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-slate-500" />
                        <span>Trang cá nhân</span>
                      </Link>
                      <Link
                        href="/user/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-200"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        <span>Cài đặt</span>
                      </Link>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                      <button
                        onClick={() => {
                          setIsAvatarMenuOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sm font-medium text-rose-600 dark:text-rose-400 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
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
