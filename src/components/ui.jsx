export function EventArt({ type = 'wedding' }) {
  return <div className={`event-art art-${type}`} aria-hidden="true"><span>{type === 'wedding' || type === 'engagement' ? '✦' : type === 'gala' || type === 'party' ? '✧' : '❋'}</span></div>
}

export function Modal({ title, children, onClose, wide = false }) {
  return <div className="modal-backdrop" onClick={onClose}><div className={`modal ${wide ? 'modal-wide' : ''}`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button>{title && <h2>{title}</h2>}{children}</div></div>
}

const paymentTypes = { PAID: ['Paid', 'sage'], PARTIAL: ['Partial payment', 'gold'], UNPAID: ['Unpaid', 'red'] }

export function FinanceBadge({ status }) {
  const [label, tone] = paymentTypes[status] || paymentTypes.PARTIAL
  return <span className={`status status-${tone}`}>{label}</span>
}
