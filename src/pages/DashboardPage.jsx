import { EmptyState, EventArt, FinanceBadge } from '../components/ui'

function parseEventDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

export default function DashboardPage({ events, directories, onCreate, onViewArchive }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activeEvents = events.filter((event) => !['Draft', 'Cancelled'].includes(event.status))
  const monthEvents = activeEvents.filter((event) => {
    const date = parseEventDate(event.date)
    return date && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()
  }).length
  const paid = activeEvents.reduce((sum, event) => sum + Math.max(0, Number(event.deposit) || 0), 0)
  const expected = activeEvents.reduce((sum, event) => sum + Math.max(0, Number(event.total) || 0), 0)
  const outstanding = activeEvents.reduce((sum, event) => {
    const balance = Number.isFinite(Number(event.balance)) ? Number(event.balance) : (Number(event.total) || 0) - (Number(event.deposit) || 0)
    return sum + Math.max(0, balance)
  }, 0)
  const upcoming = activeEvents
    .map((event) => ({ event, date: parseEventDate(event.date) }))
    .filter(({ date }) => date && date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5)
    .map(({ event }) => event)
  const confirmed = activeEvents.filter((event) => event.status === 'Confirmed').length
  const tasks = activeEvents.flatMap((event) => Array.isArray(event.tasksList) ? event.tasksList : [])
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const staff = directories?.Staff || []
  const availableStaff = staff.filter((row) => row[3] === 'Available').length
  const progress = [
    ['Confirmed events', percentage(confirmed, activeEvents.length)],
    ['Tasks completed', percentage(completedTasks, tasks.length)],
    ['Invoices collected', percentage(paid, expected)],
    ['Team availability', percentage(availableStaff, staff.length)],
  ]
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return <section className="content module-content"><div className="module-heading"><div><span className="eyebrow">OVERVIEW</span><h1>Dashboard</h1><p>متابعة الحجوزات والماليات والعمليات اليومية للمكتب.</p></div><button className="create-button" onClick={onCreate}>＋ Create Dossier</button></div><div className="metric-grid"><div className="metric-card card"><span>حفلات هذا الشهر</span><strong>{monthEvents}</strong><small>{currentMonth}</small></div><div className="metric-card card"><span>الإضبارات النشطة</span><strong>{activeEvents.length}</strong><small>لا تشمل المسودات والملغاة</small></div><div className="metric-card card"><span>الإيرادات المتوقعة</span><strong>${expected.toLocaleString()}</strong><small>من الإضبارات النشطة</small></div><div className="metric-card card"><span>المبالغ غير المجمعة</span><strong>${outstanding.toLocaleString()}</strong><small>حسب الأرصدة المتبقية</small></div></div><div className="dashboard-panels"><div className="card activity-panel"><div className="section-heading"><h2>أقرب 5 أحداث قادمة</h2><button type="button" onClick={onViewArchive}>View archive →</button></div>{upcoming.length ? upcoming.map((event) => <div className="activity-row" key={event.id}><EventArt type={event.art} /><div><strong>{event.title}</strong><small>{event.date} · {event.venue}</small></div><FinanceBadge status={event.paymentStatus} /></div>) : <EmptyState message="لا توجد أحداث قادمة حالياً." />}</div><div className="card progress-panel"><div className="section-heading"><h2>Operational progress</h2><span>{currentMonth}</span></div>{activeEvents.length ? progress.map(([label, value]) => <div className="progress-item" key={label}><div><span>{label}</span><b>{value}%</b></div><i><em style={{ width: `${value}%` }} /></i></div>) : <EmptyState message="أضف إضبارة لعرض مؤشرات التقدم." />}</div></div></section>
}
