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
import { BackgroundPattern } from '@/components/background-pattern';

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, router, authLoading]);

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
            ? (n.actor.avatarUrl && n.actor.avatarUrl.startsWith('http') 
                ? n.actor.avatarUrl 
                : n.actor.avatarUrl ? `${backendUrl}${n.actor.avatarUrl}` : "/placeholder.svg")
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <BackgroundPattern />
      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-inner">
                <Bell className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Thông báo</h1>
                <p className="text-slate-500 font-medium mt-1">
                  Cập nhật các tương tác mới nhất với bạn
                </p>
              </div>
            </div>
            {notifications.some(n => !n.isRead) && (
              <Button
                variant="default"
                onClick={handleMarkAllAsRead}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 font-bold rounded-xl h-11 px-5"
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>

        {/* Filter Tabs */}
        <div className="mb-8 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md p-2 rounded-2xl inline-flex gap-2 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
              filter === 'unread'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Chưa đọc
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold ${
                filter === 'unread' 
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' 
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        </div>

        {/* Loading State */}
        {(authLoading || isLoading) && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-5 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm shadow-sm animate-pulse">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/70 rounded-full mt-2" />
                </div>
              </div>
            ))}
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
        {!authLoading && !isLoading && !error && (
          <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`block rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                    !notification.isRead 
                      ? 'bg-teal-50/50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30 hover:shadow-md' 
                      : 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/60 hover:shadow-md hover:border-teal-500/30'
                  }`}
                >
                  {/* Unread Indicator Bar */}
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500" />
                  )}
                  
                  <div className="flex gap-5 p-5 sm:p-6 items-start">
                    {/* Icon and Avatar */}
                    <div className="relative flex-shrink-0 mt-1">
                      {notification.actor ? (
                        <>
                          <img
                            src={notification.actor.avatarUrl}
                            alt={notification.actor.fullName}
                            className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-900 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className={`absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-lg ring-2 ring-white dark:ring-slate-950 flex items-center justify-center ${
                            notification.type === 'like' ? 'bg-rose-500 text-white' :
                            notification.type === 'comment' ? 'bg-indigo-500 text-white' :
                            notification.type === 'follow' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                          }`}>
                            {notification.type === 'like' && <Heart className="w-3.5 h-3.5 fill-white" />}
                            {notification.type === 'comment' && <MessageCircle className="w-3.5 h-3.5 fill-white" />}
                            {notification.type === 'follow' && <UserPlus className="w-3.5 h-3.5 fill-white" />}
                            {notification.type !== 'like' && notification.type !== 'comment' && notification.type !== 'follow' && <Bell className="w-3.5 h-3.5" />}
                          </div>
                        </>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {notification.actor && (
                          <span className="font-bold text-slate-900 dark:text-white mr-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                            {notification.actor.fullName}
                          </span>
                        )}
                        <span>
                          {notification.content}
                        </span>
                      </p>
                      <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread indicator dot (optional, redundant with bar but looks nice) */}
                    {!notification.isRead && (
                      <div className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0 mt-2 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-800 border-dashed animate-in zoom-in-95 duration-500">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6 shadow-inner">
                  <Bell className="w-14 h-14 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                  {filter === 'unread' 
                    ? 'Bạn đã xem hết tất cả thông báo.' 
                    : 'Khi có người tương tác với bạn, thông báo sẽ hiển thị ở đây.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
