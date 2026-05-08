import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from './context/store'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DailyPage from './pages/DailyPage'
import DSAPage from './pages/DSAPage'
import DevPage from './pages/DevPage'
import SubjectsPage from './pages/SubjectsPage'
import EnglishPage from './pages/EnglishPage'
import AnalyticsPage from './pages/AnalyticsPage'

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { theme, initTheme } = useThemeStore()

  useEffect(() => {
    initTheme(theme)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="dsa" element={<DSAPage />} />
          <Route path="dev" element={<DevPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="english" element={<EnglishPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
