"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { BackgroundPattern } from "@/components/background-pattern"
import { SafeAvatar } from "@/components/safe-avatar"
import { useAuth } from "@/components/auth-provider"
import { chatService, ConversationDTO, MessageDTO } from "@/lib/chat-service"
import {
  Send,
  Search,
  MessageSquare,
  ArrowLeft,
  CheckCheck,
  Check,
  Loader2,
  Wifi,
  WifiOff,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
} from "lucide-react"
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns"
import { vi } from "date-fns/locale"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatConversationTime(dateStr: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, "HH:mm")
  if (isYesterday(date)) return "Hôm qua"
  return format(date, "dd/MM")
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, "HH:mm")
}

function formatMessageGroup(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return "Hôm nay"
  if (isYesterday(date)) return "Hôm qua"
  return format(date, "EEEE, dd/MM/yyyy", { locale: vi })
}

function isSameDay(a: string, b: string): boolean {
  return format(new Date(a), "yyyy-MM-dd") === format(new Date(b), "yyyy-MM-dd")
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConversationItem({
  conv,
  active,
  currentUserId,
  onClick,
}: {
  conv: ConversationDTO
  active: boolean
  currentUserId: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-150 text-left group relative
        ${active
          ? "bg-gradient-to-r from-teal-500/15 to-cyan-500/10 border border-teal-200/50 dark:border-teal-700/50"
          : "hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
        }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <SafeAvatar
          src={conv.otherUser.avatarUrl}
          alt={conv.otherUser.fullName}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
        />
        {/* Online dot (decorative, can be wired to presence later) */}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`text-sm font-semibold truncate ${active ? "text-teal-700 dark:text-teal-300" : "text-slate-800 dark:text-slate-200"}`}>
            {conv.otherUser.fullName}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0">
            {formatConversationTime(conv.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">
            {conv.lastMessagePreview || "Bắt đầu cuộc trò chuyện..."}
          </p>
          {conv.unreadCount > 0 && (
            <span className="flex-shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">
              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function MessageBubble({
  msg,
  isSelf,
  showAvatar,
  showTime,
}: {
  msg: MessageDTO
  isSelf: boolean
  showAvatar: boolean
  showTime: boolean
}) {
  return (
    <div className={`flex items-end gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar for others */}
      {!isSelf && (
        <div className="flex-shrink-0 w-8">
          {showAvatar && (
            <SafeAvatar
              src={msg.senderAvatarUrl}
              alt={msg.senderName}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[70%] ${isSelf ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
            ${isSelf
              ? "bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-br-sm shadow-md shadow-teal-200/50 dark:shadow-teal-900/30"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700"
            }`}
        >
          {msg.content}
        </div>

        {showTime && (
          <div className={`flex items-center gap-1 px-1 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {formatMessageTime(msg.createdAt)}
            </span>
            {isSelf && (
              msg.isRead
                ? <CheckCheck className="h-3 w-3 text-teal-500" />
                : <Check className="h-3 w-3 text-slate-400" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 flex items-center justify-center">
          <MessageSquare className="h-10 w-10 text-teal-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">💬</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Chọn một cuộc trò chuyện
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
          Chọn từ danh sách bên trái hoặc tìm kiếm bạn bè để bắt đầu nhắn tin
        </p>
      </div>
    </div>
  )
}

// ─── Main Chat Page ────────────────────────────────────────────────────────────

function ChatPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // State
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingConvs, setIsLoadingConvs] = useState(true)
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [showMobileList, setShowMobileList] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevConvIdRef = useRef<number | null>(null)

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null

  // ── SignalR Setup ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return

    let mounted = true

    const initSignalR = async () => {
      try {
        await chatService.connect()
        if (!mounted) return
        setIsConnected(true)
        setConnectionError(null)

        chatService.onReceiveMessage((msg) => {
          if (!mounted) return
          // Add message if it belongs to active conversation
          setMessages((prev) => {
            if (msg.conversationId === activeConvIdRef.current) {
              // Avoid duplicates
              if (prev.some((m) => m.id === msg.id)) return prev
              return [...prev, msg]
            }
            return prev
          })
          // Update conversation preview
          setConversations((prev) =>
            prev.map((c) =>
              c.id === msg.conversationId
                ? {
                    ...c,
                    lastMessagePreview: msg.content,
                    lastMessageAt: msg.createdAt,
                    unreadCount: msg.senderId !== user?.id
                      ? c.id === activeConvIdRef.current ? 0 : c.unreadCount + 1
                      : c.unreadCount,
                  }
                : c
            )
          )
        })

        chatService.onMessagesRead((conversationId, readerId) => {
          if (!mounted) return
          if (readerId !== user?.id) {
            // Other user read our messages → mark isRead = true
            setMessages((prev) =>
              prev.map((m) =>
                m.conversationId === conversationId ? { ...m, isRead: true } : m
              )
            )
          }
        })

        chatService.onError((message) => {
          console.error("[Chat Hub Error]", message)
        })
      } catch (err) {
        if (!mounted) return
        setIsConnected(false)
        setConnectionError("Không thể kết nối realtime. Thử lại sau.")
        console.error("[ChatService] connect error:", err)
      }
    }

    initSignalR()

    return () => {
      mounted = false
      chatService.offAll()
      chatService.disconnect()
    }
  }, [isAuthenticated, user?.id])

  // Ref to track active conversation inside callbacks
  const activeConvIdRef = useRef<number | null>(null)
  useEffect(() => {
    activeConvIdRef.current = activeConvId
  }, [activeConvId])

  // ── Load conversations ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return

    const loadConversations = async () => {
      setIsLoadingConvs(true)
      try {
        const data = await chatService.getConversations()
        setConversations(data)
      } catch (err) {
        console.error("Failed to load conversations:", err)
      } finally {
        setIsLoadingConvs(false)
      }
    }

    loadConversations()
  }, [isAuthenticated])

  // ── Handle ?userId= query param (from profile "Message" button) ───────────

  useEffect(() => {
    const targetUserId = searchParams.get("userId")
    if (!targetUserId || !isAuthenticated) return

    const openConversation = async () => {
      try {
        const conv = await chatService.openOrCreateConversation(targetUserId)
        // Add to list if not already present
        setConversations((prev) => {
          if (prev.some((c) => c.id === conv.id)) return prev
          return [conv, ...prev]
        })
        handleSelectConversation(conv.id)
        // Clean query param
        router.replace("/user/chat", { scroll: false })
      } catch (err) {
        console.error("Failed to open conversation:", err)
      }
    }

    // Wait until conversations are loaded
    if (!isLoadingConvs) {
      openConversation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, isLoadingConvs])

  // ── Select conversation ───────────────────────────────────────────────────

  const handleSelectConversation = useCallback(async (convId: number) => {
    if (convId === activeConvIdRef.current) return

    // Leave old conversation
    if (prevConvIdRef.current !== null) {
      try {
        await chatService.leaveConversation(prevConvIdRef.current)
      } catch {}
    }

    setActiveConvId(convId)
    prevConvIdRef.current = convId
    setMessages([])
    setShowMobileList(false)

    // Load messages
    setIsLoadingMsgs(true)
    try {
      const [msgs] = await Promise.all([
        chatService.getMessages(convId),
        chatService.joinConversation(convId).catch(() => {}),
      ])
      setMessages(msgs)

      // Mark as read
      await chatService.markAsRead(convId).catch(() => {})
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      )
    } catch (err) {
      console.error("Failed to load messages:", err)
    } finally {
      setIsLoadingMsgs(false)
    }
  }, [])

  // ── Send message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const content = inputText.trim()
    if (!content || !activeConvId || isSending) return

    setInputText("")
    setIsSending(true)

    try {
      await chatService.sendMessage(activeConvId, content)
      // ReceiveMessage from hub will add it to UI (for both sender & receiver)
    } catch (err) {
      console.error("Failed to send message:", err)
      setInputText(content) // restore
    } finally {
      setIsSending(false)
    }
  }, [inputText, activeConvId, isSending])

  // ── Keyboard shortcut ────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Auto scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Filtered conversations ───────────────────────────────────────────────

  const filteredConvs = conversations.filter((c) =>
    c.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <BackgroundPattern />
      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-4">
          <div
            className="flex rounded-3xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden shadow-2xl"
            style={{ height: "calc(100vh - 104px)", minHeight: 500 }}
          >
            {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
            <div
              className={`
                ${showMobileList ? "flex" : "hidden"} lg:flex
                flex-col w-full lg:w-[340px] xl:w-[380px] flex-shrink-0
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
                border-r border-slate-200/60 dark:border-slate-800/60
              `}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tin nhắn</h1>
                  {/* Connection indicator */}
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
                      ${isConnected
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                      }`}
                  >
                    {isConnected
                      ? <><Wifi className="h-3 w-3" /> Trực tuyến</>
                      : <><WifiOff className="h-3 w-3" /> Ngoại tuyến</>
                    }
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition"
                  />
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                {isLoadingConvs ? (
                  <div className="flex flex-col gap-3 p-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-32" />
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConvs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center">
                      {searchQuery ? "Không tìm thấy cuộc trò chuyện" : "Chưa có tin nhắn nào"}
                    </p>
                  </div>
                ) : (
                  filteredConvs.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      active={conv.id === activeConvId}
                      currentUserId={user?.id ?? ""}
                      onClick={() => handleSelectConversation(conv.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ── CHAT AREA ─────────────────────────────────────────────── */}
            <div
              className={`
                ${!showMobileList ? "flex" : "hidden"} lg:flex
                flex-1 flex-col
                bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl
              `}
            >
              {activeConv ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-5 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-800/60">
                    {/* Back button (mobile) */}
                    <button
                      className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      onClick={() => setShowMobileList(true)}
                    >
                      <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="relative flex-shrink-0">
                      <SafeAvatar
                        src={activeConv.otherUser.avatarUrl}
                        alt={activeConv.otherUser.fullName}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                      />
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {activeConv.otherUser.fullName}
                      </p>
                      <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
                        Đang hoạt động
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition">
                        <Phone className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                      </button>
                      <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition">
                        <Video className="h-[18px] w-[18px]" />
                      </button>
                      <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition">
                        <MoreHorizontal className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto px-4 py-5">
                    {isLoadingMsgs ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <div className="h-16 w-16 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                          <MessageSquare className="h-7 w-7 text-teal-400" />
                        </div>
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                          Hãy gửi tin nhắn đầu tiên!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {messages.map((msg, idx) => {
                          const isSelf = msg.senderId === user?.id
                          const prevMsg = messages[idx - 1]
                          const nextMsg = messages[idx + 1]

                          // Show date separator
                          const showDateSep =
                            idx === 0 || !isSameDay(msg.createdAt, prevMsg.createdAt)

                          // Show avatar when sender changes or last in group
                          const isLastInGroup =
                            !nextMsg || nextMsg.senderId !== msg.senderId
                          const showAvatar = !isSelf && isLastInGroup

                          // Show time below last in group
                          const showTime = isLastInGroup

                          return (
                            <div key={msg.id}>
                              {showDateSep && (
                                <div className="flex items-center gap-3 my-4">
                                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium px-2">
                                    {formatMessageGroup(msg.createdAt)}
                                  </span>
                                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                </div>
                              )}
                              <div
                                className={`${isLastInGroup ? "mb-3" : "mb-0.5"} animate-in fade-in-0 slide-in-from-bottom-1 duration-200`}
                              >
                                <MessageBubble
                                  msg={msg}
                                  isSelf={isSelf}
                                  showAvatar={showAvatar}
                                  showTime={showTime}
                                />
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200/60 dark:border-slate-800/60">
                    {connectionError && (
                      <p className="text-xs text-red-500 text-center mb-2">{connectionError}</p>
                    )}
                    <div className="flex items-end gap-2">
                      <button className="flex-shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition">
                        <Smile className="h-5 w-5" />
                      </button>

                      <div className="flex-1 relative">
                        <textarea
                          ref={inputRef}
                          rows={1}
                          value={inputText}
                          onChange={(e) => {
                            setInputText(e.target.value)
                            // Auto grow
                            e.target.style.height = "auto"
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Nhập tin nhắn... (Enter để gửi)"
                          className="w-full resize-none rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition leading-relaxed"
                          style={{ maxHeight: 120 }}
                          disabled={!isConnected}
                        />
                      </div>

                      <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isSending || !isConnected}
                        className="flex-shrink-0 h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-teal-200/50 dark:shadow-teal-900/30 hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isSending
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Send className="h-4 w-4" />
                        }
                      </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-2">
                      Shift + Enter để xuống dòng
                    </p>
                  </div>
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  )
}
