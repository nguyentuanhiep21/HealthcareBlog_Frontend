"use client"

import type React from "react"
import Image from "next/image"
import { useState, use, useEffect } from "react"
import { Heart, Bookmark, MoreVertical, Flag, X, LogIn, Bell, User, Settings, Send, LogOut, Edit, ImageIcon, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReportDialog } from "@/components/report-dialog"
import { formatTimeAgo } from "@/lib/time-utils"
import { authUtils } from "@/lib/auth-utils"

interface PostDetailPageProps {
  params: Promise<{
    id: string
  }>
}

interface Post {
  id: string
  author: {
    id: string
    name: string
    avatar: string
  }
  caption: string
  image: string
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const { id } = use(params)
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState("")
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<{id: string, name: string, avatar: string} | null>(null)
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
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false)
  const [showReportSuccessDialog, setShowReportSuccessDialog] = useState(false)
  const [reportSuccessMessage, setReportSuccessMessage] = useState("")
  const [isReportSuccess, setIsReportSuccess] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  // Fetch current user if authenticated
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = authUtils.getToken()
      if (!token) return

      try {
        const backendUrl = "https://localhost:7223"
        const response = await fetch(`${backendUrl}/api/user/account`, {
          headers: authUtils.getAuthHeaders(),
        })

        if (response.ok) {
          const userData = await response.json()
          setCurrentUser({
            id: userData.id,
            name: userData.fullName,
            avatar: userData.avatarUrl.startsWith('http') 
              ? userData.avatarUrl 
              : `${backendUrl}${userData.avatarUrl}`,
          })
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    if (isAuthenticated) {
      fetchCurrentUser()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const backendUrl = "https://localhost:7223"
        const headers = authUtils.getAuthHeaders()
        
        const response = await fetch(`${backendUrl}/api/post/${id}`, {
          headers,
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Không tìm thấy bài viết")
          } else {
            setError("Đã xảy ra lỗi khi tải bài viết")
          }
          return
        }
        
        const data = await response.json()
        
        // Map backend DTO to frontend Post type
        const mappedPost: Post = {
          id: data.id.toString(),
          author: {
            id: data.author.id,
            name: data.author.fullName,
            avatar: data.author.avatarUrl.startsWith('http') 
              ? data.author.avatarUrl 
              : `${backendUrl}${data.author.avatarUrl}`,
          },
          caption: data.content,
          image: data.imageUrl ? 
            (data.imageUrl.startsWith('http') ? data.imageUrl : `${backendUrl}${data.imageUrl}`) 
            : "",
          likes: data.likeCount,
          comments: data.commentCount,
          isLiked: data.isLikedByCurrentUser || false,
          isSaved: data.isSavedByCurrentUser || false,
          createdAt: data.createdAt,
        }
        
        setPost(mappedPost)
        setIsLiked(mappedPost.isLiked)
        setIsSaved(mappedPost.isSaved)
        setLikeCount(mappedPost.likes)
        setCaption(mappedPost.caption)
        setImage(mappedPost.image)
        setEditCaption(mappedPost.caption)
        setEditImage(mappedPost.image)
        
        // Map comments from backend
        if (data.comments && Array.isArray(data.comments)) {
          const mappedComments = data.comments.map((comment: any) => ({
            id: comment.id?.toString() || "",
            postId: id,
            author: {
              id: comment.author?.id || comment.authorId || "",
              name: comment.author?.fullName || "Unknown",
              avatar: comment.author?.avatarUrl 
                ? (comment.author.avatarUrl.startsWith('http') 
                    ? comment.author.avatarUrl 
                    : `${backendUrl}${comment.author.avatarUrl}`)
                : "/images/logo.png",
            },
            text: comment.content || "",
            likes: comment.likeCount || 0,
            isLiked: comment.isLikedByCurrentUser || false,
            createdAt: comment.uploadTime || comment.createdAt || new Date().toISOString(),
          }))
          setComments(mappedComments)
        }
        
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Đã xảy ra lỗi khi tải bài viết")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPost()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Đang tải bài viết...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">{error || "Không tìm thấy bài viết"}</h1>
          <Link href={isAuthenticated ? "/user" : "/"} className="text-lg text-primary hover:underline">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const newIsLiked = !isLiked
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1

    // Optimistic update
    setIsLiked(newIsLiked)
    setLikeCount(newLikeCount)

    try {
      const backendUrl = "https://localhost:7223"
      const endpoint = "like"
      const method = newIsLiked ? "POST" : "DELETE"

      const response = await fetch(`${backendUrl}/api/post/${id}/${endpoint}`, {
        method,
        headers: authUtils.getAuthHeaders(),
      })

      if (!response.ok) {
        // Revert on error
        setIsLiked(!newIsLiked)
        setLikeCount(newIsLiked ? newLikeCount - 1 : newLikeCount + 1)
        console.error("Lỗi khi like/unlike bài viết")
        return
      }

      // Update post object
      if (post) {
        setPost({
          ...post,
          isLiked: newIsLiked,
          likes: newLikeCount
        })
      }
    } catch (error) {
      console.error("Lỗi khi like/unlike bài viết:", error)
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikeCount(newIsLiked ? newLikeCount - 1 : newLikeCount + 1)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    const newIsLiked = !comment.isLiked
    const newLikeCount = newIsLiked ? comment.likes + 1 : comment.likes - 1

    // Optimistic update
    setComments(prevComments =>
      prevComments.map(c =>
        c.id === commentId
          ? { ...c, isLiked: newIsLiked, likes: newLikeCount }
          : c
      )
    )

    try {
      const backendUrl = "https://localhost:7223"
      const endpoint = "like"
      const method = newIsLiked ? "POST" : "DELETE"

      const response = await fetch(`${backendUrl}/api/comment/${commentId}/${endpoint}`, {
        method,
        headers: authUtils.getAuthHeaders(),
      })

      if (!response.ok) {
        // Revert on error
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId
              ? { ...c, isLiked: !newIsLiked, likes: newIsLiked ? newLikeCount - 1 : newLikeCount + 1 }
              : c
          )
        )
        console.error("Lỗi khi like/unlike bình luận")
      }
    } catch (error) {
      console.error("Lỗi khi like/unlike bình luận:", error)
      // Revert on error
      setComments(prevComments =>
        prevComments.map(c =>
          c.id === commentId
            ? { ...c, isLiked: !newIsLiked, likes: newIsLiked ? newLikeCount - 1 : newLikeCount + 1 }
            : c
        )
      )
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmittingComment(true)
    setCommentError(null)

    try {
      const backendUrl = "https://localhost:7223"
      const token = authUtils.getToken()
      
      if (!token) {
        setShowLoginDialog(true)
        return
      }

      const response = await fetch(`${backendUrl}/api/comment`, {
        method: "POST",
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          postId: parseInt(id),
          content: commentText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setCommentError(errorData.message || "Đã xảy ra lỗi khi đăng bình luận")
        return
      }

      const result = await response.json()
      const commentData = result.data

      // Map backend comment to frontend format
      const newComment = {
        id: commentData.id.toString(),
        postId: id,
        author: {
          id: commentData.user.id,
          name: commentData.user.fullName,
          avatar: commentData.user.avatarUrl.startsWith('http') 
            ? commentData.user.avatarUrl 
            : `${backendUrl}${commentData.user.avatarUrl}`,
        },
        text: commentData.content,
        likes: 0,
        isLiked: false,
        createdAt: commentData.createdAt,
      }

      // Add new comment to the top of the list
      setComments([newComment, ...comments])
      setCommentText("")
      
      // Cập nhật comment count của post
      if (post) {
        setPost({
          ...post,
          comments: post.comments + 1
        })
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
      setCommentError("Đã xảy ra lỗi khi đăng bình luận. Vui lòng thử lại.")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReportSubmit = async (reason: string, details: string) => {
    if (reportingCommentId) {
      try {
        const backendUrl = "https://localhost:7223"
        const response = await fetch(`${backendUrl}/api/comment/${reportingCommentId}/report`, {
          method: "POST",
          headers: authUtils.getAuthHeaders(),
          body: JSON.stringify({
            reason,
            description: details,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          const errorMessage = errorData.message || errorData.title || "Không thể báo cáo bình luận. Vui lòng thử lại."
          console.error("Đã xảy ra lỗi khi báo cáo bình luận:", errorMessage)
          setReportSuccessMessage(errorMessage)
          setIsReportSuccess(false)
          setReportingCommentId(null)
          setShowReportDialog(false)
          setShowReportSuccessDialog(true)
          return
        }

        const result = await response.json()
        setReportSuccessMessage(result.message || "Đã báo cáo bình luận thành công!")
        setIsReportSuccess(true)
        setReportingCommentId(null)
        setShowReportDialog(false)
        setShowReportSuccessDialog(true)
      } catch (error) {
        console.error("Error reporting comment:", error)
        setReportSuccessMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.")
        setIsReportSuccess(false)
        setReportingCommentId(null)
        setShowReportDialog(false)
        setShowReportSuccessDialog(true)
      }
    } else {
      try {
        const backendUrl = "https://localhost:7223"
        const response = await fetch(`${backendUrl}/api/post/${id}/report`, {
          method: "POST",
          headers: authUtils.getAuthHeaders(),
          body: JSON.stringify({
            reason,
            description: details,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          const errorMessage = errorData.message || errorData.title || "Không thể báo cáo bài viết. Vui lòng thử lại."
          console.error("Đã xảy ra lỗi khi báo cáo bài viết:", errorMessage)
          setReportSuccessMessage(errorMessage)
          setIsReportSuccess(false)
          setShowReportDialog(false)
          setShowReportSuccessDialog(true)
          return
        }

        const result = await response.json()
        setReportSuccessMessage(result.message || "Đã báo cáo bài viết thành công!")
        setIsReportSuccess(true)
        setShowReportDialog(false)
        setShowReportSuccessDialog(true)
      } catch (error) {
        console.error("Error reporting post:", error)
        setReportSuccessMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.")
        setIsReportSuccess(false)
        setShowReportDialog(false)
        setShowReportSuccessDialog(true)
      }
    }
  }

  const handleUpdatePost = async () => {
    if (!editCaption.trim()) return

    try {
      const backendUrl = "https://localhost:7223"
      let finalImageUrl = editImage

      // If image was changed and is a file (starts with data:), upload it
      if (editImage && editImage.startsWith('data:')) {
        const blob = await fetch(editImage).then(r => r.blob())
        const formData = new FormData()
        formData.append('file', blob, 'image.jpg')

        const uploadResponse = await fetch(`${backendUrl}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': authUtils.getAuthHeaders()['Authorization'] || '',
          },
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          finalImageUrl = uploadResult.url
        } else {
          console.error('Failed to upload image')
          return
        }
      }

      const response = await fetch(`${backendUrl}/api/post/${id}`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          content: editCaption,
          imageUrl: finalImageUrl || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Đã xảy ra lỗi khi cập nhật bài viết:", errorData.message)
        return
      }

      const result = await response.json()
      const updatedPostData = result.data

      // Update local state with full URL
      const fullImageUrl = updatedPostData.imageUrl 
        ? (updatedPostData.imageUrl.startsWith('http') ? updatedPostData.imageUrl : `${backendUrl}${updatedPostData.imageUrl}`)
        : ""

      setCaption(editCaption)
      setImage(fullImageUrl)
      setIsEditMode(false)

      // Update post object
      if (post) {
        setPost({
          ...post,
          caption: updatedPostData.content,
          image: fullImageUrl,
        })
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
    }
  }

  const handleDeletePost = async () => {
    try {
      const backendUrl = "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/post/${id}`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Đã xảy ra lỗi khi xóa bài viết:", errorData.message)
        return
      }

      // Redirect to home page after successful deletion
      router.push("/user")
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
    }
  }

  const handleUpdateComment = async (commentId: string, newText: string) => {
    try {
      const backendUrl = "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/comment/${commentId}`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          content: newText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Lỗi khi cập nhật bình luận:", errorData.message)
        return false
      }

      // Update local state
      setComments(
        comments.map((c) =>
          c.id === commentId ? { ...c, text: newText } : c
        )
      )
      return true
    } catch (error) {
      console.error("Lỗi khi cập nhật bình luận:", error)
      return false
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const backendUrl = "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/comment/${commentId}`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Lỗi khi xóa bình luận:", errorData.message)
        return false
      }

      // Remove from local state
      setComments(comments.filter((c) => c.id !== commentId))
      
      // Cập nhật comment count của post
      if (post) {
        setPost({
          ...post,
          comments: Math.max(0, post.comments - 1)
        })
      }
      
      return true
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error)
      return false
    }
  }

  return (
    <main className="fixed inset-0 z-50 bg-background overflow-hidden" style={{ fontSize: '100%' }}>
      <div className="border-b border-border bg-background/95 backdrop-blur h-16 flex items-center justify-between px-6">
        {/* Left - Close and Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
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
          {isAuthenticated && currentUser ? (
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
                <Link href={`/user/profile/${post.author.id}`}>
                  <img
                    src={post.author.avatar || "/placeholder.svg"}
                    alt={post.author.name}
                    className="h-10 w-10 rounded-full cursor-pointer hover:opacity-80"
                  />
                </Link>
                <div>
                  <Link
                    href={`/user/profile/${post.author.id}`}
                    className="font-semibold text-foreground hover:text-primary text-lg"
                  >
                    {post.author.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
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
                    {isAuthenticated && currentUser && post.author.id === currentUser.id ? (
                      <>
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
                        <button
                          onClick={() => {
                            setShowDeletePostDialog(true)
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary text-left text-destructive text-base"
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
                    )}
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
                onClick={async () => {
                  if (!isAuthenticated) {
                    setShowLoginDialog(true)
                    return
                  }

                  const newIsSaved = !isSaved

                  // Optimistic update
                  setIsSaved(newIsSaved)

                  try {
                    const backendUrl = "https://localhost:7223"
                    const method = newIsSaved ? "POST" : "DELETE"

                    const response = await fetch(`${backendUrl}/api/savedpost/${id}`, {
                      method,
                      headers: authUtils.getAuthHeaders(),
                    })

                    if (!response.ok) {
                      // Revert on error
                      setIsSaved(!newIsSaved)
                      console.error("Lỗi khi lưu/bỏ lưu bài viết")
                      return
                    }

                    // Update post object
                    if (post) {
                      setPost({
                        ...post,
                        isSaved: newIsSaved
                      })
                    }
                  } catch (error) {
                    console.error("Lỗi khi lưu/bỏ lưu bài viết:", error)
                    // Revert on error
                    setIsSaved(!newIsSaved)
                  }
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
                  <Link href={`/user/profile/${comment.author.id}`}>
                    <img
                      src={comment.author.avatar || "/placeholder.svg"}
                      alt={comment.author.name}
                      className="h-7 w-7 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/user/profile/${comment.author.id}`}>
                          <p className="text-sm font-semibold text-foreground hover:text-primary cursor-pointer">{comment.author.name}</p>
                        </Link>
                        <span className="text-sm text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
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
                            {isAuthenticated && currentUser && comment.author.id === currentUser.id ? (
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
                            onClick={async () => {
                              if (editCommentText.trim()) {
                                const success = await handleUpdateComment(comment.id, editCommentText)
                                if (success) {
                                  setEditingCommentId(null)
                                  setEditCommentText("")
                                }
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
            {commentError && (
              <div className="mb-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
                {commentError}
              </div>
            )}
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-center">
              {isAuthenticated && currentUser && (
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
                disabled={!isAuthenticated || isSubmittingComment}
                className="flex-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm outline-none focus:border-2 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isAuthenticated && (
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="rounded-full p-2 hover:bg-primary/10 transition text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <Send className={`h-5 w-5 ${isSubmittingComment ? 'animate-pulse' : ''}`} />
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
                  <span className="text-sm">{editImage ? "Thay ảnh" : "Thêm ảnh"}</span>
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
                  onClick={handleUpdatePost}
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
                  onClick={async () => {
                    if (deletingCommentId) {
                      const success = await handleDeleteComment(deletingCommentId)
                      if (success) {
                        setShowDeleteDialog(false)
                        setDeletingCommentId(null)
                      }
                    }
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Dialog */}
      {showDeletePostDialog && (
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
                  onClick={() => setShowDeletePostDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={handleDeletePost}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Success Dialog */}
      {showReportSuccessDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-semibold mb-2">Thông báo</h2>
                <p className="text-muted-foreground mb-6">
                  {reportSuccessMessage}
                </p>
                <Button
                  className="w-full"
                  onClick={() => setShowReportSuccessDialog(false)}
                >
                  Đóng
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
