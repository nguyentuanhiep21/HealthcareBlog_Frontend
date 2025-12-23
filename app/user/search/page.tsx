"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"
import { useSearchParams, useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"
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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
        const mappedPosts: Post[] = data.map((post: any) => ({
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
          image: post.imageUrl 
            ? (post.imageUrl.startsWith('http') 
                ? post.imageUrl 
                : `${backendUrl}${post.imageUrl}`)
            : undefined,
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          isLiked: post.isLikedByCurrentUser || false,
          isSaved: post.isSavedByCurrentUser || false,
          createdAt: post.uploadTime || new Date().toISOString(),
        }))
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
        const mappedPosts: Post[] = (data.posts || []).map((post: any) => ({
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
          image: post.imageUrl 
            ? (post.imageUrl.startsWith('http') 
                ? post.imageUrl 
                : `${backendUrl}${post.imageUrl}`)
            : undefined,
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          isLiked: post.isLikedByCurrentUser || false,
          isSaved: post.isSavedByCurrentUser || false,
          createdAt: post.uploadTime || new Date().toISOString(),
        }))

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Kết quả tìm kiếm</h1>
          {query && (
            <p className="text-muted-foreground">
              Tìm kiếm cho: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-4 font-semibold transition ${
                activeTab === "all"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-4 font-semibold transition ${
                activeTab === "posts"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bài viết {activeTab === "all" && totalPosts > 0 && `(${totalPosts})`}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-4 font-semibold transition ${
                activeTab === "users"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Người dùng {activeTab === "all" && totalUsers > 0 && `(${totalUsers})`}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {/* Posts Results */}
            {(activeTab === "all" || activeTab === "posts") && (
              <div className="mb-8">
                {activeTab === "posts" && (
                  <h2 className="text-lg font-semibold mb-4">
                    {posts.length} bài viết được tìm thấy
                  </h2>
                )}
                {activeTab === "all" && posts.length > 0 && (
                  <h2 className="text-lg font-semibold mb-4">Bài viết</h2>
                )}
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
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
                {activeTab === "users" && (
                  <h2 className="text-lg font-semibold mb-4">
                    {users.length} người dùng được tìm thấy
                  </h2>
                )}
                {activeTab === "all" && users.length > 0 && (
                  <h2 className="text-lg font-semibold mb-4">Người dùng</h2>
                )}
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-4 cursor-pointer flex-1"
                            onClick={() => router.push(`/user/profile/${user.id}`)}
                          >
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{user.fullName}</h3>
                              {user.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {user.bio}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {user.followerCount} người theo dõi
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFollowUser(user.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                              user.isFollowing
                                ? "bg-secondary text-foreground hover:bg-secondary/80"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                          >
                            {user.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                          </button>
                        </div>
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
  )
}

function EmptyState({ type }: { type: "posts" | "users" | "all" }) {
  const messages = {
    posts: {
      title: "Không tìm thấy bài viết phù hợp",
      description: "Hãy thử tìm kiếm với từ khóa khác"
    },
    users: {
      title: "Không tìm thấy người dùng phù hợp",
      description: "Hãy thử tìm kiếm với tên khác"
    },
    all: {
      title: "Không tìm thấy kết quả phù hợp",
      description: "Hãy thử tìm kiếm với từ khóa khác"
    }
  }

  const message = messages[type]

  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <svg
          className="mx-auto h-24 w-24 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">{message.title}</h2>
      <p className="text-muted-foreground">{message.description}</p>
    </div>
  )
}
