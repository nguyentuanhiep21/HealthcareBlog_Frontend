"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Bookmark, MoreVertical, Flag, Edit, ImageIcon, X, Trash2 } from "lucide-react"
import type { Post } from "@/lib/types"
import { ReportDialog } from "./report-dialog"
import { LoginRequiredDialog } from "./login-required-dialog"
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

  const cls = "w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
  
  // Use a fixed 1:1 container for the image block
  const containerCls = "mb-4 w-full aspect-square max-w-[500px] mx-auto overflow-hidden rounded-lg bg-muted"

  if (images.length === 1) {
    return (
      <div className={containerCls}>
        <img src={images[0]} alt="Post" className={cls} onClick={onClick} />
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div className={`${containerCls} grid grid-rows-2 gap-1`}>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`Ảnh ${i + 1}`} className={cls} onClick={onClick} />
        ))}
      </div>
    )
  }

  if (images.length === 3) {
    return (
      <div className={`${containerCls} grid grid-cols-2 grid-rows-2 gap-1`}>
        <div className="col-span-2 w-full h-full">
          <img src={images[0]} alt="Ảnh 1" className={cls} onClick={onClick} />
        </div>
        <div className="w-full h-full">
          <img src={images[1]} alt="Ảnh 2" className={cls} onClick={onClick} />
        </div>
        <div className="w-full h-full">
          <img src={images[2]} alt="Ảnh 3" className={cls} onClick={onClick} />
        </div>
      </div>
    )
  }

  if (images.length === 4) {
    return (
      <div className={`${containerCls} grid grid-cols-2 grid-rows-2 gap-1`}>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`Ảnh ${i + 1}`} className={cls} onClick={onClick} />
        ))}
      </div>
    )
  }

  // 5 or more images
  return (
    <div className={`${containerCls} grid grid-cols-2 grid-rows-6 gap-1`}>
      {/* Left column: 2 items */}
      <div className="col-start-1 row-start-1 row-span-3 w-full h-full">
        <img src={images[0]} alt="Ảnh 1" className={cls} onClick={onClick} />
      </div>
      <div className="col-start-1 row-start-4 row-span-3 w-full h-full">
        <img src={images[1]} alt="Ảnh 2" className={cls} onClick={onClick} />
      </div>
      
      {/* Right column: 3 items */}
      <div className="col-start-2 row-start-1 row-span-2 w-full h-full">
        <img src={images[2]} alt="Ảnh 3" className={cls} onClick={onClick} />
      </div>
      <div className="col-start-2 row-start-3 row-span-2 w-full h-full">
        <img src={images[3]} alt="Ảnh 4" className={cls} onClick={onClick} />
      </div>
      <div className="col-start-2 row-start-5 row-span-2 w-full h-full relative">
        <img src={images[4]} alt="Ảnh 5" className={cls} onClick={onClick} />
        {images.length > 5 && (
          <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold cursor-pointer hover:bg-black/40 transition"
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
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/post/${post.id}`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Đã xảy ra lỗi khi xóa bài viết:", errorData.message)
        return
      }
      setShowDeleteDialog(false)
      onPostDelete?.(post.id)
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
    }
  }

  const handleImageClick = () => router.push(`/user/post/${post.id}`)
  const handleCommentClick = () => router.push(`/user/post/${post.id}`)
  const handleUserClick = () => router.push(`/user/profile/${post.author.id}`)

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
      <article className="mb-6 rounded-lg border border-border bg-card p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <img
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              className="h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition"
              onClick={handleUserClick}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground cursor-pointer hover:text-primary transition" onClick={handleUserClick}>
                  {post.author.name}
                </p>
                <span className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full p-2 hover:bg-secondary transition">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-10">
                <div className="flex flex-col gap-1 p-2">
                  {isAuthenticated && currentUser && post.author.id === currentUser.id ? (
                    <>
                      <button onClick={() => { setIsEditMode(true); setIsMenuOpen(false) }}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left">
                        <Edit className="h-4 w-4" /><span className="text-sm">Chỉnh sửa</span>
                      </button>
                      <button onClick={() => { setShowDeleteDialog(true); setIsMenuOpen(false) }}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive">
                        <Trash2 className="h-4 w-4" /><span className="text-sm">Xóa</span>
                      </button>
                    </>
                  ) : (
                    <button onClick={() => {
                      if (!isAuthenticated) { setShowLoginDialog(true); setIsMenuOpen(false); return }
                      setShowReportDialog(true); setIsMenuOpen(false)
                    }} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive">
                      <Flag className="h-4 w-4" /><span className="text-sm">Báo cáo</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        <p className="mb-3 text-foreground leading-relaxed">{caption}</p>

        {/* Images — adaptive grid */}
        <PostImageGrid images={images} onClick={handleImageClick} />

        {/* Stats & Actions */}
        <div className="space-y-3 border-t border-border pt-3">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{likeCount.toLocaleString("vi-VN")} yêu thích</span>
            <span>{post.comments} bình luận</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button onClick={handleLike} className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition">
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${isLiked ? "text-primary font-semibold" : "text-muted-foreground"}`}>Yêu thích</span>
            </button>
            <button onClick={handleCommentClick} className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bình luận</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!!(currentUser && post.author.id === currentUser.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title={currentUser && post.author.id === currentUser.id ? "Bạn không thể lưu bài viết của mình" : ""}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${isSaved ? "text-primary font-semibold" : "text-muted-foreground"}`}>Lưu</span>
            </button>
          </div>
        </div>
      </article>

      {/* ── Edit Post Dialog ─────────────────────────────────────────────── */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chỉnh sửa bài viết</h2>
              <button onClick={() => { setIsEditMode(false); setEditCaption(post.caption); setEditImages(resolveImages(post)) }}
                className="rounded-full p-2 hover:bg-secondary transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} className="h-10 w-10 rounded-full" />
                <div>
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">Công khai</p>
                </div>
              </div>

              <textarea
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full resize-none rounded-lg bg-gray-100 p-3 text-base outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              />

              {/* Edit image previews — horizontal row */}
              {editImages.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0 group rounded-lg overflow-hidden bg-secondary" style={{ width: 100, height: 100 }}>
                      <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                {editImages.length < MAX_IMAGES && (
                  <label className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm">{editImages.length > 0 ? `Thêm ảnh (${editImages.length}/${MAX_IMAGES})` : "Thêm ảnh"}</span>
                    <input type="file" accept="image/*" multiple onChange={handleEditAddImage} className="hidden" />
                  </label>
                )}
                {editImages.length >= MAX_IMAGES && (
                  <span className="text-sm text-muted-foreground">Đã đính kèm tối đa {MAX_IMAGES} ảnh</span>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1"
                  onClick={() => { setIsEditMode(false); setEditCaption(post.caption); setEditImages(resolveImages(post)) }}>
                  Hủy
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleUpdatePost} disabled={!editCaption.trim()}>
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ──────────────────────────────────────────── */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Xóa bài viết</h2>
              <p className="text-muted-foreground mb-6">Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
                <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleDeletePost}>Xóa</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Dialog ────────────────────────────────────────────────── */}
      <ReportDialog isOpen={showReportDialog} onClose={() => setShowReportDialog(false)} onSubmit={handleReportSubmit} targetType="post" />

      {/* ── Report Success ───────────────────────────────────────────────── */}
      {showReportSuccessDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full">
            <div className="p-6 flex flex-col items-center text-center">
              <h2 className="text-xl font-semibold mb-2">Thông báo</h2>
              <p className="text-muted-foreground mb-6">{reportSuccessMessage}</p>
              <Button className="w-full" onClick={() => setShowReportSuccessDialog(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Login Required ───────────────────────────────────────────────── */}
      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </>
  )
}
