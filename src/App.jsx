import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import mockData from './data/mockData.json'
import { EmptyState, ErrorState, EventArt, FinanceBadge, LoadingState, Modal } from './components/ui'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DirectoryPage from './pages/DirectoryPage'
import SettingsPage from './pages/SettingsPage'
import DirectoryForm from './components/DirectoryForm'
import logo from './assets/logo.jpg'
import './App.css'

const navigation = [
  ['⌂', 'Dashboard'],
  ['▣', 'Events'],
  ['♧', 'Bookings'],
  ['♙', 'Clients'],
  ['⌖', 'Venues'],
  ['♜', 'Vendors'],
  ['♚', 'Staff'],
  ['⚙', 'Settings'],
]
const artTypes = ['wedding', 'engagement', 'gala', 'garden', 'birthday', 'meeting', 'party']
const eventTypes = ['All Types', 'Wedding', 'General Event', 'Engagement']
const storageKeys = { events: 'allure-events', directories: 'allure-directories' }
const languageKey = 'allure-language'
const translations = {
  ar: {
    dashboard: 'لوحة التحكم', events: 'الإضبارات', bookings: 'الحجوزات', clients: 'العملاء',
    venues: 'القاعات', vendors: 'الموردون', staff: 'الموظفون', settings: 'الإعدادات',
    search: 'ابحث عن الفعاليات أو العملاء أو القاعات...', officeAdmin: 'مدير المكتب',
    loginEyebrow: 'دخول المدير', loginTitle: 'مرحباً بك في Allure Events',
    loginDescription: 'أدر حفلاتك وعملاءك وفريقك من مكان واحد.', email: 'البريد الإلكتروني',
    password: 'كلمة المرور', remember: 'تذكرني', forgot: 'نسيت كلمة المرور؟',
    login: 'تسجيل الدخول', secure: 'وصول المدير · مساحة عمل محمية',
    settingsTitle: 'الملف الشخصي والإعدادات', settingsDescription: 'إدارة الحساب والهوية المطبوعة وإعدادات الأمان.',
    profile: 'معلومات الملف الشخصي', printed: 'الهوية المطبوعة', notifications: 'الإشعارات',
    security: 'الأمان', language: 'لغة الواجهة', arabic: 'العربية', english: 'English',
    export: 'تصدير JSON', import: 'استيراد JSON', reset: 'إعادة بيانات العرض',
    save: 'حفظ التغييرات', saved: 'تم حفظ التغييرات بنجاح.', show: 'إظهار', hide: 'إخفاء',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.', required: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
    confirmDeleteEvent: 'هل أنت متأكد من حذف الإضبارة "{title}"؟ لا يمكن التراجع عن هذا الإجراء.'
  },
  en: {
    dashboard: 'Dashboard', events: 'Events', bookings: 'Bookings', clients: 'Clients',
    venues: 'Venues', vendors: 'Vendors', staff: 'Staff', settings: 'Settings',
    search: 'Search events, clients, or venues...', officeAdmin: 'Office Admin',
    loginEyebrow: 'ADMIN LOGIN', loginTitle: 'Welcome to Allure Events',
    loginDescription: 'Manage your events, clients, and team from one place.', email: 'Email address',
    password: 'Password', remember: 'Remember me', forgot: 'Forgot password?',
    login: 'Sign in', secure: 'Admin access · Protected workspace',
    settingsTitle: 'Profile & Settings', settingsDescription: 'Manage your account, printed identity, and security.',
    profile: 'Profile information', printed: 'Printed identity', notifications: 'Notifications',
    security: 'Security', language: 'Interface language', arabic: 'العربية', english: 'English',
    export: 'Export JSON', import: 'Import JSON', reset: 'Reset demo data',
    save: 'Save changes', saved: 'Changes saved successfully.', show: 'Show', hide: 'Hide',
    invalidEmail: 'Please enter a valid email address.', required: 'Please enter your email and password.',
    confirmDeleteEvent: 'Are you sure you want to delete "{title}"? This action cannot be undone.'
  }
}

function useCopy(language) {
  return translations[language] || translations.en
}

function readStored(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function dateInputValue(date) {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${parsed.getFullYear()}-${month}-${day}`
}

function eventDateKey(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function parseEventDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function calendarCells(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(firstDay)
  start.setDate(1 - firstDay.getDay())
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function getWeekStart(date) {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  return start
}

function CreateDossier({ onClose, onSave, venues, existingEvents = [], initialEvent = null }) {
  const [template, setTemplate] = useState(initialEvent?.template || 'Wedding')
  const [form, setForm] = useState({
    name: initialEvent?.title || '', client: initialEvent?.client || '', phone: initialEvent?.phone || '',
    date: dateInputValue(initialEvent?.date), venue: initialEvent?.venue || '', total: initialEvent?.total || 0,
    deposit: initialEvent?.deposit || 0, time: initialEvent?.time === 'To be confirmed' ? '' : initialEvent?.time || '',
    guests: initialEvent?.guests || 0, tasks: initialEvent?.tasks || '',
  })
  const [services, setServices] = useState(initialEvent?.services || [])
  const [accessories, setAccessories] = useState(initialEvent?.accessories || [])
  const [taskItems, setTaskItems] = useState(initialEvent?.tasksList || [])
  const [conflict, setConflict] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const serviceOptions = template === 'Wedding' ? ['زينة', 'مطرب', 'تصوير', 'ديجي', 'إضاءة', 'تنظيم', 'ألعاب نارية', 'طبّال'] : ['أنظمة الصوت والمسرح', 'الشاشات التفاعلية', 'شاشات LED', 'الضيافة', 'التغطية الإعلامية', 'تجهيزات VIP']
  const weddingAccessories = ['كيك داي دريم', 'سلة النقوط', 'الجرة', 'العجينة', 'كاسات', 'سيارة العروس', 'حنة', 'حمالة المحابس', 'سلة قرمش']
  const toggle = (item, list, setter) => setter(list.includes(item) ? list.filter((value) => value !== item) : [...list, item])
  const addTask = () => setTaskItems((items) => [...items, { title: '', description: '', assignee: '', deadline: '', status: 'Pending' }])
  const updateTask = (index, key, value) => setTaskItems((items) => items.map((task, taskIndex) => taskIndex === index ? { ...task, [key]: value } : task))
  const removeTask = (index) => setTaskItems((items) => items.filter((_, taskIndex) => taskIndex !== index))
  const total = Math.max(0, Number(form.total) || 0)
  const deposit = Math.min(total, Math.max(0, Number(form.deposit) || 0))
  const balance = total - deposit
  const paymentStatus = balance === 0 && total > 0 ? 'PAID' : deposit > 0 ? 'PARTIAL' : 'UNPAID'
  const submit = (event) => {
    event.preventDefault()
    if (!form.name || !form.date || !form.venue) return
    const duplicate = existingEvents.find((item) => item.id !== initialEvent?.id && item.venue === form.venue && eventDateKey(item.date) === form.date && (item.time || '') === (form.time || ''))
    if (duplicate) {
      setConflict(`يوجد حجز آخر في ${form.venue} في نفس التاريخ والساعة: ${duplicate.title}`)
      return
    }
    setConflict('')
    onSave({ ...initialEvent, id: initialEvent?.id || Date.now(), title: form.name.trim(), date: new Date(`${form.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), time: form.time || 'To be confirmed', venue: form.venue, guests: Number(form.guests) || 0, status: initialEvent?.status || 'Planning', tone: initialEvent?.tone || 'gold', art: initialEvent?.art || artTypes[0], template, total, deposit, balance, paymentStatus, client: form.client.trim(), phone: form.phone.trim(), services, accessories, tasks: form.tasks.trim(), tasksList: taskItems })
  }
  return <Modal title={initialEvent ? 'تعديل الإضبارة' : 'إنشاء إضبارة جديدة'} onClose={onClose} wide><form className="dossier-form" onSubmit={submit} dir="rtl"><p className="modal-subtitle">اختر القالب وأدخل تفاصيل الحفل والخدمات والماليات.</p>{conflict && <div className="form-error">{conflict}</div>}<div className="template-tabs"><button type="button" className={template === 'Wedding' ? 'selected' : ''} onClick={() => setTemplate('Wedding')}>💍 أعراس ومناسبات عائلية</button><button type="button" className={template === 'General Event' ? 'selected' : ''} onClick={() => setTemplate('General Event')}>✦ فعالية عامة / شركة</button></div><div className="form-section"><h3>البيانات الأساسية</h3><div className="form-grid">{template === 'Wedding' ? <><label>اسم الحفل<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="مثال: عرس أحمد وسارة" /></label><label>العريس والعروس<input value={form.client} onChange={(event) => update('client', event.target.value)} placeholder="أحمد حداد & سارة" /></label></> : <><label>اسم الجهة / المؤسسة<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="اسم المؤسسة أو الفعالية" /></label><label>عنوان الفعالية<input value={form.client} onChange={(event) => update('client', event.target.value)} placeholder="عنوان الحدث" /></label></>}<label>رقم الهاتف<input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+961 ..." /></label><label>التاريخ<input required type="date" value={form.date} onChange={(event) => update('date', event.target.value)} /></label><label>القاعة / المكان<select required value={form.venue} onChange={(event) => update('venue', event.target.value)}><option value="">اختر من الدليل</option>{venues.map((venue) => <option key={venue[0]}>{venue[0]}</option>)}</select></label><label>الساعة<input type="time" value={form.time} onChange={(event) => update('time', event.target.value)} /></label>{template === 'General Event' && <label>عدد الحضور المتوقع<input type="number" min="0" value={form.guests} onChange={(event) => update('guests', event.target.value)} /></label>}</div></div><div className="form-section"><h3>الخدمات والتجهيزات</h3><div className="check-grid">{serviceOptions.map((item) => <label className="check-option" key={item}><input type="checkbox" checked={services.includes(item)} onChange={() => toggle(item, services, setServices)} />{item}</label>)}</div>{template === 'Wedding' && <><h4>ملحقات الأعراس</h4><div className="check-grid">{weddingAccessories.map((item) => <label className="check-option" key={item}><input type="checkbox" checked={accessories.includes(item)} onChange={() => toggle(item, accessories, setAccessories)} />{item}</label>)}</div></>}</div><div className="form-section"><h3>الماليات والمهام</h3><div className="form-grid"><label>إجمالي التكلفة<input type="number" min="0" value={form.total} onChange={(event) => update('total', event.target.value)} /></label><label>العربون المستلم<input type="number" min="0" max={total} value={form.deposit} onChange={(event) => update('deposit', event.target.value)} /></label><div className="finance-preview"><span>المبلغ المتبقي</span><strong>${balance.toLocaleString()}</strong><FinanceBadge status={paymentStatus} /></div>  <div className="wide-field task-editor"><div className="task-editor-head"><span>المهام وتكليف الموظفين</span><button type="button" className="secondary-button" onClick={addTask}>＋ Add task</button></div>{taskItems.map((task, index) => <div className="task-row" key={index}><input placeholder="عنوان المهمة" value={task.title} onChange={(event) => updateTask(index, 'title', event.target.value)} /><input placeholder="الموظف المسؤول" value={task.assignee} onChange={(event) => updateTask(index, 'assignee', event.target.value)} /><input type="date" value={task.deadline} onChange={(event) => updateTask(index, 'deadline', event.target.value)} /><select value={task.status} onChange={(event) => updateTask(index, 'status', event.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select><button type="button" className="danger-button" onClick={() => removeTask(index)}>×</button></div>)}</div></div></div><div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>إلغاء</button><button className="create-button">{initialEvent ? 'حفظ التعديلات' : 'حفظ الإضبارة'}</button></div></form></Modal>
}

function EventDetail({ event, onClose, onDelete, onEdit }) {
  const printableRef = useRef(null)
  const exportPdf = () => {
    if (!printableRef.current) return
    html2pdf().set({ margin: 0.35, filename: `${event.title.replace(/\s+/g, '-')}.pdf`, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(printableRef.current).save()
  }
  return <Modal title={event.title} onClose={onClose}><div ref={printableRef} className="pdf-dossier"><div className="detail-head"><EventArt type={event.art} /><div><strong>{event.template || 'Wedding'}</strong><small>{event.date} · {event.time} · {event.venue}</small></div><FinanceBadge status={event.paymentStatus || 'PARTIAL'} /></div><div className="detail-grid"><div><span>العميل / الجهة</span><strong>{event.client || '—'}</strong></div><div><span>الهاتف</span><strong>{event.phone || '—'}</strong></div><div><span>إجمالي التكلفة</span><strong>${(event.total || 0).toLocaleString()}</strong></div><div><span>العربون</span><strong>${(event.deposit || 0).toLocaleString()}</strong></div><div><span>المتبقي</span><strong>${(event.balance || 0).toLocaleString()}</strong></div><div><span>الخدمات</span><strong>{event.services?.join('، ') || 'لم تحدد بعد'}</strong></div></div></div><div className="detail-actions"><button className="secondary-button" onClick={exportPdf}>تحميل PDF</button><button className="secondary-button" onClick={() => onEdit(event)}>تعديل</button><button className="danger-button" onClick={() => onDelete(event.id)}>حذف الإضبارة</button></div></Modal>
}

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

function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(readStored('allure-auth', null)))
  const [language, setLanguage] = useState(() => readStored(languageKey, 'en'))
  const copy = useCopy(language)
  const [activeNav, setActiveNav] = useState('Events')
  const [events, setEvents] = useState(() => readStored(storageKeys.events, mockData.events))
  const [directories, setDirectories] = useState(() => readStored(storageKeys.directories, mockData.directoryRows))
  const [showCreate, setShowCreate] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [directoryModal, setDirectoryModal] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const venues = directories.Venues || []
  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 0)
    return () => window.clearTimeout(timer)
  }, [])
  useEffect(() => { window.localStorage.setItem(storageKeys.events, JSON.stringify(events)) }, [events])
  useEffect(() => { window.localStorage.setItem(storageKeys.directories, JSON.stringify(directories)) }, [directories])
  const openCreate = () => { setEditingEvent(null); setShowCreate(true) }
  const saveEvent = (event) => {
    setEvents((current) => current.some((item) => item.id === event.id) ? current.map((item) => item.id === event.id ? event : item) : [event, ...current])
    setShowCreate(false)
    setEditingEvent(null)
    setSelectedEvent(null)
    setActiveNav('Events')
  }
  const removeEvent = (id) => {
    const event = events.find((item) => item.id === id)
    if (!event) return
    const confirmation = copy.confirmDeleteEvent.replace('{title}', event.title)
    if (!window.confirm(confirmation)) return
    setEvents((current) => current.filter((event) => event.id !== id))
    setSelectedEvent(null)
  }
  const saveDirectory = (pageName, nextRow, previousRow) => {
    setDirectories((current) => {
      const rows = current[pageName] || []
      const nextRows = previousRow ? rows.map((row) => row[0] === previousRow[0] ? nextRow : row) : [...rows, nextRow]
      return { ...current, [pageName]: nextRows }
    })
    setDirectoryModal(null)
  }
  const removeDirectory = (pageName, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    setDirectories((current) => ({ ...current, [pageName]: (current[pageName] || []).filter((row) => row[0] !== name) }))
  }
  const login = () => { window.localStorage.setItem('allure-auth', JSON.stringify({ loggedIn: true, issuedAt: Date.now() })); setAuthenticated(true) }
  const logout = () => { window.localStorage.removeItem('allure-auth'); setAuthenticated(false) }
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify({ events, directories }, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'allure-events-data.json'
    link.click()
    URL.revokeObjectURL(link.href)
  }, [events, directories])
  const importData = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!Array.isArray(data.events) || !data.directories) throw new Error('Invalid data')
        setEvents(data.events)
        setDirectories(data.directories)
      } catch {
        setDataError('The selected JSON file is invalid or has an unsupported structure.')
      }
    }
    reader.onerror = () => setDataError('The selected file could not be read.')
    reader.readAsText(file)
  }, [])
  const resetData = useCallback(() => {
    if (!window.confirm('Reset all demo data?')) return
    setEvents(mockData.events)
    setDirectories(mockData.directoryRows)
    window.localStorage.removeItem(storageKeys.events)
    window.localStorage.removeItem(storageKeys.directories)
  }, [])
  const globalResults = useMemo(() => {
    const query = globalQuery.trim().toLowerCase()
    if (!query) return []
    const matches = []
    events.forEach((event) => {
      const searchable = `${event.title} ${event.client || ''} ${event.venue || ''} ${event.phone || ''}`.toLowerCase()
      if (searchable.includes(query)) matches.push({ type: 'Event', title: event.title, detail: `${event.client || 'Client not specified'} · ${event.venue || 'Venue not specified'}`, event })
    })
    Object.entries(directories).forEach(([pageName, rows]) => {
      rows.forEach((row) => {
        if (row.join(' ').toLowerCase().includes(query)) matches.push({ type: pageName, title: row[0], detail: `${row[1] || ''} · ${row[2] || ''}`, pageName, row })
      })
    })
    return matches.slice(0, 8)
  }, [directories, events, globalQuery])
  const selectGlobalResult = (result) => {
    setGlobalQuery('')
    if (result.event) {
      setActiveNav('Events')
      setSelectedEvent(result.event)
      return
    }
    setActiveNav(result.pageName)
  }
  const page = useMemo(() => {
    if (activeNav === 'Dashboard') return <DashboardPage events={events} directories={directories} onCreate={openCreate} onViewArchive={() => setActiveNav('Events')} />
    if (activeNav === 'Events') return <EventsPage events={events} onCreate={openCreate} onSelect={setSelectedEvent} />
    if (activeNav === 'Bookings') return <BookingsPage events={events} onCreate={openCreate} onSelect={setSelectedEvent} />
    if (activeNav === 'Settings') return <SettingsPage onExport={exportData} onImport={importData} onReset={resetData} language={language} onLanguageChange={setLanguage} />
    return <DirectoryPage page={activeNav} rows={directories[activeNav] || []} onCreate={(row) => setDirectoryModal({ page: activeNav, row })} onDelete={(name) => removeDirectory(activeNav, name)} />
  }, [activeNav, directories, events, exportData, importData, resetData, language])
  useEffect(() => { window.localStorage.setItem(languageKey, JSON.stringify(language)) }, [language])
  if (!authenticated) return <LoginPage onLogin={login} language={language} />
  if (isLoading) return <div className="app-state-screen"><LoadingState message="Loading workspace..." /></div>
  return <div className={`app-shell ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}><aside className="sidebar"><div className="brand"><img src={logo} alt="Allure Events" /><div><strong>ALLURE EVENTS</strong><small>MAKE IT UNFORGETTABLE</small></div></div><nav className="main-nav" aria-label="Main navigation">{navigation.map(([icon, label]) => <button className={activeNav === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => setActiveNav(label)}><span className="nav-icon">{icon}</span><span>{copy[label.toLowerCase()]}</span></button>)}</nav><div className="sidebar-quote"><div className="leaf-decoration">⌁</div><em>{language === 'ar' ? <>لحظات جميلة<br />مخططة بعناية.</> : <>Beautiful moments<br />well planned.</>}</em></div></aside><main className="main-content"><header className="topbar"><div className="global-search-wrap"><div className="search-global"><span>⌕</span><input value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setGlobalQuery('') }} placeholder={copy.search} aria-label={copy.search} /></div>{globalQuery.trim() && <div className="global-search-results">{globalResults.length ? globalResults.map((result) => <button className="global-search-result" key={`${result.type}-${result.title}`} onClick={() => selectGlobalResult(result)}><span className="global-result-type">{result.type}</span><strong>{result.title}</strong><small>{result.detail}</small></button>) : <div className="global-search-empty">No matching records found.</div>}</div>}</div><div className="profile-area"><button className="icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)}>♧<i /></button>{showNotifications && <div className="notification-popover"><strong>{copy.notifications}</strong><p>{language === 'ar' ? 'تم استلام طلب جديد لحفل سارة وأحمد.' : "New inquiry received for Sarah & Ahmad's Wedding."}</p></div>}<button className="avatar profile-avatar" onClick={logout}>IT</button><div className="profile-copy"><strong>Ibraheem Touma</strong><small>{copy.officeAdmin}</small></div><span className="chevron">⌄</span></div></header>{dataError && <ErrorState message={dataError} onDismiss={() => setDataError('')} />}<div key={`${activeNav}-${language}`} className="page-transition">{page}</div></main>{showCreate && <CreateDossier venues={venues} existingEvents={events} initialEvent={editingEvent} onClose={() => { setShowCreate(false); setEditingEvent(null) }} onSave={saveEvent} />}{selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} onEdit={(event) => { setSelectedEvent(null); setEditingEvent(event); setShowCreate(true) }} onDelete={removeEvent} />}{directoryModal && <DirectoryForm page={directoryModal.page} initialRow={directoryModal.row} onClose={() => setDirectoryModal(null)} onSave={(row) => saveDirectory(directoryModal.page, row, directoryModal.row)} />}</div>
}

export default App
