'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Post } from '@/lib/types';

interface ImageViewerModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewerModal({ post, isOpen, onClose }: ImageViewerModalProps) {
  if (!isOpen || !post.image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">Bài viết của {post.author.name}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-secondary transition"
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center bg-black/20 py-8">
          <img
            src={post.image || "/placeholder.svg"}
            alt="Post content"
            className="max-h-96 w-auto rounded-lg"
          />
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 space-y-3">
          {/* Caption */}
          <p className="text-sm text-foreground leading-relaxed">{post.caption}</p>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{post.likes.toLocaleString('vi-VN')} yêu thích</span>
            <span>{post.comments} bình luận</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 text-center">
            <button className="flex-1 rounded-lg py-2 hover:bg-secondary transition text-sm font-medium">
              👍 Thích
            </button>
            <button className="flex-1 rounded-lg py-2 hover:bg-secondary transition text-sm font-medium">
              💬 Bình luận
            </button>
            <button className="flex-1 rounded-lg py-2 hover:bg-secondary transition text-sm font-medium">
              ⬇️ Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
