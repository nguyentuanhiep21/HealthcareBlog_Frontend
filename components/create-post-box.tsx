'use client';

import { useState } from 'react';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/lib/mock-data';

interface CreatePostBoxProps {
  onPostCreate?: () => void;
}

export function CreatePostBox({ onPostCreate }: CreatePostBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const currentUser = mockUsers.currentUser;

  const handleSubmit = () => {
    if (caption.trim()) {
      setCaption('');
      setSelectedImage(null);
      setIsOpen(false);
      onPostCreate?.();
    }
  };

  if (!isOpen) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex gap-3">
          <img
            src={currentUser.avatar || "/placeholder.svg"}
            alt={currentUser.name}
            className="h-10 w-10 rounded-full"
          />
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 rounded-full border border-border bg-gray-100 px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-gray-200"
          >
            {currentUser.name}, bạn đang nghĩ gì?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start gap-3">
        <img
          src={currentUser.avatar || "/placeholder.svg"}
          alt={currentUser.name}
          className="h-10 w-10 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{currentUser.name}</h3>
          <p className="text-xs text-muted-foreground">Chỉ mình tôi</p>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setCaption('');
            setSelectedImage(null);
          }}
          className="text-2xl text-muted-foreground transition hover:text-foreground"
        >
          ×
        </button>
      </div>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Chia sẻ suy nghĩ của bạn"
        className="mb-4 w-full resize-none rounded-lg bg-gray-100 p-3 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        rows={6}
      />

      {selectedImage && (
        <div className="mb-4 relative bg-secondary rounded-lg h-64 overflow-hidden">
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-2 right-2 bg-background/90 text-foreground rounded-full h-8 w-8 flex items-center justify-center hover:bg-background"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-4 flex gap-2 border-t border-border pt-4">
        <label className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition">
          <Image className="h-5 w-5" />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setSelectedImage(event.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setIsOpen(false);
            setCaption('');
            setSelectedImage(null);
          }}
        >
          Hủy
        </Button>
        <Button
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={!caption.trim()}
        >
          Đăng
        </Button>
      </div>
    </div>
  );
}
