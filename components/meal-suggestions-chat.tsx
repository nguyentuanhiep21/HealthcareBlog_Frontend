'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { sendMessageToGemini, Message } from '@/lib/gemini-service'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MealSuggestionsChatProps {
  userInfo?: {
    gender?: string
    age?: string
    height?: string
    weight?: string
  }
  initialRequest?: string
}

interface Meal {
  name: string
  items: string[]
  icon?: string
}

const getMealIcon = (name: string): string => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('sáng')) return '🌅'
  if (lowerName.includes('trưa')) return '☀️'
  if (lowerName.includes('tối')) return '🌙'
  if (lowerName.includes('phụ')) return '🍴'
  return '🍽️'
}

const parseMealsFromJSON = (text: string): Meal[] => {
  console.log('Raw response text:', text)
  try {
    // Try to extract JSON from text (in case there's extra text around it)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const jsonText = jsonMatch[0]
    console.log('Extracted JSON:', jsonText)
    const data = JSON.parse(jsonText)
    console.log('Parsed data:', data)

    if (!data.meals || !Array.isArray(data.meals)) {
      throw new Error('Invalid meals structure')
    }

    console.log('Meals array:', data.meals)
    const meals: Meal[] = data.meals.map((meal: any) => ({
      name: meal.name || 'Bữa ăn',
      items: Array.isArray(meal.items) ? meal.items : [],
      icon: getMealIcon(meal.name || ''),
    }))

    console.log('Final parsed meals:', meals)
    return meals
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    // Fallback: return raw text
    return [
      {
        name: 'Gợi ý bữa ăn',
        icon: '🍽️',
        items: text.split('\n').filter((line) => line.trim().length > 0),
      },
    ]
  }
}

export function MealSuggestionsChat({ userInfo, initialRequest }: MealSuggestionsChatProps) {
  const getInitialMessages = (): Message[] => {
    return []
  }

  const [messages, setMessages] = useState<Message[]>(getInitialMessages())
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const initialRequestSentRef = useRef(false)

  // Send initial request on mount
  useEffect(() => {
    if (initialRequest && !initialRequestSentRef.current) {
      initialRequestSentRef.current = true
      console.log('Sending initial request once')
      handleInitialRequest()
    }
  }, [initialRequest])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleInitialRequest = async () => {
    console.log('handleInitialRequest called')
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu'
      setError(errorMessage)
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    console.log('handleSendMessage called with input:', input)
    e.preventDefault()

    if (!input.trim()) return

    // Clear error
    setError(null)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setIsLoading(true)

    try {
      // Build detailed user context from health info
      let contextMessage = ''
      if (userInfo) {
        const bmi = userInfo.height && userInfo.weight 
          ? (parseFloat(userInfo.weight) / Math.pow(parseFloat(userInfo.height) / 100, 2)).toFixed(1)
          : null

        contextMessage = `Tôi là một người ${userInfo.gender?.toLowerCase()}. Thông tin chi tiết về tôi:
- Tuổi: ${userInfo.age} tuổi
- Chiều cao: ${userInfo.height}cm
- Cân nặng: ${userInfo.weight}kg
${bmi ? `- Chỉ số BMI: ${bmi}` : ''}

Dựa trên thông tin này, vui lòng cung cấp tư vấn dinh dưỡng và chế độ ăn uống phù hợp cho tôi.`
      }

      const fullMessage = contextMessage ? `${contextMessage}\n\n${input}` : input
      const response = await sendMessageToGemini(fullMessage, messages)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
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
        {messages.map((message) => (
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
              // Assistant message - parse JSON and display meals
              <div className="w-full max-w-2xl space-y-3">
                {parseMealsFromJSON(message.content).map((meal, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2"
                  >
                    <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <span className="text-xl">{meal.icon}</span>
                      {meal.name}
                    </h3>
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
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
              placeholder="Hỏi tôi bất cứ điều gì về dinh dưỡng hoặc bữa ăn..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e as any)
                }
              }}
              className="flex-1 resize-none min-h-[40px] max-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-auto"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Nhấn Shift + Enter để xuống dòng, Enter để gửi
          </p>
        </form>
      </div>
    </div>
  )
}
