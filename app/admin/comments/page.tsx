"use client"

import { useState, useEffect } from "react"
import { Search, AlertCircle, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api"

export default function AdminCommentsPage() {
  const { token } = useAuth()
  const [reports, setReports] = useState<ViewReportDTO[]>([])
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    if (!token) return

    setReportLoading(true)
    try {
      const response = await fetch(`${API_URL}/Report?contentType=Comment&status=Pending`, {
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

  const handleDeleteComment = async (commentId: string) => {
    if (!token || !confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return

    try {
      const response = await fetch(`${API_URL}/Comment/admin/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Refresh reports after deletion
        fetchReports()
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleResolveReport = async (reportId: number) => {
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/Report/${reportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "Resolved",
          adminNote: "Đã xử lý",
        }),
      })

      if (response.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error("Error resolving report:", error)
    }
  }

  const handleRejectReport = async (reportId: number) => {
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/Report/${reportId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "Rejected",
          adminNote: "Từ chối xử lý",
        }),
      })

      if (response.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error("Error rejecting report:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý bình luận</h1>
        <p className="text-muted-foreground">Xem báo cáo vi phạm bình luận</p>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Báo cáo bình luận ({reports.filter((r) => r.status === "Pending").length} chờ xử lý)
        </h2>
        {reportLoading ? (
          <p className="text-center text-muted-foreground">Đang tải...</p>
        ) : reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-semibold">Báo cáo bởi: {report.reportedByName}</p>
                      <p className="text-sm text-muted-foreground">{report.createdAt}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      report.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : report.status === "Resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {report.status === "Pending"
                      ? "Chờ xử lý"
                      : report.status === "Resolved"
                        ? "Đã giải quyết"
                        : "Đã từ chối"}
                  </span>
                </div>

                <div className="rounded bg-secondary/50 p-3">
                  <p className="text-sm font-medium">Bình luận bị báo cáo:</p>
                  <div className="mt-2 flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={report.targetUserAvatar || "/placeholder.svg"}
                        alt={report.targetUserName || "User"}
                      />
                      <AvatarFallback>{(report.targetUserName || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{report.targetUserName}</p>
                      <p className="text-sm text-muted-foreground">{report.targetContent}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Lý do báo cáo:</p>
                  <p className="text-sm text-muted-foreground">{report.reason}</p>
                  {report.description && <p className="text-sm text-muted-foreground mt-1">{report.description}</p>}
                </div>

                {report.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleResolveReport(report.id)} className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Xử lý
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectReport(report.id)} className="gap-2">
                      <XCircle className="h-4 w-4" />
                      Từ chối
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteComment(report.contentId)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa bình luận
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
    </div>
  )
}
