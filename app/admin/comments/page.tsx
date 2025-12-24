"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Trash2, FileText, XCircle, MessageSquare } from "lucide-react"
import { authUtils } from "@/lib/auth-utils"
import { formatDateGMT7 } from "@/lib/time-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ActionResultDialog } from "@/components/action-result-dialog"

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

export default function AdminCommentsPage() {
  const [reports, setReports] = useState<ViewReportDTO[]>([])
  const [reportFilter, setReportFilter] = useState<"all" | "Pending" | "Resolved" | "Rejected">("all")
  const [reportLoading, setReportLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", description: "", onConfirm: () => {}, isDestructive: false })
  const [resultDialog, setResultDialog] = useState({ isOpen: false, message: "", isSuccess: false })
  const [isProcessing, setIsProcessing] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"

  const getFullAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder.svg"
    if (avatarUrl && avatarUrl.startsWith("http")) return avatarUrl
    return `${backendUrl}${avatarUrl}`
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const token = authUtils.getToken()
    if (!token) return

    setReportLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/Report?contentType=Comment`, {
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

  const handleProcessCommentReport = async (reportId: number, action: "Delete" | "Ignore", report: ViewReportDTO) => {
    const title = action === "Delete" ? "Xóa bình luận" : "Bỏ qua báo cáo"
    const description = action === "Delete"
      ? `Bạn có chắc chắn muốn xóa bình luận này không?\n\nLý do báo cáo: ${report.reason}${report.description ? "\nChi tiết: " + report.description : ""}`
      : `Bỏ qua báo cáo này?\n\nLý do: ${report.reason}`

    setConfirmDialog({
      isOpen: true,
      title,
      description,
      isDestructive: action === "Delete",
      onConfirm: async () => {
        setIsProcessing(true)
        try {
          const token = authUtils.getToken()
          if (!token) return

          const response = await fetch(`${API_URL}/api/Report/${reportId}/process-comment`, {
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
              message: `Đã ${action === "Delete" ? "xóa bình luận" : "bỏ qua báo cáo"} thành công!`,
              isSuccess: true,
            })
            fetchReports()
          } else {
            let errorMessage = "Đã xảy ra lỗi"
            const contentType = response.headers.get("content-type")

            if (contentType?.includes("application/json")) {
              const errorData = await response.json()
              errorMessage = errorData.message || errorData.title || errorMessage
            }
            setResultDialog({
              isOpen: true,
              message: errorMessage,
              isSuccess: false,
            })
          }
        } catch (error) {
          console.error("Error processing report:", error)
          setResultDialog({
            isOpen: true,
            message: "Đã xảy ra lỗi khi xử lý báo cáo",
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
        <h1 className="text-3xl font-bold">Quản lý bình luận</h1>
        <p className="text-muted-foreground">Xem và xử lý báo cáo vi phạm bình luận</p>
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
            <FileText className="h-5 w-5 text-green-600" />
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
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Tổng báo cáo</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Reports Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Báo cáo bình luận</h2>
        <div className="flex gap-2">
          <Button
            variant={reportFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setReportFilter("all")}
          >
            Tất cả ({stats.total})
          </Button>
          <Button
            variant={reportFilter === "Pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setReportFilter("Pending")}
          >
            Chờ xử lý ({stats.pending})
          </Button>
          <Button
            variant={reportFilter === "Resolved" ? "default" : "outline"}
            size="sm"
            onClick={() => setReportFilter("Resolved")}
          >
            Đã giải quyết ({stats.resolved})
          </Button>
          <Button
            variant={reportFilter === "Rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setReportFilter("Rejected")}
          >
            Đã từ chối ({stats.rejected})
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
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

                  {/* Target Comment Author */}
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                    <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-300">
                      ⚠️ TÁC GIẢ BÌNH LUẬN
                    </p>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={getFullAvatarUrl(report.targetUserAvatar)}
                          alt={report.targetUserName || "User"}
                        />
                        <AvatarFallback>{(report.targetUserName || "U")[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{report.targetUserName || "Đã xóa"}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.targetUserId ? `ID: ${report.targetUserId}` : "Người dùng đã bị xóa"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                  <p className="mb-2 text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    💬 NỘI DUNG BÌNH LUẬN
                  </p>
                  <p className="text-sm line-clamp-3">{report.targetContent || "Nội dung không khả dụng"}</p>
                </div>

                {/* Report Reason */}
                <div>
                  <p className="text-sm font-medium">Lý do báo cáo: {report.reason}</p>
                  {report.description && (
                    <p className="text-sm text-muted-foreground mt-1">Chi tiết: {report.description}</p>
                  )}
                </div>

                {report.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleProcessCommentReport(report.id, "Delete", report)}
                      className="gap-2"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa bình luận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProcessCommentReport(report.id, "Ignore", report)}
                      className="gap-2"
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4" />
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
      />    </div>
  )
}
