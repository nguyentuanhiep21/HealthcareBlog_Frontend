'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/components/auth-provider';
import { authUtils } from '@/lib/auth-utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUserInfo, logout, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user, isAuthenticated, router, authLoading]);

  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveMessage('');
    setErrorMessage('');
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223';
      const response = await fetch(`${backendUrl}/api/user/account`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          fullName: formData.fullName,
          bio: formData.bio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Đã xảy ra lỗi khi cập nhật thông tin');
        return;
      }

      const updatedUser = await response.json();
      
      // Refresh auth context to update user info everywhere
      await fetchUserInfo();
      
      setSaveMessage('Cài đặt đã được lưu thành công!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Đã xảy ra lỗi khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/user/profile/current`);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setErrorMessage('');
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223';
      const response = await fetch(`${backendUrl}/api/user/${user?.id}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Không thể xóa tài khoản' }));
        setErrorMessage(errorData.message || 'Đã xảy ra lỗi khi xóa tài khoản');
        setShowDeleteDialog(false);
        return;
      }

      // Logout and redirect to home
      logout();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorMessage('Đã xảy ra lỗi khi xóa tài khoản');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {authLoading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      ) : (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cài đặt</h1>

        {/* Settings Form */}
        <div className="rounded-lg border border-border bg-card p-8 space-y-6">
          {/* Success Message */}
          {saveMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 rounded-lg">
              {saveMessage}
            </div>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Name Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin liên hệ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Giới thiệu</h2>
              <span className={`text-sm ${formData.bio.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formData.bio.length}/500
              </span>
            </div>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Hãy viết về bản thân bạn..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button 
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2 border border-border rounded-lg hover:bg-secondary text-foreground font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-destructive bg-card p-8 mt-6">
          <h2 className="text-lg font-semibold mb-2 text-destructive">Vùng nguy hiểm</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Một khi bạn xóa tài khoản, sẽ không có cách nào để khôi phục lại. Hãy chắc chắn về quyết định của bạn.
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 font-medium transition"
          >
            Xóa tài khoản
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteDialog(false)}
          />
          
          {/* Dialog */}
          <div className="relative z-[10000] w-full max-w-lg mx-4 bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">Xác nhận xóa tài khoản</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Bạn có chắc chắn muốn xóa tài khoản của mình không? Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Tất cả dữ liệu của bạn bao gồm:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Thông tin cá nhân</li>
                <li>Bài viết đã đăng</li>
                <li>Bình luận</li>
                <li>Lượt thích và lưu</li>
                <li>Danh sách theo dõi</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 transition disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      )}
    </>
  );
}
