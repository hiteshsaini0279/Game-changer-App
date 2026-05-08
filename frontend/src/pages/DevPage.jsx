import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Plus, X, Edit3, Trash2, Github, Globe, ChevronRight, LayoutGrid, List } from 'lucide-react'
import api from '../utils/api'

const STATUS_COLORS = {
  planning: 'bg-gray-100 text-gray-600 dark:bg-surface-700 dark:text-gray-300',
  inprogress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const TASK_STATUSES = ['todo', 'inprogress', 'done']
const TASK_LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }
const TASK_COLORS = {
  todo: 'bg-gray-50 dark:bg-surface-800 border-gray-200 dark:border-surface-600',
  inprogress: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40',
  done: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40',
}

const defaultForm = {
  projectName: '', description: '', techStack: '', status: 'planning', priority: 'medium',
  githubUrl: '', liveUrl: ''
}

export default function DevPage() {
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [editing, setEditing] = useState(null)
  const [newTask, setNewTask] = useState('')
  const [view, setView] = useState('cards')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/dev')
      setProjects(res.data.projects)
      if (selected) setSelected(res.data.projects.find(p => p._id === selected._id))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean)
    }
    try {
      if (editing) {
        await api.put(`/dev/${editing}`, payload)
      } else {
        await api.post('/dev', payload)
      }
      setShowForm(false)
      setEditing(null)
      setForm(defaultForm)
      fetchProjects()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  const handleAddTask = async (projectId) => {
    if (!newTask.trim()) return
    await api.post(`/dev/${projectId}/tasks`, { title: newTask, status: 'todo' })
    setNewTask('')
    fetchProjects()
  }

  const handleTaskStatus = async (project, taskId, status) => {
    const task = project.tasks.find(t => t._id === taskId)
    await api.put(`/dev/${project._id}/tasks/${taskId}`, { ...task, status })
    fetchProjects()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await api.delete(`/dev/${id}`)
    if (selected?._id === id) setSelected(null)
    fetchProjects()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Dev Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {projects.length} projects · {projects.filter(p => p.status === 'completed').length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-surface-800 rounded-xl">
            {[['cards', LayoutGrid], ['kanban', List]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={`p-2 rounded-lg transition-all ${view === v ? 'bg-white dark:bg-surface-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm) }} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Monitor size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="font-medium text-gray-500">No projects yet. Start building!</p>
        </div>
      ) : view === 'kanban' && selected ? (
        /* Kanban Board */
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelected(null)} className="btn-ghost py-1.5 px-3 text-sm">
              ← All Projects
            </button>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">{selected.projectName}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {TASK_STATUSES.map(status => {
              const tasks = selected.tasks?.filter(t => t.status === status) || []
              return (
                <div key={status} className={`rounded-2xl border p-4 ${TASK_COLORS[status]}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{TASK_LABELS[status]}</h3>
                    <span className="badge bg-white dark:bg-surface-800 text-gray-500 border border-gray-200 dark:border-surface-600">
                      {tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-24">
                    {tasks.map(task => (
                      <div key={task._id} className="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-surface-600">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{task.title}</p>
                        <div className="flex gap-1 mt-2">
                          {TASK_STATUSES.filter(s => s !== status).map(s => (
                            <button key={s} onClick={() => handleTaskStatus(selected, task._id, s)}
                              className="text-xs px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-surface-700 text-gray-500 hover:bg-gray-100 transition-colors">
                              → {TASK_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {status === 'todo' && (
                    <div className="mt-3 flex gap-2">
                      <input
                        placeholder="Add task..."
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTask(selected._id)}
                        className="input-field py-1.5 text-xs flex-1"
                      />
                      <button onClick={() => handleAddTask(selected._id)} className="btn-primary py-1.5 px-3 text-xs">
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => {
            const progress = p.tasks?.length > 0
              ? Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100)
              : 0
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{p.projectName}</h3>
                    <span className={`badge text-xs mt-1 ${STATUS_COLORS[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setForm({ ...p, techStack: p.techStack?.join(', ') }); setEditing(p._id); setShowForm(true) }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-400">
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {p.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{p.description}</p>
                )}

                {p.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.techStack.slice(0, 4).map(t => (
                      <span key={t} className="badge bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs">{t}</span>
                    ))}
                    {p.techStack.length > 4 && <span className="badge bg-gray-100 text-gray-500 text-xs">+{p.techStack.length - 4}</span>}
                  </div>
                )}

                {p.tasks?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className={`h-full rounded-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.tasks.filter(t => t.status === 'done').length}/{p.tasks.length} tasks done
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        <Github size={15} />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-brand-500 transition-colors">
                        <Globe size={15} />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelected(p); setView('kanban') }}
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
                  >
                    Board <ChevronRight size={13} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-surface-700"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                  {editing ? 'Edit Project' : 'New Project'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Project Name *</label>
                  <input required placeholder="My Awesome Project" value={form.projectName}
                    onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea rows={2} placeholder="What does this project do?" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tech Stack (comma-separated)</label>
                  <input placeholder="React, Node.js, MongoDB" value={form.techStack}
                    onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                      {['planning', 'inprogress', 'completed', 'paused'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                      {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">GitHub URL</label>
                    <input type="url" placeholder="https://github.com/..." value={form.githubUrl}
                      onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Live URL</label>
                    <input type="url" placeholder="https://myapp.com" value={form.liveUrl}
                      onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Create Project'}</button>
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
