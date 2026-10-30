import { useCallback, useEffect, useMemo, useState } from 'react'
import { ErrorState, LoadingState } from './components/ui'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DirectoryPage from './pages/DirectoryPage'
import SettingsPage from './pages/SettingsPage'
import DirectoryForm from './components/DirectoryForm'
import { BookingsPage, CreateDossier, EventDetail, EventsPage } from './components/events'
import fakeApi from './services/fakeApi'
import logo from './assets/logo.jpg'
import './App.css'
import './styles/layout.css'
import './styles/events.css'
import './styles/bookings.css'
import './styles/dossier.css'
import {
  directoryId,
  normalizeDirectories,
  normalizeEvent,
  normalizeEvents,
} from './utils/eventUtils'

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
    title: 'الإعدادات', description: 'إدارة بيانات دخول حساب المدير وإعدادات اللغة.', settingsTitle: 'الإعدادات', settingsDescription: 'إدارة بيانات دخول حساب المدير وإعدادات اللغة.',
    profile: 'معلومات الملف الشخصي', printed: 'الهوية المطبوعة', notifications: 'الإشعارات',
    security: 'الأمان', language: 'لغة الواجهة', arabic: 'العربية', english: 'English',
    export: 'تصدير JSON', import: 'استيراد JSON', reset: 'إعادة بيانات العرض',
    save: 'حفظ التغييرات', saved: 'تم حفظ التغييرات بنجاح.', show: 'إظهار', hide: 'إخفاء',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.', required: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
    confirmDeleteEvent: 'هل أنت متأكد من حذف الإضبارة "{title}"؟ لا يمكن التراجع عن هذا الإجراء.',
    workspace: 'مساحة العمل', selectedSection: 'تم اختيار هذا القسم.', account: 'حساب المدير', adminName: 'admin', company: 'اسم الشركة', companyName: 'Allure Events', changePhoto: 'تغيير الصورة', fullName: 'الاسم الكامل', role: 'الدور الوظيفي', phone: 'رقم الهاتف', newPassword: 'كلمة المرور الجديدة',
    overview: 'نظرة عامة', dashboardDescription: 'متابعة الحجوزات والماليات والعمليات اليومية للمكتب.', createDossier: 'إنشاء إضبارة', eventsThisMonth: 'حفلات هذا الشهر', activeDossiers: 'الإضبارات النشطة', excludingDrafts: 'لا تشمل المسودات والملغاة', expectedRevenue: 'الإيرادات المتوقعة', activeDossiersOnly: 'من الإضبارات النشطة', outstanding: 'المبالغ غير المجمعة', remainingBalances: 'حسب الأرصدة المتبقية', upcomingFive: 'أقرب 5 أحداث قادمة', viewArchive: 'عرض الأرشيف', operationalProgress: 'التقدم التشغيلي', noData: 'لا توجد بيانات', noUpcoming: 'لا توجد أحداث قادمة حالياً.', addDossierForProgress: 'أضف إضبارة لعرض مؤشرات التقدم.', progressLabels: { 'Confirmed events': 'الأحداث المؤكدة', 'Tasks completed': 'المهام المكتملة', 'Invoices collected': 'الفواتير المحصلة', 'Team availability': 'توفر الفريق' }
  },
  en: {
    dashboard: 'Dashboard', events: 'Events', bookings: 'Bookings', clients: 'Clients',
    venues: 'Venues', vendors: 'Vendors', staff: 'Staff', settings: 'Settings',
    search: 'Search events, clients, or venues...', officeAdmin: 'Office Admin',
    loginEyebrow: 'ADMIN LOGIN', loginTitle: 'Welcome to Allure Events',
    loginDescription: 'Manage your events, clients, and team from one place.', email: 'Email address',
    password: 'Password', remember: 'Remember me', forgot: 'Forgot password?',
    login: 'Sign in', secure: 'Admin access · Protected workspace',
    title: 'Settings', description: 'Manage the administrator login details and interface language.', settingsTitle: 'Settings', settingsDescription: 'Manage the administrator login details and interface language.',
    profile: 'Administrator account', printed: 'Printed identity', notifications: 'Notifications',
    security: 'Security', language: 'Interface language', arabic: 'العربية', english: 'English',
    export: 'Export JSON', import: 'Import JSON', reset: 'Reset demo data',
    save: 'Save changes', saved: 'Changes saved successfully.', show: 'Show', hide: 'Hide',
    invalidEmail: 'Please enter a valid email address.', required: 'Please enter your email and password.',
    confirmDeleteEvent: 'Are you sure you want to delete "{title}"? This action cannot be undone.',
    workspace: 'WORKSPACE', selectedSection: 'This section is selected.', account: 'Administrator account', adminName: 'admin', company: 'Company name', companyName: 'Allure Events', changePhoto: 'Change photo', fullName: 'Full name', role: 'Role', phone: 'Phone number', newPassword: 'New password',
    overview: 'OVERVIEW', dashboardDescription: 'Track bookings, finances, and daily office operations.', createDossier: 'Create Dossier', eventsThisMonth: 'Events this month', activeDossiers: 'Active dossiers', excludingDrafts: 'Excludes drafts and cancelled', expectedRevenue: 'Expected revenue', activeDossiersOnly: 'From active dossiers', outstanding: 'Outstanding balance', remainingBalances: 'Based on remaining balances', upcomingFive: 'Next 5 upcoming events', viewArchive: 'View archive', operationalProgress: 'Operational progress', noData: 'No data yet', noUpcoming: 'There are no upcoming events.', addDossierForProgress: 'Add a dossier to see progress metrics.', progressLabels: { 'Confirmed events': 'Confirmed events', 'Tasks completed': 'Tasks completed', 'Invoices collected': 'Invoices collected', 'Team availability': 'Team availability' }
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

function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(readStored('allure-auth', null)))
  const [language, setLanguage] = useState(() => readStored(languageKey, 'en'))
  const copy = useCopy(language)
  const [activeNav, setActiveNav] = useState('Events')
  const [events, setEvents] = useState([])
  const [directories, setDirectories] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [directoryModal, setDirectoryModal] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const venues = directories.Venues || []
  const staff = directories.Staff || []
  useEffect(() => {
    let active = true
    Promise.all([fakeApi.getEvents(), fakeApi.getDirectories()])
      .then(([storedEvents, storedDirectories]) => {
        if (!active) return
        setEvents(normalizeEvents(storedEvents))
        setDirectories(normalizeDirectories(storedDirectories))
      })
      .catch((error) => { if (active) setDataError(error.message) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])
  const openCreate = () => { setEditingEvent(null); setShowCreate(true) }
  const saveEvent = async (payload) => {
    try {
      const event = payload.event || payload
      const savedEvent = normalizeEvent({ ...event, updatedAt: new Date().toISOString(), createdAt: event.createdAt || new Date().toISOString() }, events.length)
      await fakeApi.saveEvent(savedEvent)
      setEvents((current) => {
        const updated = current.map((item) => {
          if (item.id === savedEvent.id) return savedEvent
          return item
        })
        return updated.some((item) => item.id === savedEvent.id) ? updated : [savedEvent, ...updated]
      })
      setShowCreate(false)
      setEditingEvent(null)
      setSelectedEvent(null)
      setActiveNav('Events')
    } catch (error) {
      setDataError(error.message)
    }
  }
  const removeEvent = async (id) => {
    const event = events.find((item) => item.id === id)
    if (!event) return
    const confirmation = copy.confirmDeleteEvent.replace('{title}', event.title)
    if (!window.confirm(confirmation)) return
    try {
      await fakeApi.deleteEvent(id)
      setEvents((current) => current.filter((event) => event.id !== id))
      setSelectedEvent(null)
    } catch (error) {
      setDataError(error.message)
    }
  }
  const saveDirectory = async (pageName, nextRow, previousRow) => {
    const rows = directories[pageName] || []
    const now = new Date().toISOString()
    const savedRow = { ...nextRow, id: previousRow?.id || nextRow.id || directoryId(pageName, nextRow.name, rows.length), createdAt: previousRow?.createdAt || now, updatedAt: now }
    try {
      await fakeApi.saveDirectory(pageName, savedRow)
      const nextRows = previousRow ? rows.map((row) => row.id === previousRow.id ? savedRow : row) : [...rows, savedRow]
      setDirectories((current) => ({ ...current, [pageName]: nextRows }))
      setDirectoryModal(null)
    } catch (error) {
      setDataError(error.message)
    }
  }
  const removeDirectory = useCallback(async (pageName, id) => {
    const row = (directories[pageName] || []).find((item) => item.id === id)
    if (!row || !window.confirm(`Delete ${row.name}?`)) return
    try {
      await fakeApi.deleteDirectory(pageName, id)
      setDirectories((current) => ({ ...current, [pageName]: (current[pageName] || []).filter((item) => item.id !== id) }))
    } catch (error) {
      setDataError(error.message)
    }
  }, [directories])
  const login = () => { window.localStorage.setItem('allure-auth', JSON.stringify({ loggedIn: true, issuedAt: Date.now() })); setAuthenticated(true) }
  const logout = () => { window.localStorage.removeItem('allure-auth'); setAuthenticated(false) }
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
        if (`${row.name} ${row.category} ${row.contact} ${row.email} ${row.phone} ${row.status}`.toLowerCase().includes(query)) matches.push({ type: pageName, title: row.name, detail: `${row.category || ''} · ${row.email || row.phone || row.contact || ''}`, pageName, row })
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
    if (activeNav === 'Dashboard') return <DashboardPage events={events} directories={directories} onCreate={openCreate} onViewArchive={() => setActiveNav('Events')} copy={copy} />
    if (activeNav === 'Events') return <EventsPage events={events} onCreate={openCreate} onSelect={setSelectedEvent} />
    if (activeNav === 'Bookings') return <BookingsPage events={events} onCreate={openCreate} onSelect={setSelectedEvent} />
    if (activeNav === 'Settings') return <SettingsPage language={language} onLanguageChange={setLanguage} copy={copy} />
    return <DirectoryPage page={activeNav} rows={directories[activeNav] || []} onCreate={(row) => setDirectoryModal({ page: activeNav, row })} onDelete={(id) => removeDirectory(activeNav, id)} />
  }, [activeNav, copy, directories, events, language, removeDirectory])
  useEffect(() => { window.localStorage.setItem(languageKey, JSON.stringify(language)) }, [language])
  if (!authenticated) return <LoginPage onLogin={login} language={language} />
  if (isLoading) return <div className="app-state-screen"><LoadingState message="Loading workspace..." /></div>
  return <div className={`app-shell ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}><aside className="sidebar"><div className="brand"><img src={logo} alt="Allure Events" /><div><strong>ALLURE EVENTS</strong><small>MAKE IT UNFORGETTABLE</small></div></div><nav className="main-nav" aria-label="Main navigation">{navigation.map(([icon, label]) => <button className={activeNav === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => setActiveNav(label)}><span className="nav-icon">{icon}</span><span>{copy[label.toLowerCase()]}</span></button>)}</nav><div className="sidebar-quote"><div className="leaf-decoration">⌁</div><em>{language === 'ar' ? <>لحظات جميلة<br />مخططة بعناية.</> : <>Beautiful moments<br />well planned.</>}</em></div></aside><main className="main-content"><header className="topbar"><div className="global-search-wrap"><div className="search-global"><span>⌕</span><input value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setGlobalQuery('') }} placeholder={copy.search} aria-label={copy.search} /></div>{globalQuery.trim() && <div className="global-search-results">{globalResults.length ? globalResults.map((result) => <button className="global-search-result" key={`${result.type}-${result.title}`} onClick={() => selectGlobalResult(result)}><span className="global-result-type">{result.type}</span><strong>{result.title}</strong><small>{result.detail}</small></button>) : <div className="global-search-empty">No matching records found.</div>}</div>}</div><div className="profile-area"><button className="icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)}>♧<i /></button>{showNotifications && <div className="notification-popover"><strong>{copy.notifications}</strong><p>{language === 'ar' ? 'تم استلام طلب جديد لحفل سارة وأحمد.' : "New inquiry received for Sarah & Ahmad's Wedding."}</p></div>}<button className="avatar profile-avatar" onClick={logout}>IT</button><div className="profile-copy"><strong>Ibraheem Touma</strong><small>{copy.officeAdmin}</small></div><span className="chevron">⌄</span></div></header>{dataError && <ErrorState message={dataError} onDismiss={() => setDataError('')} />}<div key={`${activeNav}-${language}`} className="page-transition">{page}</div></main>{showCreate && <CreateDossier venues={venues} staff={staff} existingEvents={events} initialEvent={editingEvent} onClose={() => { setShowCreate(false); setEditingEvent(null) }} onSave={saveEvent} />}{selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} onEdit={(event) => { setSelectedEvent(null); setEditingEvent(event); setShowCreate(true) }} onDelete={removeEvent} />}{directoryModal && <DirectoryForm page={directoryModal.page} events={events} initialRow={directoryModal.row} onClose={() => setDirectoryModal(null)} onSave={(row) => saveDirectory(directoryModal.page, row, directoryModal.row)} />}</div>
}

export default App
