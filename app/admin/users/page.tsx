"use client"

import { useState } from "react"
import { Search, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { mockUsers, mockReports } from "@/lib/mock-data"
import type { Report } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reports, setReports] = useState<Report[]>(mockReports.filter((r) => r.type === "user"))

  // Filter users based on search
  const allUsers = Object.values(mockUsers)
  const filteredUsers = searchQuery
    ? allUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const handleResolve = (reportId: string) => {
    setReports(reports.map((r) => (r.id === reportId ? { ...r, status: "resolved" as const } : r)))
  }

  const handleReject = (reportId: string) => {
    setReports(reports.map((r) => (r.id === reportId ? { ...r, status: "rejected" as const } : r)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground">Tìm kiếm người dùng hoặc xem báo cáo vi phạm</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm người dùng theo tên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Kết quả tìm kiếm ({filteredUsers.length})</h2>
          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.bio}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.followers} người theo dõi • {user.following} đang theo dõi
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                    <Button variant="destructive" size="sm">
                      Khóa tài khoản
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
          <h2 className="text-xl font-semibold">
            Báo cáo người dùng ({reports.filter((r) => r.status === "pending").length} chờ xử lý)
          </h2>
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-semibold">Báo cáo bởi: {report.reportedBy.name}</p>
                        <p className="text-sm text-muted-foreground">{report.createdAt}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        report.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : report.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {report.status === "pending"
                        ? "Chờ xử lý"
                        : report.status === "resolved"
                          ? "Đã giải quyết"
                          : "Đã từ chối"}
                    </span>
                  </div>

                  <div className="rounded bg-secondary/50 p-3">
                    <p className="text-sm font-medium">Người dùng bị báo cáo:</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={report.targetAuthor.avatar || "/placeholder.svg"}
                          alt={report.targetAuthor.name}
                        />
                        <AvatarFallback>{report.targetAuthor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{report.targetAuthor.name}</p>
                        <p className="text-xs text-muted-foreground">{report.targetAuthor.bio}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Lý do báo cáo:</p>
                    <p className="text-sm text-muted-foreground">{report.reason}</p>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleResolve(report.id)} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Xử lý
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(report.id)} className="gap-2">
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
