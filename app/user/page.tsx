"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { CreatePostBox } from "@/components/create-post-box"
import { PostCard } from "@/components/post-card"
import { SafeAvatar } from "@/components/safe-avatar"
import { Button } from "@/components/ui/button"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { useAuth } from "@/components/auth-provider"
import { authUtils } from "@/lib/auth-utils"
import Link from "next/link"
import type { Post } from "@/lib/types"

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  interface SuggestedUser {
    id: string
    fullName: string
    avatarUrl: string | null
    followerCount: number
    isFollowing: boolean
  }

  const [posts, setPosts] = useState<Post[]>([])
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null)

  useEffect(() => {
    fetchPosts()
    fetchTrendingPosts()
    fetchSuggestedUsers()
  }, [])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isAuthenticated) return
      
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

    fetchCurrentUser()
  }, [isAuthenticated])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/post?page=1&pageSize=20`,
        {
          method: "GET",
          headers: authUtils.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error("Không thể tải bài viết")
      }

      const data = await response.json()
      
      console.log("API Response:", data) // Debug log
      
      // Check if data is an array or wrapped in an object
      const postsArray = Array.isArray(data) ? data : (data.posts || data.data || [])
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      
      // Map backend data to frontend Post type
      const mappedPosts: Post[] = postsArray.map((post: any) => {
        const avatarUrl = post.author?.avatarUrl
        const fullAvatarUrl = avatarUrl 
          ? (avatarUrl.startsWith('http') ? avatarUrl : `${backendUrl}${avatarUrl}`)
          : "/placeholder.svg"
          
        const imageUrl = post.imageUrl
        const fullImageUrl = imageUrl
          ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`)
          : undefined
          
        return {
          id: post.id?.toString() || "",
          author: {
            id: post.author?.id || "",
            name: post.author?.fullName || "Unknown",
            avatar: fullAvatarUrl,
            bio: post.author?.bio || "",
            followers: 0,
            following: 0,
            isFollowing: post.author?.isFollowing || false,
          },
          caption: post.content || "",
          image: fullImageUrl,
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          isSaved: post.isSavedByCurrentUser || false,
          isLiked: post.isLikedByCurrentUser || false,
          createdAt: post.createdAt || new Date().toISOString(),
        }
      })

      setPosts(mappedPosts)
    } catch (error) {
      console.error("Fetch posts error:", error)
      setError("Đã xảy ra lỗi khi tải bài viết")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTrendingPosts = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(
        `${backendUrl}/api/post/trending`,
        {
          method: "GET",
          headers: authUtils.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        console.error("Failed to fetch trending posts")
        return
      }

      const data = await response.json()
      
      // Map backend data to frontend Post type
      const mappedPosts: Post[] = data.map((post: any) => {
        const author = post.author || post.Author
        const avatarUrl = author?.avatarUrl || author?.AvatarUrl
        const fullAvatarUrl = avatarUrl 
          ? (avatarUrl.startsWith('http') ? avatarUrl : `${backendUrl}${avatarUrl}`)
          : "/placeholder.svg"
          
        const imageUrl = post.imageUrl || post.ImageUrl
        const fullImageUrl = imageUrl
          ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`)
          : undefined
          
        return {
          id: post.id?.toString() || "",
          author: {
            id: author?.id || "",
            name: author?.fullName || author?.FullName || "Unknown",
            avatar: fullAvatarUrl,
            bio: author?.bio || author?.Bio || "",
            followers: 0,
            following: 0,
          },
          caption: post.content || post.Content || "",
          image: fullImageUrl,
          likes: post.likeCount || post.LikeCount || 0,
          comments: post.commentCount || post.CommentCount || 0,
          isSaved: post.isSavedByCurrentUser || post.IsSavedByCurrentUser || false,
          isLiked: post.isLikedByCurrentUser || post.IsLikedByCurrentUser || false,
          createdAt: post.uploadTime || post.UploadTime || post.createdAt || post.CreatedAt || new Date().toISOString(),
        }
      })

      setTrendingPosts(mappedPosts)
    } catch (err) {
      console.error("Error fetching trending posts:", err)
    }
  }

  const fetchSuggestedUsers = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(
        `${backendUrl}/api/user/suggested`,
        {
          method: "GET",
          headers: authUtils.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        console.error("Failed to fetch suggested users")
        return
      }

      const data: SuggestedUser[] = await response.json()
      
      // Map avatarUrl to full URL
      const mappedUsers = data.map(user => ({
        ...user,
        avatarUrl: user.avatarUrl
          ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${backendUrl}${user.avatarUrl}`)
          : null
      }))
      
      setSuggestedUsers(mappedUsers)
      
      // Initialize followedUsers set based on isFollowing from API
      const initialFollowed = new Set(mappedUsers.filter(u => u.isFollowing).map(u => u.id))
      setFollowedUsers(initialFollowed)
    } catch (err) {
      console.error("Error fetching suggested users:", err)
    }
  }

  const handlePostCreate = (newPost: Post) => {
    setPosts([newPost, ...posts])
  }

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      )
    )
  }

  const handlePostDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }

  const handleFollowClick = (userId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    
    if (followedUsers.has(userId)) {
      setSelectedUserId(userId)
      setShowUnfollowDialog(true)
    } else {
      setFollowedUsers((prev) => {
        const newSet = new Set(prev)
        newSet.add(userId)
        return newSet
      })
    }
  }

  const handleConfirmUnfollow = () => {
    if (selectedUserId) {
      setFollowedUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(selectedUserId)
        return newSet
      })
    }
    setShowUnfollowDialog(false)
    setSelectedUserId(null)
  }

  const handleCancelUnfollow = () => {
    setShowUnfollowDialog(false)
    setSelectedUserId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-3">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <CreatePostBox onPostCreate={handlePostCreate} />

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Posts */}
            {!isLoading && !error && (
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onPostUpdate={handlePostUpdate} 
                      onPostDelete={handlePostDelete}
                      currentUser={currentUser} 
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Chưa có bài viết nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Featured Posts */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 text-lg font-bold">Bài viết nổi bật</h2>
              <div className="space-y-3">
                {trendingPosts.length > 0 ? (
                  trendingPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/user/post/${post.id}`}
                      className="group block rounded-lg overflow-hidden hover:opacity-80 transition"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-2 group-hover:underline">{post.caption}</p>
                          <p className="text-xs text-muted-foreground mt-1">{post.author.name}</p>
                        </div>
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.caption}
                            className="h-20 w-20 rounded object-cover flex-shrink-0"
                          />
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Chưa có bài viết nổi bật hôm nay</p>
                )}
              </div>
            </div>

            {/* Suggested Users - TODO: Replace with API */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 text-lg font-bold">Thành viên nổi bật</h2>
              <div className="space-y-3">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((suggestedUser) => {
                    const isCurrentUser = user && suggestedUser.id === user.id;
                    
                    return (
                      <div key={suggestedUser.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link href={`/user/profile/${suggestedUser.id}`} className="hover:underline">
                            <SafeAvatar
                              src={suggestedUser.avatarUrl}
                              alt={suggestedUser.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link href={`/user/profile/${suggestedUser.id}`} className="hover:underline text-sm font-semibold truncate">
                              {suggestedUser.fullName}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {suggestedUser.followerCount.toLocaleString("vi-VN")} người theo dõi
                            </p>
                          </div>
                        </div>
                        {!isCurrentUser && (
                          <Button
                            size="sm"
                            variant={followedUsers.has(suggestedUser.id) ? "outline" : "default"}
                            className={followedUsers.has(suggestedUser.id) ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                            onClick={() => handleFollowClick(suggestedUser.id)}
                          >
                            {followedUsers.has(suggestedUser.id) ? "Đang theo dõi" : "Theo dõi"}
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Chưa có thành viên nổi bật</p>
                )}
              </div>
            </div>

            {/* Saved Posts - Only show if authenticated */}
            {isAuthenticated && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-4 text-lg font-bold">Bài viết đã lưu</h2>
                <div className="space-y-3">
                  {posts.filter(p => p.isSaved).slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/user/post/${post.id}`}
                      className="group block rounded-lg overflow-hidden hover:opacity-80 transition p-2"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold group-hover:underline">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
                      </div>
                    </Link>
                  ))}
                  {posts.filter(p => p.isSaved).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có bài viết đã lưu</p>
                  )}
                </div>
                <Link href="/user/saved">
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Required Dialog */}
      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />

      {/* Unfollow Confirmation Dialog */}
      {showUnfollowDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Bỏ theo dõi</h2>
            <p className="text-muted-foreground mb-6">
              Bạn có chắc chắn muốn bỏ theo dõi người dùng này không?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancelUnfollow}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleConfirmUnfollow}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
