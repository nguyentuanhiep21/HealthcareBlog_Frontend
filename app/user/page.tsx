'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { CreatePostBox } from '@/components/create-post-box';
import { PostCard } from '@/components/post-card';
import { mockPosts, mockFeaturedPosts, mockSuggestedUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState(mockPosts);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-3">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <CreatePostBox />

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
                    href={`/post/${post.id}`}
                    className="group block rounded-lg overflow-hidden hover:opacity-80 transition"
                  >
                    <div className="flex gap-3">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.caption}
                        className="h-20 w-20 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2 group-hover:underline">
                          {post.caption}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.author.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/featured">
                <Button variant="outline" className="w-full mt-4">
                  Xem thêm
                </Button>
              </Link>
            </div>

            {/* Suggested Users */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 text-lg font-bold">Người nổi bật để follow</h2>
              <div className="space-y-3">
                {mockSuggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.followers.toLocaleString('vi-VN')} người theo dõi
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Xem thêm
              </Button>
            </div>

            {/* Saved Posts */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 text-lg font-bold">Bài viết đã lưu</h2>
              <div className="space-y-3">
                {mockPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/saved/${post.id}`}
                    className="group block rounded-lg overflow-hidden hover:opacity-80 transition"
                  >
                    <div className="flex gap-3">
                      <img
                        src={post.image || '/placeholder.svg?height=60&width=60&query=default'}
                        alt={post.caption}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold group-hover:underline">
                          {post.author.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {post.caption.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/saved">
                <Button variant="outline" className="w-full mt-4">
                  Xem tất cả
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
