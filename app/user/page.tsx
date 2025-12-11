"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { CreatePostBox } from "@/components/create-post-box"
import { PostCard } from "@/components/post-card"
import { mockPosts, mockFeaturedPosts, mockSuggestedUsers } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import type { Post } from "@/lib/types" // Assuming Post type is defined here

export default function Home() {
  const { isAuthenticated } = useAuth()
  // Filter to show only one post per author
  const uniqueAuthorPosts = mockPosts.reduce((acc, post) => {
    if (!acc.find(p => p.author.id === post.author.id)) {
      acc.push(post)
    }
    return acc
  }, [] as Post[])
  const [posts, setPosts] = useState(uniqueAuthorPosts)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const handlePostCreate = (newPost: Post) => {
    setPosts([newPost, ...posts])
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

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Featured Posts */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 text-lg font-bold">Bài viết nổi bật</h2>
              <div className="space-y-3">
                {mockFeaturedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/user/post/${post.id}`}
                    className="group block rounded-lg overflow-hidden hover:opacity-80 transition"
                  >
                    <div className="flex gap-3">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.caption}
                        className="h-20 w-20 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2 group-hover:underline">{post.caption}</p>
                        <p className="text-xs text-muted-foreground mt-1">{post.author.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 text-lg font-bold">Thành viên nổi bật</h2>
              <div className="space-y-3">
                {mockSuggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link href={`/user/profile/${user.id}`} className="hover:underline">
                        <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="h-10 w-10 rounded-full" />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/user/profile/${user.id}`} className="hover:underline text-sm font-semibold truncate">
                          {user.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {user.followers.toLocaleString("vi-VN")} người theo dõi
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={followedUsers.has(user.id) ? "outline" : "default"}
                      className={followedUsers.has(user.id) ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                      onClick={() => handleFollowClick(user.id)}
                    >
                      {followedUsers.has(user.id) ? "Đang theo dõi" : "Theo dõi"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Posts - Only show if authenticated */}
            {isAuthenticated && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-4 text-lg font-bold">Bài viết đã lưu</h2>
                <div className="space-y-3">
                  {mockPosts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/user/post/${post.id}`}
                      className="group block rounded-lg overflow-hidden hover:opacity-80 transition"
                    >
                      <div className="flex gap-3">
                        <img
                          src={post.image || "/placeholder.svg?height=60&width=60&query=default"}
                          alt={post.caption}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold group-hover:underline">{post.author.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{post.caption.substring(0, 60)}...</p>
                        </div>
                      </div>
                    </Link>
                  ))}
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
