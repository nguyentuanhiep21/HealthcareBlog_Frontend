// AI Service for meal suggestions - Calls backend API (backend handles AI/OpenRouter)
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

/**
 * Send a message to the AI via backend.
 * The backend handles system prompt, AI provider (OpenRouter), and context management.
 * @param userMessage - The current user message
 * @param conversationHistory - Recent conversation history for context
 */
export async function sendMessageToAI(userMessage: string, conversationHistory: Message[]): Promise<string> {
  return sendMessageToAIViaBackend(userMessage)
}

/**
 * Send only current message to backend.
 * Backend will handle context management & call AI with full session history.
 * This reduces API costs by not sending full conversation history each time.
 */
export async function sendMessageToAIViaBackend(userMessage: string): Promise<string> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'

    const response = await fetch(`${API_URL}/api/nutrition/ai-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend AI API Error:', errorText)
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Backend AI Response:', data)

    return data.response || data.message || ''
  } catch (error) {
    console.error('Error calling backend AI endpoint:', error)
    throw error
  }
}
