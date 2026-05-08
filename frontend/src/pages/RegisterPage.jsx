import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, User, Calendar, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../context/store'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    startDate: new Date().toISOString().split('T')[0]
  })
  const { register, isLoading, error, token, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/')
    return () => clearError()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await register(form.name, form.email, form.password, form.startDate)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl shadow-brand-600/40 mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Begin the challenge</h1>
          <p className="text-gray-400 mt-1 text-sm">180 days to transform your career</p>
        </div>

        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-8 shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Your name' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '6+ characters' },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="input-field pl-10 bg-surface-700 border-surface-600"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Challenge Start Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="input-field pl-10 bg-surface-700 border-surface-600"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary justify-center mt-2 py-3 text-base">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>Start Challenge <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already started?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
