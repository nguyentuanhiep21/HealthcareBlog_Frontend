'use client'

import { useState } from 'react'
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
import { X, MessageCircle, Settings } from 'lucide-react'

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

    if (!gender || !age || !height || !weight) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    const bmi = calculateBMI(height, weight)
    const request = `Tôi là một người ${gender?.toLowerCase()}. Thông tin chi tiết về tôi:
- Tuổi: ${age} tuổi
- Chiều cao: ${height}cm
- Cân nặng: ${weight}kg
- Chỉ số BMI: ${bmi} (${getBMIStatus(parseFloat(bmi!))})

Vui lòng gợi ý bữa ăn phù hợp cho tôi.`

    setInitialRequest(request)
    setUserInfo({
      gender,
      age,
      height,
      weight,
    })
    setShowChat(true)
  }

  const handleReset = () => {
    setShowChat(false)
    setGender('')
    setAge('')
    setHeight('')
    setWeight('')
    setUserInfo({
      gender: '',
      age: '',
      height: '',
      weight: '',
    })
    // Data is only stored in component state, automatically cleared on reset
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
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
                <Button type="submit" className="w-full" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Bắt đầu chat với AI
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
                    <span>Tư vấn dinh dưỡng từ AI Gemini của Google</span>
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
                <p className="text-muted-foreground mt-1">
                  Đang chat với Google Gemini - Trợ lý dinh dưỡng cá nhân
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                Kết thúc chat
              </Button>
            </div>

            {/* User Info Summary with BMI */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-2 flex justify-center">
              <div className="grid grid-cols-5 gap-32">
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
                  <p className="text-sm font-semibold">
                    <span className="text-blue-600">{calculateBMI(userInfo.height, userInfo.weight)}</span>
                    <span className="text-muted-foreground mx-1">→</span>
                    <span className="text-foreground">{getBMIStatus(parseFloat(calculateBMI(userInfo.height, userInfo.weight)!))}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
              <MealSuggestionsChat userInfo={userInfo} initialRequest={initialRequest} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
