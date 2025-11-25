export interface User {
  id: string
  name: string
  avatar: string
  bio: string
  followers: number
  following: number
  isFollowing?: boolean
}

export interface Post {
  id: string
  author: User
  caption: string
  image?: string
  likes: number
  comments: number
  isSaved: boolean
  isLiked: boolean
  createdAt: string
}

export interface Comment {
  id: string
  author: User
  text: string
  likes: number
  isLiked: boolean
  createdAt: string
}

export interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "system"
  from?: User
  content: string
  relatedPostId?: string
  isRead: boolean
  createdAt: string
}

export interface Report {
  id: string
  type: "user" | "post" | "comment"
  reportedBy: User
  targetId: string
  targetContent: string
  targetAuthor: User
  reason: string
  status: "pending" | "resolved" | "rejected"
  createdAt: string
}
