import mockData from '../data/mockData.json'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const directoryResources = {
  Clients: 'clients',
  Venues: 'venues',
  Vendors: 'vendors',
  Staff: 'staff',
}

function normalizeLegacyRow(pageName, row, index) {
  if (!Array.isArray(row)) return row
  const [name, category, contact, status] = row
  return {
    id: `${pageName.toLowerCase()}-${index + 1}`,
    name,
    category,
    contact,
    email: contact?.includes('@') ? contact : '',
    phone: '',
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`Fake API request failed (${response.status}).`)
  }
  return response.status === 204 ? null : response.json()
}

async function saveResource(resource, value) {
  const existing = value.id && (await request(`/${resource}/${value.id}`).catch(() => null))
  const method = existing ? 'PUT' : 'POST'
  const path = existing ? `/${resource}/${value.id}` : `/${resource}`
  return request(path, { method, body: JSON.stringify(value) })
}

async function getDirectories() {
  const entries = await Promise.all(Object.entries(directoryResources).map(async ([pageName, resource]) => {
    const rows = await request(`/${resource}`)
    return [pageName, rows]
  }))
  return Object.fromEntries(entries)
}

const fakeApi = {
  getEvents: () => request('/events'),
  getDirectories,
  saveEvent: (event) => saveResource('events', event),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  saveDirectory: (pageName, row) => saveResource(directoryResources[pageName], row),
  deleteDirectory: (pageName, id) => request(`/${directoryResources[pageName]}/${id}`, { method: 'DELETE' }),
  replaceData: async (events, directories) => {
    await Promise.all([
      ...events.map((event) => saveResource('events', event)),
      ...Object.entries(directoryResources).flatMap(([pageName, resource]) => (
        (directories[pageName] || []).map((row) => saveResource(resource, row))
      )),
    ])
  },
  reset: async () => {
    const events = mockData.events || []
    const directories = Object.fromEntries(Object.entries(directoryResources).map(([pageName]) => [
      pageName,
      (mockData.directoryRows?.[pageName] || []).map((row, index) => normalizeLegacyRow(pageName, row, index)),
    ]))
    return fakeApi.replaceData(events, directories)
  },
}

export default fakeApi
