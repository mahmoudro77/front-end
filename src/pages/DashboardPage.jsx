import { EmptyState, EventArt, FinanceBadge } from '../components/ui'

function parseDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function money(value) {
  return `$${Math.round(value).toLocaleString()}`
}

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

function StatCard({ icon, label, value, detail, tone = '' }) {
  return <div className={`dashboard-stat card ${tone}`}>
    <span className="dashboard-stat-icon" aria-hidden="true">{icon}</span>
    <div><small>{label}</small><strong>{value}</strong><em>{detail}</em></div>
  </div>
}

export default function DashboardPage({ events, directories, onCreate, onViewArchive, onSelect, onAddClient, onAddVenue, copy }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activeEvents = events.filter((event) => !['Draft', 'Cancelled'].includes(event.status))
  const upcoming = events
    .map((event) => ({ event, date: parseDate(event.date) }))
    .filter(({ event, date }) => date && date >= today && event.status !== 'Cancelled')
    .sort((a, b) => a.date - b.date)
    .slice(0, 5)
    .map(({ event }) => event)
  const totalRevenue = activeEvents.reduce((sum, event) => sum + Math.max(0, Number(event.total) || 0), 0)
  const outstanding = activeEvents.reduce((sum, event) => sum + Math.max(0, Number(event.balance) || (Number(event.total) || 0) - (Number(event.deposit) || 0)), 0)
  const clients = directories?.Clients || []
  const totalBookings = events.filter((event) => event.status !== 'Draft').length
  const completed = events.filter((event) => event.status === 'Completed').length
  const categories = events.reduce((result, event) => {
    const category = event.template || 'General Event'
    result[category] = (result[category] || 0) + 1
    return result
  }, {})
  const categoryTotal = Math.max(events.length, 1)
  const statusCounts = ['Confirmed', 'Planning', 'Inquiry', 'Completed', 'Cancelled'].map((status) => [status, events.filter((event) => event.status === status).length])
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1)
    const count = events.filter((event) => {
      const eventDate = parseDate(event.date)
      return eventDate && eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth()
    }).length
    return { label: date.toLocaleDateString('en-US', { month: 'short' }), count }
  })
  const maxMonth = Math.max(...months.map((month) => month.count), 1)
  const labels = copy || {}
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const activity = [
    ...events.slice().sort((a, b) => new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date)).slice(0, 3).map((event) => ({ label: 'Dossier updated', detail: event.title, date: event.updatedAt || event.date })),
    ...clients.slice(0, 2).map((client) => ({ label: 'Client available', detail: client.name, date: client.updatedAt })),
  ].slice(0, 4)

  return <section className="content module-content dashboard-page">
    <div className="dashboard-welcome">
      <div><span className="eyebrow">{labels.overview || 'OVERVIEW'}</span><h1>Welcome back, Ibraheem</h1><p>Plan beautiful moments with clarity across your events, clients, and team.</p><small>{dateLabel}</small></div>
      <div className="dashboard-actions"><button className="secondary-button" type="button" onClick={onViewArchive}>View events</button><button className="create-button" type="button" onClick={onCreate}>＋ Create dossier</button></div>
    </div>

    <div className="dashboard-stat-grid">
      <StatCard icon="✦" label="Total events" value={events.length} detail={`${activeEvents.length} active`} />
      <StatCard icon="◷" label="Upcoming events" value={upcoming.length} detail="Next scheduled events" tone="gold" />
      <StatCard icon="▣" label="Total bookings" value={totalBookings} detail="Confirmed and in planning" />
      <StatCard icon="♙" label="Total clients" value={clients.length} detail="In your directory" tone="sage" />
      <StatCard icon="$" label="Total revenue" value={money(totalRevenue)} detail="Across active dossiers" />
      <StatCard icon="!" label="Outstanding" value={money(outstanding)} detail="Remaining balances" tone="warning" />
    </div>

    <div className="dashboard-chart-grid">
      <div className="card dashboard-chart-card">
        <div className="section-heading"><div><span className="eyebrow">PERFORMANCE</span><h2>Monthly events overview</h2></div><span>Last 6 months</span></div>
        <div className="monthly-chart" aria-label="Monthly events overview">
          {months.map((month) => <div className="month-bar" key={`${month.label}-${month.count}`}><strong style={{ height: `${Math.max(8, (month.count / maxMonth) * 100)}%` }}>{month.count}</strong><span>{month.label}</span></div>)}
        </div>
      </div>
      <div className="card dashboard-chart-card revenue-chart">
        <div className="section-heading"><div><span className="eyebrow">FINANCE</span><h2>Revenue overview</h2></div><strong>{money(totalRevenue)}</strong></div>
        <div className="revenue-visual"><span>{money(totalRevenue * .75)}</span><i><em style={{ width: `${percentage(totalRevenue - outstanding, totalRevenue)}%` }} /></i><small>Collected against expected revenue</small></div>
      </div>
    </div>

    <div className="dashboard-chart-grid secondary">
      <div className="card dashboard-chart-card"><div className="section-heading"><div><span className="eyebrow">MIX</span><h2>Event categories</h2></div></div><div className="category-chart"><div className="category-donut" style={{ background: `conic-gradient(var(--primary-burgundy) 0 ${((categories.Wedding || 0) / categoryTotal) * 100}%, var(--champagne-gold) 0 ${(((categories.Wedding || 0) + (categories['General Event'] || 0)) / categoryTotal) * 100}%, #b9907d 0 100%)` }} /><div>{Object.entries(categories).map(([category, count]) => <p key={category}><i className={`dot dot-${category === 'Wedding' ? 'wine' : 'gold'}`} />{category}<b>{count}</b></p>)}</div></div></div>
      <div className="card dashboard-chart-card"><div className="section-heading"><div><span className="eyebrow">OPERATIONS</span><h2>Booking status</h2></div></div><div className="status-bars">{statusCounts.filter(([, count]) => count > 0).map(([status, count]) => <div className="status-bar" key={status}><span>{status}</span><i><em style={{ width: `${(count / Math.max(events.length, 1)) * 100}%` }} /></i><b>{count}</b></div>)}</div></div>
    </div>

    <div className="dashboard-bottom-grid">
      <div className="card dashboard-events-panel"><div className="section-heading"><div><span className="eyebrow">SCHEDULE</span><h2>Upcoming events</h2></div><button type="button" onClick={onViewArchive}>View all →</button></div>{upcoming.length ? <div className="dashboard-event-list">{upcoming.map((event) => <button type="button" className="dashboard-event-row" key={event.id} onClick={() => onSelect(event)}><EventArt type={event.art} /><span><strong>{event.title}</strong><small>{event.template || 'Event'} · {event.date} · {event.venue}</small></span><FinanceBadge status={event.paymentStatus} /></button>)}</div> : <EmptyState title="No upcoming events" message="Create a dossier to populate your schedule." />}</div>
      <div className="card dashboard-activity-panel"><div className="section-heading"><div><span className="eyebrow">TIMELINE</span><h2>Recent activity</h2></div></div>{activity.length ? activity.map((item, index) => <div className="activity-item" key={`${item.label}-${item.detail}-${index}`}><i /> <div><strong>{item.label}</strong><span>{item.detail}</span></div><small>{item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}</small></div>) : <EmptyState message="Activity will appear as records are updated." />}</div>
    </div>

    <div className="dashboard-quick-actions"><span><strong>Quick actions</strong><small>Keep your workspace moving</small></span><button type="button" onClick={onCreate}>＋ Create event</button><button type="button" onClick={onCreate}>＋ Create dossier</button><button type="button" onClick={onAddClient}>＋ Add client</button><button type="button" onClick={onAddVenue}>＋ Add venue</button></div>
    <span className="sr-only">Completed events: {completed}</span>
  </section>
}
