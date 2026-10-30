export function EventArt({ type = 'wedding' }) {
  return <div className={`event-art art-${type}`} aria-hidden="true"><span>{type === 'wedding' || type === 'engagement' ? '✦' : type === 'gala' || type === 'party' ? '✧' : '❋'}</span></div>
}

export function Modal({ title, children, onClose, wide = false }) {
  return <div className="modal-backdrop" onClick={onClose}><div className={`modal ${wide ? 'modal-wide' : ''}`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button>{title && <h2>{title}</h2>}{children}</div></div>
}

export function LoadingState({ message = 'Loading...' }) {
  return <div className="state-message state-loading" role="status"><span className="loading-spinner" aria-hidden="true" />{message}</div>
}

export function ErrorState({ message, onDismiss, title = 'Something went wrong', dismissLabel = 'Dismiss' }) {
  return <div className="state-message state-error" role="alert"><strong>{title}</strong><span>{message}</span>{onDismiss && <button type="button" onClick={onDismiss}>{dismissLabel}</button>}</div>
}

export function EmptyState({ message = 'No records found.', title = 'No data yet' }) {
  return <div className="state-message state-empty" role="status"><strong>{title}</strong><span>{message}</span></div>
}

const paymentTypes = { PAID: ['Paid', 'sage'], PARTIAL: ['Partial payment', 'gold'], UNPAID: ['Unpaid', 'red'] }

export function FinanceBadge({ status }) {
  const [label, tone] = paymentTypes[status] || paymentTypes.PARTIAL
  return <span className={`status status-${tone}`}>{label}</span>
}
