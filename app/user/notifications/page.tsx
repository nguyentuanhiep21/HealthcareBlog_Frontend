'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { mockNotifications, mockUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(notif => !notif.isRead)
    : notifications;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'like':
        return 'Lượt thích';
      case 'comment':
        return 'Bình luận';
      case 'follow':
        return 'Theo dõi';
      case 'system':
        return 'Hệ thống';
      default:
        return 'Thông báo';
    }
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
                <span className="ml-2 inline-block bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`rounded-lg border p-4 transition cursor-pointer ${
                  notification.isRead
                    ? 'border-border bg-card hover:bg-secondary'
                    : 'border-primary bg-primary/5 hover:bg-primary/10'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {notification.type === 'system' ? (
                          <>
                            <p className="font-semibold text-sm">{getNotificationTypeLabel(notification.type)}</p>
                            <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <img
                                src={notification.from?.avatar || '/placeholder.svg'}
                                alt={notification.from?.name || 'User'}
                                className="h-6 w-6 rounded-full"
                              />
                              <p className="font-semibold text-sm">{notification.from?.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                          </>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  {notification.relatedPostId && (
                    <div className="flex-shrink-0">
                      <Link href={`/user/post/${notification.relatedPostId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary border-primary hover:bg-primary/10"
                        >
                          Xem
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground mt-2 ml-10">
                  {notification.createdAt}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Bạn không có thông báo nào'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
