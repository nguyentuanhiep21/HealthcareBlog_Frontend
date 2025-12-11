"use client"

import { useState } from "react"
import { Heart, MessageCircle, Bookmark, MoreVertical, Flag, Edit, ImageIcon, X, Trash2 } from "lucide-react"
import type { Post } from "@/lib/types"
import { CommentSection } from "./comment-section"
import { ImageViewerModal } from "./image-viewer-modal"
import { ReportDialog } from "./report-dialog"
import { LoginRequiredDialog } from "./login-required-dialog"
import { mockComments, mockUsers } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [caption, setCaption] = useState(post.caption)
  const [image, setImage] = useState(post.image || "")
  const [editCaption, setEditCaption] = useState(post.caption)
  const [editImage, setEditImage] = useState(post.image || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const currentUser = mockUsers.currentUser

  const handleLike = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleSave = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setIsSaved(!isSaved)
  }

  const handleImageClick = () => {
    router.push(`/user/post/${post.id}`)
  }

  const handleCommentClick = () => {
    router.push(`/user/post/${post.id}`)
  }

  const handleUserClick = () => {
    router.push(`/user/profile/${post.author.id}`)
  }

  const handleReportSubmit = (reason: string, details: string) => {
    console.log("Report submitted:", { postId: post.id, reason, details })
    // TODO: Send report to backend
  }

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
                <p
                  className="font-semibold text-foreground cursor-pointer hover:text-primary transition"
                  onClick={handleUserClick}
                >
                  {post.author.name}
                </p>
                <span className="text-sm text-muted-foreground">{post.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full p-2 hover:bg-secondary transition"
            >
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-10">
                <div className="flex flex-col gap-1 p-2">
                  {isAuthenticated && post.author.id === currentUser.id ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditMode(true)
                          setIsMenuOpen(false)
                        }}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-sm">Chỉnh sửa</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteDialog(true)
                          setIsMenuOpen(false)
                        }}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Xóa</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowLoginDialog(true)
                          setIsMenuOpen(false)
                          return
                        }
                        setShowReportDialog(true)
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive"
                    >
                      <Flag className="h-4 w-4" />
                      <span className="text-sm">Báo cáo</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        <p className="mb-3 text-foreground leading-relaxed">{caption}</p>

        {/* Image */}
        {image && (
          <img
            src={image || "/placeholder.svg"}
            alt="Post content"
            className="mb-4 w-full rounded-lg cursor-pointer hover:opacity-90 transition"
            onClick={handleImageClick}
          />
        )}

        {/* Stats and Actions */}
        <div className="space-y-3 border-t border-border pt-3">
          {/* Stats */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{likeCount.toLocaleString("vi-VN")} yêu thích</span>
            <span>{post.comments} bình luận</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleLike}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition"
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${isLiked ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                Yêu thích
              </span>
            </button>

            <button
              onClick={handleCommentClick}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition"
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bình luận</span>
            </button>

            <button
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition"
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${isSaved ? "text-primary font-semibold" : "text-muted-foreground"}`}>Lưu</span>
            </button>
          </div>
        </div>
      </article>

      {/* Edit Post Dialog */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chỉnh sửa bài viết</h2>
              <button
                onClick={() => {
                  setIsEditMode(false)
                  setEditCaption(post.caption)
                  setEditImage(post.image || "")
                }}
                className="rounded-full p-2 hover:bg-secondary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">Công khai</p>
                </div>
              </div>

              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full resize-none rounded-lg bg-gray-100 p-3 text-base outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              />

              {editImage && (
                <div className="mt-4 relative bg-secondary rounded-lg overflow-hidden">
                  <img
                    src={editImage}
                    alt="Preview"
                    className="w-full max-h-96 object-contain"
                  />
                  <button
                    onClick={() => setEditImage("")}
                    className="absolute top-2 right-2 bg-background/90 rounded-full p-2 hover:bg-background"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setEditImage(event.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditMode(false)
                    setEditCaption(post.caption)
                    setEditImage(post.image || "")
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // TODO: Update post in backend
                    console.log("Update post:", { id: post.id, caption: editCaption, image: editImage })
                    setCaption(editCaption)
                    setImage(editImage)
                    setIsEditMode(false)
                  }}
                  disabled={!editCaption.trim()}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && <CommentSection comments={mockComments[post.id] || []} onClose={() => setShowComments(false)} />}

      {/* Image Viewer Modal */}
      <ImageViewerModal post={post} isOpen={showImageViewer} onClose={() => setShowImageViewer(false)} />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Xóa bài viết</h2>
              <p className="text-muted-foreground mb-6">
                Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => {
                    console.log("Delete post:", post.id)
                    // TODO: Delete post from backend
                    setShowDeleteDialog(false)
                    // Optionally reload or remove from UI
                    window.location.reload()
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onSubmit={handleReportSubmit}
        targetType="post"
      />

      {/* Login Required Dialog */}
      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </>
  )
}
