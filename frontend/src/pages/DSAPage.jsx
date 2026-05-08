import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Plus, Filter, Search, Trash2, Edit3, RotateCcw, ExternalLink, BookMarked, X } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../utils/api'
import { DSA_TOPICS, PLATFORMS } from '../utils/helpers'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const defaultForm = {
  problemName: '', difficulty: 'Medium', platform: 'LeetCode',
  topic: 'Array', problemUrl: '', solved: true, revisionRequired: false,
  timeTaken: 0, notes: ''
}

export default function DSAPage() {
  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState({ topicStats: [], difficultyStats: [], revisionQueue: [] })
  const [filters, setFilters] = useState({ topic: '', difficulty: '', solved: '', search: '' })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => { fetchData() }, [filters])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v) })
      const [probRes, statsRes] = await Promise.all([
        api.get(`/dsa?${params}`),
        api.get('/dsa/stats')
      ])
      setProblems(probRes.data.problems)
      setStats(statsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/dsa/${editing}`, form)
      } else {
        await api.post('/dsa', form)
      }
      setShowForm(false)
      setEditing(null)
      setForm(defaultForm)
      fetchData()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem?')) return
    await api.delete(`/dsa/${id}`)
    fetchData()
  }

  const handleEdit = (p) => {
    setForm({
      problemName: p.problemName, difficulty: p.difficulty, platform: p.platform,
      topic: p.topic, problemUrl: p.problemUrl || '', solved: p.solved,
      revisionRequired: p.revisionRequired, timeTaken: p.timeTaken || 0, notes: p.notes || ''
    })
    setEditing(p._id)
    setShowForm(true)
  }

  const totalSolved = problems.filter(p => p.solved).length
  const radarData = stats.topicStats?.slice(0, 10).map(t => ({
    topic: t._id?.length > 8 ? t._id.slice(0, 8) : t._id,
    solved: t.solved,
    total: t.total
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">DSA Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {totalSolved} solved · {problems.filter(p => p.revisionRequired).length} pending revision
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm) }} className="btn-primary">
          <Plus size={16} /> Add Problem
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Easy', count: stats.difficultyStats?.find(d => d._id === 'Easy')?.solved || 0, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Medium', count: stats.difficultyStats?.find(d => d._id === 'Medium')?.solved || 0, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Hard', count: stats.difficultyStats?.find(d => d._id === 'Hard')?.solved || 0, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, count, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`glass-card p-4 text-center ${bg} border-0`}>
            <p className={`font-display font-bold text-2xl ${color}`}>{count}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label} solved</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-surface-800 rounded-xl w-fit">
        {['list', 'analytics', 'revision'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-surface-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'revision' ? `Revision (${stats.revisionQueue?.length || 0})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search problems..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="input-field pl-9 py-2"
              />
            </div>
            {[
              { key: 'difficulty', options: ['', ...DIFFICULTIES], label: 'Difficulty' },
              { key: 'topic', options: ['', ...DSA_TOPICS], label: 'Topic' },
              { key: 'solved', options: [['', 'All'], ['true', 'Solved'], ['false', 'Unsolved']], label: 'Status' }
            ].map(({ key, options, label }) => (
              <select
                key={key}
                value={filters[key]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="input-field py-2 w-auto"
              >
                {options.map(o => Array.isArray(o)
                  ? <option key={o[0]} value={o[0]}>{o[1]}</option>
                  : <option key={o} value={o}>{o || label}</option>
                )}
              </select>
            ))}
          </div>

          {/* Problems List */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
          ) : problems.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Code2 size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No problems found. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {problems.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card px-4 py-3 flex items-center gap-4 hover:shadow-md transition-all"
                >
                  <div className={`w-2 h-8 rounded-full shrink-0 ${
                    p.difficulty === 'Easy' ? 'bg-emerald-500' :
                    p.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{p.problemName}</p>
                      {p.revisionRequired && (
                        <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                          Revision
                        </span>
                      )}
                      {!p.solved && <span className="badge bg-gray-100 text-gray-500 dark:bg-surface-700 dark:text-gray-400">Unsolved</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs badge ${p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                        {p.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{p.platform}</span>
                      <span className="text-xs text-gray-400">{p.topic}</span>
                      {p.timeTaken > 0 && <span className="text-xs text-gray-400">{p.timeTaken}m</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {p.problemUrl && (
                      <a href={p.problemUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-400 hover:text-brand-500 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-400 hover:text-brand-500 transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-6">Topic Coverage Radar</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb30" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Radar name="Solved" dataKey="solved" stroke="#5b6ef5" fill="#5b6ef5" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {stats.topicStats?.map(t => (
              <div key={t._id} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-28 shrink-0">{t._id}</span>
                <div className="flex-1 progress-bar h-1.5">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${t.total > 0 ? (t.solved / t.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-mono w-12 text-right">{t.solved}/{t.total}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'revision' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {stats.revisionQueue?.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <BookMarked size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No problems marked for revision. Great job!</p>
            </div>
          ) : stats.revisionQueue?.map(p => (
            <div key={p._id} className="glass-card p-4 flex items-center gap-4">
              <RotateCcw size={18} className="text-violet-500 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{p.problemName}</p>
                <p className="text-xs text-gray-400">{p.topic} · {p.difficulty} · {p.platform}</p>
              </div>
              <button
                onClick={async () => { await api.put(`/dsa/${p._id}`, { revisionRequired: false, lastRevised: new Date() }); fetchData() }}
                className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-lg hover:bg-violet-200 transition-colors"
              >
                Mark Revised
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-surface-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                  {editing ? 'Edit Problem' : 'Add Problem'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Problem Name *</label>
                  <input required placeholder="e.g., Two Sum" value={form.problemName}
                    onChange={e => setForm(f => ({ ...f, problemName: e.target.value }))}
                    className="input-field" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'difficulty', label: 'Difficulty', options: DIFFICULTIES },
                    { key: 'platform', label: 'Platform', options: PLATFORMS },
                    { key: 'topic', label: 'Topic', options: DSA_TOPICS }
                  ].map(({ key, label, options }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field">
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Problem URL</label>
                  <input type="url" placeholder="https://leetcode.com/problems/..." value={form.problemUrl}
                    onChange={e => setForm(f => ({ ...f, problemUrl: e.target.value }))}
                    className="input-field" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Time Taken (minutes)</label>
                  <input type="number" min={0} value={form.timeTaken}
                    onChange={e => setForm(f => ({ ...f, timeTaken: +e.target.value }))}
                    className="input-field" />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.solved}
                      onChange={e => setForm(f => ({ ...f, solved: e.target.checked }))}
                      className="rounded text-brand-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Solved</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.revisionRequired}
                      onChange={e => setForm(f => ({ ...f, revisionRequired: e.target.checked }))}
                      className="rounded text-violet-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Needs Revision</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea rows={2} placeholder="Approach, key insights..."
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="input-field resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {editing ? 'Update' : 'Add Problem'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
