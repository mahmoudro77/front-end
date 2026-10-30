import { useState } from 'react'
import { EmptyState, EventArt, FinanceBadge } from '../ui'
import { eventTypes } from '../../utils/eventUtils'

function EventsPage({ events, onCreate, onSelect }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All Types')
  const [payment, setPayment] = useState('All Payments')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6
  const filtered = events.filter((event) => {
    const textMatch = `${event.title} ${event.venue} ${event.client || ''}`.toLowerCase().includes(query.toLowerCase())
    const typeMatch = type === 'All Types' || event.template === type
    const paymentMatch = payment === 'All Payments' || event.paymentStatus === payment
    return textMatch && typeMatch && paymentMatch
  }).sort((a, b) => new Date(a.date) - new Date(b.date))
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const updateFilter = (setter) => (event) => { setter(event.target.value); setCurrentPage(1) }
  return <section className="content module-content"><div className="module-heading"><div><span className="eyebrow">EVENTS</span><h1>Events &amp; Dossiers Archive</h1><p>ابحث وعدّل واطبع كامل الإضبارات المسجلة.</p></div><button className="create-button" onClick={onCreate}>＋ Create Dossier</button></div><div className="toolbar"><div className="search-events"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} placeholder="Search dossiers, clients, venues..." /></div><select value={type} onChange={updateFilter(setType)}>{eventTypes.map((item) => <option key={item}>{item}</option>)}</select><select value={payment} onChange={updateFilter(setPayment)}><option>All Payments</option><option value="PAID">Paid</option><option value="PARTIAL">Partial</option><option value="UNPAID">Unpaid</option></select></div><div className="card archive-card"><div className="archive-header"><span>Event / Dossier</span><span>Date</span><span>Template</span><span>Total</span><span>Payment status</span><span>Actions</span></div>{visible.map((event) => <div className="archive-row" key={event.id}><div className="event-name"><EventArt type={event.art} /><div><strong>{event.title}</strong><small>{event.client || 'Client not specified'} · {event.venue}</small></div></div><span>{event.date}</span><span>{event.template || 'Wedding'}</span><span>${(event.total || 0).toLocaleString()}</span><FinanceBadge status={event.paymentStatus} /><button className="row-action" onClick={() => onSelect(event)}>⋮</button></div>)}{!visible.length && <EmptyState message={events.length ? 'لا توجد إضبارات مطابقة للبحث.' : 'أنشئ أول إضبارة للبدء.'} />}<div className="table-footer"><span>Showing {visible.length} of {filtered.length} dossiers</span><div className="pagination"><button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button>{Array.from({ length: totalPages }, (_, index) => <button className={currentPage === index + 1 ? 'current' : ''} key={index} onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>)}<button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>›</button></div></div></div></section>
}


export default EventsPage
