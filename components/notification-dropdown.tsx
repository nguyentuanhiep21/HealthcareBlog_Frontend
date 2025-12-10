import { useState } from 'react'
import Link from 'next/link'
import { Bell, Heart, MessageCircle, UserPlus, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockNotifications } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
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
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                        !notification.isRead && "bg-accent/20"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {notification.from ? (
                          <div className="relative">
                            <img
                              src={notification.from.avatar || "/placeholder.svg"}
                              alt={notification.from.name}
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
                          {notification.from && (
                            <span className="font-semibold mr-1">
                              {notification.from.name}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            {notification.content}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.createdAt}
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
