import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminHome from './pages/admin/AdminHome'
// import MyPage from './pages/MyPage' // 나중에 추가

import ManageMissions from './pages/admin/ManageMissions'
import CreateMission from './pages/admin/CreateMission'
import Chat from './pages/user/Chat'
import Missions from './pages/user/Missions'
import UserHome from './pages/user/UserHome'
import Welcome from './pages/user/Welcome'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthGuard } from './components/AuthGuard'

// 실제 라우팅 로직을 처리하는 컴포넌트
function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth()

  // 로그인된 관리자는 /login이나 / 접근시 /admin으로 리다이렉트
  const renderHome = () => {
    if (isAuthenticated && isAdmin) {
      return <Navigate to="/admin/missions" replace />
    }
    // 일반 사용자가 로그인된 경우 처리 추가
    if (isAuthenticated && !isAdmin) {
      return <Navigate to="/user/userhome" replace />
    }
    return <Home />
  }

  const renderLogin = () => {
    if (isAuthenticated && isAdmin) {
      return <Navigate to="/admin/missions" replace />
    }
    // 일반 사용자가 로그인된 경우 처리 추가
    if (isAuthenticated && !isAdmin) {
      return <Navigate to="/user/userhome" replace />
    }
    return <Login />
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={renderHome()} />
        <Route path="/login" element={renderLogin()} />
        <Route path="/welcome" element={<Welcome />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <AuthGuard requireAdmin={true}>
              <AdminHome />
            </AuthGuard>
          }
        >
          <Route path="missions" element={<ManageMissions />} />
          <Route path="missions/new" element={<CreateMission />} />
        </Route>

        {/* User routes */}
        <Route
          path="/user/*"
          element={
            <AuthGuard>
              <Routes>
                <Route path="userhome" element={<UserHome />} />
                <Route path="chat" element={<Chat />} />
                <Route path="missions" element={<Missions />} />
              </Routes>
            </AuthGuard>
          }
        />

        {/* 인증이 필요한 일반 페이지 <Route
          path="/my-page"
          element={
            <AuthGuard>
              {<MyPage />
            </AuthGuard>
          }
        />
     */}
      </Routes>
    </div>
  )
}

// 메인 App 컴포넌트
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
