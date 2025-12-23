import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Heart, MessageCircle, UserPlus, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/time-utils'
import { authUtils } from '@/lib/auth-utils'
import { useAuth } from '@/components/auth-provider'

interface Notification {
  id: number
  type: string
  content: string
  isRead: boolean
  createdAt: string
  actor: {
    id: string
    fullName: string
    avatarUrl: string
  } | null
  postId: number | null
  commentId: number | null
}

export function NotificationDropdown() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchNotifications()
    }
  }, [isAuthenticated, isOpen])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'
      const response = await fetch(`${backendUrl}/api/notification?page=1&pageSize=20`, {
        headers: authUtils.getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        const mappedNotifications: Notification[] = data.map((n: any) => ({
          id: n.id,
          type: n.type.toLowerCase(),
          content: n.content,
          isRead: n.isRead,
          createdAt: n.createdAt,
          actor: n.actor ? {
            id: n.actor.id,
            fullName: n.actor.fullName,
            avatarUrl: n.actor.avatarUrl 
              ? (n.actor.avatarUrl.startsWith('http') 
                  ? n.actor.avatarUrl 
                  : `${backendUrl}${n.actor.avatarUrl}`)
              : '/placeholder.svg'
          } : null,
          postId: n.postId,
          commentId: n.commentId,
        }))
        setNotifications(mappedNotifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'
      const response = await fetch(`${backendUrl}/api/notification/unread-count`, {
        headers: authUtils.getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (id: number) => {
    const notification = notifications.find(n => n.id === id)
    if (!notification || notification.isRead) return

    // Optimistic update
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'
      await fetch(`${backendUrl}/api/notification/${id}/read`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Revert on error
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      )
      setUnreadCount(prev => prev + 1)
    }
  }

  const markAllAsRead = async () => {
    const previousNotifications = [...notifications]
    const previousCount = unreadCount

    // Optimistic update
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'
      await fetch(`${backendUrl}/api/notification/read-all`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Error marking all as read:', error)
      // Revert on error
      setNotifications(previousNotifications)
      setUnreadCount(previousCount)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500 fill-red-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500 fill-blue-500" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500 fill-green-500" />
      default:
        return <Info className="h-4 w-4 text-primary" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.postId) {
      return `/user/post/${notification.postId}`
    } else if (notification.actor) {
      return `/user/profile/${notification.actor.id}`
    }
    return '/user'
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)
    router.push(getNotificationLink(notification))
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-7 w-7" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="font-semibold">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Đánh dấu tất cả là đã đọc
                </button>
              )}
            </div>
            
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                        !notification.isRead && "bg-accent/20"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {notification.actor ? (
                          <div className="relative">
                            <img
                              src={notification.actor.avatarUrl}
                              alt={notification.actor.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                              {getIcon(notification.type)}
                            </div>
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-snug">
                          {notification.actor && (
                            <span className="font-semibold mr-1">
                              {notification.actor.fullName}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            {notification.content}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Không có thông báo nào</p>
                </div>
              )}
            </ScrollArea>
            
            <div className="p-2 border-t border-border bg-muted/30 text-center">
              <Link 
                href="/user/notifications" 
                className="text-sm text-primary hover:underline block w-full py-1"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả thông báo
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
