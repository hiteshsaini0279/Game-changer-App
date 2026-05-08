import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Target, Clock, Code2, Flame, Trophy, Calendar, Download } from 'lucide-react'
import api from '../utils/api'
import { useAuthStore } from '../context/store'
import { getDaysSince } from '../utils/helpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 shadow-xl text-sm">
      <p className="text-gray-400 mb-1 text-xs">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-medium text-xs" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

const COLORS = ['#5b6ef5', '#7b96fa', '#a4bcfd', '#c7d7fe', '#10b981', '#f59e0b', '#ef4444']

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [dsaStats, setDsaStats] = useState({ topicStats: [], difficultyStats: [] })
  const [dailyEntries, setDailyEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeWeekTab, setActiveWeekTab] = useState('performance')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, dsaRes, dailyRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/dsa/stats'),
          api.get('/daily?limit=90')
        ])
        setSummary(analyticsRes.data.summary)
        setWeeklyData(analyticsRes.data.weeklyData)
        setDsaStats(dsaRes.data)
        setDailyEntries(dailyRes.data.entries.reverse())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const exportData = () => {
    const data = {
      summary,
      weeklyData,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '180days-analytics.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = ['Day', 'Date', 'DSA Target', 'DSA Completed', 'Study Hours', 'Subject', 'English', 'Completed', 'Mood']
    const rows = dailyEntries.map(e => [
      e.dayNumber,
      new Date(e.date).toLocaleDateString(),
      e.dsaTarget,
      e.dsaCompleted,
      e.studyHours,
      e.coreSubject,
      e.englishPractice ? 'Yes' : 'No',
      e.completed ? 'Yes' : 'No',
      e.mood
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '180days-data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Compute daily DSA trend for line chart
  const dailyDSATrend = dailyEntries.slice(-30).map(e => ({
    day: `D${e.dayNumber}`,
    dsa: e.dsaCompleted,
    hours: e.studyHours,
    target: e.dsaTarget
  }))

  // Subject distribution
  const subjectDist = ['OOPS', 'DBMS', 'OS', 'CN'].map(s => ({
    name: s,
    count: dailyEntries.filter(e => e.coreSubject === s).length
  })).filter(s => s.count > 0)

  // Difficulty pie data
  const diffPie = dsaStats.difficultyStats?.map(d => ({
    name: d._id,
    value: d.solved,
    total: d.total
  })) || []

  const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  const daysSince = getDaysSince(user?.startDate)
  const consistencyPct = summary?.consistencyScore || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Deep insights into your 180-day journey
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost text-sm py-2">
            <Download size={15} /> CSV
          </button>
          <button onClick={exportData} className="btn-ghost text-sm py-2">
            <Download size={15} /> JSON
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Consistency Score', value: `${consistencyPct}%`, icon: Target, color: 'from-brand-500 to-brand-600', sub: `${summary?.completedDays || 0}/180 days` },
          { label: 'Current Streak', value: `${summary?.currentStreak || 0}d 🔥`, icon: Flame, color: 'from-amber-500 to-orange-500', sub: `Best: ${summary?.longestStreak || 0}d` },
          { label: 'Total Study Hours', value: `${summary?.totalHours || 0}h`, icon: Clock, color: 'from-emerald-500 to-teal-500', sub: `~${summary?.avgHoursPerDay || 0}h/day` },
          { label: 'DSA Problems', value: summary?.totalDSA || 0, icon: Code2, color: 'from-violet-500 to-purple-600', sub: `~${summary?.avgDSAPerDay || 0}/day` },
        ].map(({ label, value, icon: Icon, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon size={17} className="text-white" />
            </div>
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Projection Banner */}
      {summary?.projectedDSA && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-brand-500"
        >
          <TrendingUp size={22} className="text-brand-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              📈 Projection: At your current pace of {summary.avgDSAPerDay} problems/day...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              You'll solve <strong className="text-brand-500">{summary.projectedDSA} DSA problems</strong> by Day 180 ·
              Avg study: <strong className="text-emerald-500">{summary.avgHoursPerDay}h/day</strong> ·
              Projected consistency: <strong className="text-amber-500">{consistencyPct}%</strong>
            </p>
          </div>
        </motion.div>
      )}

      {/* Weekly Performance */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Weekly Performance</h3>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-surface-700 rounded-xl">
            {['performance', 'hours', 'dsa'].map(t => (
              <button key={t} onClick={() => setActiveWeekTab(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  activeWeekTab === t ? 'bg-white dark:bg-surface-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          {activeWeekTab === 'performance' ? (
            <BarChart data={weeklyData} margin={{ left: -20, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb15" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[0, 7]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#5b6ef5" radius={[4, 4, 0, 0]} name="Days Completed" />
            </BarChart>
          ) : activeWeekTab === 'hours' ? (
            <AreaChart data={weeklyData} margin={{ left: -20, right: 0 }}>
              <defs>
                <linearGradient id="hoursGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb15" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" stroke="#10b981" fill="url(#hoursGrad2)" strokeWidth={2} name="Study Hours" />
            </AreaChart>
          ) : (
            <BarChart data={weeklyData} margin={{ left: -20, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb15" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="dsa" fill="#f59e0b" radius={[4, 4, 0, 0]} name="DSA Solved" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Daily DSA Trend (last 30 days) */}
      {dailyDSATrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Daily DSA vs Target (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyDSATrend} margin={{ left: -20, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb15" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="dsa" stroke="#5b6ef5" strokeWidth={2} dot={false} name="Solved" />
              <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* DSA + Subject breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DSA Difficulty Pie */}
        {diffPie.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">DSA by Difficulty</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={diffPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    paddingAngle={4} dataKey="value">
                    {diffPie.map((entry, i) => (
                      <Cell key={i} fill={DIFF_COLORS[entry.name] || COLORS[i]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {diffPie.map((d, i) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: DIFF_COLORS[d.name] }} />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">{d.name}</span>
                      </span>
                      <span className="font-mono text-xs text-gray-500">{d.value}/{d.total}</span>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${d.total > 0 ? (d.value / d.total) * 100 : 0}%`, background: DIFF_COLORS[d.name] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Subject Study Distribution */}
        {subjectDist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Subject Study Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectDist} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb15" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Days Studied" radius={[0, 4, 4, 0]}>
                  {subjectDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* DSA Topic Mastery */}
      {dsaStats.topicStats?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Topic Mastery Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dsaStats.topicStats.map((t, i) => {
              const pct = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0
              return (
                <div key={t._id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 truncate">{t._id}</span>
                  <div className="flex-1 progress-bar h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: `hsl(${220 + pct}, 80%, 60%)` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-mono w-12 text-right shrink-0">
                    {t.solved}/{t.total}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Weekly Goals Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Weekly Summary Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-surface-700">
                {['Week', 'Days Done', 'DSA Solved', 'Hours', 'Consistency'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-surface-700/50">
              {weeklyData.map((w, i) => {
                const consistency = Math.round((w.completed / 7) * 100)
                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-700 dark:text-gray-300">{w.week}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-800 dark:text-gray-200">{w.completed}/7</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-brand-600 dark:text-brand-400">{w.dsa}</td>
                    <td className="py-3 pr-4 font-mono text-emerald-600 dark:text-emerald-400">{w.hours}h</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-surface-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${consistency >= 70 ? 'bg-emerald-500' : consistency >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${consistency}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${consistency >= 70 ? 'text-emerald-600 dark:text-emerald-400' : consistency >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                          {consistency}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
