# Chức Năng Đăng Ký và Xác Thực Email

## Tổng Quan
Hệ thống đã được hoàn thiện với chức năng đăng ký và xác thực email đầy đủ.

## Flow Hoạt Động

### 1. Đăng Ký (Signup)
**URL:** `/auth/signup`

**Các bước:**
1. Người dùng điền form đăng ký với các thông tin:
   - Họ và tên
   - Email
   - Số điện thoại
   - Mật khẩu (tối thiểu 8 ký tự)
   - Xác nhận mật khẩu

2. Frontend gửi request POST đến API:
   ```
   POST /api/user/signup
   Body: {
     fullName: string,
     email: string,
     phoneNumber: string,
     password: string
   }
   ```

3. Backend tạo tài khoản và gửi email xác thực

4. Người dùng nhận thông báo thành công và được yêu cầu kiểm tra email

### 2. Xác Thực Email (Email Verification)
**URL:** `/auth/verify-email?userId=...&token=...`

**Các bước:**
1. Người dùng nhận email từ hệ thống
2. Click vào link xác thực trong email
3. Browser mở trang `/auth/verify-email` với userId và token
4. Frontend tự động gọi API xác thực:
   ```
   GET /api/user/verify-email?userId={userId}&token={token}
   ```
5. Hiển thị kết quả:
   - ✅ **Thành công:** Hiển thị thông báo thành công + nút "Đăng Nhập Ngay"
   - ❌ **Thất bại:** Hiển thị thông báo lỗi + nút "Đăng Ký Lại" hoặc "Về Trang Đăng Nhập"

### 3. Đăng Nhập (Login)
**URL:** `/auth/login`

- Sau khi xác thực email thành công, người dùng có thể đăng nhập
- Hệ thống sẽ kiểm tra email đã được xác thực hay chưa
- Nếu chưa xác thực, sẽ hiển thị lỗi: "Email not verified. Please verify your email first."

## Cấu Hình

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (appsettings.json)
```json
{
  "AppSettings": {
    "FrontendUrl": "http://localhost:3000"
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "HealthCareBlog"
  }
}
```

## Các File Đã Tạo/Cập Nhật

### Frontend
1. **`/app/auth/verify-email/page.tsx`** (MỚI)
   - Trang xác thực email với UI đẹp
   - Tự động xác thực khi load trang
   - Hiển thị loading, success, hoặc error state
   - Nút chuyển hướng đến trang đăng nhập

2. **`/app/auth/signup/page.tsx`** (CẬP NHẬT)
   - Gọi API đăng ký thực tế
   - Hiển thị thông báo thành công khi đăng ký
   - Thông báo người dùng kiểm tra email
   - Validation đầy đủ

3. **`.env.local.example`** (MỚI)
   - File mẫu cấu hình environment variables

### Backend
Không cần thay đổi - đã có sẵn các endpoints:
- `POST /api/user/signup`
- `GET /api/user/verify-email`
- `POST /api/user/resend-verification`

## Hướng Dẫn Chạy

### 1. Backend
```bash
cd HealthCareBlog_Backend/HealthCareBlog_Backend
dotnet run
```
Backend sẽ chạy tại: `http://localhost:5000`

### 2. Frontend
```bash
cd HealthcareBlog_Frontend

# Tạo file .env.local
cp .env.local.example .env.local

# Cài đặt dependencies (nếu chưa có)
pnpm install

# Chạy dev server
pnpm dev
```
Frontend sẽ chạy tại: `http://localhost:3000`

## Testing Flow

1. Truy cập `http://localhost:3000/auth/signup`
2. Điền form đăng ký với email thật
3. Submit form
4. Kiểm tra email inbox
5. Click vào link xác thực trong email
6. Xác nhận trang xác thực hiển thị thông báo thành công
7. Click "Đăng Nhập Ngay"
8. Đăng nhập với tài khoản vừa tạo

## Ghi Chú
- Email xác thực có thời hạn 24 giờ
- Link xác thực chỉ sử dụng được 1 lần
- Sau khi xác thực thành công, không thể xác thực lại
- Có thể resend email xác thực nếu cần thiết
