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
import {
  HeartPulse,
  Flame,
  Beef,
  Wheat,
  Droplets,
  AlertCircle,
  Loader2,
  Activity,
} from 'lucide-react'
import {
  assessHealth,
  mapGenderToApi,
  mapGoalToApi,
  getHealthScoreColor,
  getBmiCategoryColor,
  type HealthAssessResult,
  suggestMealPlan,
  type MealSuggestionResponse,
  type Meal
} from '@/lib/health-assessment-api'
import { X, Utensils } from 'lucide-react'

export default function HealthAssessmentPage() {
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState('')

  // Health Assessment state
  const [assessResult, setAssessResult] = useState<HealthAssessResult | null>(null)
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessError, setAssessError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Meal Suggestion state
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestionResult, setSuggestionResult] = useState<MealSuggestionResponse['data'] | null>(null)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const [showMealModal, setShowMealModal] = useState(false)

  const canAssess = !!(gender && age && height && weight && goal)

  const handleSuggestMeal = async () => {
    if (!assessResult) return
    try {
      setIsSuggesting(true)
      setSuggestionError(null)
      setShowMealModal(true)
      const res = await suggestMealPlan({
        caloriesKcal: assessResult.nutrition.caloriesKcal,
        proteinG: assessResult.nutrition.proteinG,
        carbsG: assessResult.nutrition.carbsG,
        fatG: assessResult.nutrition.fatG,
        goal: mapGoalToApi(goal)
      })
      setSuggestionResult(res.data)
    } catch (err: any) {
      setSuggestionError(err.message || 'Không thể gợi ý thực đơn')
    } finally {
      setIsSuggesting(false)
    }
  }

  /** Gọi API đánh giá sức khỏe — debounce 700ms */
  const triggerAssess = useCallback(() => {
    if (!gender || !age || !height || !weight || !goal) return

    const ageN = parseInt(age)
    const heightN = parseFloat(height)
    const weightN = parseFloat(weight)

    // Client-side validation trước khi gọi API
    if (isNaN(ageN) || ageN < 10 || ageN > 100) return
    if (isNaN(heightN) || heightN < 100 || heightN > 250) return
    if (isNaN(weightN) || weightN < 30 || weightN > 300) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
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
    }, 700)
  }, [gender, age, height, weight, goal])

  useEffect(() => {
    triggerAssess()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [triggerAssess])

  const calculateBMI = (h: string, w: string) => {
    if (!h || !w) return null
    const val = parseFloat(w) / Math.pow(parseFloat(h) / 100, 2)
    return isNaN(val) ? null : val.toFixed(1)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return 'Gầy'
    if (bmi < 25) return 'Bình thường'
    if (bmi < 30) return 'Thừa cân'
    return 'Béo phì'
  }

  /** Health score ring SVG */
  const HealthScoreRing = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 36
    const strokeDash = (score / 100) * circumference
    const color =
      score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444'

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
          <circle
            cx="44" cy="44" r="36"
            fill="none" stroke="currentColor" strokeWidth="8"
            className="text-muted/30"
          />
          <circle
            cx="44" cy="44" r="36"
            fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <span className="absolute text-xl font-bold" style={{ color }}>{score}</span>
      </div>
    )
  }

  const bmiDisplay = calculateBMI(height, weight)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Đánh giá sức khỏe</h1>
            <p className="text-sm text-muted-foreground">
              Nhập thông tin để nhận phân tích sức khỏe cá nhân từ mô hình AI
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ── Left: Form ── */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold mb-5">Thông tin cá nhân</h2>

            {/* BMI Quick Display */}
            {bmiDisplay && (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Chỉ số BMI</p>
                    <p className="text-2xl font-bold text-blue-600">{bmiDisplay}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Tình trạng</p>
                    <p className="text-lg font-semibold">
                      {getBMIStatus(parseFloat(bmiDisplay))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select value={gender} onValueChange={setGender}>
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
                  placeholder="Nhập tuổi (10–100)"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="10"
                  max="100"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height">Chiều cao (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Nhập chiều cao (100–250 cm)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="100"
                  max="250"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Cân nặng (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Nhập cân nặng (30–300 kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal">Mục tiêu</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Chọn mục tiêu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tăng cân">Tăng cơ / Tăng cân</SelectItem>
                    <SelectItem value="Giảm cân">Giảm mỡ / Giảm cân</SelectItem>
                    <SelectItem value="Duy trì">Duy trì cân nặng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status hint */}
              {canAssess && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  {isAssessing ? '⏳ Đang phân tích...' : '✅ Kết quả tự động cập nhật'}
                </p>
              )}
              {!canAssess && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  Điền đầy đủ thông tin để xem kết quả đánh giá →
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Health Assessment Panel ── */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Kết quả đánh giá</h2>
              {isAssessing && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />
              )}
            </div>

            {/* Empty state */}
            {!canAssess && !assessResult && !isAssessing && (
              <div className="bg-card border border-border rounded-xl p-10 text-center space-y-4">
                <HeartPulse className="h-14 w-14 mx-auto text-muted-foreground/30" />
                <div>
                  <p className="font-medium text-muted-foreground">Chưa có dữ liệu</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Điền đầy đủ thông tin bên trái để xem kết quả đánh giá sức khỏe từ mô hình AI
                  </p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {isAssessing && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-5 animate-pulse">
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

            {/* Assessment Results */}
            {assessResult && !isAssessing && (
              <>
                {/* Health Score Card */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-6">
                    <HealthScoreRing score={assessResult.healthScore} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Điểm sức khỏe
                      </p>
                      <p className={`text-3xl font-bold ${getHealthScoreColor(assessResult.healthScore)}`}>
                        {assessResult.healthScore}
                        <span className="text-lg font-normal text-muted-foreground">/100</span>
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
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

                {/* Gợi ý thực đơn Button */}
                <div className="pt-2">
                  <Button 
                    onClick={handleSuggestMeal} 
                    className="w-full h-12 text-md font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Utensils className="w-5 h-5" />
                    Gợi ý thực đơn
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Meal Suggestion Modal */}
      {showMealModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowMealModal(false)}
        >
          <div 
            className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Thực đơn gợi ý</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowMealModal(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {isSuggesting && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Đang lên thực đơn cho bạn...</p>
                </div>
              )}

              {suggestionError && !isSuggesting && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center space-y-3">
                  <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
                  <p className="text-destructive font-medium">{suggestionError}</p>
                  <Button variant="outline" onClick={handleSuggestMeal}>Thử lại</Button>
                </div>
              )}

              {suggestionResult && !isSuggesting && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">{suggestionResult.summary.coverageNote}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tổng Calo: <span className="font-bold text-foreground">{suggestionResult.summary.totalCalories}</span> / {suggestionResult.summary.targetCalories} kcal
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm bg-background/50 p-2 rounded-lg border border-border/50">
                      <div className="text-center">
                        <span className="block text-xs text-muted-foreground">Protein</span>
                        <span className="font-semibold">{suggestionResult.summary.totalProteinG}g</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs text-muted-foreground">Carbs</span>
                        <span className="font-semibold">{suggestionResult.summary.totalCarbsG}g</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs text-muted-foreground">Fat</span>
                        <span className="font-semibold">{suggestionResult.summary.totalFatG}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="space-y-4">
                    {[
                      { title: 'Bữa sáng', data: suggestionResult.breakfast, icon: '🌅' },
                      { title: 'Bữa trưa', data: suggestionResult.lunch, icon: '☀️' },
                      { title: 'Bữa tối', data: suggestionResult.dinner, icon: '🌙' }
                    ].map((meal, idx) => meal.data && (
                      <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/4 flex flex-col items-center justify-center bg-muted/30 rounded-lg p-3 text-center">
                          <span className="text-2xl mb-1">{meal.icon}</span>
                          <span className="font-semibold text-sm">{meal.title}</span>
                          <span className="text-xs text-muted-foreground font-medium mt-1">{meal.data.caloriesPerServing} kcal</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base">{meal.data.name} <span className="text-xs font-normal text-muted-foreground ml-2">({meal.data.nameEn})</span></h3>
                          <p className="text-sm text-muted-foreground mt-1">{meal.data.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">1 phần: {meal.data.servingSizeDesc}</span>
                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-md">P: {meal.data.proteinG}g</span>
                            <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-md">C: {meal.data.carbsG}g</span>
                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md">F: {meal.data.fatG}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Snacks */}
                    {suggestionResult.snacks && suggestionResult.snacks.length > 0 && (
                      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/4 flex flex-col items-center justify-center bg-muted/30 rounded-lg p-3 text-center">
                          <span className="text-2xl mb-1">🍎</span>
                          <span className="font-semibold text-sm">Ăn vặt</span>
                          <span className="text-xs text-muted-foreground font-medium mt-1">
                            {suggestionResult.snacks.reduce((acc, s) => acc + s.caloriesPerServing, 0)} kcal
                          </span>
                        </div>
                        <div className="flex-1 space-y-4">
                          {suggestionResult.snacks.map((snack, idx) => (
                            <div key={idx} className={idx > 0 ? "pt-4 border-t border-border/50" : ""}>
                              <h3 className="font-bold text-base text-sm">{snack.name} <span className="text-xs font-normal text-muted-foreground ml-2">({snack.nameEn})</span></h3>
                              <p className="text-xs text-muted-foreground mt-1">{snack.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">{snack.servingSizeDesc}</span>
                                <span className="text-[11px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md">P: {snack.proteinG}g</span>
                                <span className="text-[11px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-md">C: {snack.carbsG}g</span>
                                <span className="text-[11px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md">F: {snack.fatG}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
