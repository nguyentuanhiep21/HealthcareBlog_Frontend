"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { CreatePostBox } from "@/components/create-post-box"
import { PostCard } from "@/components/post-card"
import { SafeAvatar } from "@/components/safe-avatar"
import { Button } from "@/components/ui/button"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { useAuth } from "@/components/auth-provider"
import { authUtils } from "@/lib/auth-utils"
import { getApiUrl } from "@/lib/utils"
import Link from "next/link"
import type { Post } from "@/lib/types"
import { chatService } from "@/lib/chat-service"
import { MessageSquare, Hash, Lightbulb } from "lucide-react"
import { BackgroundPattern } from "@/components/background-pattern"

const HEALTH_TIPS = [
  { icon: "💧", tip: "Uống đủ 2 lít nước mỗi ngày giúp cơ thể thải độc và tăng cường." },
  { icon: "🥗", tip: "Ăn nhiều rau xanh và trái cây để cung cấp vitamin thiết yếu." },
  { icon: "🚶", tip: "Đi bộ 30 phút mỗi ngày giảm nguy cơ mắc bệnh tim mạch." },
  { icon: "😴", tip: "Ngủ đủ 7-8 tiếng mỗi đêm giúp tăng cường hệ miễn dịch." },
  { icon: "🧘", tip: "Thiền định 10 phút mỗi ngày giúp giảm căng thẳng." },
  { icon: "🌞", tip: "Tắm nắng 15 phút buổi sáng cung cấp vitamin D tự nhiên." },
  { icon: "🍎", tip: "Ăn bữa sáng đầy đủ giúp duy trì năng lượng cả ngày." },
]

const POPULAR_TOPICS = [
  { label: "Dinh dưỡng", href: "/user/search?q=dinh+dưỡng" },
  { label: "Tập luyện", href: "/user/search?q=tập+luyện" },
  { label: "Tâm lý", href: "/user/search?q=tâm+lý" },
  { label: "Tim mạch", href: "/user/search?q=tim+mạch" },
  { label: "Giảm cân", href: "/user/search?q=giảm+cân" },
  { label: "Đường huyết", href: "/user/search?q=đường+huyết" },
  { label: "Ung thư", href: "/user/search?q=ung+thư" },
  { label: "Huyết áp", href: "/user/search?q=huyết+áp" },
]

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
  const [recentChats, setRecentChats] = useState<{ id: string; name: string; avatar: string; isOnline: boolean }[]>([])

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const observer = useRef<IntersectionObserver | null>(null)
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, isLoadingMore, hasMore])

  useEffect(() => {
    fetchPosts(1)
    fetchTrendingPosts()
    fetchSuggestedUsers()
  }, [])

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page)
    }
  }, [page])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isAuthenticated) return
      
      const token = authUtils.getToken()
      if (!token) return
      
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
        const response = await fetch(`${backendUrl}/api/user/account`, {
          headers: authUtils.getAuthHeaders(),
        })

        if (response.ok) {
          const userData = await response.json()
          setCurrentUser({
            id: userData.id,
            name: userData.fullName,
            avatar: userData.avatarUrl
              ? (userData.avatarUrl.startsWith('http') 
                  ? userData.avatarUrl 
                  : `${backendUrl}${userData.avatarUrl}`)
              : '/placeholder.svg',
          })
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    let mounted = true

    const fetchRecentChats = async () => {
      try {
        const convs = await chatService.getConversations(1, 3)
        if (!mounted) return
        const recent = convs.slice(0, 3).map(c => ({
          id: c.otherUser.id,
          name: c.otherUser.fullName,
          avatar: c.otherUser.avatarUrl || '/placeholder.svg',
          isOnline: c.otherUser.isOnline
        }))
        setRecentChats(recent)
      } catch (err) {
        console.error("Failed to fetch recent chats", err)
      }
    }

    const setupChat = async () => {
      await fetchRecentChats()
      try {
        await chatService.connect()
        if (!mounted) return

        chatService.onUserIsOnline((userId) => {
          setRecentChats((prev) => prev.map(c => c.id === userId ? { ...c, isOnline: true } : c))
        })
        chatService.onUserIsOffline((userId) => {
          setRecentChats((prev) => prev.map(c => c.id === userId ? { ...c, isOnline: false } : c))
        })
      } catch (err) {
        console.warn("SignalR connection failed:", err)
      }
    }
    setupChat()

    return () => {
      mounted = false
      chatService.offAll()
      chatService.release()
    }
  }, [isAuthenticated])

  const fetchPosts = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError("")
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"}/api/post?page=${pageNumber}&pageSize=20`,
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
        const fullAvatarUrl = avatarUrl && avatarUrl.trim()
          ? (avatarUrl.startsWith('http') ? avatarUrl : `${backendUrl}${avatarUrl}`)
          : "/placeholder.svg"
          
        const imageUrl = post.imageUrl
        const fullImageUrl = imageUrl
          ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`)
          : undefined

        // Build images list (multi-image support)
        const rawImages: string[] = Array.isArray(post.imageUrls) ? post.imageUrls : []
        const fullImages: string[] = rawImages.length > 0
          ? rawImages.map((u: string) => u.startsWith('http') ? u : `${backendUrl}${u}`)
          : (fullImageUrl ? [fullImageUrl] : [])
          
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
          image: fullImages[0],
          images: fullImages.length > 0 ? fullImages : undefined,
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          isSaved: post.isSavedByCurrentUser || false,
          isLiked: post.isLikedByCurrentUser || false,
          createdAt: post.createdAt || new Date().toISOString(),
        }
      })

      if (pageNumber === 1) {
        setPosts(mappedPosts)
      } else {
        setPosts(prev => [...prev, ...mappedPosts])
      }
      
      if (mappedPosts.length < 20) {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Fetch posts error:", error)
      if (pageNumber === 1) setError("Đã xảy ra lỗi khi tải bài viết")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const fetchTrendingPosts = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/posts/trending-redis`)

      if (!response.ok) {
        console.error("Failed to fetch trending posts")
        return
      }

      const data = await response.json()
      
      // Map backend data to frontend Post type
      const mappedPosts: Post[] = data.map((post: any) => {
        const imageUrl = post.imageUrl
        const fullImageUrl = imageUrl
          ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`)
          : undefined
          
        return {
          id: post.id?.toString() || "",
          author: {
            id: "",
            name: post.authorName || "Unknown",
            avatar: "/placeholder.svg",
            bio: "",
            followers: 0,
            following: 0,
          },
          caption: post.content || "",
          image: fullImageUrl,
          images: fullImageUrl ? [fullImageUrl] : undefined,
          likes: 0,
          comments: 0,
          isSaved: false,
          isLiked: false,
          createdAt: new Date().toISOString(),
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

  const handleFollowClick = async (userId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    
    if (followedUsers.has(userId)) {
      setSelectedUserId(userId)
      setShowUnfollowDialog(true)
    } else {
      // Follow user
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
        const response = await fetch(`${backendUrl}/api/follow/${userId}`, {
          method: "POST",
          headers: authUtils.getAuthHeaders(),
        })

        if (response.ok) {
          setFollowedUsers((prev) => {
            const newSet = new Set(prev)
            newSet.add(userId)
            return newSet
          })
          
          // Cập nhật follower count
          setSuggestedUsers((prev) =>
            prev.map((u) =>
              u.id === userId ? { ...u, followerCount: u.followerCount + 1 } : u
            )
          )
        }
      } catch (error) {
        console.error("Error following user:", error)
      }
    }
  }

  const handleConfirmUnfollow = async () => {
    if (selectedUserId) {
      // Unfollow user
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
        const response = await fetch(`${backendUrl}/api/follow/${selectedUserId}`, {
          method: "DELETE",
          headers: authUtils.getAuthHeaders(),
        })

        if (response.ok) {
          setFollowedUsers((prev) => {
            const newSet = new Set(prev)
            newSet.delete(selectedUserId)
            return newSet
          })

          // Cập nhật follower count
          setSuggestedUsers((prev) =>
            prev.map((u) =>
              u.id === selectedUserId ? { ...u, followerCount: Math.max(0, u.followerCount - 1) } : u
            )
          )
        }
      } catch (error) {
        console.error("Error unfollowing user:", error)
      }
    }
    setShowUnfollowDialog(false)
    setSelectedUserId(null)
  }

  const handleCancelUnfollow = () => {
    setShowUnfollowDialog(false)
    setSelectedUserId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <BackgroundPattern />

      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-4">
            
          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block space-y-4 lg:col-span-1 sticky top-20 h-fit">
            {/* Quick Profile */}
            {isAuthenticated && currentUser && (
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <Link href="/user/profile/me" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">
                      Trang cá nhân của bạn
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Health Tip */}
            {(() => {
              const tip = HEALTH_TIPS[new Date().getDay() % HEALTH_TIPS.length]
              return (
                <div className="rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 pt-4 pb-3" style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lightbulb className="h-4 w-4 text-cyan-200" />
                      <span className="text-[11px] font-semibold text-cyan-100 uppercase tracking-wider">Mẹo sức khỏe</span>
                    </div>
                    <p className="text-white text-[13px] leading-relaxed font-medium">
                      <span className="mr-1.5 text-base">{tip.icon}</span>
                      {tip.tip}
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Popular Topics */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-5 shadow-sm">
              <h2 className="mb-3 text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-rose-400 inline-block"></span>
                Chủ đề nổi bật
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-100 dark:border-slate-700 transition-all duration-200"
                  >
                    <Hash className="h-3.5 w-3.5 opacity-70" />{label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Chats (Online Status) */}
            {isAuthenticated && recentChats.length > 0 && (
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-5 shadow-sm">
                <h2 className="mb-3 text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-emerald-400 inline-block"></span>
                  Liên hệ gần đây
                </h2>
                <div className="flex flex-col gap-3">
                  {recentChats.map((chat) => (
                    <Link
                      key={chat.id}
                      href={`/user/chat?userId=${chat.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-teal-100 dark:group-hover:ring-teal-900/50 transition-all" />
                        {chat.isOnline ? (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" title="Đang hoạt động" />
                        ) : (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" title="Ngoại tuyến" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {chat.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {chat.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MAIN FEED */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePostBox onPostCreate={handlePostCreate} />

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-32" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
                    </div>
                    <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4" />
                    <div className="flex gap-3">
                      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex-1" />
                      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex-1" />
                      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts */}
            {!isLoading && !error && (
              <div className="space-y-0">
                {posts.length > 0 ? (
                  <>
                    {posts.map((post, index) => {
                      if (posts.length === index + 1) {
                        return (
                          <div ref={lastPostElementRef} key={post.id}>
                            <PostCard 
                              post={post} 
                              onPostUpdate={handlePostUpdate} 
                              onPostDelete={handlePostDelete}
                              currentUser={currentUser} 
                            />
                          </div>
                        )
                      } else {
                        return (
                          <PostCard 
                            key={post.id} 
                            post={post} 
                            onPostUpdate={handlePostUpdate} 
                            onPostDelete={handlePostDelete}
                            currentUser={currentUser} 
                          />
                        )
                      }
                    })}
                    {isLoadingMore && (
                      <div className="py-4 text-center flex items-center justify-center">
                        <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có bài viết nào</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Hãy là người đầu tiên chia sẻ!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="hidden lg:block space-y-4 lg:col-span-1 sticky top-20 h-fit">


            {/* Featured Posts */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h2 className="mb-4 text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-teal-500 inline-block"></span>
                Bài viết nổi bật
              </h2>
              <div className="space-y-3">
                {trendingPosts.length > 0 ? (
                  trendingPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/user/post/${post.id}`}
                      className="group flex gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      {(post.images && post.images.length > 0 ? post.images[0] : post.image) && (
                        <img
                          src={post.images?.[0] || post.image}
                          alt={post.caption}
                          className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">{post.caption}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{post.author.name}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Chưa có bài viết nổi bật hôm nay</p>
                )}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h2 className="mb-4 text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-indigo-500 inline-block"></span>
                Thành viên nổi bật
              </h2>
              <div className="space-y-3">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((suggestedUser) => {
                    const isCurrentUser = user && suggestedUser.id === user.id;
                    
                    return (
                      <div key={suggestedUser.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Link href={isCurrentUser ? "/user/profile/me" : `/user/profile/${suggestedUser.id}`}>
                            <SafeAvatar
                              src={suggestedUser.avatarUrl}
                              alt={suggestedUser.fullName}
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 flex-shrink-0"
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link href={isCurrentUser ? "/user/profile/me" : `/user/profile/${suggestedUser.id}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate block">
                              {suggestedUser.fullName}
                            </Link>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {suggestedUser.followerCount.toLocaleString("vi-VN")} người theo dõi
                            </p>
                          </div>
                        </div>
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleFollowClick(suggestedUser.id)}
                            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                              followedUsers.has(suggestedUser.id)
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                : "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800"
                            }`}
                          >
                            {followedUsers.has(suggestedUser.id) ? "Đang theo dõi" : "Theo dõi"}
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Chưa có thành viên nổi bật</p>
                )}
              </div>
            </div>

            {/* Saved Posts - Only show if authenticated */}
            {isAuthenticated && (
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <h2 className="mb-4 text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-emerald-500 inline-block"></span>
                  Bài viết đã lưu
                </h2>
                <div className="space-y-2">
                  {posts.filter(p => p.isSaved).slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/user/post/${post.id}`}
                      className="group block rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{post.author.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">{post.caption}</p>
                    </Link>
                  ))}
                  {posts.filter(p => p.isSaved).length === 0 && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Chưa có bài viết đã lưu</p>
                  )}
                </div>
                <Link href="/user/saved">
                  <button className="w-full mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 py-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-150 cursor-pointer">
                    Xem tất cả
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating Chat Button ─────────────────────────────────────────── */}
      <Link href="/user/chat">
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-2xl cursor-pointer group transition-all duration-200 hover:scale-105 hover:shadow-[0_8px_32px_rgba(8,145,178,0.45)]"
          style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Chat</span>
          {/* Pulse indicator — coming soon badge */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-400 items-center justify-center">
              <span className="text-[8px] text-white font-bold">!</span>
            </span>
          </span>
        </div>
      </Link>

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
    </div>
  )
}
