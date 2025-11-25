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
import { X } from 'lucide-react'

export default function MealSuggestionsPage() {
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate mock result based on inputs
    const bmi = weight && height ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : 0
    const mockResult = `Dựa trên thông tin của bạn:
- Giới tính: ${gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
- Tuổi: ${age} tuổi
- Chiều cao: ${height} cm
- Cân nặng: ${weight} kg
- Chỉ số BMI: ${bmi}

Gợi ý thực đơn cho bạn:

BỮA SÁNG (7:00 - 8:00):
- 1 tô phở gà hoặc bún riêu (không ăn mỡ)
- 1 quả chuối
- 1 ly sữa đậu nành không đường

BỮA TRƯA (12:00 - 13:00):
- 150g thịt gà/cá nướng
- 1 bát cơm gạo lứt
- Rau củ luộc/xào ít dầu
- 1 bát canh rau

BỮA PHỤ (15:00 - 16:00):
- Hoa quả tươi (táo, cam, nho)
- Sữa chua không đường

BỮA TỐI (18:00 - 19:00):
- Salad rau trộn với ức gà
- Khoai lang luộc
- 1 chén soup rau

Lưu ý:
- Uống đủ 2-2.5 lít nước mỗi ngày
- Tránh đồ chiên rán, đồ ngọt
- Tập thể dục 30 phút mỗi ngày
- Ngủ đủ 7-8 tiếng mỗi đêm`

    setResult(mockResult)
    setShowResult(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Gợi ý bữa ăn</h1>
          <p className="text-muted-foreground mb-6">
            Điền thông tin của bạn để nhận gợi ý thực đơn phù hợp
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
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
              Gửi yêu cầu
            </Button>
          </form>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowResult(false)}
          />
          <div className="relative bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-semibold">Kết quả gợi ý</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResult(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="bg-secondary/30 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {result}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
