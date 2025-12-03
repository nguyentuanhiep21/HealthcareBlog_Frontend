"use client"

import { useState } from "react"
import { Heart, X, Bell } from "lucide-react"
import type { Comment } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface CommentSectionProps {
  comments: Comment[]
  onClose: () => void
}

export function CommentSection({ comments, onClose }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("")
  const [localComments, setLocalComments] = useState(comments)
  const currentUser = mockUsers.currentUser

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        author: currentUser,
        text: commentText,
        likes: 0,
        isLiked: false,
        createdAt: "vừa xong",
      }
      setLocalComments([newComment, ...localComments])
      setCommentText("")
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      <div className="border-b border-border bg-background/95 backdrop-blur h-16 flex items-center justify-between px-6">
        {/* Left - Close and Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary transition text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
          <Link href="/user">
            <Image src="/care-logo.png" alt="Health Care Logo" width={288} height={96} className="h-24 w-auto" />
          </Link>
        </div>

        {/* Right - Avatar and Notification */}
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-secondary transition text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </button>
          <Link
            href={`/profile/${currentUser.id}`}
            className="rounded-full overflow-hidden hover:opacity-80 transition"
          >
            <img
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>

      {/* Content - Full width comments */}
      <div className="h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto w-full">
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {localComments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Link
                  href={`/profile/${comment.author.id}`}
                  className="rounded-full overflow-hidden hover:opacity-80 flex-shrink-0"
                >
                  <img
                    src={comment.author.avatar || "/placeholder.svg"}
                    alt={comment.author.name}
                    className="h-8 w-8 rounded-full"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${comment.author.id}`}
                    className="font-semibold text-sm text-foreground hover:text-primary"
                  >
                    {comment.author.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{comment.createdAt}</p>
                  <p className="text-sm text-foreground mt-2">{comment.text}</p>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-2">
                    <Heart className="h-3 w-3" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div className="border-t border-border p-6 flex-shrink-0">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddComment()
                  }
                }}
              />
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
