// Nutrition API Service
import { authUtils } from './auth-utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'

export interface MealDto {
  name: string
  calories: number
  items: string[]
  icon: string
}

export interface ChatMessageDto {
  id: number
  role: string
  content: string
  parsedMeals: MealDto[] | null
  createdAt: string
}

export interface ChatSessionDto {
  id: number
  nutritionProfileId: number
  createdAt: string
  updatedAt: string
  messages: ChatMessageDto[]
}

export interface NutritionProfileDto {
  id: number
  userId: string
  gender: string
  age: number
  height: number
  weight: number
  bmi: number
  bmiStatus: string
  createdAt: string
  updatedAt: string
}

export interface NutritionDataDto {
  profile: NutritionProfileDto | null
  activeSession: ChatSessionDto | null
}

export interface CreateNutritionProfileDto {
  gender: string
  age: number
  height: number
  weight: number
}

export interface SaveChatMessageDto {
  role: string
  content: string
  parsedMeals: MealDto[] | null
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = authUtils.getAuthHeaders()
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error Response:', errorText)
    
    let error
    try {
      error = JSON.parse(errorText)
    } catch {
      error = { message: response.statusText }
    }
    
    throw new Error(error.message || `API request failed: ${response.status}`)
  }

  return response.json()
}

export const nutritionApi = {
  // Get user's nutrition data (profile + active session)
  async getUserData(): Promise<NutritionDataDto> {
    return fetchWithAuth('/api/nutrition/data')
  },

  // Create new chat session (will delete old session)
  async createNewSession(profileDto: CreateNutritionProfileDto): Promise<ChatSessionDto> {
    return fetchWithAuth('/api/nutrition/session/new', {
      method: 'POST',
      body: JSON.stringify(profileDto),
    })
  },

  // Get active chat session
  async getActiveSession(): Promise<ChatSessionDto> {
    return fetchWithAuth('/api/nutrition/session/active')
  },

  // Save a chat message
  async saveMessage(messageDto: SaveChatMessageDto): Promise<ChatMessageDto> {
    return fetchWithAuth('/api/nutrition/message', {
      method: 'POST',
      body: JSON.stringify(messageDto),
    })
  },

  // Get user's nutrition profile
  async getProfile(): Promise<NutritionProfileDto> {
    return fetchWithAuth('/api/nutrition/profile')
  },
}
