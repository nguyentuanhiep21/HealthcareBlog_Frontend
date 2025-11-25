"use client"

import { useState } from "react"
import { mockFeaturedPosts, mockSuggestedUsers, mockPosts } from "@/lib/mock-data"
import Link from "next/link"
import { Heart, MessageCircle } from "lucide-react"
import { ImageViewerModal } from "./image-viewer-modal"
import { useRouter } from "next/navigation"

export function Sidebar() {
  const router = useRouter()
  // Filter saved posts
  const savedPosts = mockPosts.filter((post) => post.isSaved)
  const [selectedPost, setSelectedPost] = useState<(typeof savedPosts)[0] | null>(null)

  const handleUserClick = (userId: string) => {
    router.push(`/user/profile/${userId}`)
  }

  return (
    <>
      <aside className="space-y-6">
        {/* Featured Posts */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Bài viết nổi bật</h2>
          <div className="space-y-3">
            {mockFeaturedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block rounded-lg border border-border bg-card p-3 hover:border-primary transition cursor-pointer group"
              >
                <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition line-clamp-2">
                  {post.caption}
                </h3>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {post.likes.toLocaleString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {post.comments}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Suggested Users */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Người để theo dõi</h2>
          <div className="space-y-3">
            {mockSuggestedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-2 flex-1">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-8 w-8 rounded-full cursor-pointer hover:opacity-80 transition"
                    onClick={() => handleUserClick(user.id)}
                  />
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition"
                      onClick={() => handleUserClick(user.id)}
                    >
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.followers} người theo dõi</p>
                  </div>
                </div>
                <button className="rounded-lg border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-background transition">
                  Theo dõi
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Saved Posts */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Bài viết đã lưu</h2>
          <div className="space-y-3">
            {savedPosts.length > 0 ? (
              savedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block rounded-lg border border-border bg-card overflow-hidden hover:border-primary transition cursor-pointer group"
                >
                  {post.image && (
                    <div
                      className="relative h-24 overflow-hidden bg-muted"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedPost(post)
                      }}
                    >
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post"
                        className="h-full w-full object-cover group-hover:scale-105 transition cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">{post.author.name}</p>
                    <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition">
                      {post.caption}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Chưa có bài viết nào được lưu</p>
            )}
          </div>
        </section>
      </aside>

      {/* Image Viewer Modal */}
      {selectedPost && (
        <ImageViewerModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  )
}
