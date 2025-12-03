"use client"

import { useState } from "react"
import { X, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, details: string) => void
  targetType: "user" | "post" | "comment"
}

export function ReportDialog({ isOpen, onClose, onSubmit, targetType }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [details, setDetails] = useState("")

  const reasons = {
    post: [
      "Spam hoặc quảng cáo",
      "Nội dung không phù hợp",
      "Bạo lực hoặc nguy hiểm",
      "Thông tin sai lệch",
      "Quấy rối hoặc bắt nạt",
      "Vi phạm bản quyền",
      "Lý do khác",
    ],
    comment: [
      "Spam hoặc quảng cáo",
      "Ngôn từ thù địch",
      "Bạo lực hoặc nguy hiểm",
      "Quấy rối hoặc bắt nạt",
      "Thông tin sai lệch",
      "Lý do khác",
    ],
    user: ["Mạo danh", "Spam hoặc quảng cáo", "Hành vi không phù hợp", "Quấy rối hoặc bắt nạt", "Lý do khác"],
  }

  const handleSubmit = () => {
    if (!selectedReason) return
    onSubmit(selectedReason, details)
    setSelectedReason("")
    setDetails("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold text-foreground">
              Báo cáo {targetType === "post" ? "bài viết" : targetType === "comment" ? "bình luận" : "người dùng"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary transition">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Chọn lý do báo cáo</label>
            <div className="space-y-2">
              {reasons[targetType].map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Chi tiết (tùy chọn)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedReason} className="flex-1">
            Gửi báo cáo
          </Button>
        </div>
      </div>
    </div>
  )
}
