"use client"

import type React from "react"
import Image from "next/image"
import { useState, use } from "react"
import { Heart, Bookmark, MoreVertical, Flag, X, LogIn, Bell, User, Settings, Send, LogOut, Edit, ImageIcon, Trash2 } from "lucide-react"
import { mockPosts, mockComments, mockUsers } from "@/lib/mock-data"
import { useAuth } from "@/components/auth-provider"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReportDialog } from "@/components/report-dialog"

interface PostDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { isAuthenticated, logout } = useAuth()
  const { id } = use(params)
  const post = mockPosts.find((p) => p.id === id)
  const [isLiked, setIsLiked] = useState(post?.isLiked || false)
  const [isSaved, setIsSaved] = useState(post?.isSaved || false)
  const [likeCount, setLikeCount] = useState(post?.likes || 0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [comments, setComments] = useState(mockComments[id] || [])
  const [commentText, setCommentText] = useState("")
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const currentUser = mockUsers.currentUser
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [openCommentMenuId, setOpenCommentMenuId] = useState<string | null>(null)
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [caption, setCaption] = useState(post?.caption || "")
  const [image, setImage] = useState(post?.image || "")
  const [editCaption, setEditCaption] = useState(post?.caption || "")
  const [editImage, setEditImage] = useState(post?.image || "")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Không tìm thấy bài viết</h1>
          <Link href={isAuthenticated ? "/user" : "/"} className="text-lg text-primary hover:underline">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const handleLike = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment = {
      id: `comment-${Date.now()}`,
      postId: id,
      author: currentUser,
      text: commentText,
      likes: 0,
      isLiked: false,
      createdAt: "Vừa xong",
    }

    // Add new comment to the top of the list
    setComments([newComment, ...comments])
    setCommentText("")
  }

  const handleCommentLike = (commentId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    )
  }

  const handleReportSubmit = (reason: string, details: string) => {
    if (reportingCommentId) {
      console.log("Comment report submitted:", { commentId: reportingCommentId, reason, details })
      setReportingCommentId(null)
    } else {
      console.log("Post report submitted:", { postId: id, reason, details })
    }
    // TODO: Send report to backend
  }

  return (
    <main className="fixed inset-0 z-50 bg-background overflow-hidden">
      <div className="border-b border-border bg-background/95 backdrop-blur h-16 flex items-center justify-between px-6">
        {/* Left - Close and Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/user"
            className="rounded-full p-2 hover:bg-secondary transition text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </Link>
          <Link href="/user">
            <Image src="/care-logo.png" alt="Health Care Logo" width={288} height={96} className="h-24 w-auto" />
          </Link>
        </div>

        {/* Right - Avatar and Notification */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button className="rounded-full p-2 hover:bg-secondary transition text-muted-foreground hover:text-foreground">
                <Bell className="h-5.5 w-5.5" />
              </button>

              {/* Avatar with dropdown menu */}
              <div className="relative">
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="rounded-full overflow-hidden hover:opacity-80 transition"
                >
                  <img
                    src={currentUser.avatar || "/placeholder.svg"}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full cursor-pointer hover:opacity-80"
                  />
                </button>

                {isAvatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-10">
                    <div className="flex flex-col gap-1 p-2">
                      <Link
                        href="/user/profile"
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-base"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Trang cá nhân</span>
                      </Link>
                      <Link
                        href="/user/settings"
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-base"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Cài đặt</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsAvatarMenuOpen(false)
                        }}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-base text-left text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth/login">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                <LogIn className="h-4 w-4" />
                Đăng Nhập
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content - Facebook style 60% image, 40% comments */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left - Image (~60%) */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          {image ? (
            <img src={image || "/placeholder.svg"} alt="Post content" className="w-full h-full object-contain" />
          ) : (
            <div className="flex items-center justify-center text-muted-foreground text-lg">Không có hình ảnh</div>
          )}
        </div>

        {/* Right - Post Details & Comments (~40%) */}
        <div className="w-[40%] bg-card border-l border-border flex flex-col overflow-hidden">
          {/* Post Info */}
          <div className="border-b border-border p-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                  className="h-10 w-10 rounded-full cursor-pointer hover:opacity-80"
                />
                <div>
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="font-semibold text-foreground hover:text-primary text-lg"
                  >
                    {post.author.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{post.createdAt}</p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-full p-2 hover:bg-secondary transition"
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-card shadow-lg z-10">
                    {isAuthenticated && post.author.id === currentUser.id && (
                      <button
                        onClick={() => {
                          setIsEditMode(true)
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-base"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
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
                      className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive text-base"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Báo cáo</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Caption - increased from text-sm to text-base */}
            <p className="text-foreground leading-relaxed text-base">{caption}</p>

            {/* Stats - increased from text-xs to text-sm */}
            <div className="flex gap-4 text-sm text-muted-foreground mt-3">
              <span>{likeCount.toLocaleString("vi-VN")} yêu thích</span>
              <span>{post.comments} bình luận</span>
            </div>

            {/* Action Buttons - increased from text-sm to text-base */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button
                onClick={handleLike}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition text-base"
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current text-primary" : "text-muted-foreground"}`} />
                <span className={isLiked ? "text-primary font-semibold" : "text-muted-foreground"}>Thích</span>
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginDialog(true)
                    return
                  }
                  setIsSaved(!isSaved)
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 hover:bg-secondary transition text-base"
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current text-primary" : "text-muted-foreground"}`} />
                <span className={isSaved ? "text-primary font-semibold" : "text-muted-foreground"}>Lưu</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <img
                    src={comment.author.avatar || "/placeholder.svg"}
                    alt={comment.author.name}
                    className="h-7 w-7 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{comment.author.name}</p>
                        <span className="text-sm text-muted-foreground">{comment.createdAt}</span>
                      </div>
                      
                      {/* Comment Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenCommentMenuId(openCommentMenuId === comment.id ? null : comment.id)}
                          className="rounded-full p-1 hover:bg-secondary transition"
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                        
                        {openCommentMenuId === comment.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-card shadow-lg z-10">
                            {isAuthenticated && comment.author.id === currentUser.id ? (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id)
                                    setEditCommentText(comment.text)
                                    setOpenCommentMenuId(null)
                                  }}
                                  className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-sm"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingCommentId(comment.id)
                                    setShowDeleteDialog(true)
                                    setOpenCommentMenuId(null)
                                  }}
                                  className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive text-sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Xóa</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!isAuthenticated) {
                                    setShowLoginDialog(true)
                                    setOpenCommentMenuId(null)
                                    return
                                  }
                                  setReportingCommentId(comment.id)
                                  setShowReportDialog(true)
                                  setOpenCommentMenuId(null)
                                }}
                                className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive text-sm"
                              >
                                <Flag className="h-4 w-4" />
                                <span>Báo cáo</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-1">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full resize-none rounded-lg bg-gray-100 px-2 py-1 text-base outline-none focus:ring-2 focus:ring-primary"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditCommentText("")
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => {
                              if (editCommentText.trim()) {
                                setComments(
                                  comments.map((c) =>
                                    c.id === comment.id ? { ...c, text: editCommentText } : c
                                  )
                                )
                                setEditingCommentId(null)
                                setEditCommentText("")
                              }
                            }}
                            disabled={!editCommentText.trim()}
                            className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-foreground bg-white rounded-lg px-2 py-1 mt-1 break-words">
                        {comment.text}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className="flex items-center gap-1 hover:opacity-70 transition"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            comment.isLiked ? "fill-current text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border p-4 flex-shrink-0">
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              {isAuthenticated && (
                <img
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-full flex-shrink-0"
                />
              )}
              <input
                type="text"
                placeholder={isAuthenticated ? "Viết bình luận..." : "Đăng nhập để bình luận"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginDialog(true)
                  }
                }}
                disabled={!isAuthenticated}
                className="flex-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isAuthenticated && (
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="rounded-full p-2 hover:bg-primary/10 transition text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <Send className="h-5 w-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Edit Post Dialog */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chỉnh sửa bài viết</h2>
              <button
                onClick={() => {
                  setIsEditMode(false)
                  setEditCaption(post?.caption || "")
                  setEditImage(post?.image || "")
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
                    setEditCaption(post?.caption || "")
                    setEditImage(post?.image || "")
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // TODO: Update post in backend
                    console.log("Update post:", { id, caption: editCaption, image: editImage })
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

      {/* Report Dialog */}
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => {
          setShowReportDialog(false)
          setReportingCommentId(null)
        }}
        onSubmit={handleReportSubmit}
        targetType={reportingCommentId ? "comment" : "post"}
      />

      {/* Delete Comment Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Xóa bình luận</h2>
              <p className="text-muted-foreground mb-6">
                Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeletingCommentId(null)
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => {
                    if (deletingCommentId) {
                      setComments(comments.filter((c) => c.id !== deletingCommentId))
                      console.log("Delete comment:", deletingCommentId)
                      // TODO: Delete comment from backend
                    }
                    setShowDeleteDialog(false)
                    setDeletingCommentId(null)
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Dialog */}
      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </main>
  )
}
