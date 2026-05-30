// OpenRouter AI Service (Xiaomimimo) for meal suggestions - Client Side
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

const systemPrompt = `Bạn là chuyên gia dinh dưỡng. Luôn trả lời bằng tiếng Việt.

PHÂN LOẠI RESPONSE:

1. KHI GỢI Ý BỮA ĂN: Trả lời JSON THUẦN (chỉ JSON, không markdown, không \`\`\`json\`\`\`)
   - Yêu cầu gợi ý bữa ăn lần đầu
   - Yêu cầu điều chỉnh/thay đổi thực đơn
   
   Format chính xác (KHÔNG THÊM PREFIX VÀO GIÁ TRỊ, dùng "calo" không "kcal"):
   {"analysis":{"health_status":"gầy, bình thường, béo...","user_requirement":"ăn nhiều trứng, ít tinh bột, ...","suggestion":"tăng lượng trứng, giảm tinh bột, tăng protein..."},"meals":[{"name":"Bữa sáng","calories":450,"items":["Món 1 (200 calo)","Món 2 (250 calo)"]},{"name":"Bữa trưa","calories":650,"items":[...]},{"name":"Bữa tối","calories":700,"items":[...]}]}
   
   ⚠️ QUAN TRỌNG:
   - CHỈ trả JSON, KHÔNG trả text kèm theo
   - KHÔNG dùng markdown (\`\`\`json\`\`\`)
   - KHÔNG dùng **bold** hoặc *italic* trong JSON
   - Dùng đơn vị "calo" chứ KHÔNG phải "kcal"
   - Có đúng 3 bữa (sáng, trưa, tối), mỗi bữa ≥2 món
   - items là mảng strings với đơn vị "calo" (VD: ["Trứng (140 calo)", "Bánh mì (300 calo)"])

2. KHI Q&A/TƯ VẤN: Trả lời TEXT (không JSON)
   - Hỏi về thực phẩm, dinh dưỡng, cách chế biến
   - Dùng **bold** và *italic* để nhấn mạnh
   - Trả lời ngắn gọn

Ghi nhớ context cuộc trò chuyện để đưa ra lời khuyên phù hợp.
Nếu câu hỏi không liên quan, từ chối trả lời một cách lịch sự.
`

export async function sendMessageToAI(userMessage: string, conversationHistory: Message[]): Promise<string> {
  const OPENROUTER_API_KEY = typeof window !== "undefined" 
    ? process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    : process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured")
  }

  try {
    // Prepare messages for OpenRouter format
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt,
      }
    ]

    // Add conversation history - only keep last 10 messages to reduce request size
    const recentHistory = conversationHistory.slice(-10)
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })
    })

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    })

    console.log("Sending message to OpenRouter API...")
    console.log("Using model: xiaomi/mimo-v2-flash:free")
    console.log("API Key present:", !!OPENROUTER_API_KEY)
    console.log("Conversation history size:", recentHistory.length, "messages")

    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 30000)

    const requestBody = {
      model: "openai/gpt-oss-20b",
      messages: messages,
      temperature: 0.7,
      max_tokens: 8000,
    }
    
    console.log("Request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(
      
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          "X-Title": "Healthcare Blog - Meal Suggestions",
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      }
    )

    clearTimeout(timeoutId)

    console.log("API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API Error Response:", errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }
      
      // Log detailed error for debugging
      if (errorData.error) {
        console.error("Error details:", errorData.error)
      }
      
      throw new Error(
        `API Error: ${errorData.error?.message || response.statusText}`
      )
    }

    const data = await response.json()
    console.log("Full API Response:", data)

    if (data.choices && data.choices[0]?.message?.content) {
      const responseText = data.choices[0].message.content
      console.log("Response text:", responseText)
      return responseText
    }

    console.error("Invalid response format:", data)
    throw new Error("No text response from OpenRouter API")
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    throw error
  }
}

/**
 * Optimized version: Send only current message to backend
 * Backend will handle context management & call AI with full session history
 * This reduces API costs by not sending full conversation history each time
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
