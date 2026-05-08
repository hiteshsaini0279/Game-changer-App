import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, X, Star, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import api from '../utils/api'

const TYPES = ['Speaking', 'Writing', 'Reading', 'Listening', 'Vocabulary', 'Grammar']
const TYPE_COLORS = {
  Speaking: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Writing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Reading: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Listening: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Vocabulary: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Grammar: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  topic: '', type: 'Speaking', duration: 30,
  mistakes: '', improvedSentences: '', newWords: '',
  selfRating: 3, notes: ''
}

export default function EnglishPage() {
  const [entries, setEntries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEntries() }, [])

  const fetchEntries = async () => {
    try {
      const res = await api.get('/english')
      setEntries(res.data.entries)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      mistakes: form.mistakes.split('\n').filter(Boolean),
      improvedSentences: form.improvedSentences.split('\n').filter(Boolean).map(s => {
        const [wrong, correct] = s.split('→').map(x => x.trim())
        return { wrong: wrong || s, correct: correct || '' }
      }),
      newWords: form.newWords.split('\n').filter(Boolean).map(s => {
        const [word, meaning] = s.split(':').map(x => x.trim())
        return { word: word || s, meaning: meaning || '' }
      })
    }
    try {
      await api.post('/english', payload)
      setShowForm(false)
      setForm(defaultForm)
      fetchEntries()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/english/${id}`)
    fetchEntries()
  }

  const totalMinutes = entries.reduce((s, e) => s + (e.duration || 0), 0)
  const avgRating = entries.length > 0
    ? (entries.reduce((s, e) => s + (e.selfRating || 0), 0) / entries.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">English Practice</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {entries.length} sessions · {Math.round(totalMinutes / 60)}h total · {avgRating}⭐ avg rating
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Log Session
        </button>
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TYPES.map(type => {
          const count = entries.filter(e => e.type === type).length
          return (
            <div key={type} className={`rounded-xl p-3 text-center ${TYPE_COLORS[type]}`}>
              <p className="font-bold text-lg">{count}</p>
              <p className="text-xs opacity-80">{type}</p>
            </div>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No sessions logged yet. Start practicing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card overflow-hidden"
            >
              <div
                className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors"
                onClick={() => setExpanded(expanded === entry._id ? null : entry._id)}
              >
                <span className={`badge ${TYPE_COLORS[entry.type]}`}>{entry.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{entry.topic}</p>
                  <p className="text-xs text-gray-400">{format(new Date(entry.date), 'MMM d, yyyy')} · {entry.duration}min</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} className={s <= entry.selfRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'} />
                  ))}
                </div>
                <button onClick={e => { e.stopPropagation(); handleDelete(entry._id) }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
                {expanded === entry._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>

              <AnimatePresence>
                {expanded === entry._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 dark:border-surface-700 px-5 py-4 space-y-3"
                  >
                    {entry.mistakes?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Mistakes to Fix</p>
                        <ul className="space-y-1">
                          {entry.mistakes.map((m, i) => (
                            <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.improvedSentences?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Improved Sentences</p>
                        <div className="space-y-2">
                          {entry.improvedSentences.map((s, i) => s.wrong && (
                            <div key={i} className="text-sm">
                              <p className="text-red-500 line-through">{s.wrong}</p>
                              {s.correct && <p className="text-emerald-600 dark:text-emerald-400">→ {s.correct}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {entry.newWords?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">New Words</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.newWords.map((w, i) => (
                            <span key={i} className="badge bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 group cursor-default"
                              title={w.meaning}>
                              {w.word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {entry.notes && <p className="text-sm text-gray-500 dark:text-gray-400 italic">{entry.notes}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-surface-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Log English Session</h3>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Topic *</label>
                  <input required placeholder="e.g., Job Interview Preparation" value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                    <input type="number" min={1} value={form.duration}
                      onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Self Rating</label>
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setForm(f => ({ ...f, selfRating: s }))}>
                          <Star size={22} className={s <= form.selfRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mistakes (one per line)</label>
                  <textarea rows={3} placeholder="List mistakes you made..." value={form.mistakes}
                    onChange={e => setForm(f => ({ ...f, mistakes: e.target.value }))} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Improved Sentences (wrong → correct)</label>
                  <textarea rows={3} placeholder="I am went to market → I went to the market" value={form.improvedSentences}
                    onChange={e => setForm(f => ({ ...f, improvedSentences: e.target.value }))} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">New Words (word: meaning)</label>
                  <textarea rows={2} placeholder="Eloquent: fluent and persuasive" value={form.newWords}
                    onChange={e => setForm(f => ({ ...f, newWords: e.target.value }))} className="input-field resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">Save Session</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
