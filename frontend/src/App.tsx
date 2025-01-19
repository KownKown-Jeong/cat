import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AdminLogin from './pages/admin/AdminLogin'
import AdminMissions from './pages/admin/AdminMissions'
import CreateMission from './pages/admin/CreateMission'
import TeamHome from './pages/team/TeamHome'
import TeamChat from './pages/team/TeamChat'
import TeamMissions from './pages/team/TeamMissions'


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/missions" element={<AdminMissions />} />
          <Route path="/admin/missions/new" element={<CreateMission />} />

          {/* Team routes - 동적 라우팅 */}
          <Route path="/:teamName" element={<TeamHome />} />
          <Route path="/:teamName/chat" element={<TeamChat />} />
          <Route path="/:teamName/missions" element={<TeamMissions />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App