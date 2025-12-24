"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, FileText, MessageSquare, AlertCircle, Lock, TrendingUp, UserCheck, ShieldAlert, CheckCircle, XCircle, ArrowRight, Clock, Activity } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { authUtils } from "@/lib/auth-utils"
import { formatDateOnlyGMT7 } from "@/lib/time-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminStatsDTO {
  totalUsers: number
  totalPosts: number
  totalComments: number
  pendingReports: number
  lockedUsers: number
  newUsersToday: number
  newPostsToday: number
  userReports: number
  postReports: number
  commentReports: number
  resolvedReports: number
  rejectedReports: number
  activeUsers: number
}

interface RecentReport {
  id: number
  reportedByName: string
  reportedByAvatar: string | null
  contentType: string
  reason: string
  status: string
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsDTO>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    pendingReports: 0,
    lockedUsers: 0,
    newUsersToday: 0,
    newPostsToday: 0,
    userReports: 0,
    postReports: 0,
    commentReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    activeUsers: 0,
  })
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    fetchRecentReports()
  }, [])

  const fetchStats = async () => {
    const token = authUtils.getToken()
    if (!token) {
      setError("Chưa đăng nhập")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/User/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setError(null)
      } else {
        const errorText = await response.text()
        console.error("API error:", response.status, errorText)
        setError(`Lỗi API: ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError("Không thể kết nối API")
    }
  }

  const fetchRecentReports = async () => {
    const token = authUtils.getToken()
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/Report?page=1&pageSize=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // data có thể là array hoặc object với items
        const items = Array.isArray(data) ? data : (data.items || [])
        setRecentReports(items)
      } else {
        console.error("Report API error:", response.status)
        setRecentReports([])
      }
    } catch (error) {
      console.error("Error fetching recent reports:", error)
      setRecentReports([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-muted-foreground mb-2">Không thể tải dữ liệu</p>
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={() => { fetchStats(); fetchRecentReports(); }} variant="outline" className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +{stats.newUsersToday}
              </span>{" "}
              hôm nay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +{stats.newPostsToday}
              </span>{" "}
              hôm nay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bình luận</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Trên tất cả bài viết</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Báo cáo chờ xử lý</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Cần được xem xét</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% tổng người dùng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tài khoản bị khóa</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lockedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.lockedUsers / stats.totalUsers) * 100).toFixed(1)}% tổng người dùng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ tương tác</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Bình luận/bài viết</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê báo cáo</CardTitle>
          <CardDescription>Chi tiết về các báo cáo vi phạm trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldAlert className="h-4 w-4 text-blue-500" />
                Báo cáo người dùng
              </div>
              <div className="text-2xl font-bold">{stats.userReports}</div>
              <p className="text-xs text-muted-foreground">
                {stats.userReports > 0 
                  ? `${((stats.userReports / (stats.userReports + stats.postReports + stats.commentReports)) * 100).toFixed(0)}% tổng`
                  : "Không có"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-purple-500" />
                Báo cáo bài viết
              </div>
              <div className="text-2xl font-bold">{stats.postReports}</div>
              <p className="text-xs text-muted-foreground">
                {stats.postReports > 0 
                  ? `${((stats.postReports / (stats.userReports + stats.postReports + stats.commentReports)) * 100).toFixed(0)}% tổng`
                  : "Không có"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                Báo cáo bình luận
              </div>
              <div className="text-2xl font-bold">{stats.commentReports}</div>
              <p className="text-xs text-muted-foreground">
                {stats.commentReports > 0 
                  ? `${((stats.commentReports / (stats.userReports + stats.postReports + stats.commentReports)) * 100).toFixed(0)}% tổng`
                  : "Không có"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Đã xử lý
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedReports}</div>
              <p className="text-xs text-muted-foreground">Báo cáo</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <XCircle className="h-4 w-4 text-gray-500" />
                Đã từ chối
              </div>
              <div className="text-2xl font-bold text-gray-600">{stats.rejectedReports}</div>
              <p className="text-xs text-muted-foreground">Báo cáo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Báo cáo gần nhất</CardTitle>
              <CardDescription>5 báo cáo mới nhất trong hệ thống</CardDescription>
            </div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={report.reportedByAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{report.reportedByName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{report.reportedByName || "Unknown"}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            report.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : report.status === "Resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {report.status === "Pending" ? "Chờ xử lý" : report.status === "Resolved" ? "Đã xử lý" : "Đã từ chối"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        <span className="font-medium">{report.contentType}</span> • {report.reason}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateOnlyGMT7(report.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Không có báo cáo nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <CardDescription>Truy cập nhanh các chức năng quản lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Users className="mr-2 h-5 w-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">Quản lý người dùng</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeUsers} hoạt động • {stats.lockedUsers} bị khóa
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/admin/posts">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="mr-2 h-5 w-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">Quản lý bài viết</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalPosts} bài viết • {stats.postReports} báo cáo
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/admin/comments">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">Quản lý bình luận</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalComments} bình luận • {stats.commentReports} báo cáo
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              {stats.pendingReports > 0 && (
                <Link href="/admin/users">
                  <Button className="w-full justify-start" size="lg">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    <div className="flex-1 text-left">
                      <p className="font-medium">Xử lý báo cáo</p>
                      <p className="text-xs opacity-90">{stats.pendingReports} báo cáo chờ xử lý</p>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tổng dữ liệu</p>
              <p className="text-2xl font-bold">
                {(stats.totalUsers + stats.totalPosts + stats.totalComments).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Users + Posts + Comments</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Hoạt động hôm nay</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.newUsersToday + stats.newPostsToday}
              </p>
              <p className="text-xs text-muted-foreground">Users mới + Posts mới</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cần xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
              <p className="text-xs text-muted-foreground">Báo cáo chờ kiểm duyệt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.pendingReports > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                <AlertCircle className="h-4 w-4" />
                <span>Có {stats.pendingReports} báo cáo đang chờ xử lý</span>
              </div>
            )}
            {stats.lockedUsers > 5 && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                <Lock className="h-4 w-4" />
                <span>Có {stats.lockedUsers} tài khoản đang bị khóa</span>
              </div>
            )}
            {stats.userReports > 10 && (
              <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                <ShieldAlert className="h-4 w-4" />
                <span>Có {stats.userReports} báo cáo về người dùng cần xem xét</span>
              </div>
            )}
            {stats.pendingReports === 0 && stats.lockedUsers <= 5 && stats.userReports <= 10 && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span>Hệ thống đang hoạt động bình thường</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
