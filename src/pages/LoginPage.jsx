import { useState } from 'react'

const copy = {
  ar: { eyebrow: 'دخول المدير', title: 'مرحباً بك في Allure Events', description: 'أدر حفلاتك وعملاءك وفريقك من مكان واحد.', email: 'البريد الإلكتروني', password: 'كلمة المرور', remember: 'تذكرني', forgot: 'نسيت كلمة المرور؟', login: 'تسجيل الدخول', secure: 'وصول المدير · مساحة عمل محمية', show: 'إظهار', hide: 'إخفاء', invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.', required: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' },
  en: { eyebrow: 'ADMIN LOGIN', title: 'Welcome to Allure Events', description: 'Manage your events, clients, and team from one place.', email: 'Email address', password: 'Password', remember: 'Remember me', forgot: 'Forgot password?', login: 'Sign in', secure: 'Admin access · Protected workspace', show: 'Show', hide: 'Hide', invalidEmail: 'Please enter a valid email address.', required: 'Please enter your email and password.' }
}

export default function LoginPage({ onLogin, language }) {
  const text = copy[language] || copy.en
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!email || !password) return setError(text.required)
    if (!email.includes('@')) return setError(text.invalidEmail)
    onLogin()
  }
  return <div className="login-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <div className="login-art"><div className="login-brand"><div className="brand-mark">A</div><strong>ALLURE EVENTS</strong><small>MAKE IT UNFORGETTABLE</small></div><div className="login-quote">{language === 'ar' ? <><span>لحظات جميلة</span><br /><em>مخططة بعناية.</em></> : <><span>Beautiful moments</span><br /><em>well planned.</em></>}</div></div>
    <form className="login-card" onSubmit={submit}><span className="eyebrow">{text.eyebrow}</span><h1>{text.title}</h1><p>{text.description}</p><label>{text.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@allureevents.com" /></label><label>{text.password}<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? text.hide : text.show}</button></div></label><div className="login-options"><label><input type="checkbox" defaultChecked /> {text.remember}</label><button type="button">{text.forgot}</button></div>{error && <div className="form-error">{error}</div>}<button className="login-submit">{text.login}</button><small className="login-help">{text.secure}</small></form>
  </div>
}
