export const artTypes = ['wedding', 'engagement', 'gala', 'garden', 'birthday', 'meeting', 'party']
export const eventTypes = ['All Types', 'Wedding', 'General Event', 'Engagement']

export function directoryId(pageName, name, index) {
  const slug = String(name || 'record').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${pageName.toLowerCase()}-${slug || 'record'}-${index + 1}`
}

function timestamp(value) {
  return value || new Date().toISOString()
}

function normalizeTask(task, eventId, index) {
  return {
    id: task?.id || `${eventId}-task-${index + 1}`,
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee || '',
    deadline: task?.deadline || '',
    status: task?.status || 'Pending',
    createdAt: timestamp(task?.createdAt),
    updatedAt: timestamp(task?.updatedAt),
  }
}

function normalizeEvent(event, index) {
  const id = event?.id || `event-${index + 1}`
  const deposit = Math.max(0, Number(event?.deposit) || 0)
  const payments = Array.isArray(event?.payments) ? event.payments.map((payment, paymentIndex) => ({
    id: payment.id || `${id}-payment-${paymentIndex + 1}`,
    amount: Math.max(0, Number(payment.amount) || 0),
    method: payment.method || 'Unspecified',
    date: payment.date || event.date || '',
    note: payment.note || '',
    createdAt: timestamp(payment.createdAt),
    updatedAt: timestamp(payment.updatedAt),
  })) : (deposit > 0 ? [{ id: `${id}-payment-1`, amount: deposit, method: 'Unspecified', date: event.date || '', note: 'Initial deposit', createdAt: timestamp(event.createdAt), updatedAt: timestamp(event.updatedAt) }] : [])
  return {
    ...event,
    id,
    title: event?.title || '',
    client: event?.client || '',
    phone: event?.phone || '',
    status: event?.status || 'Draft',
    total: Math.max(0, Number(event?.total) || 0),
    deposit,
    tasksList: (Array.isArray(event?.tasksList) ? event.tasksList : []).map((task, taskIndex) => normalizeTask(task, id, taskIndex)),
    payments,
    createdAt: timestamp(event?.createdAt),
    updatedAt: timestamp(event?.updatedAt),
  }
}

function normalizeEvents(value) {
  return (Array.isArray(value) ? value : []).map(normalizeEvent)
}

function normalizeDirectories(value) {
  return Object.fromEntries(Object.entries(value || {}).map(([pageName, rows]) => [
    pageName,
    (Array.isArray(rows) ? rows : []).map((row, index) => Array.isArray(row)
      ? { id: directoryId(pageName, row[0], index), name: row[0] || '', category: row[1] || '', contact: row[2] || '', email: row[2]?.includes('@') ? row[2] : '', phone: row[2]?.includes('@') ? '' : row[2] || '', status: row[3] || 'Active', createdAt: timestamp(), updatedAt: timestamp() }
      : { ...row, id: row.id || directoryId(pageName, row.name, index), name: row.name || '', category: row.category || '', contact: row.contact || '', email: row.email || '', phone: row.phone || '', status: row.status || 'Active', createdAt: timestamp(row.createdAt), updatedAt: timestamp(row.updatedAt) })
  ]))
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

export { timestamp, normalizeTask, normalizeEvent, normalizeEvents, normalizeDirectories, dateInputValue, eventDateKey, parseEventDate, formatMonth, calendarCells, getWeekStart }
