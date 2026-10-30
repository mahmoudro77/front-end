import { EmptyState, EventArt, FinanceBadge } from '../components/ui'

function parseEventDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

export default function DashboardPage({ events, directories, onCreate, onViewArchive, copy }) {
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
  const availableStaff = staff.filter((row) => row.status === 'Available').length
  const progress = [
    ['Confirmed events', percentage(confirmed, activeEvents.length)],
    ['Tasks completed', percentage(completedTasks, tasks.length)],
    ['Invoices collected', percentage(paid, expected)],
    ['Team availability', percentage(availableStaff, staff.length)],
  ]
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const labels = copy || { overview: 'OVERVIEW', dashboard: 'Dashboard', dashboardDescription: 'متابعة الحجوزات والماليات والعمليات اليومية للمكتب.', createDossier: 'Create Dossier', eventsThisMonth: 'حفلات هذا الشهر', activeDossiers: 'الإضبارات النشطة', excludingDrafts: 'لا تشمل المسودات والملغاة', expectedRevenue: 'الإيرادات المتوقعة', activeDossiersOnly: 'من الإضبارات النشطة', outstanding: 'المبالغ غير المجمعة', remainingBalances: 'حسب الأرصدة المتبقية', upcomingFive: 'أقرب 5 أحداث قادمة', viewArchive: 'View archive', operationalProgress: 'Operational progress', noUpcoming: 'لا توجد أحداث قادمة حالياً.', addDossierForProgress: 'أضف إضبارة لعرض مؤشرات التقدم.', noData: 'No data yet', progressLabels: { 'Confirmed events': 'Confirmed events', 'Tasks completed': 'Tasks completed', 'Invoices collected': 'Invoices collected', 'Team availability': 'Team availability' } }
  return <section className="content module-content"><div className="module-heading"><div><span className="eyebrow">{labels.overview}</span><h1>{labels.dashboard}</h1><p>{labels.dashboardDescription}</p></div><button className="create-button" onClick={onCreate}>＋ {labels.createDossier}</button></div><div className="metric-grid"><div className="metric-card card"><span>{labels.eventsThisMonth}</span><strong>{monthEvents}</strong><small>{currentMonth}</small></div><div className="metric-card card"><span>{labels.activeDossiers}</span><strong>{activeEvents.length}</strong><small>{labels.excludingDrafts}</small></div><div className="metric-card card"><span>{labels.expectedRevenue}</span><strong>${expected.toLocaleString()}</strong><small>{labels.activeDossiersOnly}</small></div><div className="metric-card card"><span>{labels.outstanding}</span><strong>${outstanding.toLocaleString()}</strong><small>{labels.remainingBalances}</small></div></div><div className="dashboard-panels"><div className="card activity-panel"><div className="section-heading"><h2>{labels.upcomingFive}</h2><button type="button" onClick={onViewArchive}>{labels.viewArchive} →</button></div>{upcoming.length ? upcoming.map((event) => <div className="activity-row" key={event.id}><EventArt type={event.art} /><div><strong>{event.title}</strong><small>{event.date} · {event.venue}</small></div><FinanceBadge status={event.paymentStatus} /></div>) : <EmptyState title={labels.noData} message={labels.noUpcoming} />}</div><div className="card progress-panel"><div className="section-heading"><h2>{labels.operationalProgress}</h2><span>{currentMonth}</span></div>{activeEvents.length ? progress.map(([label, value]) => <div className="progress-item" key={label}><div><span>{labels.progressLabels[label]}</span><b>{value}%</b></div><i><em style={{ width: `${value}%` }} /></i></div>) : <EmptyState title={labels.noData} message={labels.addDossierForProgress} />}</div></div></section>
}
