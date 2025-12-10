"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"
import { AvatarViewDialog } from "@/components/avatar-view-dialog"
import { mockUsers, mockPosts } from "@/lib/mock-data"

export default function ProfilePage() {
  const router = useRouter()
  const user = mockUsers.currentUser
  const userPosts = mockPosts.filter((post) => post.author.id === user.id)
  const [activeTab, setActiveTab] = useState("home")
  const [bio, setBio] = useState(user.bio)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "/placeholder.svg")

  useEffect(() => {
    router.push("/user/profile/current")
  }, [router])

  const handleSaveBio = () => {
    setIsEditingBio(false)
    // In a real app, would save to database here
  }

  const handleAvatarChange = async (file: File) => {
    // In a real app, would upload to server here
    // For now, just update the preview
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    
    // TODO: Implement actual upload logic
    // const formData = new FormData()
    // formData.append('avatar', file)
    // const response = await fetch('/api/user/avatar', {
    //   method: 'POST',
    //   body: formData,
    // })
    // const data = await response.json()
    // setAvatarUrl(data.avatarUrl)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 rounded-lg border border-border bg-card p-8">
          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <img 
              src={avatarUrl} 
              alt={user.name} 
              className="h-24 w-24 rounded-full cursor-pointer hover:opacity-80 transition"
              onClick={() => setIsAvatarDialogOpen(true)}
            />

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
              <p className="text-muted-foreground mb-4">{bio}</p>

              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-lg font-semibold">{user.followers.toLocaleString("vi-VN")}</p>
                  <p className="text-sm text-muted-foreground">Người theo dõi</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{user.following.toLocaleString("vi-VN")}</p>
                  <p className="text-sm text-muted-foreground">Đang theo dõi</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{userPosts.length}</p>
                  <p className="text-sm text-muted-foreground">Bài viết</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`pb-4 font-semibold transition ${
                activeTab === "home"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-4 font-semibold transition ${
                activeTab === "about"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Thông tin
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground">Chưa có bài viết nào</div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Giới thiệu</h3>
                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveBio}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setBio(user.bio)
                          setIsEditingBio(false)
                        }}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-foreground font-medium"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => setIsEditingBio(true)}
                    className="text-muted-foreground cursor-pointer hover:text-foreground transition"
                  >
                    {bio || "Chưa có giới thiệu. Bấm để thêm."}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tham gia</h3>
                <p className="text-muted-foreground">Tháng 11, 2025</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Avatar View Dialog */}
      <AvatarViewDialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        avatarUrl={avatarUrl}
        userName={user.name}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  )
}
