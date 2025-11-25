"use client"

import { useState } from "react"
import { Heart, MessageCircle, Bookmark, MoreVertical, Flag } from "lucide-react"
import type { Post } from "@/lib/types"
import { CommentSection } from "./comment-section"
import { ImageViewerModal } from "./image-viewer-modal"
import { mockComments } from "@/lib/mock-data"
import { useRouter } from "next/navigation"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleImageClick = () => {
    router.push(`/user/post/${post.id}`)
  }

  const handleCommentClick = () => {
    router.push(`/user/post/${post.id}`)
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
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{post.author.name}</p>
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
                  <button className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive">
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
              onClick={() => setIsSaved(!isSaved)}
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
    </>
  )
}
