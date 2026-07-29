"use client"

import { useState, useEffect, useRef } from "react"
import { useClickOutside } from "@/hooks/use-click-outside"
import { Heart, MessageCircle, Bookmark, MoreVertical, Flag, Edit, ImageIcon, X, Trash2 } from "lucide-react"
import type { Post } from "@/lib/types"
import { ReportDialog } from "./report-dialog"
import { LoginRequiredDialog } from "./login-required-dialog"
import { ConfirmDialog } from "./confirm-dialog"
import { ActionResultDialog } from "./action-result-dialog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { formatTimeAgo } from "@/lib/time-utils"
import { authUtils } from "@/lib/auth-utils"
import { getApiUrl } from "@/lib/utils"

const MAX_IMAGES = 5

interface PostCardProps {
  post: Post
  onPostUpdate?: (updatedPost: Post) => void
  onPostDelete?: (postId: string) => void
  currentUser?: { id: string; name: string; avatar: string } | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve images list from post (backward compat)
// ─────────────────────────────────────────────────────────────────────────────
function resolveImages(post: Post): string[] {
  if (post.images && post.images.length > 0) return post.images
  if (post.image) return [post.image]
  return []
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: multi-image grid
// Layout changes depending on number of images (1–5)
// ─────────────────────────────────────────────────────────────────────────────
function PostImageGrid({ images, onClick }: { images: string[]; onClick: () => void }) {
  if (images.length === 0) return null

  const imgCls = "w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
  const overflowWrapperCls = "w-full h-full overflow-hidden relative"
  const containerCls = "mb-4 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-border/50"

  if (images.length === 1) {
    return (
      <div className={`${containerCls} max-h-[550px]`}>
        <div className={`w-full overflow-hidden relative max-h-[550px] bg-slate-900/5 dark:bg-white/5 flex items-center justify-center`}>
          <img src={images[0]} alt="Post" className={`${imgCls} max-h-[550px] w-full object-cover`} onClick={onClick} />
        </div>
      </div>
    )
  }

  const multiContainerCls = `${containerCls} h-[380px] sm:h-[480px]`

  if (images.length === 2) {
    return (
      <div className={`${multiContainerCls} grid grid-cols-2 gap-1 bg-white dark:bg-slate-900 p-1`}>
        {images.map((src, i) => (
          <div key={i} className={`${overflowWrapperCls} rounded-xl`}>
            <img src={src} alt={`Ảnh ${i + 1}`} className={imgCls} onClick={onClick} />
          </div>
        ))}
      </div>
    )
  }

  if (images.length === 3) {
    return (
      <div className={`${multiContainerCls} grid grid-cols-2 grid-rows-2 gap-1 bg-white dark:bg-slate-900 p-1`}>
        <div className={`row-span-2 ${overflowWrapperCls} rounded-xl`}>
          <img src={images[0]} alt="Ảnh 1" className={imgCls} onClick={onClick} />
        </div>
        <div className={`${overflowWrapperCls} rounded-xl`}>
          <img src={images[1]} alt="Ảnh 2" className={imgCls} onClick={onClick} />
        </div>
        <div className={`${overflowWrapperCls} rounded-xl`}>
          <img src={images[2]} alt="Ảnh 3" className={imgCls} onClick={onClick} />
        </div>
      </div>
    )
  }

  if (images.length === 4) {
    return (
      <div className={`${multiContainerCls} grid grid-cols-2 grid-rows-2 gap-1 bg-white dark:bg-slate-900 p-1`}>
        {images.map((src, i) => (
          <div key={i} className={`${overflowWrapperCls} rounded-xl`}>
             <img src={src} alt={`Ảnh ${i + 1}`} className={imgCls} onClick={onClick} />
          </div>
        ))}
      </div>
    )
  }

  // 5 or more images
  return (
    <div className={`${multiContainerCls} grid grid-cols-6 grid-rows-2 gap-1 bg-white dark:bg-slate-900 p-1`}>
      <div className={`col-span-3 ${overflowWrapperCls} rounded-xl`}>
        <img src={images[0]} alt="Ảnh 1" className={imgCls} onClick={onClick} />
      </div>
      <div className={`col-span-3 ${overflowWrapperCls} rounded-xl`}>
        <img src={images[1]} alt="Ảnh 2" className={imgCls} onClick={onClick} />
      </div>
      <div className={`col-span-2 ${overflowWrapperCls} rounded-xl`}>
        <img src={images[2]} alt="Ảnh 3" className={imgCls} onClick={onClick} />
      </div>
      <div className={`col-span-2 ${overflowWrapperCls} rounded-xl`}>
        <img src={images[3]} alt="Ảnh 4" className={imgCls} onClick={onClick} />
      </div>
      <div className={`col-span-2 ${overflowWrapperCls} rounded-xl`}>
        <img src={images[4]} alt="Ảnh 5" className={imgCls} onClick={onClick} />
        {images.length > 5 && (
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-medium cursor-pointer hover:bg-slate-900/70 transition-colors"
            onClick={onClick}
          >
            +{images.length - 5}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PostCard
// ─────────────────────────────────────────────────────────────────────────────
export function PostCard({ post, onPostUpdate, onPostDelete, currentUser }: PostCardProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setIsMenuOpen(false))
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showReportSuccessDialog, setShowReportSuccessDialog] = useState(false)
  const [reportSuccessMessage, setReportSuccessMessage] = useState("")
  const [isReportSuccess, setIsReportSuccess] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [caption, setCaption] = useState(post.caption)
  const [images, setImages] = useState<string[]>(resolveImages(post))
  const [editCaption, setEditCaption] = useState(post.caption)
  const [editImages, setEditImages] = useState<string[]>(resolveImages(post))
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setIsLiked(post.isLiked)
    setLikeCount(post.likes)
    setIsSaved(post.isSaved)
  }, [post.isLiked, post.likes, post.isSaved])

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleLike = async () => {
    if (!isAuthenticated) { setShowLoginDialog(true); return }
    const newIsLiked = !isLiked
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1
    setIsLiked(newIsLiked); setLikeCount(newLikeCount)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/post/${post.id}/${newIsLiked ? "like" : "like"}`, {
        method: newIsLiked ? "POST" : "DELETE",
        headers: authUtils.getAuthHeaders(),
      })
      if (!response.ok) { setIsLiked(!newIsLiked); setLikeCount(newIsLiked ? newLikeCount - 1 : newLikeCount + 1) }
      else if (onPostUpdate) onPostUpdate({ ...post, isLiked: newIsLiked, likes: newLikeCount })
    } catch { setIsLiked(!newIsLiked); setLikeCount(newIsLiked ? newLikeCount - 1 : newLikeCount + 1) }
  }

  const handleSave = async () => {
    if (!isAuthenticated) { setShowLoginDialog(true); return }
    const newIsSaved = !isSaved
    setIsSaved(newIsSaved)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/savedpost/${post.id}`, {
        method: newIsSaved ? "POST" : "DELETE",
        headers: authUtils.getAuthHeaders(),
      })
      if (!response.ok) { setIsSaved(!newIsSaved) }
      else if (onPostUpdate) onPostUpdate({ ...post, isSaved: newIsSaved })
    } catch { setIsSaved(!newIsSaved) }
  }

  const handleUpdatePost = async () => {
    if (!editCaption.trim()) return
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"

      // Upload new images (data: URLs) to backend
      const finalImages: string[] = []
      for (const img of editImages) {
        if (img.startsWith("data:")) {
          const blob = await fetch(img).then(r => r.blob())
          const formData = new FormData()
          formData.append("file", blob, "image.jpg")
          const authHeaders = authUtils.getAuthHeaders() as Record<string, string>
          const uploadResponse = await fetch(`${backendUrl}/api/upload/image`, {
            method: "POST",
            headers: { Authorization: authHeaders["Authorization"] || "" },
            body: formData,
          })
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            finalImages.push(uploadResult.url)
          } else {
            console.error("Failed to upload image")
            return
          }
        } else {
          finalImages.push(img)
        }
      }

      const response = await fetch(`${backendUrl}/api/post/${post.id}`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          content: editCaption,
          imageUrl: finalImages[0] ?? null,
          imageUrls: finalImages.length > 0 ? finalImages : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Đã xảy ra lỗi khi cập nhật bài viết:", errorData.message)
        return
      }

      const result = await response.json()
      const updatedPostData = result.data

      // Normalize full URLs
      const fullImages: string[] = []
      if (updatedPostData.imageUrls && updatedPostData.imageUrls.length > 0) {
        for (const u of updatedPostData.imageUrls) {
          fullImages.push(u.startsWith("http") ? u : `${backendUrl}${u}`)
        }
      } else if (updatedPostData.imageUrl) {
        const u = updatedPostData.imageUrl
        fullImages.push(u.startsWith("http") ? u : `${backendUrl}${u}`)
      }

      setCaption(editCaption)
      setImages(fullImages)
      setIsEditMode(false)

      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          caption: updatedPostData.content,
          image: fullImages[0],
          images: fullImages.length > 0 ? fullImages : undefined,
        })
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
    }
  }

  const handleDeletePost = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/post/${post.id}`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Đã xảy ra lỗi khi xóa bài viết:", errorData.message)
        setIsDeleting(false)
        return
      }
      setShowDeleteDialog(false)
      onPostDelete?.(post.id)
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
      setIsDeleting(false)
    }
  }

  const handleImageClick = () => router.push(`/user/post/${post.id}`)
  const handleCommentClick = () => router.push(`/user/post/${post.id}`)
  const handleUserClick = () => {
    if (currentUser && post.author.id === currentUser.id) {
      router.push(`/user/profile/me`)
    } else {
      router.push(`/user/profile/${post.author.id}`)
    }
  }

  // Add image to edit mode (from file input)
  const handleEditAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_IMAGES - editImages.length
    const toAdd = files.slice(0, remaining)
    toAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setEditImages(prev => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const handleReportSubmit = async (reason: string, details: string) => {
    try {
      const backendUrl = getApiUrl()
      const response = await fetch(`${backendUrl}/api/post/${post.id}/report`, {
        method: "POST",
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({ reason, description: details }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.title || "Không thể báo cáo bài viết."
        setReportSuccessMessage(errorMessage); setIsReportSuccess(false)
        setShowReportDialog(false); setShowReportSuccessDialog(true)
        return
      }
      const result = await response.json()
      setReportSuccessMessage(result.message || "Đã báo cáo bài viết thành công!"); setIsReportSuccess(true)
      setShowReportDialog(false); setShowReportSuccessDialog(true)
    } catch {
      setReportSuccessMessage("Đã xảy ra lỗi. Vui lòng thử lại sau."); setIsReportSuccess(false)
      setShowReportDialog(false); setShowReportSuccessDialog(true)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <article className="mb-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div className="flex items-start gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-teal-500/20 cursor-pointer hover:opacity-80 transition"
                onClick={handleUserClick}
              />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-bold text-slate-900 dark:text-white text-[15px] cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors" onClick={handleUserClick}>
                {post.author.name}
              </p>
              <span className="text-[13px] text-slate-500 font-medium">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full h-9 w-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col p-1">
                  {isAuthenticated && currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? (
                    <>
                      <button onClick={() => { setIsEditMode(true); setIsMenuOpen(false) }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 text-left cursor-pointer transition">
                        <Edit className="h-4 w-4 text-slate-500" /><span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">Chỉnh sửa</span>
                      </button>
                      <button onClick={() => { setShowDeleteDialog(true); setIsMenuOpen(false) }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left text-rose-600 dark:text-rose-400 cursor-pointer transition">
                        <Trash2 className="h-4 w-4" /><span className="text-[14px] font-medium">Xóa bài</span>
                      </button>
                    </>
                  ) : (
                    <button onClick={() => {
                      if (!isAuthenticated) { setShowLoginDialog(true); setIsMenuOpen(false); return }
                      setShowReportDialog(true); setIsMenuOpen(false)
                    }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left text-rose-600 dark:text-rose-400 cursor-pointer transition">
                      <Flag className="h-4 w-4" /><span className="text-[14px] font-medium">Báo cáo vi phạm</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        <p className="px-6 py-2 text-slate-800 dark:text-slate-200 leading-relaxed text-[15px] whitespace-pre-wrap">{caption}</p>

        {/* Images — adaptive grid */}
        {images.length > 0 && (
          <div className="px-6 py-2">
            <PostImageGrid images={images} onClick={handleImageClick} />
          </div>
        )}

        {/* Stats & Actions */}
        <div className="px-6 pb-4">
          {(likeCount > 0 || post.comments > 0) && (
            <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium py-3 border-b border-slate-100 dark:border-slate-800/60">
              {likeCount > 0 && <span>{likeCount.toLocaleString("vi-VN")} lượt thích</span>}
              {post.comments > 0 && <span className="cursor-pointer hover:text-teal-600 transition-colors" onClick={handleCommentClick}>{post.comments} bình luận</span>}
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <button onClick={handleLike} className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 transition-all duration-200 cursor-pointer ${
              isLiked ? "text-rose-600 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}>
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              <span className={`text-[14px] font-semibold`}>Yêu thích</span>
            </button>
            <button onClick={handleCommentClick} className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 cursor-pointer">
              <MessageCircle className="h-5 w-5" />
              <span className="text-[14px] font-semibold">Bình luận</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!!(currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase())}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isSaved ? "text-teal-600 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "Bạn không thể lưu bài viết của mình" : ""}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
              <span className={`text-[14px] font-semibold`}>Lưu bài</span>
            </button>
          </div>
        </div>
      </article>

      {/* ── Edit Post Dialog ─────────────────────────────────────────────── */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => { setIsEditMode(false); setEditCaption(post.caption); setEditImages(resolveImages(post)) }}
          />
          <div className="relative z-50 w-full max-w-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chỉnh sửa bài viết</h2>
              <button onClick={() => { setIsEditMode(false); setEditCaption(post.caption); setEditImages(resolveImages(post)) }}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-5">
                <img src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} className="h-12 w-12 rounded-full ring-2 ring-teal-500/20 object-cover" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                  <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-900/30 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 dark:text-teal-400 mt-1">Công khai</span>
                </div>
              </div>

              <textarea
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full resize-none rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 text-[15px] leading-relaxed outline-none border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 min-h-[140px] text-slate-900 dark:text-slate-100 transition-all"
              />

              {/* Edit image previews — horizontal row */}
              {editImages.length > 0 && (
                <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0 group rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" style={{ width: 120, height: 120 }}>
                      <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <button
                        onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 bg-black/50 backdrop-blur-md hover:bg-rose-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-5">
                {editImages.length < MAX_IMAGES && (
                  <label className="flex items-center gap-2 cursor-pointer text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-4 py-2.5 rounded-full font-semibold transition-colors">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[14px]">{editImages.length > 0 ? `Thêm ảnh (${editImages.length}/${MAX_IMAGES})` : "Thêm ảnh"}</span>
                    <input type="file" accept="image/*" multiple onChange={handleEditAddImage} className="hidden" />
                  </label>
                )}
                {editImages.length >= MAX_IMAGES && (
                  <span className="text-[14px] text-slate-500 font-medium px-4 py-2.5">Đã đính kèm tối đa {MAX_IMAGES} ảnh</span>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                  onClick={() => { setIsEditMode(false); setEditCaption(post.caption); setEditImages(resolveImages(post)) }}>
                  Hủy
                </Button>
                <Button className="flex-1 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20 transition-all" onClick={handleUpdatePost} disabled={!editCaption.trim()}>
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ──────────────────────────────────────────── */}
      <ConfirmDialog 
        isOpen={showDeleteDialog}
        title="Xóa bài viết"
        description="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa bài"
        cancelText="Hủy"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeletePost}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* ── Report Dialog ────────────────────────────────────────────────── */}
      <ReportDialog isOpen={showReportDialog} onClose={() => setShowReportDialog(false)} onSubmit={handleReportSubmit} targetType="post" />

      {/* ── Report Success ───────────────────────────────────────────────── */}
      <ActionResultDialog 
        isOpen={showReportSuccessDialog}
        title="Thông báo"
        message={reportSuccessMessage}
        isSuccess={isReportSuccess}
        onClose={() => setShowReportSuccessDialog(false)}
      />

      {/* ── Login Required ───────────────────────────────────────────────── */}
      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </>
  )
}
