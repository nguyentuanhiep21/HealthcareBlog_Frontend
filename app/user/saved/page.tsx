'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { ImageViewerModal } from '@/components/image-viewer-modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth-utils';
import { formatDateOnlyGMT7 } from '@/lib/time-utils';
import { BackgroundPattern } from '@/components/background-pattern';
import type { Post } from '@/lib/types';
import { Bookmark, BookmarkMinus, Heart, MessageCircle, BookMarked, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SavedPage() {
  const router = useRouter();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223";
      const response = await fetch(
        `${backendUrl}/api/savedpost?page=1&pageSize=50`,
        {
          headers: authUtils.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Không thể tải bài viết đã lưu');
      }

      const data = await response.json();
      
      // Log để debug
      console.log('Saved posts data:', data);
      
      // Map backend data to frontend Post type
      const mappedPosts: Post[] = data.map((post: any) => {
        // Backend uses camelCase for JSON serialization
        const author = post.author || post.Author;
        const avatarUrl = author?.avatarUrl || author?.AvatarUrl;
        const fullAvatarUrl = avatarUrl 
          ? (avatarUrl && avatarUrl.startsWith('http') ? avatarUrl : avatarUrl ? `${backendUrl}${avatarUrl}` : "/placeholder.svg")
          : "/placeholder.svg";
          
        const imageUrl = post.imageUrl || post.ImageUrl;
        const fullImageUrl = imageUrl
          ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`)
          : undefined;

        // Build images list
        const rawImages: string[] = Array.isArray(post.imageUrls || post.ImageUrls)
          ? (post.imageUrls || post.ImageUrls)
          : [];
        const fullImages: string[] = rawImages.length > 0
          ? rawImages.map((u: string) => u.startsWith('http') ? u : `${backendUrl}${u}`)
          : (fullImageUrl ? [fullImageUrl] : []);
          
        return {
          id: post.id?.toString() || "",
          author: {
            id: author?.id || "",
            name: author?.fullName || author?.FullName || "Unknown",
            avatar: fullAvatarUrl,
            bio: author?.bio || author?.Bio || "",
            followers: 0,
            following: 0,
          },
          caption: post.content || post.Content || "",
          image: fullImages[0],
          images: fullImages.length > 0 ? fullImages : undefined,
          likes: post.likeCount || post.LikeCount || 0,
          comments: post.commentCount || post.CommentCount || 0,
          isSaved: true, // Already saved
          isLiked: post.isLikedByCurrentUser || post.IsLikedByCurrentUser || false,
          createdAt: post.uploadTime || post.UploadTime || post.createdAt || post.CreatedAt || new Date().toISOString(),
        };
      });

      setSavedPosts(mappedPosts);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setError('Đã xảy ra lỗi khi tải bài viết đã lưu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveClick = (postId: string) => {
    setConfirmRemove(postId);
  };

  const handleConfirmRemove = async () => {
    if (!confirmRemove) return;
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223";
      const response = await fetch(
        `${backendUrl}/api/savedpost/${confirmRemove}`,
        {
          method: 'DELETE',
          headers: authUtils.getAuthHeaders(),
        }
      );

      if (response.ok) {
        // Remove from list
        setSavedPosts(savedPosts.filter(post => post.id !== confirmRemove));
      }
    } catch (error) {
      console.error('Error removing saved post:', error);
    } finally {
      setConfirmRemove(null);
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/user/post/${postId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <BackgroundPattern />
      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-10 flex items-center gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-inner">
              <BookMarked className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bài viết đã lưu</h1>
              <p className="text-slate-500 font-medium mt-1">
                {isLoading ? 'Đang tải...' : `Bạn có ${savedPosts.length} bài viết được lưu trữ`}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-6 shadow-sm animate-pulse flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/70 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                      <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                      <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800/70 rounded-xl" />
                    </div>
                  </div>
                  <div className="h-40 w-full sm:w-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto opacity-80" />
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" onClick={fetchSavedPosts}>Thử lại</Button>
            </div>
          )}

          {/* Saved Posts */}
          {!isLoading && !error && savedPosts.length > 0 && (
            <div className="grid gap-6 animate-in slide-in-from-bottom-8 duration-700">
              {savedPosts.map((post) => (
                <div
                  key={post.id}
                  className="group rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-teal-500/30 transition-all duration-300"
                >
                  <div className="flex flex-col-reverse sm:flex-row gap-6 p-6 sm:p-7">
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={post.author.avatar || '/placeholder.svg'}
                            alt={post.author.name}
                            className="h-12 w-12 rounded-full ring-4 ring-slate-50 dark:ring-slate-900 object-cover cursor-pointer hover:ring-teal-500/20 transition-all duration-300 shadow-sm"
                            onClick={() => router.push(`/user/profile/${post.author.id}`)}
                          />
                          <div>
                            <p 
                              className="font-bold text-[15px] text-slate-900 dark:text-white cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              onClick={() => router.push(`/user/profile/${post.author.id}`)}
                            >
                              {post.author.name}
                            </p>
                            <p className="text-[12px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                              {formatDateOnlyGMT7(post.createdAt)}
                            </p>
                          </div>
                        </div>

                        <h3 
                          className="font-medium text-[16px] line-clamp-3 mb-5 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 leading-relaxed text-slate-700 dark:text-slate-200"
                          onClick={() => handlePostClick(post.id)}
                        >
                          {post.caption}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <Heart className="h-4 w-4 text-rose-500" />
                            {post.likes.toLocaleString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <MessageCircle className="h-4 w-4 text-indigo-500" />
                            {post.comments}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleRemoveClick(post.id)}
                            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 h-10 px-4 rounded-xl font-semibold transition-all"
                            title="Bỏ lưu"
                          >
                            <BookmarkMinus className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">Bỏ lưu</span>
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handlePostClick(post.id)}
                            className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 font-bold transition-all"
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {(post.images?.[0] || post.image) && (
                      <div className="w-full sm:w-56 flex-shrink-0">
                        <div 
                          className="aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden cursor-pointer relative group-hover:shadow-lg transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10"
                          onClick={() => handlePostClick(post.id)}
                        >
                          <img
                            src={post.images?.[0] || post.image}
                            alt="Thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* Image count overlay if multiple */}
                          {post.images && post.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-white/10">
                              +{post.images.length - 1} ảnh
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && savedPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-800 border-dashed animate-in zoom-in-95 duration-500">
              <div className="bg-teal-50 dark:bg-teal-900/30 p-6 rounded-full mb-6 shadow-inner">
                <Bookmark className="h-14 w-14 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Chưa có bài viết nào được lưu</h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                Bạn có thể lưu các bài viết hữu ích để dễ dàng xem lại sau. Hãy khám phá các bài viết mới từ cộng đồng!
              </p>
              <Link href="/user">
                <Button className="rounded-xl px-8 h-12 gap-2 shadow-lg shadow-teal-500/30 bg-teal-600 hover:bg-teal-700 text-white font-bold hover:-translate-y-1 transition-all duration-300">
                  Khám phá bài viết
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Confirmation Dialog for Removing Saved Post */}
        {confirmRemove && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setConfirmRemove(null)}
            />
            <div className="relative bg-white dark:bg-slate-950 rounded-3xl p-8 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mb-6 mx-auto">
                <BookmarkMinus className="h-8 w-8 text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white text-center">Bỏ lưu bài viết?</h2>
              <p className="text-[15px] font-medium text-slate-500 mb-8 leading-relaxed text-center">
                Bài viết này sẽ bị xóa khỏi danh sách đã lưu của bạn. Bạn không thể hoàn tác hành động này.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="default"
                  onClick={handleConfirmRemove}
                  className="w-full rounded-xl h-12 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
                >
                  Xác nhận bỏ lưu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmRemove(null)}
                  className="w-full rounded-xl h-12 font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
                >
                  Hủy
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
    </div>
  );
}
