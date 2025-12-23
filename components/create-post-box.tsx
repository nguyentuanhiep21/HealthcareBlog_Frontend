"use client"

import { useState, useEffect } from "react"
import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import type { Post } from "@/lib/types"

interface CreatePostBoxProps {
  onPostCreate?: (newPost: Post) => void
}

export function CreatePostBox({ onPostCreate }: CreatePostBoxProps) {
  const { isAuthenticated, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [caption, setCaption] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setIsOpen(true)
    setError("")
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Vui lòng chọn file ảnh")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB")
      return
    }

    setSelectedFile(file)
    setError("")

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setUploadedImageUrl(null)
  }

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError("Vui lòng nhập nội dung bài viết")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setError("Vui lòng đăng nhập lại")
        setTimeout(() => window.location.href = "/auth/login", 2000)
        return
      }

      // Upload image first if selected
      let finalImageUrl: string | null = null
      if (selectedFile && !uploadedImageUrl) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/upload/image`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: formData,
          }
        )

        const uploadData = await uploadResponse.json()
        setIsUploading(false)

        if (!uploadResponse.ok || !uploadData.success) {
          setError(uploadData.message || "Upload ảnh thất bại")
          setIsLoading(false)
          return
        }

        finalImageUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}${uploadData.url}`
        setUploadedImageUrl(finalImageUrl)
      } else if (uploadedImageUrl) {
        finalImageUrl = uploadedImageUrl
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: caption.trim(),
            imageUrl: finalImageUrl,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        // Create post object for UI update
        if (user) {
          const newPost: Post = {
            id: data.data.id.toString(),
            author: {
              id: user.id,
              name: user.fullName,
              avatar: user.avatarUrl,
              bio: "",
              followers: 0,
              following: 0,
              isFollowing: false,
            },
            caption: caption.trim(),
            image: finalImageUrl || undefined,
            likes: 0,
            comments: 0,
            isLiked: false,
            isSaved: false,
            createdAt: new Date().toISOString(),
          }

          setCaption("")
          setSelectedFile(null)
          setImagePreview(null)
          setUploadedImageUrl(null)
          setIsOpen(false)
          onPostCreate?.(newPost)
        }
      } else {
        setError(data.message || "Đăng bài thất bại. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Create post error:", error)
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex gap-3">
          {isAuthenticated && user && (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <button
            onClick={handleOpenCreate}
            className="flex-1 rounded-full border border-border bg-gray-100 px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-gray-200"
          >
            {isAuthenticated && user ? `${user.fullName}, bạn đang nghĩ gì?` : "Bạn đang nghĩ gì?"}
          </button>
        </div>
        <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start gap-3">
        {user && (
          <>
            <img src={user.avatarUrl} alt={user.fullName} className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold">{user.fullName}</h3>
            </div>
          </>
        )}
        <button
          onClick={() => {
            setIsOpen(false)
            setCaption("")
            handleRemoveImage()
          }}
          className="text-2xl text-muted-foreground transition hover:text-foreground"
        >
          ×
        </button>
      </div>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Chia sẻ suy nghĩ của bạn"
        className="mb-4 w-full resize-none rounded-lg bg-gray-100 p-3 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        rows={6}
        disabled={isLoading}
      />

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {imagePreview && (
        <div className="mb-4 relative bg-secondary rounded-lg overflow-hidden">
          <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-background/90 text-foreground rounded-full h-8 w-8 flex items-center justify-center hover:bg-background transition"
            type="button"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-4 flex gap-2 border-t border-border pt-4">
        <label className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition">
          <ImageIcon className="h-5 w-5" />
          <span className="text-sm">Thêm ảnh</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading || isUploading}
          />
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 bg-transparent"
          onClick={() => {
            setIsOpen(false)
            setCaption("")
            handleRemoveImage()
            setError("")
          }}
          disabled={isLoading || isUploading}
        >
          Hủy
        </Button>
        <Button
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={!caption.trim() || isLoading || isUploading}
        >
          {isUploading ? "Đang tải ảnh..." : isLoading ? "Đang đăng..." : "Đăng"}
        </Button>
      </div>
    </div>
  )
}
