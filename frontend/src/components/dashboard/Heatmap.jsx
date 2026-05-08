import { useMemo } from 'react'
import { format, eachDayOfInterval, startOfDay, addDays } from 'date-fns'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Heatmap({ data = [], startDate }) {
  const heatmapMap = useMemo(() => {
    const map = {}
    data.forEach(d => {
      const key = format(new Date(d.date), 'yyyy-MM-dd')
      map[key] = d.intensity || 0
    })
    return map
  }, [data])

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 180 * 86400000)
  const end = addDays(start, 179)
  const days = eachDayOfInterval({ start, end })

  // Group into weeks
  const weeks = []
  let currentWeek = []
  const firstDay = start.getDay()
  for (let i = 0; i < firstDay; i++) currentWeek.push(null) // padding

  days.forEach(day => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null)
    weeks.push(currentWeek)
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          <div className="h-4" />
          {DAYS.map(d => (
            <div key={d} className="h-3 text-xs text-gray-400 flex items-center" style={{ fontSize: 10 }}>
              {d[0]}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => {
          const monthDay = week.find(d => d && d.getDate() === 1)
          return (
            <div key={wi} className="flex flex-col gap-1">
              <div className="h-4 text-xs text-gray-400" style={{ fontSize: 9 }}>
                {monthDay ? MONTHS[monthDay.getMonth()] : ''}
              </div>
              {week.map((day, di) => {
                if (!day) return <div key={di} className="w-3 h-3" />
                const key = format(day, 'yyyy-MM-dd')
                const intensity = heatmapMap[key] ?? -1
                const isToday = key === format(new Date(), 'yyyy-MM-dd')
                const isFuture = day > new Date()
                return (
                  <div
                    key={di}
                    title={`${format(day, 'MMM d')} — ${intensity > 0 ? `Intensity: ${intensity}` : intensity === 0 ? 'Missed' : 'No data'}`}
                    className={`w-3 h-3 rounded-sm cursor-default transition-transform hover:scale-125 ${
                      isFuture ? 'bg-gray-100 dark:bg-surface-700 opacity-30' :
                      intensity === -1 ? 'bg-gray-100 dark:bg-surface-700' :
                      `heat-${intensity}`
                    } ${isToday ? 'ring-1 ring-brand-500 ring-offset-1' : ''}`}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
