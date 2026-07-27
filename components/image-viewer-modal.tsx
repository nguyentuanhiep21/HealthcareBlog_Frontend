'use client';

import { X, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Post } from '@/lib/types';
import { SafeAvatar } from '@/components/safe-avatar';
import { formatTimeAgo } from '@/lib/time-utils';

interface ImageViewerModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewerModal({ post, isOpen, onClose }: ImageViewerModalProps) {
  if (!isOpen || !post.image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Nút đóng góc trên phải */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all shadow-lg"
      >
        <X className="h-6 w-6" />
      </button>
      
      {/* Modal Container */}
      <div
        className="relative z-[105] w-full max-w-5xl h-full max-h-[85vh] flex flex-col md:flex-row bg-slate-950/40 rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side: Image Viewer */}
        <div className="flex-1 relative bg-black/40 flex items-center justify-center min-h-[300px] md:min-h-0 border-b md:border-b-0 md:border-r border-white/10 p-2 sm:p-6 group">
          <img
            src={post.image || "/placeholder.svg"}
            alt="Post content"
            className="w-full h-full object-contain rounded-2xl max-h-[70vh] md:max-h-full"
          />
        </div>

        {/* Right side: Post Info & Actions */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-slate-900 flex flex-col flex-shrink-0">
          
          {/* Header */}
          <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-800">
            <SafeAvatar 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="h-10 w-10 rounded-full ring-2 ring-teal-500/20 object-cover" 
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-[15px] truncate">
                {post.author.name}
              </p>
              <span className="text-[13px] text-slate-500 font-medium">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Caption (scrollable if too long) */}
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[15px] whitespace-pre-wrap">
              {post.caption}
            </p>
          </div>

          {/* Stats & Actions */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            {(post.likes > 0 || post.comments > 0) && (
              <div className="flex gap-4 text-[13px] text-slate-500 font-medium pb-3 border-b border-slate-200 dark:border-slate-700/50 mb-3">
                {post.likes > 0 && <span>{post.likes.toLocaleString('vi-VN')} lượt thích</span>}
                {post.comments > 0 && <span>{post.comments} bình luận</span>}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <button className="flex flex-1 items-center justify-center gap-2 h-11 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-600 transition-colors font-semibold">
                <Heart className="h-5 w-5" />
                <span className="text-[14px]">Thích</span>
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 h-11 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold">
                <MessageCircle className="h-5 w-5" />
                <span className="text-[14px]">Bình luận</span>
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 h-11 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-semibold">
                <Share2 className="h-5 w-5" />
                <span className="text-[14px]">Chia sẻ</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
