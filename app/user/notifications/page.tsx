'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { authUtils } from '@/lib/auth-utils';
import { formatTimeAgo } from '@/lib/time-utils';

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

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, router]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223';
      const response = await fetch(`${backendUrl}/api/notification?page=1&pageSize=50`, {
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Notifications data:', data);
      
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
      }));
      
      setNotifications(mappedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Đã xảy ra lỗi khi tải thông báo');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(notif => !notif.isRead)
    : notifications;

  const handleMarkAsRead = async (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.isRead) return;

    // Optimistic update
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223';
      await fetch(`${backendUrl}/api/notification/${notificationId}/read`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: false } : notif
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    const previousNotifications = [...notifications];
    
    // Optimistic update
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223';
      await fetch(`${backendUrl}/api/notification/read-all`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Revert on error
      setNotifications(previousNotifications);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500 fill-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500 fill-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.postId) {
      return `/user/post/${notification.postId}`;
    } else if (notification.actor) {
      return `/user/profile/${notification.actor.id}`;
    }
    return '#';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Thông báo</h1>
          {notifications.some(n => !n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-primary border-primary hover:bg-primary/10"
            >
              Đánh dấu tất cả là đã đọc
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setFilter('all')}
              className={`pb-4 font-semibold transition ${
                filter === 'all'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-4 font-semibold transition ${
                filter === 'unread'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Chưa đọc
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchNotifications}>Thử lại</Button>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && !error && (
          <div className="space-y-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`block rounded-lg border border-border p-4 hover:bg-accent/50 transition ${
                    !notification.isRead ? 'bg-accent/20' : 'bg-card'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    {/* Icon and Avatar */}
                    <div className="relative flex-shrink-0">
                      {notification.actor ? (
                        <>
                          <img
                            src={notification.actor.avatarUrl}
                            alt={notification.actor.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">
                        {notification.actor && (
                          <span className="font-semibold">
                            {notification.actor.fullName}{' '}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {notification.content}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' 
                    ? 'Bạn đã đọc tất cả thông báo' 
                    : 'Khi có người tương tác với bạn, thông báo sẽ hiển thị ở đây'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
