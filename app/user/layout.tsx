import { AuthProvider } from "@/components/auth-provider"
import { UserAuthGuard } from "@/components/user-auth-guard"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <UserAuthGuard>
        {children}
      </UserAuthGuard>
    </AuthProvider>
  )
}
