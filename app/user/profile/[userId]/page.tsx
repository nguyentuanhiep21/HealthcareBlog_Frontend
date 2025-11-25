"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"
import { mockUsers, mockPosts } from "@/lib/mock-data"

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params
  const isCurrentUser = userId === "current"
  const viewedUser = isCurrentUser ? mockUsers.currentUser : mockUsers[userId]

  const [activeTab, setActiveTab] = useState("home")
  const [bio, setBio] = useState(viewedUser ? viewedUser.bio : "")
  const [isEditingBio, setIsEditingBio] = useState(false)

  const handleSaveBio = () => {
    setIsEditingBio(false)
    // In a real app, would save to database here
  }

  if (!viewedUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-center text-muted-foreground">Không tìm thấy người dùng</p>
        </div>
      </div>
    )
  }

  const userPosts = mockPosts.filter((post) => post.author.id === viewedUser.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 rounded-lg border border-border bg-card p-8">
          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <img
              src={viewedUser.avatar || "/placeholder.svg"}
              alt={viewedUser.name}
              className="h-24 w-24 rounded-full"
            />

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{viewedUser.name}</h1>
              <p className="text-muted-foreground mb-4">{bio}</p>

              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-lg font-semibold">{viewedUser.followers.toLocaleString("vi-VN")}</p>
                  <p className="text-sm text-muted-foreground">Người theo dõi</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{viewedUser.following.toLocaleString("vi-VN")}</p>
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
                {isCurrentUser ? (
                  isEditingBio ? (
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
                            setBio(viewedUser.bio)
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
                  )
                ) : (
                  <p className="text-muted-foreground">{bio || "Chưa có giới thiệu."}</p>
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
    </div>
  )
}
