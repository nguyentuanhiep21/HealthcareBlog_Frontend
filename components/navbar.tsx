"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, Home, Bookmark, User, Settings, Users, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockUsers } from "@/lib/mock-data"
import { NotificationDropdown } from "@/components/notification-dropdown"
import Image from "next/image"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)

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
                      <Link
                        href="/user/saved"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bookmark className="h-5 w-5" />
                        Đã lưu
                      </Link>
                      <Link
                        href="/user/following"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Users className="h-5 w-5" />
                        Đang theo dõi
                      </Link>
                      <Link
                        href="/user/meal-suggestions"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UtensilsCrossed className="h-5 w-5" />
                        Gợi ý bữa ăn
                      </Link>
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
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Tìm kiếm..." className="pl-9 w-64" />
            </div>
          </div>

          {/* Right Section: Notification + Avatar */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Avatar with Dropdown */}
            <div className="relative">
              <button
                className="rounded-full overflow-hidden p-0 border-0 bg-transparent cursor-pointer"
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              >
                <img
                  src={mockUsers.currentUser.avatar || "/placeholder.svg"}
                  alt={mockUsers.currentUser.name}
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
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
