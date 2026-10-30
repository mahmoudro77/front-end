import { useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { EventArt, FinanceBadge, Modal } from '../ui'

function EventDetail({ event, onClose, onDelete, onEdit }) {
  const printableRef = useRef(null)
  const exportPdf = () => {
    if (!printableRef.current) return
    html2pdf().set({ margin: 0.35, filename: `${event.title.replace(/\s+/g, '-')}.pdf`, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(printableRef.current).save()
  }
  return <Modal title={event.title} onClose={onClose}><div ref={printableRef} className="pdf-dossier"><div className="detail-head"><EventArt type={event.art} /><div><strong>{event.template || 'Wedding'}</strong><small>{event.date} · {event.time} · {event.venue}</small></div><FinanceBadge status={event.paymentStatus || 'PARTIAL'} /></div><div className="detail-grid"><div><span>العميل / الجهة</span><strong>{event.client || '—'}</strong></div><div><span>الهاتف</span><strong>{event.phone || '—'}</strong></div><div><span>إجمالي التكلفة</span><strong>${(event.total || 0).toLocaleString()}</strong></div><div><span>العربون</span><strong>${(event.deposit || 0).toLocaleString()}</strong></div><div><span>المتبقي</span><strong>${(event.balance || 0).toLocaleString()}</strong></div><div><span>الخدمات</span><strong>{event.services?.join('، ') || 'لم تحدد بعد'}</strong></div></div></div><div className="detail-actions"><button className="secondary-button" onClick={exportPdf}>تحميل PDF</button><button className="secondary-button" onClick={() => onEdit(event)}>تعديل</button><button className="danger-button" onClick={() => onDelete(event.id)}>حذف الإضبارة</button></div></Modal>
}


export default EventDetail
