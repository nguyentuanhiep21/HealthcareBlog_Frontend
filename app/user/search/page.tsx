"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"
import { mockPosts } from "@/lib/mock-data"
import { useSearchParams } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [filteredPosts, setFilteredPosts] = useState(mockPosts)

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockPosts.filter(
        (post) =>
          post.caption.toLowerCase().includes(query.toLowerCase()) ||
          post.author.name.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(mockPosts)
    }
  }, [query])

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
          <p className="text-sm text-muted-foreground mt-1">
            {filteredPosts.length} bài viết được tìm thấy
          </p>
        </div>

        {/* Posts List */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
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
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy bài viết phù hợp
            </h2>
            <p className="text-muted-foreground">
              Hãy thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
