"use client"

import { useState, useEffect } from "react"
import { ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { SafeAvatar } from "@/components/safe-avatar"
import type { Post } from "@/lib/types"

const MAX_IMAGES = 5

interface CreatePostBoxProps {
  onPostCreate?: (newPost: Post) => void
}

export function CreatePostBox({ onPostCreate }: CreatePostBoxProps) {
  const { isAuthenticated, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [caption, setCaption] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
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
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_IMAGES - selectedFiles.length
    const toAdd = files.slice(0, remaining)

    for (const file of toAdd) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB")
        return
      }
    }

    setError("")
    setSelectedFiles(prev => [...prev, ...toAdd])

    // Create previews
    const previews = await Promise.all(
      toAdd.map(
        file =>
          new Promise<string>(resolve => {
            const reader = new FileReader()
            reader.onload = e => resolve(e.target?.result as string)
            reader.readAsDataURL(file)
          })
      )
    )
    setImagePreviews(prev => [...prev, ...previews])

    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setCaption("")
    setSelectedFiles([])
    setImagePreviews([])
    setUploadedImageUrls([])
    setError("")
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
        setTimeout(() => (window.location.href = "/auth/login"), 2000)
        return
      }

      // Upload all selected images sequentially
      const finalImageUrls: string[] = []
      if (selectedFiles.length > 0) {
        setIsUploading(true)
        for (const file of selectedFiles) {
          const formData = new FormData()
          formData.append("file", file)

          const uploadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/upload/image`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          )

          const uploadData = await uploadResponse.json()
          if (!uploadResponse.ok || !uploadData.success) {
            setError(uploadData.message || "Upload ảnh thất bại")
            setIsLoading(false)
            setIsUploading(false)
            return
          }

          const url = uploadData.url.startsWith("http")
            ? uploadData.url
            : `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}${uploadData.url}`
          finalImageUrls.push(url)
        }
        setIsUploading(false)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: caption.trim(),
            imageUrl: finalImageUrls[0] ?? null,
            imageUrls: finalImageUrls.length > 0 ? finalImageUrls : null,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
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
            image: finalImageUrls[0] ?? undefined,
            images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
            likes: 0,
            comments: 0,
            isLiked: false,
            isSaved: false,
            createdAt: new Date().toISOString(),
          }

          resetForm()
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

  const canAddMore = selectedFiles.length < MAX_IMAGES

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start gap-3">
        {user && (
          <>
            <SafeAvatar src={user.avatarUrl} alt={user.fullName} className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold">{user.fullName}</h3>
            </div>
          </>
        )}
        <button
          onClick={() => { setIsOpen(false); resetForm() }}
          className="text-2xl text-muted-foreground transition hover:text-foreground"
        >
          ×
        </button>
      </div>

      <textarea
        value={caption}
        onChange={e => setCaption(e.target.value)}
        placeholder="Chia sẻ suy nghĩ của bạn"
        className="mb-4 w-full resize-none rounded-lg bg-gray-100 p-3 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        rows={4}
        disabled={isLoading}
      />

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Image Previews Grid */}
      {imagePreviews.length > 0 && (
        <div className={`mb-4 grid gap-2 ${
          imagePreviews.length === 1 ? "grid-cols-1" :
          imagePreviews.length === 2 ? "grid-cols-2" :
          imagePreviews.length === 3 ? "grid-cols-3" :
          "grid-cols-2"
        }`}>
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden bg-secondary aspect-square">
              <img
                src={preview}
                alt={`Ảnh ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                type="button"
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                title="Xóa ảnh"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex items-center gap-3 border-t border-border pt-4">
        {/* Add image button — hidden when max reached */}
        {canAddMore && (
          <label className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition">
            <ImageIcon className="h-5 w-5" />
            <span className="text-sm">
              Thêm ảnh {selectedFiles.length > 0 ? `(${selectedFiles.length}/${MAX_IMAGES})` : ""}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading || isUploading}
            />
          </label>
        )}
        {!canAddMore && (
          <span className="text-sm text-muted-foreground">
            Đã đính kèm tối đa {MAX_IMAGES} ảnh
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 bg-transparent"
          onClick={() => { setIsOpen(false); resetForm() }}
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
