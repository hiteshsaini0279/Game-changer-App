import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Circle, RefreshCw } from 'lucide-react'
import api from '../utils/api'

const SUBJECT_COLORS = {
  OOPS: { bg: 'from-brand-500 to-brand-600', light: 'bg-brand-50 dark:bg-brand-900/20', border: 'border-brand-200 dark:border-brand-800/40', text: 'text-brand-600 dark:text-brand-400' },
  DBMS: { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800/40', text: 'text-violet-600 dark:text-violet-400' },
  OS: { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/40', text: 'text-amber-600 dark:text-amber-400' },
  CN: { bg: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40', text: 'text-emerald-600 dark:text-emerald-400' },
}

const CONFIDENCE_COLORS = {
  Low: 'badge-hard',
  Medium: 'badge-medium',
  High: 'badge-easy'
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSubjects() }, [])

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects')
      setSubjects(res.data.subjects)
      if (!selected && res.data.subjects.length > 0) setSelected(res.data.subjects[0]._id)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const updateTopic = async (subjectId, topicId, updates) => {
    try {
      await api.put(`/subjects/${subjectId}/topics/${topicId}`, updates)
      fetchSubjects()
    } catch (err) { console.error(err) }
  }

  const selectedSubject = subjects.find(s => s._id === selected)
  const coveredCount = selectedSubject?.topics?.filter(t => t.covered).length || 0
  const totalCount = selectedSubject?.topics?.length || 0
  const pct = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0

  if (loading) return <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Core Subjects</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">OOPS · DBMS · Operating Systems · Computer Networks</p>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {subjects.map((s, i) => {
          const col = SUBJECT_COLORS[s.subject]
          const done = s.topics?.filter(t => t.covered).length || 0
          const total = s.topics?.length || 0
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <motion.button
              key={s._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(s._id)}
              className={`glass-card p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
                selected === s._id ? `border-2 ${col.border.split(' ')[0]}` : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${col.bg} flex items-center justify-center mb-3 shadow-lg`}>
                <span className="text-white font-bold text-sm font-display">{s.subject[0]}</span>
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{s.subject}</p>
              <p className={`text-xs mt-0.5 font-medium ${col.text}`}>{done}/{total} topics</p>
              <div className="progress-bar mt-2">
                <div className={`h-full rounded-full bg-gradient-to-r ${col.bg} transition-all duration-500`}
                  style={{ width: `${pct}%` }} />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Topic Detail */}
      {selectedSubject && (
        <motion.div
          key={selectedSubject._id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">{selectedSubject.subject}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {coveredCount}/{totalCount} topics covered · {pct}% complete
              </p>
            </div>
            <div className="text-right">
              <div className={`font-bold text-2xl font-display ${SUBJECT_COLORS[selectedSubject.subject]?.text}`}>{pct}%</div>
              <div className="w-24 progress-bar mt-1">
                <div className={`h-full rounded-full bg-gradient-to-r ${SUBJECT_COLORS[selectedSubject.subject]?.bg}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedSubject.topics?.map((topic, i) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border p-3.5 transition-all ${
                  topic.covered
                    ? `${SUBJECT_COLORS[selectedSubject.subject]?.light} ${SUBJECT_COLORS[selectedSubject.subject]?.border}`
                    : 'bg-gray-50 dark:bg-surface-700/50 border-gray-200 dark:border-surface-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => updateTopic(selectedSubject._id, topic._id, {
                      covered: !topic.covered,
                      revisionStatus: !topic.covered ? 'done' : 'not_started'
                    })}
                    className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                  >
                    {topic.covered
                      ? <CheckCircle2 size={18} className={SUBJECT_COLORS[selectedSubject.subject]?.text} />
                      : <Circle size={18} className="text-gray-300 dark:text-gray-600" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${topic.covered ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                      {topic.name}
                    </p>
                    {topic.covered && (
                      <div className="flex items-center gap-2 mt-2">
                        <select
                          value={topic.confidence}
                          onChange={e => updateTopic(selectedSubject._id, topic._id, { ...topic, confidence: e.target.value })}
                          className="text-xs bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          {['Low', 'Medium', 'High'].map(c => <option key={c} value={c}>{c} Confidence</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  {topic.covered && (
                    <span className={`badge shrink-0 ${CONFIDENCE_COLORS[topic.confidence]}`}>
                      {topic.confidence}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
