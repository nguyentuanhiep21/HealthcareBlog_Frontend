// Health Assessment API Service
// Calls POST /api/HealthAssessment/assess — không yêu cầu đăng nhập

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'

export interface HealthAssessRequest {
  /** "Male" | "Female" */
  gender: string
  /** Tuổi: 10–100 */
  age: number
  /** Chiều cao cm: 100–250 */
  height: number
  /** Cân nặng kg: 30–300 */
  weight: number
  /** "Gain_Muscle" | "Lose_Fat" | "Maintain" */
  goal: string
}

export interface NutritionTarget {
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface HealthAssessResult {
  status: string
  bmi: number
  bmiCategory: string
  healthScore: number
  nutrition: NutritionTarget
  advice: string
}

export interface HealthAssessError {
  status: string
  message: string
}

/** Gọi API đánh giá sức khỏe (public endpoint, không cần auth) */
export async function assessHealth(
  request: HealthAssessRequest
): Promise<HealthAssessResult> {
  const response = await fetch(`${API_URL}/api/HealthAssessment/assess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData: HealthAssessError = await response.json().catch(() => ({
      status: 'error',
      message: `Lỗi ${response.status}: ${response.statusText}`,
    }))
    throw new Error(errorData.message || 'Đánh giá sức khỏe thất bại')
  }

  return response.json()
}

/** Map giới tính tiếng Việt → API enum */
export function mapGenderToApi(gender: string): string {
  const map: Record<string, string> = {
    Nam: 'Male',
    Nữ: 'Female',
    Male: 'Male',
    Female: 'Female',
  }
  return map[gender] ?? 'Male'
}

/** Map mục tiêu tiếng Việt → API enum */
export function mapGoalToApi(goal: string): string {
  const map: Record<string, string> = {
    'Tăng cơ': 'Gain_Muscle',
    'Tăng cân': 'Gain_Muscle',
    'Giảm cân': 'Lose_Fat',
    'Giảm mỡ': 'Lose_Fat',
    'Duy trì': 'Maintain',
    Gain_Muscle: 'Gain_Muscle',
    Lose_Fat: 'Lose_Fat',
    Maintain: 'Maintain',
  }
  return map[goal] ?? 'Maintain'
}

/** Health score color helper */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

/** BMI category color helper */
export function getBmiCategoryColor(category: string): string {
  if (category.includes('Bình thường')) return 'text-emerald-500'
  if (category.includes('Thừa cân')) return 'text-yellow-500'
  if (category.includes('Béo phì')) return 'text-red-500'
  if (category.includes('Gầy')) return 'text-blue-500'
  return 'text-muted-foreground'
}

export interface MealSuggestionRequest {
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  goal: string
}

export interface Meal {
  id: number
  name: string
  nameEn: string
  mealType: string
  caloriesPerServing: number
  proteinG: number
  carbsG: number
  fatG: number
  servingSizeDesc: string
  tags: string[]
  description: string
  imageUrl: string | null
}

export interface MealSuggestionResponse {
  message: string
  data: {
    breakfast: Meal
    lunch: Meal
    dinner: Meal
    snacks: Meal[]
    summary: {
      targetCalories: number
      totalCalories: number
      totalProteinG: number
      totalCarbsG: number
      totalFatG: number
      caloriesCoverage: number
      coverageNote: string
    }
  }
  success: boolean
}

/** Gọi API gợi ý thực đơn (public endpoint) */
export async function suggestMealPlan(
  request: MealSuggestionRequest
): Promise<MealSuggestionResponse> {
  const response = await fetch(`${API_URL}/api/MealSuggestion/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Lỗi ${response.status}: ${response.statusText}`,
    }))
    throw new Error(errorData.message || 'Gợi ý thực đơn thất bại')
  }

  return response.json()
}
