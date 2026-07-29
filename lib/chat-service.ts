/**
 * Chat Service — SignalR + REST API integration
 * Based on: chat_frontend_guide.md
 *
 * Token strategy: accessTokenFactory (SignalR JS client tự append
 * ?access_token=<JWT> cho WebSocket, Authorization: Bearer cho negotiate HTTP)
 */

import * as signalR from "@microsoft/signalr"
import { authUtils } from "./auth-utils"

// ─── Data Models ──────────────────────────────────────────────────────────────

export interface ChatUserDTO {
  id: string
  fullName: string
  avatarUrl: string | null
  userName: string | null
  isOnline: boolean
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
  /**
   * Counts active consumers (mounted components using this service).
   * release() only disconnects when count reaches 0.
   */
  private consumerCount = 0
  /** Deduplicates concurrent connect() calls */
  private connectingPromise: Promise<void> | null = null
  /** Timer ID for the deferred disconnect (handles React StrictMode double-mount) */
  private releaseTimer: ReturnType<typeof setTimeout> | null = null

  private getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
  }

  private getFullAvatarUrl(url: string | null): string | null {
    if (!url) return null
    if (url.startsWith("http")) return url
    return `${this.getBaseUrl()}${url}`
  }

  // ── Connection ──────────────────────────────────────────────────────────────

  /**
   * Connect to the SignalR hub.
   * Safe to call multiple times — subsequent calls wait for the in-flight promise.
   *
   * Render cold-start note: The backend on Render free tier may take 30-60s to
   * wake up. The negotiate request may fail with a timeout during this window.
   * We catch that gracefully and let the UI show an "offline" badge.
   */
  async connect(): Promise<void> {
    // Cancel any pending deferred disconnect (handles React StrictMode re-mount)
    if (this.releaseTimer !== null) {
      clearTimeout(this.releaseTimer)
      this.releaseTimer = null
    }

    this.consumerCount++

    // Already connected — nothing to do
    if (this.connection?.state === signalR.HubConnectionState.Connected) return

    // Already connecting — wait for the same promise
    if (this.connectingPromise) return this.connectingPromise

    const token = authUtils.getToken()
    if (!token) {
      this.consumerCount--
      throw new Error("No auth token — user must be logged in to use chat")
    }

    const hubUrl = `${this.getBaseUrl()}/hubs/chat`

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => authUtils.getToken() ?? "",
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (ctx) => {
          const delays = [0, 2000, 5000, 10000, 30000]
          return delays[ctx.previousRetryCount] ?? null
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connectingPromise = this.connection
      .start()
      .then(() => {
        console.log("[ChatService] SignalR connected ✓")
      })
      .catch((err) => {
        // Reset so the next connect() can retry from scratch
        this.connection = null
        throw err
      })
      .finally(() => {
        this.connectingPromise = null
      })

    return this.connectingPromise
  }

  /**
   * Release one consumer.
   *
   * Uses a 300ms deferred disconnect to handle React StrictMode's double-mount:
   *   mount → unmount (release) → re-mount (connect cancels timer) → ...
   *
   * If a new consumer connects within 300ms the timer is cancelled and the
   * connection is preserved, preventing "stopped during negotiation".
   */
  async release(): Promise<void> {
    this.consumerCount = Math.max(0, this.consumerCount - 1)
    if (this.consumerCount > 0) return

    // Defer: give React StrictMode time to re-mount before we pull the plug
    this.releaseTimer = setTimeout(async () => {
      this.releaseTimer = null
      if (this.consumerCount > 0) return // New consumer arrived — abort disconnect
      await this.forceDisconnect()
    }, 300)
  }

  /**
   * Hard-stop — ignores consumer count.
   * Swallows any error from stop() (e.g. "stopped during negotiation")
   * so it never surfaces as an unhandled console error.
   */
  async forceDisconnect(): Promise<void> {
    this.consumerCount = 0
    this.connectingPromise = null

    const conn = this.connection
    this.connection = null

    if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
      try {
        await conn.stop()
      } catch {
        // Intentionally swallowed — stop() during negotiate throws this error,
        // it is harmless and already handled by the catch in connect().
      }
    }
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
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

  onUserIsOnline(handler: (userId: string) => void): void {
    this.connection?.on("UserIsOnline", handler)
  }

  onUserIsOffline(handler: (userId: string) => void): void {
    this.connection?.on("UserIsOffline", handler)
  }

  onReconnecting(handler: () => void): void {
    this.connection?.onreconnecting(() => handler())
  }

  onReconnected(handler: () => void): void {
    this.connection?.onreconnected(() => handler())
  }

  offAll(): void {
    this.connection?.off("ReceiveMessage")
    this.connection?.off("MessagesRead")
    this.connection?.off("Error")
    this.connection?.off("UserIsOnline")
    this.connection?.off("UserIsOffline")
  }

  // ── Hub invocations ─────────────────────────────────────────────────────────

  async joinConversation(conversationId: number): Promise<void> {
    if (!this.isConnected()) return
    await this.connection!.invoke("JoinConversation", conversationId)
  }

  async leaveConversation(conversationId: number): Promise<void> {
    if (!this.isConnected()) return
    await this.connection!.invoke("LeaveConversation", conversationId)
  }

  async sendMessage(conversationId: number, content: string): Promise<void> {
    if (!this.isConnected()) throw new Error("Không có kết nối realtime")
    await this.connection!.invoke("SendMessage", conversationId, content)
  }

  async markAsRead(conversationId: number): Promise<void> {
    if (!this.isConnected()) return
    await this.connection!.invoke("MarkAsRead", conversationId)
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

    // API returns newest first → reverse for chronological display
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
