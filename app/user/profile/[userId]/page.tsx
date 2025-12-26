"use client"

import { use, useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"
import { ReportDialog } from "@/components/report-dialog"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { CreatePostBox } from "@/components/create-post-box"
import { AvatarViewDialog } from "@/components/avatar-view-dialog"
import { AvatarCropDialog } from "@/components/avatar-crop-dialog"
import { SafeAvatar } from "@/components/safe-avatar"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import type { Post } from "@/lib/types"
import { authUtils } from "@/lib/auth-utils"

interface ViewedUserProfile {
  id: string
  name: string
  avatar: string
  bio: string
  followers: number
  following: number
  postCount: number
  isFollowing: boolean
}

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const { isAuthenticated, user, fetchUserInfo } = useAuth()
  
  const [viewedUser, setViewedUser] = useState<ViewedUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("home")
  const [bio, setBio] = useState("")
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg")
  const [showReportSuccessDialog, setShowReportSuccessDialog] = useState(false)
  const [reportSuccessMessage, setReportSuccessMessage] = useState("")
  const [isReportSuccess, setIsReportSuccess] = useState(true)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("")
  
  // Check if viewing current user profile
  const isCurrentUser = userId === "current" || (user && userId === user.id)
  
  // Fetch user profile from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
        
        // Determine actual userId to fetch
        let targetUserId = userId
        if (userId === "current") {
          if (!user?.id) {
            setError("Vui lòng đăng nhập để xem trang cá nhân")
            setIsLoading(false)
            return
          }
          targetUserId = user.id
        }
        
        const response = await fetch(
          `${backendUrl}/api/user/profile/${targetUserId}?page=1&pageSize=20`,
          {
            headers: authUtils.getAuthHeaders(),
          }
        )
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Không tìm thấy người dùng")
          } else {
            setError("Đã xảy ra lỗi khi tải thông tin người dùng")
          }
          setIsLoading(false)
          return
        }
        
        const data = await response.json()
        
        // Map backend DTO to frontend format
        const fullAvatarUrl = data.avatarUrl 
          ? (data.avatarUrl && data.avatarUrl.startsWith('http') 
              ? data.avatarUrl 
              : data.avatarUrl ? `${backendUrl}${data.avatarUrl}` : "/placeholder.svg")
          : "/placeholder.svg"
        
        const profileData: ViewedUserProfile = {
          id: data.id,
          name: data.fullName,
          avatar: fullAvatarUrl,
          bio: data.bio || "",
          followers: data.followerCount,
          following: data.followingCount,
          postCount: data.postCount,
          isFollowing: data.isFollowedByCurrentUser,
        }
        
        setViewedUser(profileData)
        setBio(profileData.bio)
        setAvatarUrl(fullAvatarUrl)
        setIsFollowing(profileData.isFollowing)
        
        // Map posts
        if (data.posts && Array.isArray(data.posts)) {
          const mappedPosts: Post[] = data.posts.map((post: any) => ({
            id: post.id?.toString() || "",
            author: {
              id: data.id,
              name: data.fullName,
              avatar: fullAvatarUrl,
              bio: data.bio || "",
              followers: data.followerCount,
              following: data.followingCount,
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
            createdAt: post.uploadTime || post.createdAt || new Date().toISOString(),
          }))
          setUserPosts(mappedPosts)
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError("Đã xảy ra lỗi khi tải thông tin người dùng")
        setIsLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [userId, user])

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    
    if (!viewedUser) return
    
    const newIsFollowing = !isFollowing
    
    // Optimistic update
    setIsFollowing(newIsFollowing)
    setViewedUser({
      ...viewedUser,
      followers: newIsFollowing ? viewedUser.followers + 1 : viewedUser.followers - 1,
      isFollowing: newIsFollowing,
    })
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const method = newIsFollowing ? "POST" : "DELETE"
      
      const response = await fetch(`${backendUrl}/api/follow/${viewedUser.id}`, {
        method,
        headers: authUtils.getAuthHeaders(),
      })
      
      if (!response.ok) {
        // Revert on error
        setIsFollowing(!newIsFollowing)
        setViewedUser({
          ...viewedUser,
          followers: newIsFollowing ? viewedUser.followers - 1 : viewedUser.followers + 1,
          isFollowing: !newIsFollowing,
        })
        console.error("Lỗi khi follow/unfollow")
      }
    } catch (error) {
      console.error("Lỗi khi follow/unfollow:", error)
      // Revert on error
      setIsFollowing(!newIsFollowing)
      setViewedUser({
        ...viewedUser,
        followers: newIsFollowing ? viewedUser.followers - 1 : viewedUser.followers + 1,
        isFollowing: !newIsFollowing,
      })
    }
  }

  const handlePostCreate = (newPost: Post) => {
    setUserPosts([newPost, ...userPosts])
    if (viewedUser) {
      setViewedUser({
        ...viewedUser,
        postCount: viewedUser.postCount + 1,
      })
    }
  }

  const handleReportSubmit = async (reason: string, details: string) => {
    if (!viewedUser) return
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      const response = await fetch(`${backendUrl}/api/user/${viewedUser.id}/report`, {
        method: "POST",
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          reason,
          description: details,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || "Không thể báo cáo người dùng. Vui lòng thử lại."
        setReportSuccessMessage(errorMessage)
        setIsReportSuccess(false)
        setShowReportSuccessDialog(true)
        return
      }

      const result = await response.json()
      setReportSuccessMessage(result.message || "Đã báo cáo người dùng thành công!")
      setIsReportSuccess(true)
      setShowReportSuccessDialog(true)
    } catch (error) {
      console.error("Error reporting user:", error)
      setReportSuccessMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.")
      setIsReportSuccess(false)
      setShowReportSuccessDialog(true)
    }
  }

  const handleAvatarFileSelect = (file: File) => {
    // Read file and show crop dialog
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string)
      setIsCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCroppedImage = async (croppedBlob: Blob) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
      
      // Convert Blob to File
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
      
      // Step 1: Upload file to get URL
      const formData = new FormData()
      formData.append('file', file)
      
      const token = authUtils.getToken()
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      const uploadResponse = await fetch(`${backendUrl}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}))
        console.error('Failed to upload avatar:', errorData)
        return
      }

      const uploadResult = await uploadResponse.json()
      const avatarUrl = uploadResult.url

      // Step 2: Update user avatar in database
      const updateResponse = await fetch(`${backendUrl}/api/user/avatar`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          avatarUrl: avatarUrl
        }),
      })

      if (!updateResponse.ok) {
        console.error('Failed to update avatar')
        return
      }

      const updatedUser = await updateResponse.json()
      
      // Update local state with full URL
      const fullAvatarUrl = updatedUser.avatarUrl
        ? (updatedUser.avatarUrl.startsWith('http') 
            ? updatedUser.avatarUrl 
            : `${backendUrl}${updatedUser.avatarUrl}`)
        : '/placeholder.svg'
      
      setAvatarUrl(fullAvatarUrl)
      
      // Update viewedUser state
      if (viewedUser) {
        setViewedUser({
          ...viewedUser,
          avatar: fullAvatarUrl,
        })
      }
      
      // Refresh auth context if viewing own profile
      if (isCurrentUser) {
        await fetchUserInfo()
      }
    } catch (error) {
      console.error('Error updating avatar:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || !viewedUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-muted-foreground">{error || "Không tìm thấy người dùng"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 rounded-lg border border-border bg-card p-8">
          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <div onClick={() => setIsAvatarDialogOpen(true)} className="cursor-pointer">
              <SafeAvatar
                src={avatarUrl}
                alt={viewedUser.name}
                className="h-24 w-24 rounded-full hover:opacity-80 transition"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h1 className="text-3xl font-bold">{viewedUser.name}</h1>
                {!isCurrentUser && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`${isFollowing ? "border border-primary text-primary bg-transparent hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                      onClick={handleFollowClick}
                    >
                      {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                    </Button>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowLoginDialog(true)
                          return
                        }
                        setIsReportDialogOpen(true)
                      }}
                      className="flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                    >
                      <Flag className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-4 line-clamp-1">{bio}</p>

              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-lg font-semibold">{viewedUser.followers.toLocaleString("vi-VN")}</p>
                  <p className="text-sm text-muted-foreground">Người theo dõi</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{viewedUser.following.toLocaleString("vi-VN")}</p>
                  <p className="text-sm text-muted-foreground">Đang theo dõi</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{userPosts.length}</p>
                  <p className="text-sm text-muted-foreground">Bài viết</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`pb-4 font-semibold transition ${
                activeTab === "home"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-4 font-semibold transition ${
                activeTab === "about"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Thông tin
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {isCurrentUser && <CreatePostBox onPostCreate={handlePostCreate} />}

            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  currentUser={user ? { id: user.id, name: user.fullName || "", avatar: user.avatarUrl || "" } : null}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">Chưa có bài viết nào</div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Giới thiệu</h3>
                <p className="text-muted-foreground">{bio || "Chưa có giới thiệu."}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tham gia</h3>
                <p className="text-sm text-muted-foreground">Tháng 11, 2025</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        targetType="user"
        onSubmit={handleReportSubmit}
      />

      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />

      {/* Report Success Dialog */}
      {showReportSuccessDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-semibold mb-2">Thông báo</h2>
                <p className="text-muted-foreground mb-6">{reportSuccessMessage}</p>
                <Button
                  className="w-full"
                  onClick={() => setShowReportSuccessDialog(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar View Dialog - Only show change button for current user */}
      <AvatarViewDialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        avatarUrl={avatarUrl}
        userName={viewedUser.name}
        onAvatarChange={isCurrentUser ? handleAvatarFileSelect : undefined}
      />

      {/* Avatar Crop Dialog */}
      <AvatarCropDialog
        isOpen={isCropDialogOpen}
        onClose={() => setIsCropDialogOpen(false)}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCroppedImage}
      />
    </div>
  )
}
