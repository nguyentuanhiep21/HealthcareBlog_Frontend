'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { authUtils } from '@/lib/auth-utils'

interface FollowingUser {
  id: string
  fullName: string
  avatarUrl: string
  bio: string
  followerCount: number
  followingCount: number
  isFollowedByCurrentUser: boolean
}

export default function FollowingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user?.id) {
      fetchFollowingUsers()
    }
  }, [user, isAuthenticated, router])

  const fetchFollowingUsers = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'
      const response = await fetch(
        `${backendUrl}/api/follow/${user.id}/following-users?page=1&pageSize=50`,
        {
          headers: authUtils.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch following users')
      }

      const data = await response.json()
      
      // Map backend DTO to frontend format
      const mappedUsers: FollowingUser[] = data.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl 
          ? (u.avatarUrl.startsWith('http') 
              ? u.avatarUrl 
              : `${backendUrl}${u.avatarUrl}`)
          : '/placeholder.svg',
        bio: u.bio || '',
        followerCount: u.followerCount || 0,
        followingCount: u.followingCount || 0,
        isFollowedByCurrentUser: u.isFollowedByCurrentUser || false,
      }))

      setFollowingUsers(mappedUsers)
    } catch (err) {
      console.error('Error fetching following users:', err)
      setError('Đã xảy ra lỗi khi tải danh sách người theo dõi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfollowClick = (userId: string) => {
    setSelectedUserId(userId)
    setShowUnfollowDialog(true)
  }

  const handleConfirmUnfollow = async () => {
    if (!selectedUserId) return

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'
      const response = await fetch(`${backendUrl}/api/follow/${selectedUserId}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to unfollow user')
      }

      // Remove user from list
      setFollowingUsers(followingUsers.filter(user => user.id !== selectedUserId))
    } catch (error) {
      console.error('Error unfollowing user:', error)
      alert('Đã xảy ra lỗi khi bỏ theo dõi')
    } finally {
      setShowUnfollowDialog(false)
      setSelectedUserId(null)
    }
  }

  const handleCancelUnfollow = () => {
    setShowUnfollowDialog(false)
    setSelectedUserId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Đang theo dõi</h1>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchFollowingUsers}>Thử lại</Button>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-8">
              {followingUsers.length} người bạn đang theo dõi
            </p>

            <div className="space-y-4">
              {followingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition"
                >
                  <Link href={`/user/profile/${user.id}`} className="flex-shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/user/profile/${user.id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg">{user.fullName}</h3>
                    </Link>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {user.bio}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{user.followerCount} người theo dõi</span>
                      <span>{user.followingCount} đang theo dõi</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={() => handleUnfollowClick(user.id)}
                  >
                    Đang theo dõi
                  </Button>
                </div>
              ))}
            </div>

            {followingUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Bạn chưa theo dõi ai
                </p>
                <Link href="/user">
                  <Button>Khám phá người dùng</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

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
