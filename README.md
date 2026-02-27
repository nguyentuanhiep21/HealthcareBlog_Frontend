# Healthcare Blog - Frontend

Frontend ứng dụng blog chăm sóc sức khỏe với Next.js frontend và .NET backend.

## 🚀 Quick Start

### Development (Local)

1. **Khởi động Backend** (nếu chưa chạy):
   ```powershell
   cd HealthCareBlog_Backend\HealthCareBlog_Backend
   dotnet run
   ```
   Backend chạy trên: `https://localhost:7223`

2. **Khởi động Frontend**:
   ```powershell
   cd HealthcareBlog_Frontend
   pnpm dev
   ```
   Frontend chạy trên: `http://localhost:3000`

## 🔧 Tech Stack

### Frontend
- Next.js 16.0.3
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

## ⚙️ Configuration

### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=https://localhost:7223
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```
