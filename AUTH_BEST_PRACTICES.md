# Authentication Implementation Guide

## ⚠️ QUAN TRỌNG: Token Management

### Sử dụng authUtils thay vì trực tiếp localStorage

**ĐÚNG:**
```typescript
import { authUtils } from "@/lib/auth-utils"

// Lấy token
const token = authUtils.getToken()

// Lưu token (chỉ ở login/register)
authUtils.setToken(token)

// Xóa token (ở logout)
authUtils.removeToken()

// Lấy headers với token
const headers = authUtils.getAuthHeaders()

// Kiểm tra authenticated
if (authUtils.isAuthenticated()) {
  // ...
}
```

**SAI:**
```typescript
// ❌ KHÔNG làm như này
localStorage.getItem("token")
localStorage.getItem("authToken") 
localStorage.setItem("token", token)
```

---

## Cấu trúc Authentication

### 1. AuthProvider (`components/auth-provider.tsx`)
- Quản lý state `isAuthenticated` toàn cục
- Sử dụng `authUtils.isAuthenticated()` để kiểm tra token
- Cung cấp `login()`, `logout()` functions
- Được wrap ở `app/user/layout.tsx`

### 2. Token Storage
- Key: `"authToken"` (QUAN TRỌNG: phải thống nhất)
- Auth state key: `"isAuthenticated"`
- Tự động set/remove qua `authUtils`

### 3. API Calls Pattern

```typescript
// Pattern chuẩn cho mọi API call cần authentication
const fetchData = async () => {
  const token = authUtils.getToken()
  
  if (!token) {
    // Redirect hoặc show login dialog
    return
  }

  const response = await fetch(`${backendUrl}/api/endpoint`, {
    headers: authUtils.getAuthHeaders(),
    // ... other options
  })
  
  if (response.status === 401) {
    // Token expired, logout
    authUtils.removeToken()
    router.push("/auth/login")
    return
  }
  
  // Handle response...
}
```

---

## Checklist cho trang mới

Khi tạo trang mới cần authentication:

- [ ] Import `authUtils` từ `@/lib/auth-utils`
- [ ] Import `useAuth` từ `@/components/auth-provider`
- [ ] Sử dụng `authUtils.getToken()` thay vì `localStorage.getItem()`
- [ ] Sử dụng `authUtils.getAuthHeaders()` cho API calls
- [ ] Kiểm tra `isAuthenticated` trước khi thực hiện actions
- [ ] Fetch current user nếu cần hiển thị thông tin user:

```typescript
const [currentUser, setCurrentUser] = useState<User | null>(null)

useEffect(() => {
  const fetchCurrentUser = async () => {
    const token = authUtils.getToken()
    if (!token) return

    try {
      const response = await fetch(`${backendUrl}/api/user/account`, {
        headers: authUtils.getAuthHeaders(),
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser({
          id: userData.id,
          name: userData.fullName,
          avatar: userData.avatarUrl.startsWith('http') 
            ? userData.avatarUrl 
            : `${backendUrl}${userData.avatarUrl}`,
        })
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  if (isAuthenticated) {
    fetchCurrentUser()
  }
}, [isAuthenticated])
```

- [ ] Thêm null checks cho `currentUser` trước khi sử dụng:
  - `{isAuthenticated && currentUser && (...)}`
  - `{currentUser?.avatar}`

---

## Common Pitfalls (Lỗi thường gặp)

### 1. ❌ Không thống nhất token key
```typescript
// SAI
localStorage.setItem("token", ...) 
localStorage.getItem("authToken")
```

### 2. ❌ Không kiểm tra null cho currentUser
```typescript
// SAI
<img src={currentUser.avatar} />

// ĐÚNG
{currentUser && <img src={currentUser.avatar} />}
```

### 3. ❌ Không fetch user khi cần
Nếu trang cần hiển thị info của current user, phải fetch từ API, không dùng mock data.

### 4. ❌ Không xử lý token expired
Luôn kiểm tra response.status === 401 và logout nếu cần.

---

## Files đã được cập nhật

✅ Đã thống nhất token management:
- `lib/auth-utils.ts` - Central token management
- `components/auth-provider.tsx` - Sử dụng authUtils
- `app/auth/login/page.tsx` - Sử dụng authUtils.setToken
- `app/user/post/[id]/page.tsx` - Sử dụng authUtils, fetch currentUser
- `components/create-post-box.tsx` - Đã dùng authToken (cần verify)

⚠️ Cần kiểm tra thêm:
- `app/user/change-password/page.tsx` - Có dùng authToken
- Các trang khác trong `app/user/*`

---

## Testing Checklist

Khi test authentication:

1. [ ] Login → token được lưu đúng
2. [ ] Chuyển trang → vẫn giữ trạng thái đăng nhập
3. [ ] Refresh page → vẫn authenticated
4. [ ] Logout → token bị xóa, redirect về login
5. [ ] Token expired → auto logout và redirect
6. [ ] Protected actions → hiện login dialog nếu chưa đăng nhập

---

## Backend URL Configuration

Sử dụng environment variable hoặc constant:
```typescript
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223"
```

Avatar/Image URL prefix:
```typescript
const fullUrl = url.startsWith('http') 
  ? url 
  : `${backendUrl}${url}`
```
