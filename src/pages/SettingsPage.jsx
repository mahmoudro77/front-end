import { useState } from 'react'
import logo from '../assets/logo.jpg'

const defaultEmail = 'admin@allureevents.com'

export default function SettingsPage({ language, onLanguageChange, copy }) {
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const ar = language === 'ar'
  const text = copy || (ar ? {
    title: 'الإعدادات',
    description: 'إدارة بيانات دخول حساب المدير وإعدادات اللغة.',
    account: 'حساب المدير',
    adminName: 'admin',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور الجديدة',
    company: 'اسم الشركة',
    companyName: 'Allure Events',
    language: 'لغة الواجهة',
    arabic: 'العربية',
    english: 'English',
    save: 'حفظ التغييرات',
    saved: 'تم حفظ التغييرات بنجاح.',
    show: 'إظهار',
    hide: 'إخفاء',
  } : {
    title: 'Settings',
    description: 'Manage the administrator login details and interface language.',
    account: 'Administrator account',
    adminName: 'admin',
    email: 'Email address',
    password: 'New password',
    company: 'Company name',
    companyName: 'Allure Events',
    language: 'Interface language',
    arabic: 'العربية',
    english: 'English',
    save: 'Save changes',
    saved: 'Changes saved successfully.',
    show: 'Show',
    hide: 'Hide',
  })
  const [showPassword, setShowPassword] = useState(false)

  const save = (event) => {
    event.preventDefault()
    setSaved(true)
    setPassword('')
  }

  return <section className="content module-content settings-page">
    <div className="module-heading">
      <div>
        <span className="eyebrow">{text.account}</span>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </div>
    </div>
    <div className="settings-layout">
      <div className="card settings-identity">
        <img src={logo} alt="Allure Events" />
        <strong>{text.companyName}</strong>
        <span>{text.adminName}</span>
      </div>
      <form className="card settings-form" onSubmit={save}>
        <h2>{text.account}</h2>
        <div className="form-grid">
          <label>{text.adminName}<input value={text.adminName} readOnly /></label>
          <label>{text.company}<input value={text.companyName} readOnly /></label>
          <label>{text.email}<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSaved(false) }} required /></label>
          <label>{text.password}<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setSaved(false) }} placeholder="••••••••" minLength="6" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? text.hide : text.show}</button></div></label>
        </div>
        <div className="language-setting">
          <span>{text.language}</span>
          <div className="language-switch">
            <button type="button" className={ar ? 'selected' : ''} onClick={() => onLanguageChange('ar')}>{text.arabic}</button>
            <button type="button" className={!ar ? 'selected' : ''} onClick={() => onLanguageChange('en')}>{text.english}</button>
          </div>
        </div>
        <div className="settings-actions">
          <span>{saved ? text.saved : ''}</span>
          <button className="create-button">{text.save}</button>
        </div>
      </form>
    </div>
  </section>
}
