"use client"

import { useState, useRef } from "react"
import { X } from "lucide-react"

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

  if (!open) return null

  // Handler cho overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Nếu click vào overlay (không phải modal content)
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  return (
    <>
      {/* Dark Overlay + Modal Content */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div className="relative w-full flex flex-col items-center justify-center">
          {/* Avatar Image */}
          <div className="relative">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt={userName}
              className="max-w-[1080px] max-h-[600px] object-contain rounded-lg"
            />

            {/* Edit/Close Button - Only show if onAvatarChange is provided */}
            {onAvatarChange && (
              <button
                onClick={handleUploadClick}
                className="absolute top-0 -right-14 hover:opacity-80 transition"
              >
                <img
                  src="/edit_avatar.png"
                  alt="Đổi avatar"
                  className="w-10 h-10"
                />
              </button>
            )}
          </div>

          {/* Save/Cancel Buttons - Show when changes are made */}
          {hasChanges && onAvatarChange && (
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition"
              >
                Lưu
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-white text-foreground rounded-lg hover:bg-gray-100 font-medium transition"
              >
                Hủy
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
    </>
  )
}
