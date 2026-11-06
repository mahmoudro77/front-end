<<<<<<< HEAD
=======
import { useEffect, useId, useRef } from 'react'

>>>>>>> eeca1c3 (edit)
export function EventArt({ type = 'wedding' }) {
  return <div className={`event-art art-${type}`} aria-hidden="true"><span>{type === 'wedding' || type === 'engagement' ? '✦' : type === 'gala' || type === 'party' ? '✧' : '❋'}</span></div>
}

export function Modal({ title, children, onClose, wide = false }) {
<<<<<<< HEAD
  return <div className="modal-backdrop" onClick={onClose}><div className={`modal ${wide ? 'modal-wide' : ''}`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button>{title && <h2>{title}</h2>}{children}</div></div>
=======
  const titleId = useId()
  const closeRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return <div className="modal-backdrop" onClick={onClose}>
    <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} onClick={(event) => event.stopPropagation()}>
      <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
      {title && <h2 id={titleId}>{title}</h2>}
      {children}
    </div>
  </div>
>>>>>>> eeca1c3 (edit)
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
