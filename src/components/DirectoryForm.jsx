import { useState } from 'react'
import { Modal } from './ui'

export default function DirectoryForm({ page, initialRow, events = [], onClose, onSave }) {
  const [name, setName] = useState(initialRow?.name || '')
  const [category, setCategory] = useState(initialRow?.category || '')
  const [contact, setContact] = useState(initialRow?.contact || '')
  const [email, setEmail] = useState(initialRow?.email || '')
  const [phone, setPhone] = useState(initialRow?.phone || '')
  const [status, setStatus] = useState(initialRow?.status || 'Active')
  const [eventId, setEventId] = useState(initialRow?.eventId || '')
  const submit = (event) => {
    event.preventDefault()
    if (name.trim()) onSave({ id: initialRow?.id, name: name.trim(), category: category.trim(), contact: contact.trim(), email: email.trim(), phone: phone.trim(), status, eventId: page === 'Staff' ? eventId : initialRow?.eventId || '' })
  }
  return <Modal title={`${initialRow ? 'Edit' : 'Add'} ${page}`} onClose={onClose}><form className="simple-form" onSubmit={submit}><label>Name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Category / role<input value={category} onChange={(event) => setCategory(event.target.value)} /></label>{page === 'Staff' && <label>Event assignment<select value={eventId} onChange={(event) => setEventId(event.target.value)}><option value="">Select an event</option>{events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}<label>Contact / assignment<input value={contact} onChange={(event) => setContact(event.target.value)} /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Active</option><option>Available</option><option>Assigned</option><option>Booked</option><option>Review</option></select></label><div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="create-button">Save</button></div></form></Modal>
}
