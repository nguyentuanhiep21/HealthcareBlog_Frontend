'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
import { X, MessageCircle, Settings, Loader2, HeartPulse, Flame, Beef, Wheat, Droplets, AlertCircle } from 'lucide-react'
import {
  assessHealth,
  mapGenderToApi,
  mapGoalToApi,
  getHealthScoreColor,
  getBmiCategoryColor,
  type HealthAssessResult,
} from '@/lib/health-assessment-api'
import { authUtils } from '@/lib/auth-utils'

export default function MealSuggestionsPage() {
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [userInfo, setUserInfo] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
  })
  const [initialRequest, setInitialRequest] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [chatKey, setChatKey] = useState(Date.now())

  // Health Assessment state
  const [assessResult, setAssessResult] = useState<HealthAssessResult | null>(null)
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessError, setAssessError] = useState<string | null>(null)
  const assessDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canAssess = gender && age && height && weight && goal

  /** Gọi API đánh giá sức khỏe — debounce 600ms */
  const triggerAssess = useCallback(() => {
    if (!gender || !age || !height || !weight || !goal) return

    const ageN = parseInt(age)
    const heightN = parseFloat(height)
    const weightN = parseFloat(weight)

    // Client-side validation trước khi gọi API
    if (ageN < 10 || ageN > 100) return
    if (heightN < 100 || heightN > 250) return
    if (weightN < 30 || weightN > 300) return

    if (assessDebounceRef.current) clearTimeout(assessDebounceRef.current)

    assessDebounceRef.current = setTimeout(async () => {
      try {
        setIsAssessing(true)
        setAssessError(null)
        const result = await assessHealth({
          gender: mapGenderToApi(gender),
          age: ageN,
          height: heightN,
          weight: weightN,
          goal: mapGoalToApi(goal),
        })
        setAssessResult(result)
      } catch (err: any) {
        setAssessError(err.message || 'Không thể đánh giá sức khỏe')
        setAssessResult(null)
      } finally {
        setIsAssessing(false)
      }
    }, 600)
  }, [gender, age, height, weight, goal])

  useEffect(() => {
    triggerAssess()
    return () => {
      if (assessDebounceRef.current) clearTimeout(assessDebounceRef.current)
    }
  }, [triggerAssess])

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

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gender || !age || !height || !weight || !goal) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      setIsSaving(true)

      const bmi = calculateBMI(height, weight)
      const request = `Tôi là một ${gender?.toLowerCase()} giới. Thông tin chi tiết về tôi:\n- Tuổi: ${age} tuổi\n- Chiều cao: ${height}cm\n- Cân nặng: ${weight}kg\n- Chỉ số BMI: ${bmi} (${getBMIStatus(parseFloat(bmi!))})\n- Mục tiêu: ${goal}\n\nVui lòng gợi ý bữa ăn phù hợp cho tôi dựa trên mục tiêu ${goal.toLowerCase()}.`

      const sessionKey = `initial-request-sent-${request.substring(0, 50)}`
      sessionStorage.removeItem(sessionKey)

      setInitialRequest(request)
      setUserInfo({ gender, age, height, weight, goal })
      setChatKey(Date.now())
      setShowChat(true)
    } catch (error) {
      console.error('Error starting chat:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setShowChat(false)
  }

  /** Render health score ring */
  const HealthScoreRing = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 36
    const strokeDash = (score / 100) * circumference
    const color =
      score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444'

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
          <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <span className="absolute text-xl font-bold" style={{ color }}>
          {score}
        </span>
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
            {/* ── Left: Form ── */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm h-fit">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5" />
                <h1 className="text-2xl font-bold">Cài đặt thông tin sức khỏe</h1>
              </div>
              <p className="text-muted-foreground mb-6">
                Điền thông tin của bạn để nhận đánh giá sức khỏe và bắt đầu chat với AI dinh dưỡng
              </p>

              {/* BMI Quick Display */}
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
                    min="10"
                    max="100"
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
                    min="100"
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
                    min="30"
                    max="300"
                    step="0.1"
                    required
                  />
                </div>

                {/* Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal">Mục tiêu</Label>
                  <Select value={goal} onValueChange={setGoal} required>
                    <SelectTrigger id="goal">
                      <SelectValue placeholder="Chọn mục tiêu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tăng cân">Tăng cơ / Tăng cân</SelectItem>
                      <SelectItem value="Giảm cân">Giảm mỡ / Giảm cân</SelectItem>
                      <SelectItem value="Duy trì">Duy trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Gợi ý thực đơn phù hợp
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* ── Right: Health Assessment Panel ── */}
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Đánh giá sức khỏe</h2>
                {isAssessing && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />
                )}
              </div>

              {/* Empty state */}
              {!canAssess && !assessResult && !isAssessing && (
                <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
                  <HeartPulse className="h-12 w-12 mx-auto text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">
                    Điền đầy đủ thông tin bên trái để xem kết quả đánh giá sức khỏe từ mô hình AI
                  </p>
                </div>
              )}

              {/* Loading skeleton */}
              {isAssessing && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4 animate-pulse">
                  <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-muted" />
                  </div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg" />
                    ))}
                  </div>
                </div>
              )}

              {/* Error state */}
              {assessError && !isAssessing && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{assessError}</p>
                </div>
              )}

              {/* Assessment Result */}
              {assessResult && !isAssessing && (
                <>
                  {/* Health Score Card */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-6">
                      <HealthScoreRing score={assessResult.healthScore} />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Điểm sức khỏe
                        </p>
                        <p className={`text-3xl font-bold ${getHealthScoreColor(assessResult.healthScore)}`}>
                          {assessResult.healthScore}/100
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">BMI:</span>
                          <span className="font-semibold">{assessResult.bmi}</span>
                          <span className={`text-sm font-medium ${getBmiCategoryColor(assessResult.bmiCategory)}`}>
                            ({assessResult.bmiCategory})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Targets */}
                  <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                      Mục tiêu dinh dưỡng hằng ngày
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Calories */}
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center gap-3">
                        <Flame className="h-7 w-7 text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Calo</p>
                          <p className="text-lg font-bold text-orange-500">
                            {assessResult.nutrition.caloriesKcal.toLocaleString('vi-VN')}
                          </p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                      </div>

                      {/* Protein */}
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                        <Beef className="h-7 w-7 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Protein</p>
                          <p className="text-lg font-bold text-red-500">
                            {assessResult.nutrition.proteinG}g
                          </p>
                          <p className="text-xs text-muted-foreground">/ ngày</p>
                        </div>
                      </div>

                      {/* Carbs */}
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-3">
                        <Wheat className="h-7 w-7 text-yellow-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Carbs</p>
                          <p className="text-lg font-bold text-yellow-500">
                            {assessResult.nutrition.carbsG}g
                          </p>
                          <p className="text-xs text-muted-foreground">/ ngày</p>
                        </div>
                      </div>

                      {/* Fat */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-3">
                        <Droplets className="h-7 w-7 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Chất béo</p>
                          <p className="text-lg font-bold text-blue-500">
                            {assessResult.nutrition.fatG}g
                          </p>
                          <p className="text-xs text-muted-foreground">/ ngày</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advice */}
                  {assessResult.advice && (
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                        💡 Lời khuyên cá nhân
                      </p>
                      <p className="text-sm leading-relaxed">{assessResult.advice}</p>
                    </div>
                  )}
                </>
              )}
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
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4 flex justify-center">
              <div className="grid grid-cols-6 gap-6 md:gap-10 lg:gap-14 w-full max-w-5xl px-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Giới tính</p>
                  <p className="text-sm font-semibold">{userInfo.gender}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Tuổi</p>
                  <p className="text-sm font-semibold">{userInfo.age} tuổi</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Chiều cao</p>
                  <p className="text-sm font-semibold">{userInfo.height}cm</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Cân nặng</p>
                  <p className="text-sm font-semibold">{userInfo.weight}kg</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">BMI</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {calculateBMI(userInfo.height, userInfo.weight)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Mục đích</p>
                  <p className="text-sm font-semibold text-green-600">{userInfo.goal}</p>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div
              className="bg-card border border-border rounded-lg overflow-hidden"
              style={{ height: 'calc(100vh - 220px)' }}
            >
              <MealSuggestionsChat
                key={chatKey}
                userInfo={userInfo}
                initialRequest={initialRequest}
                existingSession={null}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
