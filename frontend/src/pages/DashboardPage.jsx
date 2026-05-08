import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Flame, Trophy, Clock, Code2, Target, TrendingUp,
  Calendar, ArrowRight, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../utils/api'
import { useAuthStore } from '../context/store'
import { getDailyQuote, getDaysSince } from '../utils/helpers'
import Heatmap from '../components/dashboard/Heatmap'

const StatCard = ({ icon: Icon, label, value, sub, color = 'brand', delay = 0 }) => {
  const colors = {
    brand: 'from-brand-500 to-brand-600',
    amber: 'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-teal-500',
    violet: 'from-violet-500 to-purple-600',
    red: 'from-red-500 to-rose-500',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={17} className="text-white" />
        </div>
        {sub && <span className="text-xs text-gray-400 dark:text-gray-500">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 shadow-xl text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-medium" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [todayEntry, setTodayEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const quote = getDailyQuote()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, heatmapRes, todayRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/daily/heatmap'),
          api.get('/daily/today')
        ])
        setSummary(analyticsRes.data.summary)
        setWeeklyData(analyticsRes.data.weeklyData)
        setHeatmapData(heatmapRes.data.heatmap)
        setTodayEntry(todayRes.data.entry)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const daysSince = getDaysSince(user?.startDate)
  const progressPct = summary ? Math.min(100, Math.round((summary.completedDays / 180) * 100)) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="page-header">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Day {daysSince} of 180 — {summary?.daysRemaining || 0} days remaining
          </p>
        </div>
        <Link to="/daily" className="btn-primary w-fit">
          <Calendar size={16} /> Log Today <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* Quote Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 flex items-start gap-3 border-l-4 border-l-brand-500"
      >
        <Sparkles size={18} className="text-brand-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{quote.text}"</p>
          <p className="text-xs text-gray-400 mt-0.5">— {quote.author}</p>
        </div>
      </motion.div>

      {/* Today's Status */}
      {!todayEntry ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-700/40 bg-amber-50/50 dark:bg-amber-900/10"
        >
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">🚨 No Zero Day! You haven't logged today yet.</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5">Every day counts. Log at least 1 DSA problem to keep your streak alive.</p>
          </div>
          <Link to="/daily" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
            Log Now
          </Link>
        </motion.div>
      ) : todayEntry.completed ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 flex items-center gap-3 border border-emerald-200 dark:border-emerald-700/40 bg-emerald-50/50 dark:bg-emerald-900/10"
        >
          <CheckCircle2 size={20} className="text-emerald-500" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            ✅ Day {daysSince} complete! {todayEntry.dsaCompleted} DSA problems · {todayEntry.studyHours}h studied
          </p>
        </motion.div>
      ) : null}

      {/* Main Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg">Challenge Progress</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {summary?.completedDays || 0} of 180 days completed
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-3xl text-brand-600 dark:text-brand-400">{progressPct}%</p>
            <p className="text-xs text-gray-400">Consistency Score</p>
          </div>
        </div>

        <div className="progress-bar h-3 mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            className="progress-fill h-3"
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>Start</span>
          <span>Day {daysSince}</span>
          <span>Day 180</span>
        </div>

        {summary?.projectedDSA && (
          <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/40">
            <p className="text-xs text-brand-700 dark:text-brand-300">
              📈 At this pace, you'll solve <strong>{summary.projectedDSA}</strong> problems in 180 days
              ({summary.avgDSAPerDay}/day avg)
            </p>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Current Streak" value={`${summary?.currentStreak || 0}d`}
          sub="🔥 Keep going" color="amber" delay={0.25} />
        <StatCard icon={Trophy} label="Longest Streak" value={`${summary?.longestStreak || 0}d`}
          sub="Personal best" color="violet" delay={0.3} />
        <StatCard icon={Code2} label="DSA Solved" value={summary?.totalDSA || 0}
          sub={`~${summary?.avgDSAPerDay || 0}/day`} color="brand" delay={0.35} />
        <StatCard icon={Clock} label="Hours Studied" value={`${summary?.totalHours || 0}h`}
          sub={`~${summary?.avgHoursPerDay || 0}h/day`} color="emerald" delay={0.4} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb20" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#5b6ef5" radius={[4, 4, 0, 0]} name="Days" />
              <Bar dataKey="dsa" fill="#7b96fa" radius={[4, 4, 0, 0]} name="DSA" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hours Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Study Hours Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b6ef5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5b6ef5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb20" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" stroke="#5b6ef5" fill="url(#hoursGrad)"
                strokeWidth={2} name="Hours" dot={{ fill: '#5b6ef5', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Activity Heatmap</h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>Less</span>
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`w-3 h-3 rounded-sm heat-${i}`} />
            ))}
            <span>More</span>
          </div>
        </div>
        <Heatmap data={heatmapData} startDate={user?.startDate} />
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { to: '/dsa', label: 'Add DSA Problem', icon: Code2, color: 'brand' },
          { to: '/dev', label: 'Update Project', icon: Target, color: 'emerald' },
          { to: '/subjects', label: 'Study Subjects', icon: TrendingUp, color: 'violet' },
          { to: '/english', label: 'English Practice', icon: Flame, color: 'amber' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-all hover:-translate-y-0.5 group"
          >
            <Icon size={20} className={`text-${color}-500 group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
