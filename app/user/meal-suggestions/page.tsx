'use client'

import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MealSuggestionsChat } from '@/components/meal-suggestions-chat'
import { X, MessageCircle, Settings, Loader2 } from 'lucide-react'
import { nutritionApi, NutritionDataDto } from '@/lib/nutrition-api'
import { authUtils } from '@/lib/auth-utils'

export default function MealSuggestionsPage() {
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [userInfo, setUserInfo] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
  })
  const [initialRequest, setInitialRequest] = useState('')
  const [nutritionData, setNutritionData] = useState<NutritionDataDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const hasLoadedData = useRef(false)
  const [chatKey, setChatKey] = useState(Date.now()) // Key to force re-mount

  const calculateBMI = (h: string, w: string) => {
    if (!h || !w) return null
    return (parseFloat(w) / Math.pow(parseFloat(h) / 100, 2)).toFixed(1)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return 'Gầy'
    if (bmi < 25) return 'Bình thường'
    if (bmi < 30) return 'Thừa cân'
    return 'Béo phì'
  }

  // Load user's nutrition data on mount
  useEffect(() => {
    // Prevent duplicate calls in StrictMode
    if (hasLoadedData.current) return
    hasLoadedData.current = true

    const loadUserData = async () => {
      try {
        // Check if user is logged in
        if (!authUtils.isAuthenticated()) {
          console.log('User not logged in, skipping API call')
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        const data = await nutritionApi.getUserData()
        setNutritionData(data)

        // If user has profile, pre-fill the form
        if (data.profile) {
          setGender(data.profile.gender)
          setAge(data.profile.age.toString())
          setHeight(data.profile.height.toString())
          setWeight(data.profile.weight.toString())
          setUserInfo({
            gender: data.profile.gender,
            age: data.profile.age.toString(),
            height: data.profile.height.toString(),
            weight: data.profile.weight.toString(),
          })
        }
      } catch (error: any) {
        console.error('Error loading nutrition data:', error)
        // If 401, user not authenticated - just skip
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('User not authenticated, skipping data load')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gender || !age || !height || !weight) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      setIsSaving(true)

      // Check if user is logged in
      if (authUtils.isAuthenticated()) {
        // Create new session (will delete old one)
        await nutritionApi.createNewSession({
          gender,
          age: parseInt(age),
          height: parseFloat(height),
          weight: parseFloat(weight),
        })
        
        // Clear old session data to force new chat
        setNutritionData(prev => prev ? { ...prev, activeSession: null } : null)
      } else {
        console.log('User not logged in, session not saved to database')
      }

      const bmi = calculateBMI(height, weight)
      const request = `Tôi là một ${gender?.toLowerCase()} giới. Thông tin chi tiết về tôi:
- Tuổi: ${age} tuổi
- Chiều cao: ${height}cm
- Cân nặng: ${weight}kg
- Chỉ số BMI: ${bmi} (${getBMIStatus(parseFloat(bmi!))})

Vui lòng gợi ý bữa ăn phù hợp cho tôi.`

      // Clear any previous session storage for initial request
      const sessionKey = `initial-request-sent-${request.substring(0, 50)}`
      sessionStorage.removeItem(sessionKey)

      setInitialRequest(request)
      setUserInfo({
        gender,
        age,
        height,
        weight,
      })
      setChatKey(Date.now()) // Generate new key to force re-mount
      setShowChat(true)
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Có lỗi xảy ra khi tạo phiên chat. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContinueChat = () => {
    // Load existing session and show chat
    // Set userInfo from existing profile if available
    if (nutritionData?.profile) {
      setUserInfo({
        gender: nutritionData.profile.gender,
        age: nutritionData.profile.age.toString(),
        height: nutritionData.profile.height.toString(),
        weight: nutritionData.profile.weight.toString(),
      })
    }
    setInitialRequest('') // No initial request, just continue
    setShowChat(true)
  }

  const handleReset = () => {
    setShowChat(false)
    // Keep the form data, don't reset
  }

  const hasSavedSession = nutritionData?.activeSession !== null && nutritionData?.activeSession !== undefined

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-4 pb-0">
        {!showChat ? (
          // Setup Form
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm h-fit">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5" />
                <h1 className="text-2xl font-bold">Cài đặt thông tin sức khỏe</h1>
              </div>
              <p className="text-muted-foreground mb-6">
                Điền thông tin của bạn để bắt đầu chat với AI dinh dưỡng
              </p>

              {/* Continue Chat Button - Show if user has saved session */}
              {hasSavedSession && (
                <div className="mb-6">
                  <Button 
                    onClick={handleContinueChat} 
                    className="w-full" 
                    size="lg"
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Tiếp tục chat từ lần trước
                  </Button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Hoặc bắt đầu mới</span>
                    </div>
                  </div>
                </div>
              )}

              {/* BMI Display */}
              {height && weight && (
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chỉ số BMI của bạn</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {calculateBMI(height, weight)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tình trạng</p>
                      <p className="text-lg font-semibold text-foreground">
                        {getBMIStatus(parseFloat(calculateBMI(height, weight)!))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleStartChat} className="space-y-6">
                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">Tuổi</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Nhập tuổi của bạn"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="1"
                    max="120"
                    required
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label htmlFor="height">Chiều cao (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Nhập chiều cao của bạn"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="50"
                    max="250"
                    required
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight">Cân nặng (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Nhập cân nặng của bạn"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="20"
                    max="300"
                    step="0.1"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {hasSavedSession ? 'Bắt đầu chat mới (xóa chat cũ)' : 'Bắt đầu chat với AI'}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">💡 Tính năng AI Dinh dưỡng</h2>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Gợi ý bữa ăn được cá nhân hóa dựa trên thông tin sức khỏe của bạn</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Giải đáp câu hỏi về lợi ích sức khỏe của các loại thực phẩm</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Hỗ trợ lập kế hoạch dinh dưỡng hàng ngày</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Chat trực tiếp - tương tác liên tục với trợ lý AI</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">⚠️ Lưu ý quan trọng</h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>AI là trợ lý tư vấn, không thay thế lời khuyên của bác sĩ</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Luôn tham khảo ý kiến chuyên gia y tế trước khi thay đổi chế độ ăn</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Thông tin được cung cấp chỉ nhằm mục đích giáo dục</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Chat với Trợ lý Dinh dưỡng AI</h1>
              </div>
              <Button variant="outline" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                Kết thúc chat
              </Button>
            </div>

            {/* User Info Summary with BMI */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-2 flex justify-center">
              <div className="grid grid-cols-5 gap-12 md:gap-20 lg:gap-32">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Giới tính</p>
                  <p className="text-sm font-semibold">{userInfo.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Tuổi</p>
                  <p className="text-sm font-semibold">{userInfo.age} tuổi</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Chiều cao</p>
                  <p className="text-sm font-semibold">{userInfo.height}cm</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Cân nặng</p>
                  <p className="text-sm font-semibold">{userInfo.weight}kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">BMI</p>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-blue-600">{calculateBMI(userInfo.height, userInfo.weight)}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      ({getBMIStatus(parseFloat(calculateBMI(userInfo.height, userInfo.weight)!))})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
              <MealSuggestionsChat 
                key={chatKey} // Force re-mount with unique key
                userInfo={userInfo} 
                initialRequest={initialRequest}
                existingSession={nutritionData?.activeSession || null}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
