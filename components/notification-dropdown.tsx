import { useState, useEffect, useRef } from 'react'
import { useClickOutside } from '@/hooks/use-click-outside'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Heart, MessageCircle, UserPlus, Info, CheckCheck } from 'lucide-react'
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
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setIsOpen(false))

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
      const response = await fetch(`${backendUrl}/api/notifications?page=1&pageSize=20`, {
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
      const response = await fetch(`${backendUrl}/api/notifications/unread-count`, {
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
      await fetch(`${backendUrl}/api/notifications/${id}/read`, {
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
      await fetch(`${backendUrl}/api/notifications/read-all`, {
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
        return <Heart className="h-3.5 w-3.5 text-white fill-white" />
      case 'comment':
        return <MessageCircle className="h-3.5 w-3.5 text-white fill-white" />
      case 'follow':
        return <UserPlus className="h-3.5 w-3.5 text-white fill-white" />
      default:
        return <Info className="h-3.5 w-3.5 text-white" />
    }
  }

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-rose-500 shadow-rose-500/40'
      case 'comment':
        return 'bg-blue-500 shadow-blue-500/40'
      case 'follow':
        return 'bg-emerald-500 shadow-emerald-500/40'
      default:
        return 'bg-indigo-500 shadow-indigo-500/40'
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
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 w-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-[22px] w-[22px] text-slate-700 dark:text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center border-2 border-white dark:border-slate-950 text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </Button>

      {isOpen && (
          <div className="absolute right-0 top-12 w-80 sm:w-[400px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-full"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
            
            {/* Content List */}
            <ScrollArea className="h-[420px]">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-full mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-4 p-4 transition-all duration-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group",
                        !notification.isRead ? "bg-teal-50/30 dark:bg-teal-900/10" : ""
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full" />
                      )}

                      <div className="mt-0.5 flex-shrink-0">
                        {notification.actor ? (
                          <div className="relative">
                            <img
                              src={notification.actor.avatarUrl}
                              alt={notification.actor.fullName}
                              className="h-12 w-12 rounded-full object-cover border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className={cn(
                              "absolute -bottom-1 -right-1 rounded-full p-1 shadow-lg ring-2 ring-white dark:ring-slate-950 flex items-center justify-center",
                              getIconBgColor(notification.type)
                            )}>
                              {getIcon(notification.type)}
                            </div>
                          </div>
                        ) : (
                          <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center shadow-lg",
                            getIconBgColor(notification.type)
                          )}>
                            {getIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug">
                          {notification.actor && (
                            <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
                              {notification.actor.fullName}
                            </span>
                          )}
                          <span>{notification.content}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium mb-1">Bạn đã xem hết thông báo</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Không có thông báo mới nào vào lúc này.</p>
                </div>
              )}
            </ScrollArea>
            
            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <Button 
                variant="ghost" 
                className="w-full text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl"
                onClick={() => {
                  setIsOpen(false)
                  router.push("/user/notifications")
                }}
              >
                Xem tất cả thông báo
              </Button>
            </div>
          </div>
      )}
    </div>
  )
}
