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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose} 
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
              <Flag className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Báo cáo {targetType === "post" ? "bài viết" : targetType === "comment" ? "bình luận" : "người dùng"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5">
          <div>
            <label className="text-[15px] font-semibold text-slate-900 dark:text-white mb-3 block">Chọn lý do báo cáo</label>
            <div className="space-y-2.5">
              {reasons[targetType].map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedReason === reason 
                      ? "border-rose-500 border-[6px]" 
                      : "border-slate-300 dark:border-slate-600 group-hover:border-rose-400"
                  }`} />
                  <span className={`text-[15px] transition-colors ${
                    selectedReason === reason 
                      ? "font-semibold text-slate-900 dark:text-white" 
                      : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                  }`}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[15px] font-semibold text-slate-900 dark:text-white mb-2 block">Chi tiết (tùy chọn)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-h-[100px] resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedReason} 
            className="flex-1 h-12 rounded-full font-semibold shadow-sm transition-all bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:hover:bg-rose-600"
          >
            Gửi báo cáo
          </Button>
        </div>
      </div>
    </div>
  )
}
