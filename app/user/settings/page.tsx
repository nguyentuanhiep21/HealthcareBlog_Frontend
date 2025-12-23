'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/components/auth-provider';
import { authUtils } from '@/lib/auth-utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUserInfo } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
      });
    }
  }, [user, isAuthenticated, router]);

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
          phoneNumber: formData.phoneNumber,
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

  return (
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
              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Giới thiệu</h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Hãy viết về bản thân bạn..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
      </div>
    </div>
  );
}
