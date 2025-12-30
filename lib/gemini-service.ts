// Gemini AI Service for meal suggestions - Client Side
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

const systemPrompt = `Bạn là một chuyên gia dinh dưỡng. Nhiệm vụ duy nhất: gợi ý bữa ăn phù hợp.

Yêu cầu:
- Gợi ý 3 bữa chính (sáng, trưa, tối)
- Thêm bữa phụ nếu cần thiết
- Dùng nguyên liệu, món ăn truyền thống Việt Nam
- Ngắn gọn, dễ hiểu, thực tế
- CHỈ nói duy nhất khẩu phần từng bữa, không nói gì khác

**TRẢ LỜI DƯỚI DẠNG JSON:**
{
  "meals": [
    {
      "name": "Bữa sáng",
      "items": [
        "Món ăn 1: khẩu phần",
        "Món ăn 2: khẩu phần"
      ]
    },
    {
      "name": "Bữa trưa",
      "items": [
        "Món ăn 1: khẩu phần",
        "Món ăn 2: khẩu phần"
      ]
    },
    {
      "name": "Bữa tối",
      "items": [
        "Món ăn 1: khẩu phần",
        "Món ăn 2: khẩu phần"
      ]
    }
  ]
}

Trả lời CHỈ JSON, không nói gì khác. JSON phải hợp lệ.`

export async function sendMessageToGemini(userMessage: string, conversationHistory: Message[]): Promise<string> {
  const GEMINI_API_KEY = typeof window !== "undefined" 
    ? process.env.NEXT_PUBLIC_GEMINI_API_KEY
    : process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured")
  }

  try {
    // Prepare conversation history
    const contents = conversationHistory
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [
          {
            text: msg.content,
          },
        ],
      }))

    // Add current user message
    contents.push({
      role: "user",
      parts: [
        {
          text: userMessage,
        },
      ],
    })

    console.log("Sending message to Gemini API...")

    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 30000)

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 16000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
        signal: abortController.signal,
      }
    )

    clearTimeout(timeoutId)

    console.log("API Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API Error:", errorData)
      throw new Error(
        `API Error: ${errorData.error?.message || response.statusText}`
      )
    }

    const data = await response.json()

    console.log("Full API Response:", JSON.stringify(data, null, 2))

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const responseText = data.candidates[0].content.parts[0].text
      console.log("Response text:", responseText)
      return responseText
    }

    console.error("Invalid response format:", data)
    throw new Error("No text response from Gemini API")
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}
