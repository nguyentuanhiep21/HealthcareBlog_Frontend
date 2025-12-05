"use client"

import type React from "react"
import Image from "next/image"
import { useState, use } from "react"
import { Heart, Bookmark, MoreVertical, Flag, X, LogIn, Bell, User, Settings, Send } from "lucide-react"
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
  const { isAuthenticated } = useAuth()
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

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Không tìm thấy bài viết</h1>
          <Link href="/" className="text-lg text-primary hover:underline">
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
                        href="/profile"
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-base"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Trang cá nhân</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-base"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Cài đặt</span>
                      </Link>
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
          {post.image ? (
            <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-full object-contain" />
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
            <p className="text-foreground leading-relaxed text-base">{post.caption}</p>

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
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-base text-foreground bg-secondary rounded-lg px-2 py-1 mt-1 break-words">
                      {comment.text}
                    </p>
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
                className="flex-1 rounded-full bg-secondary px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Login Required Dialog */}
      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </main>
  )
}
