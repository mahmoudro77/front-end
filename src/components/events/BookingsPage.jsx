import { useState } from 'react'
import { EmptyState, EventArt, FinanceBadge } from '../ui'
import { calendarCells, eventDateKey, formatMonth, getWeekStart, parseEventDate } from '../../utils/eventUtils'

function BookingsPage({ events, onCreate, onSelect }) {
  const [view, setView] = useState('month')
  const initialDate = new Date()
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [month, setMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
  const cells = view === 'month' ? calendarCells(month) : Array.from({ length: view === 'week' ? 7 : 1 }, (_, index) => {
    const date = getWeekStart(selectedDate)
    date.setDate(date.getDate() + index)
    return date
  })
  const eventsByDate = events.reduce((result, event) => {
    const key = eventDateKey(event.date)
    if (key) result[key] = [...(result[key] || []), event]
    return result
  }, {})
  const moveMonth = (amount) => {
    const next = new Date(month.getFullYear(), month.getMonth() + amount, 1)
    setMonth(next)
    setSelectedDate(next)
  }
  const goToday = () => {
    const today = new Date()
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }
  const cellEvents = (date) => eventsByDate[eventDateKey(date)] || []
  const monthEvents = events.filter((event) => {
    const date = parseEventDate(event.date)
    return date && date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()
  })
  const confirmed = monthEvents.filter((event) => event.status === 'Confirmed').length
  const pending = monthEvents.filter((event) => event.status === 'Planning' || event.status === 'Inquiry').length
  const cancelled = monthEvents.filter((event) => event.status === 'Cancelled').length
  const upcoming = events
    .map((event) => ({ event, date: parseEventDate(event.date) }))
    .filter(({ date }) => date && date >= new Date())
    .sort((a, b) => a.date - b.date)
    .slice(0, 3)
    .map(({ event }) => event)
  return <section className="content module-content booking-page"><div className="booking-hero"><div><h1>Bookings &amp; Calendar</h1><p>View bookings and manage your calendar.</p></div><div className="booking-hero-actions"><strong>Manage<br /><em>Your Bookings<br />&amp; Calendar</em></strong><button className="create-button" onClick={onCreate}>＋ New Booking</button></div></div><div className="booking-stats"><div className="booking-stat"><span>▣</span><small>Total Bookings</small><b>{monthEvents.length}</b><em>{formatMonth(month)}</em></div><div className="booking-stat"><span>☑</span><small>Confirmed</small><b>{confirmed}</b><em>{formatMonth(month)}</em></div><div className="booking-stat"><span>⌛</span><small>Pending</small><b>{pending}</b><em>{formatMonth(month)}</em></div><div className="booking-stat"><span>⊗</span><small>Cancelled</small><b>{cancelled}</b><em>{formatMonth(month)}</em></div></div><div className="booking-layout"><div><div className="card full-calendar calendar-card"><div className="calendar-card-heading"><h2>▣ &nbsp;Calendar</h2><div className="booking-toolbar"><button className={view === 'month' ? 'selected' : ''} onClick={() => setView('month')}>Month</button><button className={view === 'week' ? 'selected' : ''} onClick={() => setView('week')}>Week</button><button className={view === 'day' ? 'selected' : ''} onClick={() => setView('day')}>Day</button><button type="button" onClick={goToday}>Today</button></div><span className="calendar-month"><button onClick={() => moveMonth(-1)}>‹</button>{formatMonth(month)}<button onClick={() => moveMonth(1)}>›</button></span></div><div className={`calendar-view-${view}`}><div className="full-calendar-head">{(view === 'day' ? [selectedDate.toLocaleDateString('en-US', { weekday: 'short' })] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day) => <b key={day}>{day}</b>)}</div><div className="full-calendar-grid">{cells.map((date) => { const dateEvents = cellEvents(date); const key = eventDateKey(date); return <button className={`calendar-cell ${date.getMonth() !== month.getMonth() && view === 'month' ? 'outside-month' : ''} ${key === eventDateKey(selectedDate) ? 'selected-day' : ''}`} key={key} onClick={() => setSelectedDate(date)}><span className="calendar-day-number">{date.getDate()}</span>{dateEvents.map((event) => <small className={`calendar-event event-${event.paymentStatus?.toLowerCase() || 'partial'}`} key={event.id} onClick={(clickEvent) => { clickEvent.stopPropagation(); onSelect(event) }}>{event.title}</small>)}</button> })}</div></div></div><div className="card upcoming-bookings"><div className="section-heading"><h2>▣ &nbsp;Upcoming Bookings</h2><button onClick={() => setView('month')}>View all →</button></div>    <div className="upcoming-grid">{upcoming.length ? upcoming.map((event) => <button className="upcoming-row" key={event.id} onClick={() => onSelect(event)}><EventArt type={event.art} /><span><strong>{event.title}</strong><small>{event.date} · {event.time}</small><FinanceBadge status={event.paymentStatus} /></span></button>) : <EmptyState message="لا توجد حجوزات قادمة." />}</div></div></div>  <div className="card booking-list"><div className="section-heading"><h2>♧ &nbsp;Bookings List</h2><button type="button" onClick={() => setView('month')}>View all →</button></div>{events.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map((event) => <button className="booking-item" key={event.id} onClick={() => onSelect(event)}><EventArt type={event.art} /><div><strong>{event.title}</strong><small>◷ {event.date} · {event.time}</small><small>⌖ {event.venue}</small></div><FinanceBadge status={event.status === 'Planning' ? 'PARTIAL' : event.paymentStatus} /><span className="booking-dots">⋮</span></button>)}</div></div></section>
}


export default BookingsPage
