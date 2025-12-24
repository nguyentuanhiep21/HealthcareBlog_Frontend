"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Users, FileText, MessageSquare, LayoutDashboard, LogOut } from "lucide-react"
import { AdminAuthGuard } from "@/components/admin-auth-guard"
import { Button } from "@/components/ui/button"
import { authUtils } from "@/lib/auth-utils"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const handleLogout = () => {
    authUtils.removeToken()
    router.push("/auth/login")
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/admin">
              <Image src="/care-logo.png" alt="Health Care Logo" width={288} height={96} className="h-24 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="border-b bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <Users className="h-5 w-5" />
              Quản lý người dùng
            </Link>
            <Link
              href="/admin/posts"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <FileText className="h-5 w-5" />
              Quản lý bài viết
            </Link>
            <Link
              href="/admin/comments"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <MessageSquare className="h-5 w-5" />
              Quản lý bình luận
            </Link>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
    </AdminAuthGuard>
  )
}
