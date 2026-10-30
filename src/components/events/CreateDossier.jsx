import { useState } from 'react'
import { FinanceBadge, Modal } from '../ui'
import { artTypes, dateInputValue, eventDateKey } from '../../utils/eventUtils'

function CreateDossier({ onClose, onSave, venues, staff, existingEvents = [], initialEvent = null }) {
  const [template, setTemplate] = useState(initialEvent?.template || 'Wedding')
  const [form, setForm] = useState({
    name: initialEvent?.title || '', client: initialEvent?.client || '', phone: initialEvent?.phone || '',
    date: dateInputValue(initialEvent?.date), venue: initialEvent?.venue || '', total: initialEvent?.total || 0,
    deposit: initialEvent?.deposit || 0, time: initialEvent?.time === 'To be confirmed' ? '' : initialEvent?.time || '',
    guests: initialEvent?.guests || 0,
  })
  const [services, setServices] = useState(initialEvent?.services || [])
  const [accessories, setAccessories] = useState(initialEvent?.accessories || [])
  const [assignments, setAssignments] = useState(initialEvent?.tasksList || [])
  const [conflict, setConflict] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const serviceOptions = template === 'Wedding' ? ['زينة', 'مطرب', 'تصوير', 'ديجي', 'إضاءة', 'تنظيم', 'ألعاب نارية', 'طبّال'] : ['أنظمة الصوت والمسرح', 'الشاشات التفاعلية', 'شاشات LED', 'الضيافة', 'التغطية الإعلامية', 'تجهيزات VIP']
  const weddingAccessories = ['كيك داي دريم', 'سلة النقوط', 'الجرة', 'العجينة', 'كاسات', 'سيارة العروس', 'حنة', 'حمالة المحابس', 'سلة قرمش']
  const toggle = (item, list, setter) => setter(list.includes(item) ? list.filter((value) => value !== item) : [...list, item])
  const addAssignment = () => setAssignments((items) => [...items, { title: '', assignee: '', deadline: '', status: 'Pending' }])
  const updateAssignment = (index, key, value) => setAssignments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  const removeAssignment = (index) => setAssignments((items) => items.filter((_, itemIndex) => itemIndex !== index))
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
    onSave({ ...initialEvent, id: initialEvent?.id || Date.now(), title: form.name.trim(), date: new Date(`${form.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), time: form.time || 'To be confirmed', venue: form.venue, guests: Number(form.guests) || 0, status: initialEvent?.status || 'Planning', tone: initialEvent?.tone || 'gold', art: initialEvent?.art || artTypes[0], template, total, deposit, balance, paymentStatus, client: form.client.trim(), phone: form.phone.trim(), services, accessories, tasksList: assignments })
  }
  return <Modal title={initialEvent ? 'تعديل الإضبارة' : 'إنشاء إضبارة جديدة'} onClose={onClose} wide><form className="dossier-form" onSubmit={submit} dir="rtl">
    <p className="modal-subtitle">اختر القالب وأدخل تفاصيل الحفل والموظفين والماليات.</p>
    {conflict && <div className="form-error">{conflict}</div>}
    <div className="template-tabs"><button type="button" className={template === 'Wedding' ? 'selected' : ''} onClick={() => setTemplate('Wedding')}>💍 أعراس ومناسبات عائلية</button><button type="button" className={template === 'General Event' ? 'selected' : ''} onClick={() => setTemplate('General Event')}>✦ فعالية عامة / شركة</button></div>
    <div className="form-section"><h3>البيانات الأساسية</h3><div className="form-grid">
      <label>{template === 'Wedding' ? 'اسم الحفل' : 'اسم الجهة / المؤسسة'}<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
      <label>{template === 'Wedding' ? 'العريس والعروس' : 'عنوان الفعالية'}<input value={form.client} onChange={(event) => update('client', event.target.value)} /></label>
      <label>رقم الهاتف<input value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label>
      <label>التاريخ<input required type="date" value={form.date} onChange={(event) => update('date', event.target.value)} /></label>
      <label>القاعة / المكان<select required value={form.venue} onChange={(event) => update('venue', event.target.value)}><option value="">اختر من الدليل</option>{venues.map((venue) => { const name = venue?.name || venue?.[0] || ''; return <option key={venue?.id || name} value={name}>{name}</option> })}</select></label>
      <label>الساعة<input type="time" value={form.time} onChange={(event) => update('time', event.target.value)} /></label>
      {template === 'General Event' && <label>عدد الحضور المتوقع<input type="number" min="0" value={form.guests} onChange={(event) => update('guests', event.target.value)} /></label>}
    </div></div>
    <div className="form-section"><h3>الموظفون المشاركون</h3><div className="assignment-editor"><button type="button" className="secondary-button" onClick={addAssignment}>＋ إضافة موظف</button>{assignments.map((assignment, index) => <div className="assignment-row" key={index}><select required aria-label="الموظف" value={assignment.assignee || ''} onChange={(event) => updateAssignment(index, 'assignee', event.target.value)}><option value="">اختر موظفاً متاحاً</option>{staff.filter((member) => member.status === 'Available' || member.name === assignment.assignee).map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}</select><input required placeholder="ماذا سيعمل؟" value={assignment.title || ''} onChange={(event) => updateAssignment(index, 'title', event.target.value)} /><input required type="date" value={assignment.deadline || ''} onChange={(event) => updateAssignment(index, 'deadline', event.target.value)} /><button type="button" className="danger-button" onClick={() => removeAssignment(index)}>×</button></div>)}</div></div>
    <div className="form-section"><h3>الخدمات والتجهيزات</h3><div className="check-grid">{serviceOptions.map((item) => <label className="check-option" key={item}><input type="checkbox" checked={services.includes(item)} onChange={() => toggle(item, services, setServices)} />{item}</label>)}</div>{template === 'Wedding' && <><h4>ملحقات الأعراس</h4><div className="check-grid">{weddingAccessories.map((item) => <label className="check-option" key={item}><input type="checkbox" checked={accessories.includes(item)} onChange={() => toggle(item, accessories, setAccessories)} />{item}</label>)}</div></>}</div>
    <div className="form-section"><h3>الماليات</h3><div className="form-grid"><label>إجمالي التكلفة<input type="number" min="0" value={form.total} onChange={(event) => update('total', event.target.value)} /></label><label>العربون المستلم<input type="number" min="0" max={total} value={form.deposit} onChange={(event) => update('deposit', event.target.value)} /></label><div className="finance-preview"><span>المبلغ المتبقي</span><strong>${balance.toLocaleString()}</strong><FinanceBadge status={paymentStatus} /></div></div></div>
    <div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>إلغاء</button><button className="create-button">{initialEvent ? 'حفظ التعديلات' : 'حفظ الإضبارة'}</button></div>
  </form></Modal>
}

export default CreateDossier
