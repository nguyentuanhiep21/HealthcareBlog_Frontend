# Healthcare Blog - Full Stack Application

Ứng dụng blog chăm sóc sức khỏe với Next.js frontend và .NET backend.

## 🚀 Quick Start

### Development (Local)

1. **Khởi động Backend**:
   ```powershell
   cd HealthCareBlog_Backend\HealthCareBlog_Backend
   dotnet run --launch-profile https
   ```
   Backend chạy trên: `https://localhost:7223`

2. **Khởi động Frontend**:
   ```powershell
   cd HealthcareBlog_Frontend
   pnpm dev
   ```
   Frontend chạy trên: `http://localhost:3000`

### Sử dụng script tự động

```powershell
.\start-dev.bat
```

## 🔧 Tech Stack

### Frontend
- Next.js 16.0.3
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

### Backend
- .NET 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication

## 📚 Documentation

- [Frontend README](HealthcareBlog_Frontend/README.md)
- [Backend README](HealthCareBlog_Backend/README_AUTHENTICATION.md)
- [Authentication Guide](HealthcareBlog_Frontend/AUTHENTICATION_GUIDE.md)

## ⚙️ Configuration

### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=https://localhost:7223
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Backend Configuration

Xem [appsettings.json](HealthCareBlog_Backend/HealthCareBlog_Backend/appsettings.json) để cấu hình:
- Database connection string
- JWT settings
- CORS origins
- Email configuration

