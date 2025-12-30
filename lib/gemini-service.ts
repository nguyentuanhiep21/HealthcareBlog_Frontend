// OpenRouter AI Service for meal suggestions - Client Side
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

const systemPrompt = `Bạn là một chuyên gia dinh dưỡng chuyên nghiệp. Nhiệm vụ: phân tích tình trạng sức khỏe và gợi ý bữa ăn phù hợp.

QUAN TRỌNG: 
- Đọc kỹ toàn bộ lịch sử hội thoại để hiểu thông tin sức khỏe của người dùng (BMI, tuổi, chiều cao, cân nặng)
- Nếu người dùng hỏi thêm hoặc yêu cầu điều chỉnh, hãy dựa trên thông tin đã có trong cuộc trò chuyện
- Luôn nhớ context và đưa ra câu trả lời phù hợp với tình trạng sức khỏe của họ

Yêu cầu khi trả lời lần đầu:
1. Phân tích tình trạng sức khỏe dựa trên BMI và thông tin cá nhân
2. Đưa ra hướng ăn uống phù hợp (tăng/giảm cân, duy trì, cải thiện sức khỏe)
3. Gợi ý 3 bữa chính (sáng, trưa, tối) và bữa phụ nếu cần
4. Dùng nguyên liệu, món ăn truyền thống Việt Nam
5. Tính toán calories cho từng bữa ăn
6. Ngắn gọn, dễ hiểu, thực tế

Yêu cầu khi trả lời các câu hỏi tiếp theo:
- Nếu người dùng hỏi về món ăn cụ thể, giải thích chi tiết
- Nếu yêu cầu thay đổi/điều chỉnh, đưa ra gợi ý mới phù hợp
- Nếu hỏi về dinh dưỡng, giải thích dựa trên tình trạng sức khỏe của họ
- Luôn trả lời JSON format nếu gợi ý bữa ăn, text thông thường nếu giải thích/tư vấn

**KHI GỢI Ý BỮA ĂN, TRẢ LỜI DƯỚI DẠNG JSON:**
{
  "analysis": {
    "status": "Tình trạng sức khỏe hiện tại (1-2 câu)",
    "recommendation": "Hướng ăn uống phù hợp (2-3 câu)"
  },
  "meals": [
    {
      "name": "Bữa sáng",
      "calories": 400,
      "items": [
        "Món ăn 1: khẩu phần cụ thể",
        "Món ăn 2: khẩu phần cụ thể"
      ]
    },
    {
      "name": "Bữa trưa",
      "calories": 600,
      "items": [
        "Món ăn 1: khẩu phần cụ thể",
        "Món ăn 2: khẩu phần cụ thể"
      ]
    },
    {
      "name": "Bữa tối",
      "calories": 500,
      "items": [
        "Món ăn 1: khẩu phần cụ thể",
        "Món ăn 2: khẩu phần cụ thể"
      ]
    }
  ]
}

**KHI TRẢ LỜI CÂU HỎI/TƯ VẤN, TRẢ LỜI TEXT THÔNG THƯỜNG**

Nếu trả lời JSON, phải hợp lệ và không có text nào khác xung quanh.`

export async function sendMessageToGemini(userMessage: string, conversationHistory: Message[]): Promise<string> {
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
      model: "xiaomi/mimo-v2-flash:free",
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
