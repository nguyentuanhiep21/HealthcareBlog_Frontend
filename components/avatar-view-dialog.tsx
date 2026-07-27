"use client"

import { useState, useRef } from "react"
import { X, Camera, Check } from "lucide-react"

interface AvatarViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  avatarUrl: string
  userName: string
  onAvatarChange?: (file: File) => void
}

export function AvatarViewDialog({
  open,
  onOpenChange,
  avatarUrl,
  userName,
  onAvatarChange,
}: AvatarViewDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setSelectedFile(file)
      setHasChanges(true)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = () => {
    if (selectedFile && onAvatarChange) {
      onAvatarChange(selectedFile)
      setHasChanges(false)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(avatarUrl)
    setSelectedFile(null)
    setHasChanges(false)
  }

  const handleClose = () => {
    handleCancel()
    onOpenChange(false)
  }

  if (!open) return null

  // Handler cho overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Nếu click vào overlay (không phải modal content)
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      {/* Nút đóng góc trên phải */}
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative w-full max-w-lg flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
        
        {/* Avatar Image Wrapper */}
        <div className="relative group">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt={userName}
            className="w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] object-cover rounded-full shadow-2xl ring-4 ring-white/10"
          />

          {/* Edit Button - Only show if onAvatarChange is provided */}
          {onAvatarChange && !hasChanges && (
            <button
              onClick={handleUploadClick}
              className="absolute bottom-6 right-6 h-16 w-16 bg-teal-600 hover:bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            >
              <Camera className="h-7 w-7" />
            </button>
          )}
        </div>

        {/* Save/Cancel Buttons - Show when changes are made */}
        {hasChanges && onAvatarChange && (
          <div className="mt-8 flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg animate-in slide-in-from-bottom-4">
            <button
              onClick={handleCancel}
              className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="h-12 px-8 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold shadow-md transition-transform hover:scale-105 flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              Lưu ảnh mới
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
