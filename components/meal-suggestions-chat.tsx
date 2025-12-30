'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { sendMessageToGemini, Message } from '@/lib/gemini-service'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { nutritionApi, ChatSessionDto, MealDto as ApiMealDto } from '@/lib/nutrition-api'
import { authUtils } from '@/lib/auth-utils'

interface MealSuggestionsChatProps {
  userInfo?: {
    gender?: string
    age?: string
    height?: string
    weight?: string
  }
  initialRequest?: string
  existingSession?: ChatSessionDto | null
}

interface Meal {
  name: string
  items: string[]
  calories?: number
  icon?: string
}

interface Analysis {
  status: string
  recommendation: string
}

interface ParsedResponse {
  analysis?: Analysis
  meals: Meal[]
}

const getMealIcon = (name: string): string => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('sáng')) return '🌅'
  if (lowerName.includes('trưa')) return '☀️'
  if (lowerName.includes('tối')) return '🌙'
  if (lowerName.includes('phụ')) return '�'
  return '🍽️'
}

const parseMealsFromJSON = (text: string): ParsedResponse | null => {
  try {
    // Try to extract JSON from text (in case there's extra text around it)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Not JSON, return null to indicate text response
      return null
    }

    const jsonText = jsonMatch[0]
    const data = JSON.parse(jsonText)

    if (!data.meals || !Array.isArray(data.meals)) {
      // Invalid structure, return null
      return null
    }

    const meals: Meal[] = data.meals.map((meal: any) => ({
      name: meal.name || 'Bữa ăn',
      items: Array.isArray(meal.items) ? meal.items : [],
      calories: meal.calories || 0,
      icon: getMealIcon(meal.name || ''),
    }))

    return {
      analysis: data.analysis || undefined,
      meals: meals
    }
  } catch (error) {
    console.error('❌ Failed to parse meals JSON:', error)
    // Return null to indicate text response
    return null
  }
}

export function MealSuggestionsChat({ userInfo, initialRequest, existingSession }: MealSuggestionsChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isInitialRequestSent = useRef(false)

  // Load existing messages from session
  useEffect(() => {
    if (existingSession && existingSession.messages.length > 0) {
      const loadedMessages: Message[] = existingSession.messages.map(msg => ({
        id: msg.id.toString(),
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }))
      setMessages(loadedMessages)
      setHasInitialized(true)
      isInitialRequestSent.current = true // Mark as initialized from existing session
    } else {
      // Reset if no existing session (new chat)
      setMessages([])
      setHasInitialized(false)
      isInitialRequestSent.current = false
    }
  }, [existingSession])

  // Send initial request only once when component mounts
  useEffect(() => {
    // Create unique session key based on initialRequest
    const sessionKey = `initial-request-sent-${initialRequest?.substring(0, 50)}`
    
    // Check if already sent in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      console.log('Initial request already sent in this session, skipping')
      return
    }
    
    // Prevent duplicate calls in StrictMode
    if (isInitialRequestSent.current) {
      console.log('Initial request already sent (ref check), skipping')
      return
    }
    
    // Only send if: has initialRequest AND no existing session AND not yet initialized
    if (!hasInitialized && initialRequest && initialRequest.trim() !== '' && !existingSession) {
      console.log('Sending initial request...')
      isInitialRequestSent.current = true
      setHasInitialized(true)
      
      // Mark as sent in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(sessionKey, 'true')
      }
      
      const sendInitialRequest = async () => {
        setIsLoading(true)
        setError(null)

        try {
          const response = await sendMessageToGemini(initialRequest, [])
          
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          }
          setMessages([assistantMessage])

          // Save initial messages to database
          try {
            if (!authUtils.isAuthenticated()) {
              console.log('User not logged in, messages saved locally only')
              setIsLoading(false)
              return
            }

            console.log('Saving initial messages to database...')
            const parsedResponse = parseMealsFromJSON(response)
            const mealsForApi: ApiMealDto[] | null = parsedResponse
              ? parsedResponse.meals.map(meal => ({
                  name: meal.name,
                  calories: meal.calories || 0,
                  items: meal.items,
                  icon: meal.icon || '',
                }))
              : null

            // Save initial user request (implicit)
            await nutritionApi.saveMessage({
              role: 'user',
              content: initialRequest,
              parsedMeals: null,
            })
            console.log('User message saved')

            // Save assistant response
            await nutritionApi.saveMessage({
              role: 'assistant',
              content: response,
              parsedMeals: mealsForApi,
            })
            console.log('Assistant message saved')
          } catch (saveError) {
            console.error('Error saving initial messages:', saveError)
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu'
          setError(errorMessage)
          console.error('Error:', err)
        } finally {
          setIsLoading(false)
        }
      }

      sendInitialRequest()
    }
  }, []) // Empty dependency array - only run once on mount

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Memoize parsed meals to prevent re-parsing on every render
  const parsedMessages = useMemo(() => {
    return messages.map((message) => ({
      ...message,
      parsedResponse: message.role === 'assistant' ? parseMealsFromJSON(message.content) : null,
    }))
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    const currentInput = input
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      // Send the current input directly, with updated conversation history including the new user message
      const updatedHistory = [...messages, userMessage]
      const response = await sendMessageToGemini(currentInput, updatedHistory)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save messages to database
      try {
        // Check if user is logged in
        if (!authUtils.isAuthenticated()) {
          console.log('User not logged in, messages saved locally only')
          return
        }

        // Parse meals from response (might be null for text responses)
        const parsedResponse = parseMealsFromJSON(response)
        const mealsForApi: ApiMealDto[] | null = parsedResponse 
          ? parsedResponse.meals.map(meal => ({
              name: meal.name,
              calories: meal.calories || 0,
              items: meal.items,
              icon: meal.icon || '',
            }))
          : null

        // Save user message
        await nutritionApi.saveMessage({
          role: 'user',
          content: currentInput,
          parsedMeals: null,
        })

        // Save assistant message with parsed meals (or null for text responses)
        await nutritionApi.saveMessage({
          role: 'assistant',
          content: response,
          parsedMeals: mealsForApi,
        })
      } catch (saveError) {
        console.error('Error saving messages to database:', saveError)
        // Don't show error to user, messages are still in UI
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi tin nhắn'
      setError(errorMessage)
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-secondary/10 rounded-lg border border-border overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {parsedMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            {message.role === 'user' ? (
              // User message
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg bg-primary text-primary-foreground rounded-br-none">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <span className="text-xs mt-1 block text-primary-foreground/70">
                  {message.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ) : (
              // Assistant message - display analysis and parsed meals OR plain text
              <div className="w-full max-w-2xl space-y-3">
                {message.parsedResponse ? (
                  <>
                    {/* Analysis Section */}
                    {message.parsedResponse.analysis && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                          <span className="text-xl">📊</span>
                          Phân tích tình trạng sức khỏe
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">Tình trạng hiện tại:</p>
                            <p className="text-sm text-foreground">{message.parsedResponse.analysis.status}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">Hướng ăn uống:</p>
                            <p className="text-sm text-foreground">{message.parsedResponse.analysis.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Meals Section */}
                    {message.parsedResponse.meals.map((meal, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <span className="text-xl">{meal.icon}</span>
                            {meal.name}
                          </h3>
                          {meal.calories && meal.calories > 0 && (
                            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                              🔥 {meal.calories} kcal
                            </span>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {meal.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-sm text-foreground flex gap-2">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
                ) : (
                  // Plain text response (Q&A, explanations)
                  <div className="bg-card border border-border px-4 py-3 rounded-lg rounded-bl-none">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                )}
                <span className="text-xs text-muted-foreground block mt-2">
                  {message.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input Area */}
      <div className="border-t border-border px-2 py-1.5 bg-card">
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-1.5 items-center">
            <textarea
              ref={textareaRef}
              placeholder="Hỏi tôi bất cứ điều gì về dinh dưỡng hoặc bữa ăn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e as any)
                }
              }}
              className="flex-1 resize-none min-h-[36px] max-h-[80px] px-3 py-2 text-sm rounded-md border-0 bg-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-9 w-9 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
