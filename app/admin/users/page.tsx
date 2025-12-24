"use client"

import { useState, useEffect } from "react"
import { Search, AlertCircle, CheckCircle, XCircle, Lock, Unlock, Trash2, Users } from "lucide-react"
import type { Report } from "@/lib/types"
import { authUtils } from "@/lib/auth-utils"
import { formatDateGMT7 } from "@/lib/time-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ActionResultDialog } from "@/components/action-result-dialog"

interface AdminUser {
  id: string
  username: string
  email: string
  fullName: string | null
  bio: string | null
  avatarUrl: string | null
  followersCount: number
  followingCount: number
  postsCount: number
  isLocked: boolean
  createdAt: string
  lockedAt: string | null
}

interface ViewReportDTO {
  id: number
  reportedById: string
  reportedByName: string
  reportedByAvatar: string | null
  contentType: string
  contentId: string
  reason: string
  description: string | null
  status: string
  adminNote: string | null
  createdAt: string
  resolvedAt: string | null
  targetUserId: string | null
  targetUserName: string | null
  targetUserAvatar: string | null
  targetContent: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [reports, setReports] = useState<ViewReportDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportFilter, setReportFilter] = useState<"all" | "Pending" | "Resolved" | "Rejected">("all")
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", description: "", onConfirm: () => {}, isDestructive: false })
  const [resultDialog, setResultDialog] = useState({ isOpen: false, message: "", isSuccess: false })
  const [isProcessing, setIsProcessing] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"

  const getFullAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder.svg"
    if (avatarUrl.startsWith("http")) return avatarUrl
    return `${backendUrl}${avatarUrl}`
  }

  // Fetch users when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      fetchUsers()
    }
  }, [searchQuery])

  // Fetch reports on mount
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchUsers = async () => {
    const token = authUtils.getToken()
    if (!token) return
    
    setLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/User/admin/all?searchQuery=${encodeURIComponent(searchQuery)}&page=1&pageSize=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    const token = authUtils.getToken()
    if (!token) return
    
    setReportLoading(true)
    try {
      // Fetch all user reports (no status filter, we'll filter on client side)
      const response = await fetch(`${API_URL}/api/Report?contentType=User`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setReportLoading(false)
    }
  }

  const handleToggleLock = async (userId: string, isCurrentlyLocked: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: isCurrentlyLocked ? "Mở khóa tài khoản" : "Khóa tài khoản",
      description: isCurrentlyLocked 
        ? "Bạn có chắc chắn muốn mở khóa tài khoản này không?"
        : "Bạn có chắc chắn muốn khóa tài khoản này không?",
      isDestructive: !isCurrentlyLocked,
      onConfirm: async () => {
        setIsProcessing(true)
        try {
          const token = authUtils.getToken()
          if (!token) return

          const response = await fetch(`${API_URL}/api/User/${userId}/toggle-lock`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reason: isCurrentlyLocked ? null : "Khóa bởi admin",
            }),
          })

          if (response.ok) {
            setConfirmDialog({ ...confirmDialog, isOpen: false })
            setResultDialog({
              isOpen: true,
              message: isCurrentlyLocked ? "Mở khóa tài khoản thành công!" : "Khóa tài khoản thành công!",
              isSuccess: true,
            })
            if (searchQuery) {
              fetchUsers()
            }
          } else {
            setResultDialog({
              isOpen: true,
              message: "Không thể xử lý yêu cầu. Vui lòng thử lại.",
              isSuccess: false,
            })
          }
        } catch (error) {
          console.error("Error toggling user lock:", error)
          setResultDialog({
            isOpen: true,
            message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
            isSuccess: false,
          })
        } finally {
          setIsProcessing(false)
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  const handleDeleteUser = async (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa người dùng",
      description: "⚠️ Bạn có chắc chắn muốn xóa người dùng này không?\n\nHành động này KHÔNG THỂ HOÀN TÁC!",
      isDestructive: true,
      onConfirm: async () => {
        setIsProcessing(true)
        try {
          const token = authUtils.getToken()
          if (!token) return

          const response = await fetch(`${API_URL}/api/User/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            setConfirmDialog({ ...confirmDialog, isOpen: false })
            setResultDialog({
              isOpen: true,
              message: "Xóa người dùng thành công!",
              isSuccess: true,
            })
            if (searchQuery) {
              fetchUsers()
            }
          } else {
            setResultDialog({
              isOpen: true,
              message: "Không thể xóa người dùng. Vui lòng thử lại.",
              isSuccess: false,
            })
          }
        } catch (error) {
          console.error("Error deleting user:", error)
          setResultDialog({
            isOpen: true,
            message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
            isSuccess: false,
          })
        } finally {
          setIsProcessing(false)
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  const handleProcessUserReport = async (reportId: number, action: "Lock" | "Delete" | "Ignore", report: ViewReportDTO) => {
    let title = ""
    let description = ""
    let isDestructive = false

    switch (action) {
      case "Lock":
        title = "Khóa tài khoản"
        description = `Khóa tài khoản "${report.targetUserName}"?\n\nLý do báo cáo: ${report.reason}${report.description ? "\nChi tiết: " + report.description : ""}`
        isDestructive = true
        break
      case "Delete":
        title = "Xóa người dùng"
        description = `⚠️ Xóa tài khoản "${report.targetUserName}" vĩnh viễn?\n\nHành động KHÔNG THỂ HOÀN TÁC!\n\nLý do: ${report.reason}${report.description ? "\nChi tiết: " + report.description : ""}`
        isDestructive = true
        break
      case "Ignore":
        title = "Bỏ qua báo cáo"
        description = `Bỏ qua báo cáo này?\n\nNgười bị báo cáo: ${report.targetUserName}\nLý do: ${report.reason}`
        isDestructive = false
        break
    }

    setConfirmDialog({
      isOpen: true,
      title,
      description,
      isDestructive,
      onConfirm: async () => {
        setIsProcessing(true)
        try {
          const token = authUtils.getToken()
          if (!token) return

          const response = await fetch(`${API_URL}/api/Report/${reportId}/process-user`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action }),
          })

          setConfirmDialog({ ...confirmDialog, isOpen: false })

          if (response.ok) {
            setResultDialog({
              isOpen: true,
              message: `Đã ${action === "Lock" ? "khóa" : action === "Delete" ? "xóa" : "bỏ qua"} thành công!`,
              isSuccess: true,
            })
            fetchReports()
          } else {
            let errorMessage = "Không thể xử lý báo cáo"
            try {
              const contentType = response.headers.get("content-type")
              if (contentType?.includes("application/json")) {
                try {
                  const error = await response.json()
                  errorMessage = error.message || error.title || errorMessage
                } catch (parseError) {
                  console.error("Failed to parse JSON error:", parseError)
                  errorMessage = `Lỗi ${response.status}: Không thể xử lý báo cáo`
                }
              } else {
                // For non-JSON responses, try to read text
                try {
                  const text = await response.text()
                  if (text.includes("quản trị viên")) {
                    errorMessage = "Không thể xử lý báo cáo đối với quản trị viên"
                  } else if (text.includes("đã được xử lý")) {
                    errorMessage = "Báo cáo này đã được xử lý"
                  } else {
                    errorMessage = `Lỗi ${response.status}: ${text.substring(0, 100)}`
                  }
                } catch (textError) {
                  errorMessage = `Lỗi ${response.status}: Không thể đọc lỗi từ server`
                }
              }
            } catch (e) {
              console.error("Error handling response:", e)
              errorMessage = `Lỗi ${response.status}: Không thể xử lý báo cáo`
            }
            setResultDialog({
              isOpen: true,
              message: errorMessage,
              isSuccess: false,
            })
          }
        } catch (error) {
          console.error("Error processing user report:", error)
          setResultDialog({
            isOpen: true,
            message: "Có lỗi xảy ra khi xử lý báo cáo",
            isSuccess: false,
          })
        } finally {
          setIsProcessing(false)
        }
      },
    })
  }

  const filteredReports = reportFilter === "all" 
    ? reports 
    : reportFilter === "Resolved"
    ? reports.filter((r) => r.status === "Resolved" || r.targetContent === null)
    : reports.filter((r) => r.status === reportFilter)

  const stats = {
    pending: reports.filter((r) => r.status === "Pending" && r.targetContent !== null).length,
    resolved: reports.filter((r) => r.status === "Resolved" || r.targetContent === null).length,
    rejected: reports.filter((r) => r.status === "Rejected").length,
    total: reports.length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground">Xem và xử lý báo cáo vi phạm người dùng</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Chờ xử lý</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Đã giải quyết</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.resolved}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Đã từ chối</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.rejected}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Tổng báo cáo</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm người dùng theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Kết quả tìm kiếm ({users.length})</h2>
          {loading ? (
            <p className="text-center text-muted-foreground">Đang tải...</p>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getFullAvatarUrl(user.avatarUrl)} alt={user.fullName || user.username} />
                      <AvatarFallback>{(user.fullName || user.username)[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{user.fullName || user.username}</p>
                        {user.isLocked && (
                          <Badge variant="destructive">
                            <Lock className="mr-1 h-3 w-3" />
                            Đã khóa
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.followersCount} người theo dõi • {user.followingCount} đang theo dõi • {user.postsCount}{" "}
                        bài viết
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={user.isLocked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleLock(user.id, user.isLocked)}
                    >
                      {user.isLocked ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Mở khóa
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Khóa tài khoản
                        </>
                      )}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Không tìm thấy người dùng nào</p>
          )}
        </div>
      )}

      {/* Reports List (only show when not searching) */}
      {!searchQuery && (
        <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Báo cáo người dùng</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={reportFilter === "all" ? "default" : "outline"}
              onClick={() => setReportFilter("all")}
            >
              Tất cả ({stats.total})
            </Button>
            <Button
              size="sm"
              variant={reportFilter === "Pending" ? "default" : "outline"}
              onClick={() => setReportFilter("Pending")}
            >
              Chờ xử lý ({stats.pending})
            </Button>
            <Button
              size="sm"
              variant={reportFilter === "Resolved" ? "default" : "outline"}
              onClick={() => setReportFilter("Resolved")}
            >
              Đã giải quyết ({stats.resolved})
            </Button>
            <Button
              size="sm"
              variant={reportFilter === "Rejected" ? "default" : "outline"}
              onClick={() => setReportFilter("Rejected")}
            >
              Đã từ chối ({stats.rejected})
            </Button>
          </div>
        </div>

        {reportLoading ? (
          <p className="text-center text-muted-foreground">Đang tải...</p>
        ) : filteredReports.length > 0 ? (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div key={report.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Báo cáo #{report.id}
                    </span>
                  </div>
                  <Badge
                    variant={
                      report.status === "Pending"
                        ? "warning"
                        : report.status === "Resolved"
                          ? "success"
                          : "secondary"
                    }
                  >
                    {report.status === "Pending"
                      ? "Chờ xử lý"
                      : report.status === "Resolved"
                        ? "Đã giải quyết"
                        : "Đã từ chối"}
                  </Badge>
                </div>

                {/* Reporter and Target Side by Side */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Reporter */}
                  <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                    <p className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      👤 NGƯỜI BÁO CÁO
                    </p>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={getFullAvatarUrl(report.reportedByAvatar)} />
                        <AvatarFallback>{report.reportedByName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{report.reportedByName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateGMT7(report.createdAt, {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Target */}
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                    <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-300">
                      ⚠️ NGƯỜI BỊ BÁO CÁO
                    </p>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={getFullAvatarUrl(report.targetUserAvatar)} />
                        <AvatarFallback>{report.targetUserName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{report.targetUserName}</p>
                        {report.targetContent && (
                          <p className="truncate text-xs text-muted-foreground">{report.targetContent}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Reason */}
                <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                  <p className="mb-1 text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    📋 LÝ DO BÁO CÁO
                  </p>
                  <p className="text-sm font-medium">{report.reason}</p>
                  {report.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{report.description}</p>
                  )}
                </div>

                {/* Actions */}
                {report.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleProcessUserReport(report.id, "Lock", report)}
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Khóa người dùng
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleProcessUserReport(report.id, "Delete", report)}
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa người dùng
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProcessUserReport(report.id, "Ignore", report)}
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Bỏ qua
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Không có báo cáo nào</p>
        )}
      </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        isDestructive={confirmDialog.isDestructive}
        isLoading={isProcessing}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Action Result Dialog */}
      <ActionResultDialog
        isOpen={resultDialog.isOpen}
        message={resultDialog.message}
        isSuccess={resultDialog.isSuccess}
        onClose={() => setResultDialog({ ...resultDialog, isOpen: false })}
      />
    </div>
  )
}
