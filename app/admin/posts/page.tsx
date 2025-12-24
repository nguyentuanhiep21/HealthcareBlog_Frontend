"use client"

import { useState, useEffect } from "react"
import { Search, AlertCircle, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"

interface ViewPostDTO {
  id: number
  userId: string
  userName: string
  userAvatar: string | null
  content: string
  imageUrl: string | null
  likesCount: number
  commentsCount: number
  isLikedByUser: boolean
  isSavedByUser: boolean
  isFollowedByUser: boolean
  createdAt: string
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api"

export default function AdminPostsPage() {
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<ViewPostDTO[]>([])
  const [reports, setReports] = useState<ViewReportDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    if (searchQuery) {
      fetchPosts()
    }
  }, [searchQuery])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchPosts = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/Post/admin/all?searchQuery=${encodeURIComponent(searchQuery)}&page=1&pageSize=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    if (!token) return

    setReportLoading(true)
    try {
      const response = await fetch(`${API_URL}/Report?contentType=Post&status=Pending`, {
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

  const handleDeletePost = async (postId: number) => {
    if (!token || !confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return

    try {
      const response = await fetch(`${API_URL}/Post/admin/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        if (searchQuery) {
          fetchPosts()
        }
      }
    } catch (error) {
      console.error("Error deleting post:", error)
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
        <h1 className="text-3xl font-bold">Quản lý bài viết</h1>
        <p className="text-muted-foreground">Tìm kiếm bài viết hoặc xem báo cáo vi phạm</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm bài viết theo nội dung hoặc tác giả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Kết quả tìm kiếm ({posts.length})</h2>
          {loading ? (
            <p className="text-center text-muted-foreground">Đang tải...</p>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.userAvatar || "/placeholder.svg"} alt={post.userName} />
                      <AvatarFallback>{post.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.userName}</p>
                      <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                    </div>
                  </div>

                  <p className="text-sm">{post.content}</p>

                  {post.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden rounded-lg">
                      <Image src={post.imageUrl || "/placeholder.svg"} alt="Post" fill className="object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{post.likesCount} lượt thích</span>
                    <span>{post.commentsCount} bình luận</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa bài viết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Không tìm thấy bài viết nào</p>
          )}
        </div>
      )}

      {/* Reports List */}
      {!searchQuery && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Báo cáo bài viết ({reports.filter((r) => r.status === "Pending").length} chờ xử lý)
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
                    <p className="text-sm font-medium">Bài viết bị báo cáo:</p>
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{report.targetContent}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Lý do báo cáo:</p>
                    <p className="text-sm text-muted-foreground">{report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    )}
                  </div>

                  {report.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleResolveReport(report.id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Xử lý
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectReport(report.id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Từ chối
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
    </div>
  )
}
