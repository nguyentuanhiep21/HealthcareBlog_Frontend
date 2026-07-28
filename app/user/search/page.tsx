"use client"

import { useState, useEffect, Suspense } from "react"
import { Search, AlertCircle, FileText, Users, UserPlus, SearchX } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { BackgroundPattern } from "@/components/background-pattern"
import { PostCard } from "@/components/post-card"
import { useSearchParams, useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"
import { useAuth } from "@/components/auth-provider"
import type { Post } from "@/lib/types"
import { Avatar } from "@/components/ui/avatar"

interface SearchUser {
  id: string
  fullName: string
  avatarUrl: string
  bio: string
  followerCount: number
  isFollowing: boolean
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const query = searchParams.get("q") || ""
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "users">("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<SearchUser[]>([])
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (query.trim()) {
      searchContent()
    } else {
      setPosts([])
      setUsers([])
      setTotalPosts(0)
      setTotalUsers(0)
    }
  }, [query])

  const handlePostDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setTotalPosts(prev => Math.max(0, prev - 1))
  }

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
  }

  const searchContent = async () => {
    setIsLoading(true)
    setError("")

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      
      let endpoint = ""
      if (activeTab === "posts") {
        endpoint = `/api/search/posts?query=${encodeURIComponent(query)}&page=1&pageSize=20`
      } else if (activeTab === "users") {
        endpoint = `/api/search/users?query=${encodeURIComponent(query)}&page=1&pageSize=20`
      } else {
        endpoint = `/api/search?query=${encodeURIComponent(query)}&page=1&pageSize=20`
      }

      const response = await fetch(`${backendUrl}${endpoint}`, {
        headers: authUtils.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch search results")
      }

      const data = await response.json()

      if (activeTab === "posts") {
        // Data is array of posts
        const mappedPosts: Post[] = data.map((post: any) => {
          const rawImages: string[] = Array.isArray(post.imageUrls) ? post.imageUrls : []
          const fullImageUrl = post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${backendUrl}${post.imageUrl}`) : undefined
          const fullImages: string[] = rawImages.length > 0
            ? rawImages.map((u: string) => u.startsWith('http') ? u : `${backendUrl}${u}`)
            : (fullImageUrl ? [fullImageUrl] : [])

          return {
            id: post.id?.toString() || "",
            author: {
              id: post.authorId,
              name: post.authorName,
              avatar: post.authorAvatarUrl 
                ? (post.authorAvatarUrl.startsWith('http') 
                    ? post.authorAvatarUrl 
                    : `${backendUrl}${post.authorAvatarUrl}`)
                : "/placeholder.svg",
              bio: post.authorBio || "",
              followers: post.authorFollowerCount || 0,
              following: post.authorFollowingCount || 0,
            },
            caption: post.content || "",
            image: fullImages[0],
            images: fullImages.length > 0 ? fullImages : undefined,
            likes: post.likeCount || 0,
            comments: post.commentCount || 0,
            isLiked: post.isLikedByCurrentUser || false,
            isSaved: post.isSavedByCurrentUser || false,
            createdAt: post.uploadTime || new Date().toISOString(),
          }
        })
        setPosts(mappedPosts)
        setTotalPosts(mappedPosts.length)
      } else if (activeTab === "users") {
        // Data is array of users
        const mappedUsers: SearchUser[] = data.map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl 
            ? (user.avatarUrl.startsWith('http') 
                ? user.avatarUrl 
                : `${backendUrl}${user.avatarUrl}`)
            : "/placeholder.svg",
          bio: user.bio || "",
          followerCount: user.followerCount || 0,
          isFollowing: user.isFollowing || false,
        }))
        setUsers(mappedUsers)
        setTotalUsers(mappedUsers.length)
      } else {
        // All results
        const mappedPosts: Post[] = (data.posts || []).map((post: any) => {
          const rawImages: string[] = Array.isArray(post.imageUrls) ? post.imageUrls : []
          const fullImageUrl = post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${backendUrl}${post.imageUrl}`) : undefined
          const fullImages: string[] = rawImages.length > 0
            ? rawImages.map((u: string) => u.startsWith('http') ? u : `${backendUrl}${u}`)
            : (fullImageUrl ? [fullImageUrl] : [])

          return {
            id: post.id?.toString() || "",
            author: {
              id: post.authorId,
              name: post.authorName,
              avatar: post.authorAvatarUrl 
                ? (post.authorAvatarUrl.startsWith('http') 
                    ? post.authorAvatarUrl 
                    : `${backendUrl}${post.authorAvatarUrl}`)
                : "/placeholder.svg",
              bio: post.authorBio || "",
              followers: post.authorFollowerCount || 0,
              following: post.authorFollowingCount || 0,
            },
            caption: post.content || "",
            image: fullImages[0],
            images: fullImages.length > 0 ? fullImages : undefined,
            likes: post.likeCount || 0,
            comments: post.commentCount || 0,
            isLiked: post.isLikedByCurrentUser || false,
            isSaved: post.isSavedByCurrentUser || false,
            createdAt: post.uploadTime || new Date().toISOString(),
          }
        })

        const mappedUsers: SearchUser[] = (data.users || []).map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl 
            ? (user.avatarUrl.startsWith('http') 
                ? user.avatarUrl 
                : `${backendUrl}${user.avatarUrl}`)
            : "/placeholder.svg",
          bio: user.bio || "",
          followerCount: user.followerCount || 0,
          isFollowing: user.isFollowing || false,
        }))

        setPosts(mappedPosts)
        setUsers(mappedUsers)
        setTotalPosts(data.totalPosts || 0)
        setTotalUsers(data.totalUsers || 0)
      }
    } catch (error) {
      console.error("Search error:", error)
      setError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const newIsFollowing = !user.isFollowing
    
    // Optimistic update
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, isFollowing: newIsFollowing, followerCount: newIsFollowing ? u.followerCount + 1 : u.followerCount - 1 }
        : u
    ))

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const method = newIsFollowing ? "POST" : "DELETE"
      
      const response = await fetch(`${backendUrl}/api/follow/${userId}`, {
        method,
        headers: authUtils.getAuthHeaders(),
      })
      
      if (!response.ok) {
        // Revert on error
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, isFollowing: !newIsFollowing, followerCount: newIsFollowing ? u.followerCount - 1 : u.followerCount + 1 }
            : u
        ))
      }
    } catch (error) {
      console.error("Error following user:", error)
      // Revert on error
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, isFollowing: !newIsFollowing, followerCount: newIsFollowing ? u.followerCount - 1 : u.followerCount + 1 }
          : u
      ))
    }
  }

  useEffect(() => {
    if (query.trim()) {
      searchContent()
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <BackgroundPattern />
      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Search Header */}
        <div className="mb-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400">
              <Search className="h-6 w-6" />
            </div>
            Kết quả tìm kiếm
          </h1>
          {query ? (
            <p className="text-slate-500 font-medium ml-14">
              Hiển thị kết quả cho từ khóa: <span className="font-bold text-teal-600 dark:text-teal-400 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-xl ml-1">"{query}"</span>
            </p>
          ) : (
            <p className="text-slate-500 font-medium ml-14">Nhập từ khóa trên thanh tìm kiếm để bắt đầu</p>
          )}
        </div>

        {/* Tabs */}
        {query && (
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-full font-bold text-[15px] whitespace-nowrap transition-all duration-300 focus:outline-none ${
                activeTab === "all"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/40"
                  : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tất cả kết quả
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-6 py-3 rounded-full font-bold text-[15px] whitespace-nowrap transition-all duration-300 focus:outline-none ${
                activeTab === "posts"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/40"
                  : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Bài viết {activeTab === "all" && totalPosts > 0 && <span className="ml-2 px-2.5 py-0.5 bg-white/20 text-white rounded-full text-xs font-semibold">{totalPosts}</span>}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 rounded-full font-bold text-[15px] whitespace-nowrap transition-all duration-300 focus:outline-none ${
                activeTab === "users"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/40"
                  : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Người dùng {activeTab === "all" && totalUsers > 0 && <span className="ml-2 px-2.5 py-0.5 bg-white/20 text-white rounded-full text-xs font-semibold">{totalUsers}</span>}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm animate-pulse flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/6"></div>
                  </div>
                </div>
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 bg-rose-50/50 dark:bg-rose-900/10 backdrop-blur-sm border border-rose-200 dark:border-rose-800/30 rounded-3xl animate-in zoom-in-95">
            <div className="h-16 w-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <p className="text-rose-600 dark:text-rose-400 font-bold text-lg">{error}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && query && (
          <>
            {/* Posts Results */}
            {(activeTab === "all" || activeTab === "posts") && (
              <div className="mb-10">
                {activeTab === "posts" && posts.length > 0 && (
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-teal-500" />
                    {posts.length} bài viết
                  </h2>
                )}
                {activeTab === "all" && posts.length > 0 && (
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-teal-500" />
                    Bài viết liên quan
                  </h2>
                )}
                {posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        currentUser={currentUser ? { id: currentUser.id, name: currentUser.fullName || "", avatar: currentUser.avatarUrl || "" } : null}
                        onPostDelete={handlePostDelete}
                        onPostUpdate={handlePostUpdate}
                      />
                    ))}
                  </div>
                ) : activeTab === "posts" ? (
                  <EmptyState type="posts" />
                ) : null}
              </div>
            )}

            {/* Users Results */}
            {(activeTab === "all" || activeTab === "users") && (
              <div>
                {activeTab === "users" && users.length > 0 && (
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Users className="h-6 w-6 text-indigo-500" />
                    {users.length} người dùng
                  </h2>
                )}
                {activeTab === "all" && users.length > 0 && (
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Users className="h-6 w-6 text-indigo-500" />
                    Người dùng liên quan
                  </h2>
                )}
                {users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="group flex flex-col justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300"
                      >
                        <div 
                          className="flex items-start gap-4 cursor-pointer mb-5"
                          onClick={() => router.push(currentUser && user.id === currentUser.id ? "/user/profile/me" : `/user/profile/${user.id}`)}
                        >
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="h-16 w-16 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-900 group-hover:ring-teal-500/20 transition-all duration-300 shadow-sm"
                          />
                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-bold text-[16px] text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{user.fullName}</h3>
                            <p className="text-[13px] text-slate-500 mt-1 font-medium">
                              {user.followerCount} người theo dõi
                            </p>
                            {user.bio && (
                              <p className="text-[14px] text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        {(!currentUser || String(user.id).toLowerCase() !== String(currentUser.id).toLowerCase()) && (
                          <button
                            onClick={() => handleFollowUser(user.id)}
                            className={`w-full h-12 rounded-full text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                              user.isFollowing
                                ? "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800"
                                : "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20"
                            }`}
                          >
                            {user.isFollowing ? (
                              <>Đang theo dõi</>
                            ) : (
                              <>
                                <UserPlus className="h-5 w-5" />
                                Theo dõi
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : activeTab === "users" ? (
                  <EmptyState type="users" />
                ) : null}
              </div>
            )}

            {/* Empty State for All Tab */}
            {activeTab === "all" && posts.length === 0 && users.length === 0 && (
              <EmptyState type="all" />
            )}
          </>
        )}
      </div>
      </div>
    </div>
  )
}

function EmptyState({ type }: { type: "posts" | "users" | "all" }) {
  const messages = {
    posts: {
      title: "Không tìm thấy bài viết",
      description: "Thử tìm kiếm với một từ khóa khác ngắn gọn hoặc phổ biến hơn."
    },
    users: {
      title: "Không tìm thấy người dùng",
      description: "Tên người dùng này có thể không tồn tại hoặc đã bị đổi."
    },
    all: {
      title: "Không có kết quả nào",
      description: "Rất tiếc, chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa của bạn."
    }
  }

  const message = messages[type]

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
      <div className="h-24 w-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <SearchX className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{message.title}</h2>
      <p className="text-slate-500 text-center max-w-sm font-medium leading-relaxed">{message.description}</p>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
