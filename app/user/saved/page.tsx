'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { ImageViewerModal } from '@/components/image-viewer-modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth-utils';
import type { Post } from '@/lib/types';

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
      if (data.length > 0) {
        console.log('First post Author:', data[0].author || data[0].Author);
      }
      
      // Map backend data to frontend Post type
      const mappedPosts: Post[] = data.map((post: any) => {
        // Backend uses camelCase for JSON serialization
        const author = post.author || post.Author;
        const avatarUrl = author?.avatarUrl || author?.AvatarUrl;
        const fullAvatarUrl = avatarUrl 
          ? (avatarUrl.startsWith('http') ? avatarUrl : `${backendUrl}${avatarUrl}`)
          : "/placeholder.svg";
          
        const imageUrl = post.imageUrl || post.ImageUrl;
        const fullImageUrl = imageUrl
          ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`)
          : undefined;
          
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
          image: fullImageUrl,
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Đã lưu</h1>
          <p className="text-muted-foreground mt-2">
            {isLoading ? 'Đang tải...' : `${savedPosts.length} bài viết đã lưu`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Đang tải bài viết đã lưu...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Saved Posts */}
        {!isLoading && !error && (
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
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <h3 
                      className="font-semibold line-clamp-2 mb-2 cursor-pointer hover:text-primary transition"
                      onClick={() => handlePostClick(post.id)}
                    >
                      {post.caption}
                    </h3>

                    <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                      <span>{post.likes.toLocaleString('vi-VN')} yêu thích</span>
                      <span>{post.comments} bình luận</span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePostClick(post.id)}
                        className="text-primary border-primary hover:bg-primary/10"
                      >
                        Xem bài viết
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
                        src={post.image}
                        alt={post.caption}
                        className="h-32 w-32 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
                        onClick={() => handlePostClick(post.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && savedPosts.length === 0 && (
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
