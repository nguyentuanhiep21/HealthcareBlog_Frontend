'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { mockUsers, mockSuggestedUsers } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FollowingPage() {
  // Create a list of users that current user is following
  const [followingUsers, setFollowingUsers] = useState([
    { ...mockUsers.user1, isFollowing: true },
    { ...mockUsers.user2, isFollowing: true },
    { ...mockUsers.user3, isFollowing: true },
    { ...mockUsers.user4, isFollowing: true },
  ])
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const handleUnfollowClick = (userId: string) => {
    setSelectedUserId(userId)
    setShowUnfollowDialog(true)
  }

  const handleConfirmUnfollow = () => {
    if (selectedUserId) {
      setFollowingUsers(followingUsers.filter(user => user.id !== selectedUserId))
    }
    setShowUnfollowDialog(false)
    setSelectedUserId(null)
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
                  src={user.avatar || '/placeholder.svg'}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/user/profile/${user.id}`} className="hover:underline">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {user.bio}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{user.followers} người theo dõi</span>
                  <span>{user.following} đang theo dõi</span>
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
            <Link href="/">
              <Button>Khám phá người dùng</Button>
            </Link>
          </div>
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
