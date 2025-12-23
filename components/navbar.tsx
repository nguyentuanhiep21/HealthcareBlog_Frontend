"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, Home, Bookmark, User, Settings, Users, UtensilsCrossed, LogOut, LogIn, KeyRound } from "lucide-react"
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
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Menu + Logo + Search */}
          <div className="flex items-center gap-4">
            {/* Menu Button */}
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="h-7 w-7" />
              </Button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute left-0 top-12 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
                    <div className="py-2">
                      <Link
                        href="/user"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Home className="h-5 w-5" />
                        Trang chủ
                      </Link>
                      {isAuthenticated ? (
                        <Link
                          href="/user/saved"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Bookmark className="h-5 w-5" />
                          Đã lưu
                        </Link>
                      ) : (
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition text-left"
                          onClick={() => {
                            setIsMenuOpen(false)
                            setShowLoginDialog(true)
                          }}
                        >
                          <Bookmark className="h-5 w-5" />
                          Đã lưu
                        </button>
                      )}
                      {isAuthenticated ? (
                        <Link
                          href="/user/following"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Users className="h-5 w-5" />
                          Đang theo dõi
                        </Link>
                      ) : (
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition text-left"
                          onClick={() => {
                            setIsMenuOpen(false)
                            setShowLoginDialog(true)
                          }}
                        >
                          <Users className="h-5 w-5" />
                          Đang theo dõi
                        </button>
                      )}
                      {isAuthenticated ? (
                        <Link
                          href="/user/meal-suggestions"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UtensilsCrossed className="h-5 w-5" />
                          Gợi ý bữa ăn
                        </Link>
                      ) : (
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition text-left"
                          onClick={() => {
                            setIsMenuOpen(false)
                            setShowLoginDialog(true)
                          }}
                        >
                          <UtensilsCrossed className="h-5 w-5" />
                          Gợi ý bữa ăn
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logo/Brand */}
            <Link href="/user" className="flex items-center">
              <Image src="/care-logo.png" alt="Health Care Logo" width={288} height={96} className="h-24 w-auto" />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Section: Notification + Avatar */}
          <div className="flex items-center gap-4">
            {/* Notification Bell - Only show if authenticated */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Avatar with Dropdown or Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="rounded-full overflow-hidden p-0 border-0 bg-transparent cursor-pointer"
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                >
                  <img
                    src={user?.avatarUrl || "/placeholder.svg"}
                    alt={user?.fullName || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                </button>

                {isAvatarMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAvatarMenuOpen(false)} />
                    <div className="absolute right-0 top-12 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
                      <div className="py-2">
                        <Link
                          href="/user/profile/current"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                          onClick={() => setIsAvatarMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          Trang cá nhân
                        </Link>
                        <Link
                          href="/user/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                          onClick={() => setIsAvatarMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          Cài đặt
                        </Link>
                        <Link
                          href="/user/change-password"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                          onClick={() => setIsAvatarMenuOpen(false)}
                        >
                          <KeyRound className="h-5 w-5" />
                          Đổi mật khẩu
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition text-destructive hover:bg-destructive/10 text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
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
