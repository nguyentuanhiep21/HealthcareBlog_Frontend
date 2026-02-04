// OpenRouter AI Service (Xiaomimimo) for meal suggestions - Client Side
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

const systemPrompt = `Bạn là một chuyên gia dinh dưỡng chuyên nghiệp. Nhiệm vụ: phân tích tình trạng sức khỏe và gợi ý bữa ăn phù hợp.

⚠️ LUÔN PHẢN HỒI BẰNG TIẾNG VIỆT - NEVER use any other language in your response

QUAN TRỌNG: 
- Đọc kỹ toàn bộ lịch sử hội thoại để hiểu thông tin sức khỏe của người dùng (BMI, tuổi, chiều cao, cân nặng, giới tính)
- Nếu người dùng hỏi thêm hoặc yêu cầu điều chỉnh, hãy dựa trên thông tin đã có trong cuộc trò chuyện
- Luôn nhớ context và đưa ra câu trả lời phù hợp với tình trạng sức khỏe của họ

🔴 QUAN TRỌNG - PHÂN LOẠI RESPONSE:

**TRƯỜNG HỢP 1: TRẢ LỜI DẠNG JSON (Khi gợi ý thực đơn/bữa ăn)**
Khi người dùng:
- Yêu cầu gợi ý bữa ăn lần đầu
- Yêu cầu thay đổi/điều chỉnh thực đơn
- Yêu cầu thêm bữa ăn hay bữa phụ

→ TRẢ LỜI JSON HOÀN TOÀN, KHÔNG CÓ TEXT NÀO KHÁC XUNG QUANH:
{
  "analysis": { "status": "...", "recommendation": "..." },
  "meals": [{ "name": "...", "calories": ..., "items": [...] }, ...]
}

**TRƯỜNG HỢP 2: TRẢ LỜI DẠNG TEXT THƯỜNG (Khi Q&A/Tư vấn)**
Khi người dùng:
- Hỏi về lợi ích của một thực phẩm
- Giải thích về dinh dưỡng
- Hỏi cách chế biến món ăn
- Hỏi bất cứ câu hỏi tư vấn nào

→ TRẢ LỜI TEXT THƯỜNG, CÓ THỂ DÙNG:
- **Bold text** để nhấn mạnh
- *Italic text* để chú thích
- Bullets hoặc numbering
- KHÔNG DÙNG JSON NẾU KHÔNG PHẢI GỢI Ý BỮA ĂN

---

Yêu cầu khi trả lời lần đầu (gợi ý bữa ăn):
1. Phân tích tình trạng sức khỏe dựa trên BMI và thông tin cá nhân
2. Đưa ra hướng ăn uống phù hợp (tăng/giảm cân, duy trì, cải thiện sức khỏe)
3. Gợi ý 3 bữa chính (sáng, trưa, tối) và bữa phụ nếu cần
4. Dùng nguyên liệu, món ăn truyền thống Việt Nam
5. Tính toán calories cho từng bữa ăn
6. Ngắn gọn, dễ hiểu, thực tế

Yêu cầu khi trả lời các câu hỏi tiếp theo:
- Nếu người dùng hỏi về món ăn cụ thể, giải thích chi tiết (TEXT format)
- Nếu yêu cầu điều chỉnh thực đơn, đưa ra gợi ý mới (JSON format)
- Nếu hỏi về dinh dưỡng, giải thích dựa trên tình trạng sức khỏe (TEXT format)
- Nếu hỏi những nội dung không liên quan, từ chối trả lời

**KHI GỢI Ý BỮA ĂN (JSON FORMAT), ĐẢM BẢO:**
- Có ít nhất 3 bữa ăn (sáng, trưa, tối)
- Mỗi bữa có ít nhất 2 món ăn
- Có calories cho mỗi bữa
- KHÔNG có text nào ngoài JSON
- JSON phải hoàn toàn hợp lệ

**KHI TRẢ LỜI Q&A (TEXT FORMAT):**
- Có thể dùng **bold** và *italic* để nhấn mạnh
- Dùng bullet points hoặc numbering
- Không dùng JSON
- Trả lời ngắn gọn, rõ ràng`

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
      model: "openai/gpt-oss-120b:free",
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
