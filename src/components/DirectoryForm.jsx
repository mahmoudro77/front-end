import { useState } from 'react'
import { Modal } from './ui'

export default function DirectoryForm({ page, initialRow, onClose, onSave }) {
  const [name, setName] = useState(initialRow?.[0] || '')
  const [category, setCategory] = useState(initialRow?.[1] || '')
  const [contact, setContact] = useState(initialRow?.[2] || '')
  const [status, setStatus] = useState(initialRow?.[3] || 'Active')
  const submit = (event) => {
    event.preventDefault()
    if (name.trim()) onSave([name.trim(), category.trim(), contact.trim(), status])
  }
  return <Modal title={`${initialRow ? 'Edit' : 'Add'} ${page}`} onClose={onClose}><form className="simple-form" onSubmit={submit}><label>Name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Category / role<input value={category} onChange={(event) => setCategory(event.target.value)} /></label><label>Contact / assignment<input value={contact} onChange={(event) => setContact(event.target.value)} /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Active</option><option>Available</option><option>Assigned</option><option>Booked</option><option>Review</option></select></label><div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="create-button">Save</button></div></form></Modal>
}
