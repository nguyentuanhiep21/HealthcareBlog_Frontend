"use client"

import { useState, useEffect } from "react"
import { ImageIcon, X, Send, AlertCircle, ImagePlus } from "lucide-react"
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

  const canAddMore = selectedFiles.length < MAX_IMAGES

  if (!isOpen) {
    return (
      <div className="mb-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex gap-4 items-center">

          <button
            onClick={handleOpenCreate}
            className="flex-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-3.5 text-left text-[15px] text-slate-500 dark:text-slate-400 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-teal-500/30 hover:shadow-[0_2px_10px_-3px_rgba(13,148,136,0.1)]"
          >
            Bạn có chia sẻ gì về chủ đề sức khỏe không?
          </button>
          <div className="hidden sm:flex gap-2">
             <button onClick={handleOpenCreate} className="p-3 rounded-full text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors" title="Thêm ảnh">
                <ImagePlus className="h-[22px] w-[22px]" />
             </button>
          </div>
        </div>
        <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-3xl border border-teal-500/20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_8px_30px_-4px_rgba(13,148,136,0.1)] p-5 md:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{user.fullName}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-900/30 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                    Công khai
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => { setIsOpen(false); resetForm() }}
          className="rounded-full p-2 h-9 w-9 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <textarea
        value={caption}
        onChange={e => setCaption(e.target.value)}
        placeholder="Bạn có chia sẻ gì về chủ đề sức khỏe không?"
        className="mb-4 w-full resize-none bg-transparent px-2 py-3 text-[16px] leading-relaxed outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[120px] border-none focus:ring-0 text-slate-900 dark:text-slate-100"
        rows={4}
        disabled={isLoading}
      />

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-rose-600 dark:text-rose-400 text-[14px] font-medium flex items-center gap-2 animate-in zoom-in-95">
           <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="mb-5 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0 group rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" style={{ width: 140, height: 140 }}>
              <img
                src={preview}
                alt={`Ảnh ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                type="button"
                className="absolute top-2 right-2 bg-black/50 backdrop-blur-md hover:bg-rose-600 text-white rounded-full h-7 w-7 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                title="Xóa ảnh"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
        {/* Add image button */}
        <div className="flex items-center gap-2">
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-colors ${canAddMore ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold' : 'text-slate-400 opacity-50 cursor-not-allowed font-medium'}`}>
              <ImageIcon className="h-5 w-5" />
              <span className="text-[14px] hidden sm:inline-block">
                Ảnh/Video {selectedFiles.length > 0 ? `(${selectedFiles.length}/${MAX_IMAGES})` : ""}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={!canAddMore || isLoading || isUploading}
              />
            </label>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="rounded-full h-11 px-6 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            onClick={() => { setIsOpen(false); resetForm() }}
            disabled={isLoading || isUploading}
          >
            Hủy
          </Button>
          <Button
            className="rounded-full h-11 px-8 font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:hover:shadow-none"
            onClick={handleSubmit}
            disabled={!caption.trim() || isLoading || isUploading}
          >
            {isUploading ? "Đang tải ảnh..." : isLoading ? "Đang đăng..." : (
               <span className="flex items-center gap-2">
                 Đăng bài <Send className="h-4 w-4" />
               </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
