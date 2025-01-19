import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export const AuthGuard = ({
  children,
  requireAdmin = false,
}: AuthGuardProps) => {
  const { isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  // 토큰이 없으면 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 관리자 권한이 필요한 경우 체크
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
