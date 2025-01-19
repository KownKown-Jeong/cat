import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') !== null
  })
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true'
  })
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('isAdmin', 'true') // 임시로 모든 유저를 admin으로 설정
    setIsAuthenticated(true)
    setIsAdmin(true)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    setIsAuthenticated(false)
    setIsAdmin(false)
    setToken(null)
  }

  // 페이지 로드시 로컬 스토리지 체크
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      setIsAdmin(localStorage.getItem('isAdmin') === 'true')
      setToken(token)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
