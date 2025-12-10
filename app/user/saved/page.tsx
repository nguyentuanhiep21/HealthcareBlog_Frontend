'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { mockPosts } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ImageViewerModal } from '@/components/image-viewer-modal';
import Link from 'next/link';

export default function SavedPage() {
  const savedPosts = mockPosts.slice(0, 3);
  const [selectedPost, setSelectedPost] = useState<typeof savedPosts[0] | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const handleRemoveClick = (postId: string) => {
    setConfirmRemove(postId);
  };

  const handleConfirmRemove = () => {
    setConfirmRemove(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Đã lưu</h1>
          <p className="text-muted-foreground mt-2">
            {savedPosts.length} bài viết đã lưu
          </p>
        </div>

        {/* Saved Posts */}
        <div className="space-y-6">
          {savedPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition"
            >
              <div className="flex gap-4 p-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={post.author.avatar || '/placeholder.svg'}
                      alt={post.author.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm">{post.author.name}</p>
                      <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                    </div>
                  </div>

                  <h3 className="font-semibold line-clamp-2 mb-2">{post.caption}</h3>

                  <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                    <span>{post.likes.toLocaleString('vi-VN')} yêu thích</span>
                    <span>{post.comments} bình luận</span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-primary border-primary hover:bg-primary/10"
                    >
                      <Link href={`/user/post/${post.id}`}>Xem bài viết</Link>
                    </Button>
                    <button
                      onClick={() => handleRemoveClick(post.id)}
                      className="text-sm px-3 py-1 rounded text-muted-foreground hover:text-destructive transition font-medium"
                    >
                      Bỏ lưu
                    </button>
                  </div>
                </div>

                {/* Image */}
                {post.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={post.image || '/placeholder.svg'}
                      alt={post.caption}
                      className="h-32 w-32 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedPost(post)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {savedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có bài viết nào được lưu</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Removing Saved Post */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 border border-border">
            <h2 className="text-lg font-semibold mb-2">Bỏ lưu bài viết?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn có chắc chắn muốn bỏ lưu bài viết này không?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRemove(null)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmRemove}
              >
                Bỏ lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedPost && (
        <ImageViewerModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
