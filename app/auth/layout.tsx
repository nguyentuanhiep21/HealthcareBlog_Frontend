import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          {children}
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
