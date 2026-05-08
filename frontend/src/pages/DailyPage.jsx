import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Calendar, CheckCircle2, Clock, Code2, BookOpen,
  MessageSquare, Edit3, Save, Plus, ChevronLeft, ChevronRight,
  TrendingUp, AlertTriangle, Smile
} from 'lucide-react'
import api from '../utils/api'
import { useAuthStore } from '../context/store'
import { getDaysSince } from '../utils/helpers'

const SUBJECTS = ['None', 'OOPS', 'DBMS', 'OS', 'CN']
const MOODS = [
  { val: 'great', emoji: '🚀', label: 'Great' },
  { val: 'good', emoji: '😊', label: 'Good' },
  { val: 'okay', emoji: '😐', label: 'Okay' },
  { val: 'bad', emoji: '😔', label: 'Tough' }
]

const defaultForm = {
  dsaTarget: 2, dsaCompleted: 0, developmentWork: '',
  coreSubject: 'None', coreSubjectTopic: '', englishPractice: false,
  studyHours: 0, completed: false, mood: 'okay', notes: ''
}

export default function DailyPage() {
  const { user } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  const dayNumber = getDaysSince(user?.startDate)

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    const entry = entries.find(e =>
      format(new Date(e.date), 'yyyy-MM-dd') === selectedDate
    )
    if (entry) {
      setCurrentEntry(entry)
      setForm({
        dsaTarget: entry.dsaTarget || 2,
        dsaCompleted: entry.dsaCompleted || 0,
        developmentWork: entry.developmentWork || '',
        coreSubject: entry.coreSubject || 'None',
        coreSubjectTopic: entry.coreSubjectTopic || '',
        englishPractice: entry.englishPractice || false,
        studyHours: entry.studyHours || 0,
        completed: entry.completed || false,
        mood: entry.mood || 'okay',
        notes: entry.notes || ''
      })
      setEditing(false)
    } else {
      setCurrentEntry(null)
      setForm({ ...defaultForm, dsaTarget: user?.dailyDSATarget || 2 })
      setEditing(true)
    }
  }, [selectedDate, entries])

  const fetchEntries = async () => {
    try {
      const res = await api.get('/daily?limit=180')
      setEntries(res.data.entries)
      setStreak({ current: res.data.currentStreak, longest: res.data.longestStreak })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, date: selectedDate }
      if (currentEntry) {
        await api.put(`/daily/${currentEntry._id}`, payload)
      } else {
        await api.post('/daily', payload)
      }
      await fetchEntries()
      setEditing(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const completionPct = form.dsaTarget > 0 ? Math.min(100, Math.round((form.dsaCompleted / form.dsaTarget) * 100)) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Daily Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Day {dayNumber} · Streak: <span className="text-amber-500 font-bold">{streak.current} 🔥</span>
            {streak.longest > 0 && <span className="text-gray-400"> · Best: {streak.longest} 🏆</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() - 1)
            setSelectedDate(d.toISOString().split('T')[0])
          }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input-field py-2 w-40 text-center"
          />
          <button onClick={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() + 1)
            setSelectedDate(d.toISOString().split('T')[0])
          }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {isToday && !currentEntry && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-700/30 bg-amber-50/30 dark:bg-amber-900/10"
        >
          <AlertTriangle size={18} className="text-amber-500" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">🚨 No Zero Day! Log something today — even 1 problem counts.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* DSA Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={18} className="text-brand-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">DSA Practice</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target</label>
                <input
                  type="number" min={0} max={20}
                  disabled={!editing}
                  value={form.dsaTarget}
                  onChange={e => setForm(f => ({ ...f, dsaTarget: +e.target.value }))}
                  className="input-field disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Completed</label>
                <input
                  type="number" min={0} max={50}
                  disabled={!editing}
                  value={form.dsaCompleted}
                  onChange={e => setForm(f => ({ ...f, dsaCompleted: +e.target.value }))}
                  className="input-field disabled:opacity-60"
                />
              </div>
            </div>

            <div className="progress-bar mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${completionPct >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
              />
            </div>
            <p className="text-xs text-gray-400">
              {form.dsaCompleted}/{form.dsaTarget} problems — {completionPct}%
              {completionPct >= 100 && ' 🎯 Target achieved!'}
            </p>
          </motion.div>

          {/* Dev + Subject + English */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Today's Work</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Development Work</label>
                <textarea
                  rows={2}
                  disabled={!editing}
                  placeholder="What did you build/learn today?"
                  value={form.developmentWork}
                  onChange={e => setForm(f => ({ ...f, developmentWork: e.target.value }))}
                  className="input-field disabled:opacity-60 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Core Subject</label>
                  <select
                    disabled={!editing}
                    value={form.coreSubject}
                    onChange={e => setForm(f => ({ ...f, coreSubject: e.target.value }))}
                    className="input-field disabled:opacity-60"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Study Hours</label>
                  <input
                    type="number" min={0} max={24} step={0.5}
                    disabled={!editing}
                    value={form.studyHours}
                    onChange={e => setForm(f => ({ ...f, studyHours: +e.target.value }))}
                    className="input-field disabled:opacity-60"
                  />
                </div>
              </div>

              {form.coreSubject !== 'None' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Topic Studied</label>
                  <input
                    type="text"
                    disabled={!editing}
                    placeholder="e.g., Normalization, Paging"
                    value={form.coreSubjectTopic}
                    onChange={e => setForm(f => ({ ...f, coreSubjectTopic: e.target.value }))}
                    className="input-field disabled:opacity-60"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    disabled={!editing}
                    checked={form.englishPractice}
                    onChange={e => setForm(f => ({ ...f, englishPractice: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-60"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <MessageSquare size={15} className="text-amber-500" /> English Practice
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    disabled={!editing}
                    checked={form.completed}
                    onChange={e => setForm(f => ({ ...f, completed: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-60"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-500" /> Day Complete
                  </span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Mood + Notes */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smile size={18} className="text-violet-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Mood & Reflection</h3>
            </div>

            <div className="flex gap-2 mb-4">
              {MOODS.map(m => (
                <button
                  key={m.val}
                  disabled={!editing}
                  onClick={() => setForm(f => ({ ...f, mood: m.val }))}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                    form.mood === m.val
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-surface-600 hover:border-gray-300 dark:hover:border-surface-500'
                  } disabled:opacity-60`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              disabled={!editing}
              placeholder="Notes, reflections, what went well..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input-field resize-none disabled:opacity-60"
            />
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-3">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
                {currentEntry && (
                  <button onClick={() => setEditing(false)} className="btn-ghost py-3 px-4">
                    Cancel
                  </button>
                )}
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-2">
                <Edit3 size={16} /> Edit
              </button>
            )}
          </div>
        </div>

        {/* Recent Entries Sidebar */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Recent Days</h3>
          {entries.slice(0, 14).map((entry, i) => {
            const dateStr = format(new Date(entry.date), 'yyyy-MM-dd')
            const isSelected = dateStr === selectedDate
            return (
              <motion.button
                key={entry._id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'glass-card hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Day {entry.dayNumber}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${entry.completed ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-surface-600'}`} />
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {format(new Date(entry.date), 'MMM d, EEE')}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-brand-500">{entry.dsaCompleted} DSA</span>
                  <span className="text-xs text-emerald-500">{entry.studyHours}h</span>
                  {entry.englishPractice && <span className="text-xs text-amber-500">Eng</span>}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
