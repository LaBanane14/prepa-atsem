'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [sliding, setSliding] = useState('')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Signup state
  const [firstname, setFirstname] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showSignupPass, setShowSignupPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const checks = {
    len: signupPassword.length >= 8,
    upper: /[A-Z]/.test(signupPassword),
    num: /[0-9]/.test(signupPassword),
    spec: /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword)
  }
  const allValid = Object.values(checks).every(Boolean)
  const matches = signupPassword === confirmPassword && signupPassword !== ''
  const canSubmit = allValid && matches && firstname && signupEmail

  function switchTo(target) {
    if (target === mode) return
    setSliding(target === 'signup' ? 'slide-left' : 'slide-right')
    setTimeout(() => {
      setMode(target)
      setSliding(target === 'signup' ? 'slide-in-right' : 'slide-in-left')
      setTimeout(() => setSliding(''), 400)
    }, 300)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    setLoginLoading(false)
    if (error) setLoginError('Email ou mot de passe incorrect.')
    else window.location.href = '/dashboard'
  }

  async function handleSignup(e) {
    e.preventDefault()
    setSignupError('')
    setSignupLoading(true)
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { first_name: firstname } }
    })
    setSignupLoading(false)
    if (error) setSignupError(error.message)
    else setSignupSuccess(true)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    })
  }

  const EyeOpen = <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  const EyeClosed = <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  const GoogleIcon = <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
  const LockIcon = <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  const MailIcon = <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  const UserIcon = <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  const CheckCircle = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path strokeLinecap="round" strokeLinejoin="round" d="M22 4 12 14.01l-3-3"/></svg>

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(ellipse at 0% 0%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(251,191,36,0.13), transparent 60%), radial-gradient(ellipse at 50% -10%, rgba(236,72,153,0.10), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(14,165,233,0.10), transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(236,72,153,0.14), transparent 60%)' }}>
        <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Vérifiez votre email</h2>
          <p className="text-slate-500 font-medium">Un lien de confirmation a été envoyé à <strong className="text-slate-800">{signupEmail}</strong>.</p>
          <button onClick={() => { setSignupSuccess(false); switchTo('login') }} className="inline-block mt-6 bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer">Aller à la connexion</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-900 flex items-center justify-center p-4 selection:bg-purple-200" style={{ backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(ellipse at 0% 0%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(251,191,36,0.13), transparent 60%), radial-gradient(ellipse at 50% -10%, rgba(236,72,153,0.10), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(14,165,233,0.10), transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(236,72,153,0.14), transparent 60%)' }}>
      <style>{`
        @keyframes slideLeft { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(-80px) scale(.96) } }
        @keyframes slideRight { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(80px) scale(.96) } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(80px) scale(.96) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-80px) scale(.96) } to { opacity:1; transform:translateX(0) } }
        .slide-left { animation: slideLeft .3s cubic-bezier(.55,.06,.68,.19) forwards }
        .slide-right { animation: slideRight .3s cubic-bezier(.55,.06,.68,.19) forwards }
        .slide-in-right { animation: slideInRight .4s cubic-bezier(.22,1,.36,1) forwards }
        .slide-in-left { animation: slideInLeft .4s cubic-bezier(.22,1,.36,1) forwards }
      `}</style>

      <div className={`bg-white max-w-md w-full rounded-3xl shadow-2xl relative z-10 p-8 sm:p-10 border border-slate-100 ${sliding}`}>
        <a href="/" className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition bg-slate-50 hover:bg-[#eceef1] p-2 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </a>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-purple-800 text-white p-2 rounded-2xl shadow-sm mb-4">
            <svg className="w-8 h-8" viewBox="2 -2 36 26" fill="currentColor"><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1 text-center">
            {mode === 'login' ? 'Connectez-vous' : 'Débutez votre essai de 7 jours'}
          </h1>
          <p className="text-slate-500 font-medium text-center">
            {mode === 'login' ? "pour accéder à votre espace d'entraînement." : 'Commencez votre entraînement pour le concours ATSEM.'}
          </p>
        </div>

        <button type="button" onClick={handleGoogle} className="w-full bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-base py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 mb-6">
          {GoogleIcon} {mode === 'login' ? 'Continuer avec Google' : "S'inscrire avec Google"}
        </button>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">ou par email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {mode === 'login' ? (
          <>
            {loginError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-3 rounded-xl mb-4">{loginError}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{MailIcon}</div>
                  <input type="email" required placeholder="marie@email.fr" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition font-medium"/>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Mot de passe</label>
                  <a href="/forgot-password" className="text-xs font-bold text-purple-800 hover:text-purple-900 transition">Oublié ?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{LockIcon}</div>
                  <input type={showLoginPass?"text":"password"} required placeholder="••••••••" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition font-medium"/>
                  <button type="button" onClick={()=>setShowLoginPass(!showLoginPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition">{showLoginPass?EyeClosed:EyeOpen}</button>
                </div>
              </div>
              <button type="submit" disabled={loginLoading} className="w-full bg-slate-900 hover:bg-black text-white font-bold text-lg py-4 rounded-xl mt-2 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group">
                {loginLoading?'Connexion en cours...':'Se connecter'}
                {!loginLoading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>}
              </button>
            </form>
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-slate-500 font-medium text-sm">Pas encore de compte ? <button onClick={()=>switchTo('signup')} className="text-purple-800 font-bold hover:text-purple-900 transition ml-1 cursor-pointer">S'inscrire gratuitement</button></p>
            </div>
          </>
        ) : (
          <>
            {signupError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-3 rounded-xl mb-4">{signupError}</div>}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Prénom</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{UserIcon}</div>
                  <input type="text" required placeholder="Marie" value={firstname} onChange={e=>setFirstname(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition font-medium"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{MailIcon}</div>
                  <input type="email" required placeholder="marie@email.fr" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition font-medium"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{LockIcon}</div>
                  <input type={showSignupPass?"text":"password"} required placeholder="••••••••" value={signupPassword} onChange={e=>setSignupPassword(e.target.value)} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition font-medium"/>
                  <button type="button" onClick={()=>setShowSignupPass(!showSignupPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition">{showSignupPass?EyeClosed:EyeOpen}</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs font-bold">
                  <div className={`flex items-center gap-1.5 transition-colors ${checks.len?'text-purple-800':'text-slate-400'}`}>{CheckCircle} 8+ caractères</div>
                  <div className={`flex items-center gap-1.5 transition-colors ${checks.upper?'text-purple-800':'text-slate-400'}`}>{CheckCircle} 1 Majuscule</div>
                  <div className={`flex items-center gap-1.5 transition-colors ${checks.num?'text-purple-800':'text-slate-400'}`}>{CheckCircle} 1 Chiffre</div>
                  <div className={`flex items-center gap-1.5 transition-colors ${checks.spec?'text-purple-800':'text-slate-400'}`}>{CheckCircle} 1 Caractère spécial</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{LockIcon}</div>
                  <input type={showConfirm?"text":"password"} required placeholder="••••••••" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition font-medium"/>
                  <button type="button" onClick={()=>setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition">{showConfirm?EyeClosed:EyeOpen}</button>
                </div>
                {confirmPassword && !matches && <p className="text-xs text-purple-800 font-bold mt-1.5">Les mots de passe ne correspondent pas.</p>}
              </div>
              <button type="submit" disabled={!canSubmit||signupLoading} className={`w-full font-bold text-lg py-4 rounded-xl mt-2 transition-all shadow-lg flex items-center justify-center gap-2 ${canSubmit&&!signupLoading?'bg-slate-900 hover:bg-black text-white shadow-slate-200':'bg-slate-200 text-slate-400 cursor-not-allowed shadow-slate-100'}`}>
                {signupLoading?'Création en cours...':'Créer mon compte'}
              </button>
            </form>
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-slate-500 font-medium text-sm">Déjà un compte ? <button onClick={()=>switchTo('login')} className="text-purple-800 font-bold hover:text-purple-900 transition ml-1 cursor-pointer">Se connecter</button></p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}