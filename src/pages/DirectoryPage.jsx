import { useState } from 'react'
import mockData from '../data/mockData.json'
import { EmptyState } from '../components/ui'

function getStats(page, rows) {
  const statuses = rows.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] || 0) + 1 }), {})
  const categories = rows.reduce((counts, row) => ({ ...counts, [row.category]: (counts[row.category] || 0) + 1 }), {})
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
  const stat = (label, value, detail) => [label, String(value), detail]

  if (page === 'Staff') {
    return [
      stat('Team Members', rows.length, 'In this directory'),
      stat('Assigned', statuses.Assigned || 0, 'Across events'),
      stat('Available', statuses.Available || 0, 'Ready to assign'),
      stat('On leave', statuses['On leave'] || 0, 'Currently unavailable'),
    ]
  }
  if (page === 'Venues') {
    return [
      stat('Venues', rows.length, 'In your directory'),
      stat('Available', statuses.Available || 0, 'For new bookings'),
      stat('Booked', statuses.Booked || 0, 'Currently reserved'),
      stat('Categories', Object.keys(categories).length, 'Venue categories'),
    ]
  }
  if (page === 'Vendors') {
    return [
      stat('Vendors', rows.length, 'Active partners'),
      stat('Active', statuses.Active || 0, 'Available partners'),
      stat('Top category', topCategory ? topCategory[1] : 0, topCategory ? topCategory[0] : 'No categories'),
      stat('Pending review', statuses.Review || 0, 'Need attention'),
    ]
  }
  return [
    stat('Clients', rows.length, 'In your directory'),
    stat('Confirmed', statuses.Confirmed || 0, 'Confirmed events'),
    stat('Planning', statuses.Planning || 0, 'Events in planning'),
    stat('Inquiries', statuses.Inquiry || 0, 'Awaiting response'),
  ]
}

export default function DirectoryPage({ page, rows, onCreate, onDelete }) {
  const [query, setQuery] = useState('')
  const filtered = rows.filter((row) => `${row.name} ${row.category} ${row.contact} ${row.email} ${row.phone} ${row.status}`.toLowerCase().includes(query.toLowerCase()))
  const stats = getStats(page, rows)
  return <section className="content module-content"><div className="module-heading"><div><span className="eyebrow">DIRECTORY</span><h1>{mockData.modules[page]?.title}</h1><p>{mockData.modules[page]?.subtitle}</p></div><button className="create-button" onClick={() => onCreate(null)}>＋ Add {page === 'Staff' ? 'staff member' : page.slice(0, -1).toLowerCase()}</button></div><div className="metric-grid compact">{stats.map(([label, value, detail]) => <div className="metric-card card" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}</div><div className="card directory-card"><div className="directory-toolbar"><div className="search-events"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${page.toLowerCase()}...`} /></div></div><div className="directory-table"><div className="directory-header"><span>Name</span><span>Category / role</span><span>Contact / assignment</span><span>Status</span><span>Actions</span></div>{filtered.map((row) => <div className="directory-row" key={row.id}><span>{row.name}</span><span>{row.category}</span><span>{row.email || row.phone || row.contact}</span><span className="status status-sage">{row.status}</span><span className="directory-actions"><button onClick={() => onCreate(row)}>Edit</button><button onClick={() => onDelete(row.id)}>Delete</button></span></div>)}</div>{!rows.length ? <EmptyState message="لا توجد سجلات بعد. أضف أول سجل للبدء." /> : !filtered.length && <EmptyState message="جرّب تغيير عبارة البحث." />}</div></section>
}
