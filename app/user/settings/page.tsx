'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { mockUsers } from '@/lib/mock-data';

export default function SettingsPage() {
  const router = useRouter();
  const user = mockUsers.currentUser;
  const [formData, setFormData] = useState({
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ').slice(1).join(' '),
    email: user.email || 'user@example.com',
    phone: user.phone || '0123456789',
    bio: user.bio || '',
  });

  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setSaveMessage('Cài đặt đã được lưu thành công!');
    setTimeout(() => setSaveMessage(''), 3000);
    // In a real app, would save to database here
  };

  const handleCancel = () => {
    router.push(`/user/profile/${user.id}`);
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

          {/* Name Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Họ</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tên</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
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
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition"
            >
              Lưu thay đổi
            </button>
            <button 
              onClick={handleCancel}
              className="px-6 py-2 border border-border rounded-lg hover:bg-secondary text-foreground font-medium transition"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
