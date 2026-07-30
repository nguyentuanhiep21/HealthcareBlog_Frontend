"use client"

import type React from "react"
import Image from "next/image"
import { useState, use, useEffect } from "react"
import { Heart, Bookmark, MoreVertical, Flag, X, LogIn, Bell, User, Settings, Send, LogOut, Edit, ImageIcon, Trash2, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReportDialog } from "@/components/report-dialog"
import { formatTimeAgo } from "@/lib/time-utils"
import { authUtils } from "@/lib/auth-utils"
import { getApiUrl } from "@/lib/utils"
import { BackgroundPattern } from "@/components/background-pattern"

interface PostDetailPageProps {
  params: Promise<{
    id: string
  }>
}

const MAX_IMAGES = 5

export interface CommentType {
  id: string
  postId: string
  author: { id: string, name: string, avatar: string }
  text: string
  likes: number
  isLiked: boolean
  createdAt: string
  replyCount: number
  parentCommentId: string | null
  replies?: CommentType[]
  isRepliesExpanded?: boolean
  isLoadingReplies?: boolean
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
  images?: string[] // multi-image support
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { isAuthenticated, user, logout } = useAuth()
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
  const [comments, setComments] = useState<CommentType[]>([])
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null)
  const [commentText, setCommentText] = useState("")
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  
  const currentUser = user ? { id: user.id, name: user.fullName || "", avatar: user.avatarUrl || "" } : null

  const [showReportDialog, setShowReportDialog] = useState(false)
  const [openCommentMenuId, setOpenCommentMenuId] = useState<string | null>(null)
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [caption, setCaption] = useState(post?.caption || "")
  const [image, setImage] = useState(post?.image || "")
  const [images, setImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [editCaption, setEditCaption] = useState(post?.caption || "")
  const [editImages, setEditImages] = useState<string[]>([])
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


  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const backendUrl = getApiUrl()
        const headers = authUtils.getAuthHeaders()
        
        const response = await fetch(`${backendUrl}/api/posts/${id}`, {
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
        // Resolve images list (backward compat)
        const resolvedImages: string[] = []
        if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
          for (const u of data.imageUrls) {
            resolvedImages.push(u.startsWith('http') ? u : `${backendUrl}${u}`)
          }
        } else if (data.imageUrl) {
          resolvedImages.push(data.imageUrl.startsWith('http') ? data.imageUrl : `${backendUrl}${data.imageUrl}`)
        }

        const mappedPost: Post = {
          id: data.id.toString(),
          author: {
            id: data.author.id,
            name: data.author.fullName,
            avatar: data.author.avatarUrl
              ? (data.author.avatarUrl.startsWith('http') 
                  ? data.author.avatarUrl 
                  : `${backendUrl}${data.author.avatarUrl}`)
              : '/placeholder.svg',
          },
          caption: data.content,
          image: resolvedImages[0] ?? "",
          images: resolvedImages,
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
        setImages(resolvedImages)
        setCurrentImageIndex(0)
        setEditCaption(mappedPost.caption)
        setEditImages(resolvedImages)
        // Map comments from backend
        try {
          const commentsRes = await fetch(`${backendUrl}/api/comments/post/${id}?page=1&pageSize=50`, {
            headers,
          })
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json()
            const items = commentsData.items || commentsData.data || commentsData
            if (Array.isArray(items)) {
              const mappedComments = items.map((comment: any) => ({
                id: comment.id?.toString() || "",
                postId: id,
                author: {
                  id: comment.author?.id || comment.user?.id || comment.authorId || "",
                  name: comment.author?.fullName || comment.user?.fullName || "Unknown",
                  avatar: comment.author?.avatarUrl || comment.user?.avatarUrl
                    ? ((comment.author?.avatarUrl || comment.user?.avatarUrl).startsWith('http') 
                        ? (comment.author?.avatarUrl || comment.user?.avatarUrl)
                        : `${backendUrl}${comment.author?.avatarUrl || comment.user?.avatarUrl}`)
                    : "/placeholder.svg",
                },
                text: comment.content || "",
                likes: comment.likeCount || 0,
                isLiked: comment.isLikedByCurrentUser || false,
                createdAt: comment.createdAt || comment.uploadTime || new Date().toISOString(),
                replyCount: comment.replyCount || 0,
                parentCommentId: comment.parentCommentId || null,
                replies: [],
                isRepliesExpanded: false,
                isLoadingReplies: false
              }))
              setComments(mappedComments)
            }
          }
        } catch (err) {
          console.error("Error fetching comments:", err)
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
      const backendUrl = getApiUrl()
      const endpoint = "like"
      const method = newIsLiked ? "POST" : "DELETE"

      const response = await fetch(`${backendUrl}/api/posts/${id}/${endpoint}`, {
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
      const backendUrl = getApiUrl()
      const endpoint = "like"
      const method = newIsLiked ? "POST" : "DELETE"

      const response = await fetch(`${backendUrl}/api/comments/${commentId}/${endpoint}`, {
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
      const backendUrl = getApiUrl()
      const token = authUtils.getToken()
      
      if (!token) {
        setShowLoginDialog(true)
        return
      }

      const response = await fetch(`${backendUrl}/api/comments`, {
        method: "POST",
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          postId: parseInt(id),
          content: commentText,
          parentCommentId: replyingTo ? parseInt(replyingTo.id) : null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setCommentError(errorData.message || "Đã xảy ra lỗi khi đăng bình luận")
        return
      }

      const result = await response.json()
      const commentData = result.data || result

      // Map backend comment to frontend format
      const newComment: CommentType = {
        id: commentData.id?.toString() || "",
        postId: id,
        author: {
          id: commentData.user?.id || commentData.author?.id || "",
          name: commentData.user?.fullName || commentData.author?.fullName || "Unknown",
          avatar: commentData.user?.avatarUrl || commentData.author?.avatarUrl
            ? ((commentData.user?.avatarUrl || commentData.author?.avatarUrl).startsWith('http') 
                ? (commentData.user?.avatarUrl || commentData.author?.avatarUrl)
                : `${backendUrl}${commentData.user?.avatarUrl || commentData.author?.avatarUrl}`)
            : '/placeholder.svg',
        },
        text: commentData.content || commentText,
        likes: 0,
        isLiked: false,
        createdAt: commentData.createdAt || new Date().toISOString(),
        replyCount: 0,
        parentCommentId: commentData.parentCommentId ? commentData.parentCommentId.toString() : null,
        replies: [],
        isRepliesExpanded: false,
        isLoadingReplies: false
      }

      if (replyingTo) {
        setComments(prev => prev.map(c => 
          c.id === replyingTo.id 
            ? { ...c, replies: [...(c.replies || []), newComment], isRepliesExpanded: true, replyCount: (c.replyCount || 0) + 1 } 
            : c
        ))
        setReplyingTo(null)
      } else {
        setComments([newComment, ...comments])
      }
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
        const backendUrl = getApiUrl()
        const response = await fetch(`${backendUrl}/api/comments/${reportingCommentId}/report`, {
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
        const backendUrl = getApiUrl()
        const response = await fetch(`${backendUrl}/api/posts/${id}/report`, {
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
      const backendUrl = getApiUrl()

      // Upload any new images (data: URLs) and collect final URLs
      const finalImages: string[] = []
      for (const img of editImages) {
        if (img.startsWith('data:')) {
          const blob = await fetch(img).then(r => r.blob())
          const formData = new FormData()
          formData.append('file', blob, 'image.jpg')
          const uploadResponse = await fetch(`${backendUrl}/api/uploads/image`, {
            method: 'POST',
            headers: { 'Authorization': authUtils.getAuthHeaders()['Authorization'] || '' },
            body: formData,
          })
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            finalImages.push(uploadResult.url)
          } else {
            console.error('Failed to upload image')
            return
          }
        } else {
          finalImages.push(img)
        }
      }

      const response = await fetch(`${backendUrl}/api/posts/${id}`, {
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

      // Normalize URLs
      const fullImages: string[] = []
      if (updatedPostData.imageUrls && updatedPostData.imageUrls.length > 0) {
        for (const u of updatedPostData.imageUrls) {
          fullImages.push(u.startsWith('http') ? u : `${backendUrl}${u}`)
        }
      } else if (updatedPostData.imageUrl) {
        const u = updatedPostData.imageUrl
        fullImages.push(u.startsWith('http') ? u : `${backendUrl}${u}`)
      }

      setCaption(editCaption)
      setImage(fullImages[0] ?? "")
      setImages(fullImages)
      setCurrentImageIndex(0)
      setIsEditMode(false)

      if (post) {
        setPost({ ...post, caption: updatedPostData.content, image: fullImages[0] ?? "", images: fullImages })
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error)
    }
  }

  const handleDeletePost = async () => {
    try {
      const backendUrl = getApiUrl()
      const response = await fetch(`${backendUrl}/api/posts/${id}`, {
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
      const backendUrl = getApiUrl()
      const response = await fetch(`${backendUrl}/api/comments/${commentId}`, {
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
      const backendUrl = getApiUrl()
      const response = await fetch(`${backendUrl}/api/comments/${commentId}`, {
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

  const handleLoadReplies = async (commentId: string) => {
    try {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLoadingReplies: true } : c))
      
      const backendUrl = getApiUrl()
      const response = await fetch(`${backendUrl}/api/comments/${commentId}/replies?page=1&pageSize=50`, {
        headers: authUtils.getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        const items = data.items || data.data || data
        if (Array.isArray(items)) {
          const mappedReplies = items.map((comment: any) => ({
            id: comment.id?.toString() || "",
            postId: id,
            author: {
              id: comment.author?.id || comment.user?.id || comment.authorId || "",
              name: comment.author?.fullName || comment.user?.fullName || "Unknown",
              avatar: comment.author?.avatarUrl || comment.user?.avatarUrl
                ? ((comment.author?.avatarUrl || comment.user?.avatarUrl).startsWith('http') 
                    ? (comment.author?.avatarUrl || comment.user?.avatarUrl)
                    : `${backendUrl}${comment.author?.avatarUrl || comment.user?.avatarUrl}`)
                : "/placeholder.svg",
            },
            text: comment.content || "",
            likes: comment.likeCount || 0,
            isLiked: comment.isLikedByCurrentUser || false,
            createdAt: comment.createdAt || comment.uploadTime || new Date().toISOString(),
            replyCount: 0,
            parentCommentId: commentId,
            replies: [],
            isRepliesExpanded: false,
            isLoadingReplies: false
          }))
          
          setComments(prev => prev.map(c => 
            c.id === commentId 
              ? { ...c, replies: mappedReplies, isRepliesExpanded: true, isLoadingReplies: false } 
              : c
          ))
        }
      } else {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLoadingReplies: false } : c))
      }
    } catch (error) {
      console.error("Lỗi khi tải phản hồi:", error)
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLoadingReplies: false } : c))
    }
  }

  return (
    <main className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-hidden" style={{ fontSize: '100%' }}>
      <BackgroundPattern />
      <div className="relative z-10 h-full flex flex-col">
        <div className="border-b border-border bg-background/95 backdrop-blur h-16 flex items-center justify-between px-6 flex-shrink-0">
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

      {/* Content - Responsive & Conditional Layout */}
      <div className={`flex flex-col md:flex-row ${images.length > 0 ? 'h-[calc(100vh-4rem)]' : 'min-h-[calc(100vh-4rem)] justify-center bg-slate-50 dark:bg-slate-950 p-4 md:p-8'}`}>
        
        {/* Left - Image Carousel (only show if there are images) */}
        {images.length > 0 && (
          <div className="w-full md:flex-1 bg-black flex flex-col items-center justify-center overflow-hidden relative h-[40vh] md:h-full flex-shrink-0">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={`Ảnh ${currentImageIndex + 1}`}
              className="w-full h-full object-contain transition-opacity duration-300"
            />
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(i => Math.max(0, i - 1))}
                  disabled={currentImageIndex === 0}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full p-2.5 sm:p-3 transition-all disabled:opacity-0"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(i => Math.min(images.length - 1, i + 1))}
                  disabled={currentImageIndex === images.length - 1}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full p-2.5 sm:p-3 transition-all disabled:opacity-0"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                {/* Dots indicator */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Xem ảnh ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Right - Post Details & Comments */}
        <div className={`w-full ${images.length > 0 ? 'md:w-[45%] lg:w-[40%] xl:w-[35%] bg-card border-l border-border h-auto md:h-full' : 'max-w-2xl bg-card border border-border/50 rounded-2xl shadow-xl h-fit max-h-[85vh]'} flex flex-col flex-shrink-0 relative`}>
          
          {/* Post Info Header */}
          <div className="border-b border-border/50 p-4 sm:p-5 flex-shrink-0 bg-card z-10 sticky top-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5 flex-1">
                <Link href={currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "/user/profile/me" : `/user/profile/${post.author.id}`}>
                  <img
                    src={post.author.avatar || "/placeholder.svg"}
                    alt={post.author.name}
                    className="h-11 w-11 rounded-full cursor-pointer hover:opacity-80 object-cover ring-2 ring-primary/5"
                  />
                </Link>
                <div>
                  <Link
                    href={currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "/user/profile/me" : `/user/profile/${post.author.id}`}
                    className="font-semibold text-[15px] text-foreground hover:text-primary transition-colors"
                  >
                    {post.author.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-full p-2 hover:bg-secondary transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/50 bg-card shadow-lg shadow-black/5 z-20 overflow-hidden">
                    {isAuthenticated && currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? (
                      <div className="p-1">
                        <button
                          onClick={() => { setIsEditMode(true); setIsMenuOpen(false) }}
                          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary text-left text-sm font-medium transition-colors"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span>Chỉnh sửa bài viết</span>
                        </button>
                        <button
                          onClick={() => { setShowDeletePostDialog(true); setIsMenuOpen(false) }}
                          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-destructive/10 text-left text-destructive text-sm font-medium transition-colors mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Xóa bài viết</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-1">
                        <button
                          onClick={() => {
                            if (!isAuthenticated) { setShowLoginDialog(true); setIsMenuOpen(false); return }
                            setShowReportDialog(true); setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-destructive/10 text-left text-destructive text-sm font-medium transition-colors"
                        >
                          <Flag className="h-4 w-4" />
                          <span>Báo cáo bài viết</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content Area: Caption + Comments */}
          <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30 custom-scrollbar">
            {/* Caption */}
            <div className="p-4 sm:p-5 bg-card">
              <p className="text-foreground leading-relaxed text-[15px] whitespace-pre-wrap">{caption}</p>
              
              {/* Stats */}
              <div className="flex gap-4 text-[13px] text-muted-foreground mt-4 pt-4 border-t border-border/30">
                <span className="font-medium text-foreground">{likeCount.toLocaleString("vi-VN")} <span className="font-normal text-muted-foreground">yêu thích</span></span>
                <span className="font-medium text-foreground">{post.comments} <span className="font-normal text-muted-foreground">bình luận</span></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 px-4 py-2 border-y border-border/50 bg-card sticky top-0 z-10 shadow-sm shadow-black/5">
              <button
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all duration-200 ${
                  isLiked ? "bg-rose-50 dark:bg-rose-950/30 text-rose-500" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-semibold text-sm">Thích</span>
              </button>

              <button
                onClick={async () => {
                  if (!isAuthenticated) { setShowLoginDialog(true); return }
                  const newIsSaved = !isSaved
                  setIsSaved(newIsSaved)
                  try {
                    const response = await fetch(`${getApiUrl()}/api/saved-posts/${id}`, {
                      method: newIsSaved ? "POST" : "DELETE",
                      headers: authUtils.getAuthHeaders(),
                    })
                    if (!response.ok) setIsSaved(!newIsSaved)
                    else if (post) setPost({ ...post, isSaved: newIsSaved })
                  } catch { setIsSaved(!newIsSaved) }
                }}
                disabled={!!(currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase())}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSaved ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title={currentUser && String(post.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "Bạn không thể lưu bài viết của chính mình" : ""}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                <span className="font-semibold text-sm">Lưu</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="p-4 sm:p-5 space-y-5">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Chưa có bình luận nào.<br/>Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <Link href={currentUser && String(comment.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "/user/profile/me" : `/user/profile/${comment.author.id}`} className="flex-shrink-0 pt-1">
                      <img
                        src={comment.author.avatar || "/placeholder.svg"}
                        alt={comment.author.name}
                        className="h-8 w-8 rounded-full cursor-pointer hover:opacity-80 object-cover ring-1 ring-border"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      {editingCommentId === comment.id ? (
                        <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/50"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border/50">
                            <button
                              onClick={() => { setEditingCommentId(null); setEditCommentText("") }}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={async () => {
                                if (editCommentText.trim()) {
                                  const success = await handleUpdateComment(comment.id, editCommentText)
                                  if (success) { setEditingCommentId(null); setEditCommentText("") }
                                }
                              }}
                              disabled={!editCommentText.trim()}
                              className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                              Cập nhật
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start max-w-[95%]">
                          <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                            <Link href={currentUser && String(comment.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "/user/profile/me" : `/user/profile/${comment.author.id}`}>
                              <span className="text-[13px] font-semibold text-foreground hover:text-primary cursor-pointer mb-1 block">
                                {comment.author.name}
                              </span>
                            </Link>
                            <p className="text-[14px] text-foreground leading-snug break-words whitespace-pre-wrap">
                              {comment.text}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1.5 px-2">
                            <span className="text-[11px] text-muted-foreground font-medium">{formatTimeAgo(comment.createdAt)}</span>
                            
                            <button
                              onClick={() => handleCommentLike(comment.id)}
                              className={`text-[12px] font-bold hover:underline ${comment.isLiked ? "text-rose-500" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              Thích {comment.likes > 0 && `(${comment.likes})`}
                            </button>

                            <button
                              onClick={() => {
                                if (!isAuthenticated) { setShowLoginDialog(true); return }
                                setReplyingTo({ id: comment.id, name: comment.author.name })
                                // Optional: focus input
                              }}
                              className="text-[12px] font-bold text-muted-foreground hover:text-foreground hover:underline"
                            >
                              Phản hồi
                            </button>
                            
                            {/* Comment Menu Trigger - Shows on hover of the comment block */}
                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setOpenCommentMenuId(openCommentMenuId === comment.id ? null : comment.id)}
                                className="p-1 rounded-full hover:bg-secondary text-muted-foreground"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                              
                              {openCommentMenuId === comment.id && (
                                <div className="absolute left-0 top-full mt-1 w-36 rounded-xl border border-border bg-card shadow-lg z-20 py-1">
                                  {isAuthenticated && currentUser && String(comment.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? (
                                    <>
                                      <button
                                        onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.text); setOpenCommentMenuId(null) }}
                                        className="w-full text-left px-3 py-2 hover:bg-secondary text-xs font-medium"
                                      >
                                        Chỉnh sửa
                                      </button>
                                      <button
                                        onClick={() => { setDeletingCommentId(comment.id); setShowDeleteDialog(true); setOpenCommentMenuId(null) }}
                                        className="w-full text-left px-3 py-2 hover:bg-destructive/10 text-destructive text-xs font-medium"
                                      >
                                        Xóa
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (!isAuthenticated) { setShowLoginDialog(true); setOpenCommentMenuId(null); return }
                                        setReportingCommentId(comment.id); setShowReportDialog(true); setOpenCommentMenuId(null)
                                      }}
                                      className="w-full text-left px-3 py-2 hover:bg-destructive/10 text-destructive text-xs font-medium"
                                    >
                                      Báo cáo
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* View Replies Button */}
                      {comment.replyCount > 0 && !comment.isRepliesExpanded && (
                        <button 
                          onClick={() => handleLoadReplies(comment.id)}
                          className="text-[12px] font-bold text-primary mt-2 ml-2 hover:underline flex items-center gap-2"
                          disabled={comment.isLoadingReplies}
                        >
                          <span className="w-6 border-b border-primary/50 inline-block mb-1"></span>
                          {comment.isLoadingReplies ? "Đang tải..." : `Xem ${comment.replyCount} phản hồi`}
                        </button>
                      )}

                      {/* Replies List */}
                      {comment.isRepliesExpanded && comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-4 border-l-2 border-border/40 pl-4 ml-4">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="flex gap-3 group">
                              <Link href={currentUser && String(reply.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "/user/profile/me" : `/user/profile/${reply.author.id}`} className="flex-shrink-0 pt-1">
                                <img
                                  src={reply.author.avatar || "/placeholder.svg"}
                                  alt={reply.author.name}
                                  className="h-7 w-7 rounded-full cursor-pointer hover:opacity-80 object-cover ring-1 ring-border"
                                />
                              </Link>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col items-start max-w-[95%]">
                                  <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                                    <Link href={currentUser && String(reply.author.id).toLowerCase() === String(currentUser.id).toLowerCase() ? "/user/profile/me" : `/user/profile/${reply.author.id}`}>
                                      <span className="text-[13px] font-semibold text-foreground hover:text-primary cursor-pointer mb-1 block">
                                        {reply.author.name}
                                      </span>
                                    </Link>
                                    <p className="text-[14px] text-foreground leading-snug break-words whitespace-pre-wrap">
                                      {reply.text}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 mt-1.5 px-2">
                                    <span className="text-[11px] text-muted-foreground font-medium">{formatTimeAgo(reply.createdAt)}</span>
                                    <button
                                      onClick={() => {}} // Could implement reply-to-reply or just like
                                      className="text-[12px] font-bold text-muted-foreground hover:text-foreground hover:underline"
                                    >
                                      Thích {reply.likes > 0 && `(${reply.likes})`}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Input Footer */}
          <div className="border-t border-border/50 bg-card p-3 sm:p-4 flex-shrink-0 z-10 flex flex-col">
            {commentError && (
              <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-[13px] font-medium text-destructive">
                {commentError}
              </div>
            )}
            {replyingTo && (
              <div className="flex items-center justify-between bg-primary/5 text-primary text-xs font-medium px-3 py-2 rounded-lg mb-2">
                <span>Đang trả lời <strong>{replyingTo.name}</strong></span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-primary/70">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmitComment} className="flex gap-3 items-end relative">
              {isAuthenticated && currentUser && (
                <img
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt={currentUser.name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-border mb-0.5 hidden sm:block"
                />
              )}
              <div className="flex-1 bg-secondary/50 border border-border/50 rounded-2xl focus-within:border-primary/50 focus-within:bg-card focus-within:shadow-sm transition-all flex items-end">
                <textarea
                  placeholder={isAuthenticated ? "Viết bình luận..." : "Đăng nhập để bình luận"}
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value)
                    // Auto-resize textarea logic can be added here if needed
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                  }}
                  onClick={() => { if (!isAuthenticated) setShowLoginDialog(true) }}
                  disabled={!isAuthenticated || isSubmittingComment}
                  className="w-full bg-transparent px-4 py-3 text-[14px] outline-none resize-none placeholder:text-muted-foreground/60 min-h-[44px] max-h-[100px] custom-scrollbar"
                  rows={1}
                />
                {isAuthenticated && (
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="p-3 text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className={`h-5 w-5 ${isSubmittingComment ? 'animate-pulse' : ''}`} />
                  </button>
                )}
              </div>
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
                onClick={() => { setIsEditMode(false); setEditCaption(post?.caption || ""); setEditImages(images) }}
                className="rounded-full p-2 hover:bg-secondary transition"
              >
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
                {editImages.length < MAX_IMAGES ? (
                  <label className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm">
                      {editImages.length > 0 ? `Thêm ảnh (${editImages.length}/${MAX_IMAGES})` : "Thêm ảnh"}
                    </span>
                    <input
                      type="file" accept="image/*" multiple className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files || [])
                        const remaining = MAX_IMAGES - editImages.length
                        files.slice(0, remaining).forEach(file => {
                          const reader = new FileReader()
                          reader.onload = ev => setEditImages(prev => [...prev, ev.target?.result as string])
                          reader.readAsDataURL(file)
                        })
                        e.target.value = ""
                      }}
                    />
                  </label>
                ) : (
                  <span className="text-sm text-muted-foreground">Đã đính kèm tối đa {MAX_IMAGES} ảnh</span>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1"
                  onClick={() => { setIsEditMode(false); setEditCaption(post?.caption || ""); setEditImages(images) }}>
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
      </div>
    </main>
  )
}
