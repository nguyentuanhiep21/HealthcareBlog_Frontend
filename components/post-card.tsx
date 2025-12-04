"use client"

import { useState } from "react"
import { Heart, MessageCircle, Bookmark, MoreVertical, Flag } from "lucide-react"
import type { Post } from "@/lib/types"
import { CommentSection } from "./comment-section"
import { ImageViewerModal } from "./image-viewer-modal"
import { ReportDialog } from "./report-dialog"
import { LoginRequiredDialog } from "./login-required-dialog"
import { mockComments } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        <p className="mb-3 text-foreground leading-relaxed">{post.caption}</p>

        {/* Image */}
        {post.image && (
          <img
            src={post.image || "/placeholder.svg"}
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

      {/* Comments Modal */}
      {showComments && <CommentSection comments={mockComments[post.id] || []} onClose={() => setShowComments(false)} />}

      {/* Image Viewer Modal */}
      <ImageViewerModal post={post} isOpen={showImageViewer} onClose={() => setShowImageViewer(false)} />

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
