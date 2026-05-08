import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Code2, Monitor, BookOpen,
  MessageSquare, BarChart3, LogOut, Sun, Moon, Menu, X,
  Zap, User, ChevronRight
} from 'lucide-react'
import { useAuthStore, useThemeStore } from '../../context/store'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/daily', label: 'Daily Tracker', icon: Calendar },
  { to: '/dsa', label: 'DSA Problems', icon: Code2 },
  { to: '/dev', label: 'Dev Projects', icon: Monitor },
  { to: '/subjects', label: 'Core Subjects', icon: BookOpen },
  { to: '/english', label: 'English', icon: MessageSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100 dark:border-surface-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-gray-900 dark:text-white leading-none">Game Changer</p>
            <p className="text-xs text-gray-400 mt-0.5">Consistency Challenge</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 mb-3">Navigation</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-surface-700 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-surface-700">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="flex-1 btn-ghost justify-center text-xs py-2">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button onClick={handleLogout} className="flex-1 btn-ghost justify-center text-xs py-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-surface-850 border-r border-gray-100 dark:border-surface-700 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-surface-850 z-50 lg:hidden shadow-2xl"
            >
              <div className="absolute right-3 top-3">
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-850 border-b border-gray-100 dark:border-surface-700">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700">
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm text-gray-900 dark:text-white">180 Days</span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700">
            {theme === 'dark' ? <Sun size={18} className="text-gray-400" /> : <Moon size={18} className="text-gray-600" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
