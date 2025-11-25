import { Navbar } from '@/components/navbar'
import { mockUsers, mockSuggestedUsers } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FollowingPage() {
  // Create a list of users that current user is following
  const followingUsers = [
    { ...mockUsers.user1, isFollowing: true },
    { ...mockUsers.user2, isFollowing: true },
    { ...mockUsers.user3, isFollowing: true },
    { ...mockUsers.user4, isFollowing: true },
  ]

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
              <Link href="/profile" className="flex-shrink-0">
                <img
                  src={user.avatar || '/placeholder.svg'}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href="/profile" className="hover:underline">
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
    </div>
  )
}
