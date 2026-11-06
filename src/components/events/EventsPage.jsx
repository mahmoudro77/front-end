import { useMemo, useState } from 'react'
import { EmptyState, EventArt } from '../ui'
import { eventTypes } from '../../utils/eventUtils'

function parseDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isUpcoming(event) {
  const date = parseDate(event.date)
  return date && date >= new Date() && !['Cancelled', 'Draft'].includes(event.status)
}

function EventsPage({ events, onCreate, onSelect }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All Types')
  const [status, setStatus] = useState('All Statuses')
  const [dateFilter, setDateFilter] = useState('all')
  const [sort, setSort] = useState('date-asc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6
  const stats = [
    ['Total events', events.length],
    ['Upcoming events', events.filter(isUpcoming).length],
    ['Completed events', events.filter((event) => event.status === 'Completed').length],
    ['Cancelled events', events.filter((event) => event.status === 'Cancelled').length],
  ]
  const filtered = useMemo(() => {
    const now = new Date()
    return events.filter((event) => {
      const textMatch = `${event.title} ${event.venue} ${event.client || ''}`.toLowerCase().includes(query.toLowerCase())
      const typeMatch = type === 'All Types' || event.template === type
      const statusMatch = status === 'All Statuses' || event.status === status
      const date = parseDate(event.date)
      const dateMatch = dateFilter === 'all' || (dateFilter === 'upcoming' && date && date >= now) || (dateFilter === 'past' && date && date < now)
      return textMatch && typeMatch && statusMatch && dateMatch
    }).sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title)
      if (sort === 'budget-desc') return (Number(b.total) || 0) - (Number(a.total) || 0)
      const difference = (parseDate(a.date)?.getTime() || 0) - (parseDate(b.date)?.getTime() || 0)
      return sort === 'date-desc' ? -difference : difference
    })
  }, [dateFilter, events, query, sort, status, type])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const update = (setter) => (event) => { setter(event.target.value); setCurrentPage(1) }
  return <section className="content module-content events-page">
    <div className="module-heading events-heading"><div><span className="eyebrow">EVENTS MANAGEMENT</span><h1>Events Management</h1><p>Organize dossiers, monitor schedules, and keep every celebration on track.</p></div><button className="create-button" type="button" onClick={onCreate}>＋ Create event</button></div>
    <div className="events-stat-grid">{stats.map(([label, value], index) => <div className="events-stat card" key={label}><span>{['✦', '◷', '✓', '×'][index]}</span><div><small>{label}</small><strong>{value}</strong></div></div>)}</div>
    <div className="toolbar events-toolbar"><div className="search-events"><span>⌕</span><input aria-label="Search events" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} placeholder="Search events, clients, or venues..." /></div><select aria-label="Filter by category" value={type} onChange={update(setType)}>{eventTypes.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by status" value={status} onChange={update(setStatus)}><option>All Statuses</option>{['Confirmed', 'Planning', 'Inquiry', 'Completed', 'Draft', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by date" value={dateFilter} onChange={update(setDateFilter)}><option value="all">All dates</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select><select aria-label="Sort events" value={sort} onChange={update(setSort)}><option value="date-asc">Date: earliest</option><option value="date-desc">Date: latest</option><option value="name">Name: A-Z</option><option value="budget-desc">Budget: highest</option></select></div>
    <div className="card archive-card events-table-card"><div className="archive-header events-table-header"><span>Event name</span><span>Category</span><span>Client</span><span>Date / venue</span><span>Guests</span><span>Budget</span><span>Status</span><span>Actions</span></div>{visible.map((event) => <div className="archive-row events-table-row" key={event.id}><div className="event-name"><EventArt type={event.art} /><div><strong>{event.title}</strong><small>{event.phone || 'Client contact not specified'}</small></div></div><span>{event.template || 'General Event'}</span><span>{event.client || '—'}</span><span><b>{event.date}</b><small>{event.time || 'Time TBD'} · {event.venue}</small></span><span>{event.guests || '—'}</span><span>${(Number(event.total) || 0).toLocaleString()}</span><span className={`event-status event-status-${String(event.status || 'Draft').toLowerCase().replace(/\s+/g, '-')}`}>{event.status || 'Draft'}</span><button className="row-action" type="button" aria-label={`View ${event.title}`} onClick={() => onSelect(event)}>View</button></div>)}{!visible.length && <EmptyState message={events.length ? 'Try changing your search or filters.' : 'Create your first event to get started.'} />}<div className="table-footer"><span>Showing {visible.length} of {filtered.length} events</span><div className="pagination"><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button>{Array.from({ length: totalPages }, (_, index) => <button aria-label={`Page ${index + 1}`} className={currentPage === index + 1 ? 'current' : ''} key={index} onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>)}<button aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>›</button></div></div></div>
  </section>
}

export default EventsPage
