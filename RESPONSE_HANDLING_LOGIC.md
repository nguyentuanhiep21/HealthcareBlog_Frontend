# Response Handling Logic - Meal Suggestions Chat

## 📋 Tóm tắt Logic Xử lý

Component `MealSuggestionsChat` xử lý 2 loại response từ AI:

---

## ✅ CASE 1: Response dạng JSON (Gợi ý thực đơn)

### Điều kiện nhận diện:
1. Response chứa JSON object `{ ... }`
2. JSON có property `meals` là array
3. Array `meals` **không trống** (length > 0)
4. Ít nhất một meal có `items` array với dữ liệu

### Cách xử lý:
```
parseMealsFromJSON(response) → ParsedResponse object
  {
    analysis?: { status, recommendation },
    meals: [ { name, calories, items, icon }, ... ]
  }
```

### Cách hiển thị:
- **Analysis Section** (nếu có):
  - 📊 Header "Phân tích tình trạng sức khỏe"
  - Tình trạng hiện tại
  - Hướng ăn uống

- **Meals Sections** (1 section cho mỗi bữa):
  - 🌅/☀️/🌙 Icon + Tên bữa ăn
  - 🔥 Calories badge
  - Danh sách món ăn (bullet points)

### Ví dụ Response:
```json
{
  "analysis": {
    "status": "BMI 23.4, cân nặng bình thường",
    "recommendation": "Duy trì chế độ ăn cân bằng"
  },
  "meals": [
    {
      "name": "Bữa sáng",
      "calories": 450,
      "items": ["Bánh mì + trứng", "Sữa đậu nành"]
    }
  ]
}
```

---

## ✅ CASE 2: Response dạng TEXT (Q&A / Tư vấn)

### Điều kiện nhận diện:
- Response **KHÔNG phải JSON hợp lệ** có `meals` array
- Hoặc JSON không có `meals` field
- Hoặc JSON có `meals` nhưng array trống

### Cách xử lý:
```
parseMealsFromJSON(response) → null (trả về null)
  → Hiển thị dạng TEXT response
```

### Cách hiển thị:
- Box chat bình thường (gray background)
- Apply markdown formatting:
  - `**text**` → `<strong>text</strong>` (bold)
  - `*text*` → `<em>text</em>` (italic)
  - `\n` → `<br />` (line break)
- FormattedText component xử lý + có error fallback

### Ví dụ Response:
```
Rau má là lựa chọn rất tốt! **Lợi ích:**
- Giàu vitamin A, C
- Chứa chất chống oxy hóa
- Ít calo

*Cách dùng:* Uống 1 ly nước rau má/ngày
```

---

## 🛡️ Error Handling

### 1. Invalid JSON
```
❌ Response: "Tôi không có..."
✅ Result: Hiển thị TEXT (không phải JSON)
```

### 2. Empty Meals Array
```
❌ Response: { "meals": [], "analysis": {...} }
✅ Result: Hiển thị TEXT (meals rỗng)
```

### 3. FormattedText Error
```
❌ Lỗi khi render HTML
✅ Fallback: Hiển thị raw text (không formatting)
```

### 4. Missing Fields
```
❌ meal.items không tồn tại
✅ Fallback: Hiển thị "Chưa có thông tin về món ăn"
```

---

## 🔄 Flow Diagram

```
AI Response
    ↓
[parseMealsFromJSON()]
    ↓
    ├─→ JSON hợp lệ + meals array không trống?
    │   ├─ YES → ParsedResponse object
    │   │        ↓
    │   │    Hiển thị MEAL CARDS (JSON format)
    │   │
    │   └─ NO → null
    │
    └─→ null?
        ├─ YES → Hiển thị PLAIN TEXT (markdown formatted)
        │        (có error fallback)
        │
        └─ NO → (Không xảy ra)
```

---

## 📊 Test Cases

### Test 1: User hỏi "Gợi ý bữa ăn cho tôi"
```
AI Response: JSON với meals array
Expected: Meal cards beautifully formatted ✅
```

### Test 2: User hỏi "Rau má có lợi ích gì?"
```
AI Response: Plain text với **bold** và *italic*
Expected: Chat text với formatting đẹp ✅
```

### Test 3: User hỏi "Điều chỉnh thực đơn"
```
AI Response: JSON với meals array (mới)
Expected: Meal cards cập nhật ✅
```

### Test 4: User hỏi "Làm thế nào để ăn cân bằng?"
```
AI Response: Plain text Q&A
Expected: Chat text bình thường ✅
```

### Test 5: AI response bị lỗi (corrupted JSON)
```
AI Response: "{broken json..." 
Expected: Fallback to plain text hiển thị response ✅
```

---

## 🎯 Kết luận

✅ **Logic đảm bảo:**
1. Phân loại chính xác JSON vs TEXT
2. Hiển thị đúng format cho từng loại
3. Xử lý lỗi gracefully (fallback)
4. Markdown formatting cho text response
5. Không crash ngay cả khi dữ liệu lỗi

✅ **User sẽ thấy:**
- Bữa ăn: Thực đơn đẹp với analysis
- Q&A: Chat text thường với format markdown
- Error: Fallback text (không blank/crash)
