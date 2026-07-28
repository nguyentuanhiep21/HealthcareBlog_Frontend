/**
 * Chat Service — SignalR + REST API integration
 * Based on: chat_frontend_guide.md
 */

import * as signalR from "@microsoft/signalr"
import { authUtils } from "./auth-utils"

// ─── Data Models ──────────────────────────────────────────────────────────────

export interface ChatUserDTO {
  id: string
  fullName: string
  avatarUrl: string | null
  userName: string | null
}

export interface ConversationDTO {
  id: number
  otherUser: ChatUserDTO
  lastMessagePreview: string | null
  lastMessageAt: string | null
  unreadCount: number
  createdAt: string
}

export interface MessageDTO {
  id: number
  conversationId: number
  senderId: string
  senderName: string
  senderAvatarUrl: string | null
  content: string
  isRead: boolean
  createdAt: string
}

// ─── SignalR Connection Manager ────────────────────────────────────────────────

class ChatService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false

  private getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
  }

  private getFullAvatarUrl(url: string | null): string | null {
    if (!url) return null
    if (url.startsWith("http")) return url
    return `${this.getBaseUrl()}${url}`
  }

  // ── Connection ──────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return
    if (this.isConnecting) return

    const token = authUtils.getToken()
    if (!token) throw new Error("No auth token")

    this.isConnecting = true

    try {
      const hubUrl = `${this.getBaseUrl()}/hubs/chat`

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      await this.connection.start()
      console.log("[ChatService] SignalR connected")
    } finally {
      this.isConnecting = false
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      console.log("[ChatService] SignalR disconnected")
    }
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected
  }

  // ── Hub listeners ───────────────────────────────────────────────────────────

  onReceiveMessage(handler: (msg: MessageDTO) => void): void {
    this.connection?.on("ReceiveMessage", (msg: MessageDTO) => {
      handler({
        ...msg,
        senderAvatarUrl: this.getFullAvatarUrl(msg.senderAvatarUrl),
      })
    })
  }

  onMessagesRead(handler: (conversationId: number, readerId: string) => void): void {
    this.connection?.on("MessagesRead", handler)
  }

  onError(handler: (message: string) => void): void {
    this.connection?.on("Error", handler)
  }

  offAll(): void {
    this.connection?.off("ReceiveMessage")
    this.connection?.off("MessagesRead")
    this.connection?.off("Error")
  }

  // ── Hub invocations ─────────────────────────────────────────────────────────

  async joinConversation(conversationId: number): Promise<void> {
    await this.connection?.invoke("JoinConversation", conversationId)
  }

  async leaveConversation(conversationId: number): Promise<void> {
    await this.connection?.invoke("LeaveConversation", conversationId)
  }

  async sendMessage(conversationId: number, content: string): Promise<void> {
    await this.connection?.invoke("SendMessage", conversationId, content)
  }

  async markAsRead(conversationId: number): Promise<void> {
    await this.connection?.invoke("MarkAsRead", conversationId)
  }

  // ── REST API ────────────────────────────────────────────────────────────────

  async getConversations(page = 1, pageSize = 20): Promise<ConversationDTO[]> {
    const res = await fetch(
      `${this.getBaseUrl()}/api/chat/conversations?page=${page}&pageSize=${pageSize}`,
      { headers: authUtils.getAuthHeaders() }
    )
    if (!res.ok) throw new Error("Failed to fetch conversations")
    const data: ConversationDTO[] = await res.json()

    return data.map((c) => ({
      ...c,
      otherUser: {
        ...c.otherUser,
        avatarUrl: this.getFullAvatarUrl(c.otherUser.avatarUrl),
      },
    }))
  }

  async openOrCreateConversation(targetUserId: string): Promise<ConversationDTO> {
    const res = await fetch(
      `${this.getBaseUrl()}/api/chat/conversations/${targetUserId}`,
      {
        method: "POST",
        headers: authUtils.getAuthHeaders(),
      }
    )
    if (!res.ok) throw new Error("Failed to create conversation")
    const data: ConversationDTO = await res.json()

    return {
      ...data,
      otherUser: {
        ...data.otherUser,
        avatarUrl: this.getFullAvatarUrl(data.otherUser.avatarUrl),
      },
    }
  }

  async getMessages(conversationId: number, page = 1, pageSize = 30): Promise<MessageDTO[]> {
    const res = await fetch(
      `${this.getBaseUrl()}/api/chat/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`,
      { headers: authUtils.getAuthHeaders() }
    )
    if (!res.ok) throw new Error("Failed to fetch messages")
    const data: MessageDTO[] = await res.json()

    // API returns newest first → reverse for display
    return data.reverse().map((m) => ({
      ...m,
      senderAvatarUrl: this.getFullAvatarUrl(m.senderAvatarUrl),
    }))
  }

  async getUnreadCount(): Promise<number> {
    try {
      const res = await fetch(
        `${this.getBaseUrl()}/api/chat/unread-count`,
        { headers: authUtils.getAuthHeaders() }
      )
      if (!res.ok) return 0
      const data: { count: number } = await res.json()
      return data.count
    } catch {
      return 0
    }
  }
}

// Singleton instance
export const chatService = new ChatService()
