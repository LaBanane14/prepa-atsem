'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

// Les entraînements et thèmes affichés dans la pile (repris du hero de l'accueil)
const MODULES = [
  { label: 'QCM thématiques', bg: 'linear-gradient(145deg, #a855f7, #9333ea)', ink: '#ffffff', accent: '#9333ea', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg> },
  { label: 'Hygiène & propreté', bg: 'linear-gradient(145deg, #67e8f9, #22d3ee)', ink: '#083344', accent: '#0eb5d4', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg> },
  { label: "Développement de l'enfant", bg: 'linear-gradient(145deg, #f9a8d4, #f472b6)', ink: '#500724', accent: '#ec4899', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg> },
  { label: 'Nutrition', bg: 'linear-gradient(145deg, #bef264, #a3e635)', ink: '#1a2e05', accent: '#65a30d', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg> },
  { label: 'Annales corrigées', bg: 'linear-gradient(145deg, #cbd5e1, #94a3b8)', ink: '#0f172a', accent: '#64748b', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { label: 'Examen blanc', bg: 'linear-gradient(145deg, #fcd34d, #fbbf24)', ink: '#451a03', accent: '#e5a50c', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/></svg> },
  { label: 'Oral', bg: 'linear-gradient(145deg, #6ee7b7, #34d399)', ink: '#064e3b', accent: '#10b981', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg> },
  { label: 'Pédagogie', bg: 'linear-gradient(145deg, #a5b4fc, #818cf8)', ink: '#1e1b4b', accent: '#6366f1', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="7" height="7" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/></svg> },
]

// Orbes de fond qui dérivent et changent de teinte
const Orbes = ({ couleur }) => (
  <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
    <div className="orbe-1 absolute w-44 h-44 rounded-full blur-3xl" style={{top: '14%', left: '12%', background: `${couleur}30`, transition: 'background 1.2s ease'}}></div>
    <div className="orbe-2 absolute w-60 h-60 rounded-full blur-3xl" style={{bottom: '12%', right: '8%', background: `${couleur}26`, transition: 'background 1.2s ease'}}></div>
    <div className="orbe-3 absolute w-32 h-32 rounded-full blur-2xl" style={{top: '60%', left: '20%', background: `${couleur}1e`, transition: 'background 1.2s ease'}}></div>
  </div>
)

// Panneau du mode inscription : le même que la connexion, avec la checklist de l'essai en plus.
// Les ticks suivent la couleur du module affiché (comme les orbes).
function PanneauInscription({ sombre = false }) {
  const [accent, setAccent] = useState(MODULES[0].accent)
  return (
    <div className="flex flex-col items-center">
      <PileModules sombre={sombre} onAccent={setAccent} />
      {/* Checklist de l'essai */}
      <div className={`relative w-[300px] backdrop-blur rounded-2xl ring-1 p-5 mt-9 space-y-3 ${sombre ? 'bg-white/[0.06] ring-white/10' : 'bg-white/70 ring-black/[0.06]'}`}>
        {["7 jours d'essai gratuit", 'Sans carte bancaire', 'Tous les entraînements inclus', 'Résiliable en un clic'].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{background: `${accent}${sombre ? '33' : '1f'}`, transition: 'background 1.2s ease'}}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{transition: 'stroke 1.2s ease'}}><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <span className={`text-[15px] font-medium ${sombre ? 'text-white/75' : 'text-black/65'}`}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// La pile de tuiles seule (réutilisable) : cycle toutes les 2,4s et notifie le module affiché
function PileTuiles({ echelle = 1, marge = '0', onModule }) {
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const onModuleRef = useRef(onModule)
  onModuleRef.current = onModule
  const indexRef = useRef(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaving(true)
      setTimeout(() => {
        const n = (indexRef.current + 1) % MODULES.length
        indexRef.current = n
        setIndex(n)
        onModuleRef.current?.(MODULES[n])
        setLeaving(false)
      }, 420)
    }, 2400)
    return () => clearInterval(interval)
  }, [])
  const mod = MODULES[index]
  return (
    <div aria-hidden="true" style={{transform: `scale(${echelle})`, margin: marge}}>
      <div className="relative w-[88px] h-[88px] mx-auto">
        <div className="absolute inset-0 rounded-[24px] bg-[#ececec]" style={{transform: 'translateY(-14px) scale(0.84)'}}></div>
        <div className="absolute inset-0 rounded-[24px] bg-[#f7f7f7] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" style={{transform: 'translateY(-7px) scale(0.92)'}}></div>
        <div
          key={index}
          className="tuile-entree absolute inset-0 rounded-[24px] flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.14)]"
          style={{
            background: mod.bg,
            transition: leaving ? 'transform 0.42s cubic-bezier(0.55,0.06,0.68,0.19), opacity 0.42s cubic-bezier(0.55,0.06,0.68,0.19)' : 'none',
            transform: leaving ? 'translateY(-34px) scale(0.9)' : undefined,
            opacity: leaving ? 0 : undefined,
          }}
        >
          {mod.icon(mod.ink)}
        </div>
      </div>
    </div>
  )
}

// Pile de modules animée (version agrandie de celle du hero), avec le nom du
// module qui s'affiche dessous dans sa couleur
function PileModules({ sombre = false, onAccent }) {
  const [mod, setMod] = useState(MODULES[0])
  const fondPastille = sombre ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.13)'] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.08)']
  const traitPastille = sombre ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)'
  return (
    <div className="flex flex-col items-center">
      <Orbes couleur={mod.accent} />
      <PileTuiles echelle={1.5} marge="36px 0 48px" onModule={(m) => { setMod(m); onAccent?.(m.accent) }} />
      <p key={mod.label} className="stat-swap text-2xl font-extrabold tracking-tight text-center" style={{color: mod.accent}}>{mod.label}</p>

      {/* Preuve sociale : pastilles des candidats */}
      <div className="mt-10 flex flex-col items-center gap-2.5">
        <div className="flex">
          {[
            [fondPastille[0], traitPastille, <path key="t" d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z M22 10v6 M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>],
            [fondPastille[1], traitPastille, <path key="c" d="M20 6 9 17l-5-5"/>],
            [fondPastille[0], traitPastille, <path key="h" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>],
            [fondPastille[1], traitPastille, <path key="p" d="M12 5v14M5 12h14"/>],
          ].map(([fond, trait, icone], i) => (
            <span key={i} className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 shadow-sm ${sombre ? 'ring-[#0d0d0d]' : 'ring-white'} ${i > 0 ? '-ml-2.5' : ''}`} style={{background: fond}}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={trait} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{icone}</svg>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} className="w-4 h-4" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            ))}
          </span>
          <span className={`text-sm font-extrabold ${sombre ? 'text-white/85' : 'text-black/70'}`}>4,8/5</span>
        </div>
        <p className={`text-sm font-medium text-center max-w-[300px] leading-relaxed ${sombre ? 'text-white/50' : 'text-black/45'}`}>Rejoignez <strong className={`font-extrabold ${sombre ? 'text-white/90' : 'text-black/70'}`}>600 candidats</strong> qui préparent le concours ATSEM avec Prépa ATSEM</p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [sliding, setSliding] = useState('')

  // Connexion
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Inscription
  const [firstname, setFirstname] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showSignupPass, setShowSignupPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  // ?mode=signup dans l'URL → ouvrir directement l'inscription
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'signup') setMode('signup')
  }, [])

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
    setSliding(target === 'signup' ? 'glisse-sortie-g' : 'glisse-sortie-d')
    setTimeout(() => {
      setMode(target)
      setSliding(target === 'signup' ? 'glisse-entree-d' : 'glisse-entree-g')
      setTimeout(() => setSliding(''), 400)
    }, 300)
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!supabase) { setLoginError('Service indisponible.'); return }
    setLoginError('')
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    setLoginLoading(false)
    if (error) setLoginError('Email ou mot de passe incorrect.')
    else window.location.href = '/dashboard'
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!supabase) { setSignupError('Service indisponible.'); return }
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
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    })
  }

  // Mode sombre : toute la page passe sur le fond de la section « Déroulement du concours » en inscription
  const sombre = mode === 'signup'
  const chkOn = sombre ? 'text-purple-400' : 'text-purple-700'
  const chkOff = sombre ? 'text-white/35' : 'text-black/30'

  const EyeOpen = <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  const EyeClosed = <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  const GoogleIcon = <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
  const iconTeinte = sombre ? 'text-white/35' : 'text-black/30'
  const LockIcon = <svg className={`w-5 h-5 ${iconTeinte}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  const MailIcon = <svg className={`w-5 h-5 ${iconTeinte}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  const UserIcon = <svg className={`w-5 h-5 ${iconTeinte}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  const CheckCircle = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path strokeLinecap="round" strokeLinejoin="round" d="M22 4 12 14.01l-3-3"/></svg>

  const inputClass = sombre
    ? "w-full pl-11 py-3.5 bg-white/[0.06] ring-1 ring-white/15 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white/10 outline-none transition font-medium text-white placeholder:text-white/25"
    : "w-full pl-11 py-3.5 bg-black/[0.03] ring-1 ring-black/[0.08] rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition font-medium placeholder:text-black/25"

  const emailValide = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  // Coche qui « pop » quand le champ est correctement rempli
  const FieldCheck = ({ show, decale }) => show ? (
    <div className={`absolute inset-y-0 ${decale ? 'right-11' : 'right-0 pr-3.5'} flex items-center pointer-events-none`}>
      <span className="w-5 h-5 rounded-full bg-purple-700 flex items-center justify-center">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </span>
    </div>
  ) : null

  return (
    <section className={`relative lg:grid lg:grid-cols-2 min-h-screen overflow-hidden ${sombre ? 'bg-[#0d0d0d]' : ''}`}>
      {/* Halos du mode sombre : posés sur la section entière pour un fond continu */}
      {sombre && (
        <>
          <div aria-hidden="true" className="absolute -top-32 -right-24 w-[32rem] h-[24rem] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}
      {/* Brume violette en haut sur mobile (le panneau décoré de droite est masqué) */}
      {!sombre && (
        <div aria-hidden="true" className="lg:hidden absolute inset-x-0 top-0 h-[280px] pointer-events-none" style={{background: 'radial-gradient(ellipse 70% 220px at 50% -40px, rgba(107,33,168,0.14), transparent 70%), radial-gradient(ellipse 45% 200px at 100% 20px, rgba(107,33,168,0.10), transparent 70%)'}}></div>
      )}
      <style>{`
        @keyframes glisseSortieG { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(-80px) scale(.96) } }
        @keyframes glisseSortieD { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(80px) scale(.96) } }
        @keyframes glisseEntreeD { from { opacity:0; transform:translateX(80px) scale(.96) } to { opacity:1; transform:translateX(0) } }
        @keyframes glisseEntreeG { from { opacity:0; transform:translateX(-80px) scale(.96) } to { opacity:1; transform:translateX(0) } }
        .glisse-sortie-g { animation: glisseSortieG .3s cubic-bezier(.55,.06,.68,.19) forwards }
        .glisse-sortie-d { animation: glisseSortieD .3s cubic-bezier(.55,.06,.68,.19) forwards }
        .glisse-entree-d { animation: glisseEntreeD .4s cubic-bezier(.22,1,.36,1) forwards }
        .glisse-entree-g { animation: glisseEntreeG .4s cubic-bezier(.22,1,.36,1) forwards }
        /* Les orbes dérivent lentement sur le panneau, chacune sur sa trajectoire */
        @keyframes orbe-derive-1 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(90px, -60px); } 66% { transform: translate(-50px, 70px); } }
        @keyframes orbe-derive-2 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(-100px, -50px); } 66% { transform: translate(60px, 60px); } }
        @keyframes orbe-derive-3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(80px, 90px); } }
        .orbe-1 { animation: orbe-derive-1 16s ease-in-out infinite; }
        .orbe-2 { animation: orbe-derive-2 20s ease-in-out infinite; }
        .orbe-3 { animation: orbe-derive-3 13s ease-in-out infinite; }
        /* Neutralise le fond bleu du remplissage automatique de Chrome */
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${sombre ? '#1c1c1c' : '#f7f7f7'} inset;
          -webkit-text-fill-color: ${sombre ? '#ffffff' : '#0d0d0d'};
          caret-color: ${sombre ? '#ffffff' : '#0d0d0d'};
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>

      {/* ===================== COLONNE GAUCHE : FORMULAIRE ===================== */}
      <div className="relative flex items-center justify-center px-6 pt-[88px] lg:pt-[110px] pb-14 min-h-screen">
        {signupSuccess ? (
          <div className="max-w-[420px] w-full text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${sombre ? 'text-white' : ''}`}>Vérifiez votre email</h2>
            <p className={`font-medium ${sombre ? 'text-white/55' : 'text-black/50'}`}>Un lien de confirmation a été envoyé à <strong className={`font-bold ${sombre ? 'text-white/90' : 'text-black/80'}`}>{signupEmail}</strong>.</p>
            <button onClick={() => { setSignupSuccess(false); switchTo('login') }} className={`inline-block mt-7 font-bold px-7 py-3.5 rounded-full transition cursor-pointer ${sombre ? 'bg-white text-[#0d0d0d] hover:bg-white/90' : 'bg-[#0d0d0d] hover:bg-black/85 text-white'}`}>Aller à la connexion</button>
          </div>
        ) : (
        <div className={`max-w-[420px] w-full ${sliding}`} style={{marginTop: '3vh'}}>
          <h1 className={`font-extrabold tracking-[-0.03em] leading-[1.05] mb-3 text-[2.1rem] sm:text-[2.55rem] ${mode === 'login' ? 'sm:whitespace-nowrap' : ''} ${sombre ? 'text-white' : ''}`}>
            {mode === 'login' ? 'Ravis de vous revoir !' : 'Débutez votre essai de 7 jours'}
          </h1>
          <p className={`font-medium text-lg mb-8 ${sombre ? 'text-white/55' : 'text-black/50'}`}>
            {mode === 'login' ? 'Connectez-vous pour reprendre votre entraînement.' : 'Commencez votre entraînement pour le concours ATSEM, sans frais.'}
          </p>

          {/* Annotation manuscrite version mobile, au-dessus du bouton Google */}
          <div aria-hidden="true" className="lg:hidden flex justify-end pr-3 -mt-3 -mb-1 pointer-events-none">
            <div>
              <p className="text-[1.3rem] text-purple-500 whitespace-nowrap" style={{fontFamily: "'Caveat', cursive", fontWeight: 700, transform: 'rotate(-2deg)'}}>Privilégiez Google&nbsp;!</p>
              <svg className="w-9 h-9 text-purple-500/80 ml-5 -mt-1" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M33 4 C 28 15, 20 23, 9 29"/><path d="M17 30.5 9 29 11 21"/></svg>
            </div>
          </div>
          <div className="relative">
            {/* Annotation manuscrite vers le bouton Google */}
            <div aria-hidden="true" className="absolute hidden lg:block pointer-events-none" style={{left: 'calc(100% + 18px)', top: '-44px', width: '170px'}}>
              <p className="text-[1.45rem] text-purple-500 whitespace-nowrap" style={{fontFamily: "'Caveat', cursive", fontWeight: 700, transform: 'rotate(6deg)'}}>Privilégiez Google&nbsp;!</p>
              <svg className="w-12 h-12 text-purple-500/80 mt-0.5 ml-2" viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M52 5 C 42 22, 30 34, 14 40"/><path d="M24 43 14 40 17 30"/></svg>
            </div>
            <button type="button" onClick={handleGoogle} className={`w-full bg-white font-bold text-base py-3.5 rounded-full transition flex items-center justify-center gap-3 mb-6 cursor-pointer ${sombre ? 'ring-1 ring-white/10 hover:bg-white/90' : 'ring-1 ring-black/10 hover:bg-black/[0.03]'}`}>
              {GoogleIcon} {mode === 'login' ? 'Continuer avec Google' : "S'inscrire avec Google"}
            </button>
          </div>

          <div className="relative flex items-center mb-6">
            <div className={`flex-grow border-t ${sombre ? 'border-white/15' : 'border-black/[0.08]'}`}></div>
            <span className={`flex-shrink-0 mx-4 text-xs font-extrabold uppercase tracking-widest ${sombre ? 'text-white/40' : 'text-black/35'}`}>ou par email</span>
            <div className={`flex-grow border-t ${sombre ? 'border-white/15' : 'border-black/[0.08]'}`}></div>
          </div>

          {mode === 'login' ? (
            <>
              {loginError && <div className="bg-red-500/[0.06] ring-1 ring-red-500/20 text-red-600 text-sm font-bold p-3.5 rounded-2xl mb-4">{loginError}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${sombre ? 'text-white/80' : 'text-black/70'}`}>Adresse email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{MailIcon}</div>
                    <input type="email" required placeholder="nathalie@email.fr" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} className={inputClass + ' pr-12'}/>
                    <FieldCheck show={emailValide(loginEmail)} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-black/70">Mot de passe</label>
                    <a href="/forgot-password" className="text-xs font-bold text-purple-700 hover:text-purple-600 transition">Oublié&nbsp;?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{LockIcon}</div>
                    <input type={showLoginPass?"text":"password"} required placeholder="••••••••" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} className={inputClass + ' pr-20'}/>
                    <FieldCheck show={loginPassword.length > 0} decale />
                    <button type="button" onClick={()=>setShowLoginPass(!showLoginPass)} className={`absolute inset-y-0 right-0 pr-4 flex items-center transition cursor-pointer ${sombre ? 'text-white/35 hover:text-white/70' : 'text-black/30 hover:text-black/60'}`}>{showLoginPass?EyeClosed:EyeOpen}</button>
                  </div>
                </div>
                <button type="submit" disabled={!(emailValide(loginEmail) && loginPassword.length > 0)||loginLoading} className={`w-full font-bold text-lg py-4 rounded-full mt-2 transition flex items-center justify-center gap-2 group ${emailValide(loginEmail) && loginPassword.length > 0 && !loginLoading ? 'btn-shine bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-700/25 cursor-pointer' : 'bg-black/[0.05] text-black/30 cursor-not-allowed'}`}>
                  {loginLoading?'Connexion en cours...':'Se connecter'}
                  {!loginLoading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>}
                </button>
              </form>
              <p className={`mt-7 text-center font-medium text-sm ${sombre ? 'text-white/55' : 'text-black/50'}`}>Pas encore de compte&nbsp;? <button onClick={()=>switchTo('signup')} className="text-purple-700 font-bold hover:text-purple-600 transition ml-1 cursor-pointer">S&apos;inscrire gratuitement</button></p>
            </>
          ) : (
            <>
              {signupError && <div className={`ring-1 ring-red-500/20 text-sm font-bold p-3.5 rounded-2xl mb-4 ${sombre ? 'bg-red-500/15 text-red-300' : 'bg-red-500/[0.06] text-red-600'}`}>{signupError}</div>}
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${sombre ? 'text-white/80' : 'text-black/70'}`}>Prénom</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{UserIcon}</div>
                    <input type="text" required placeholder="Nathalie" value={firstname} onChange={e=>setFirstname(e.target.value)} className={inputClass + ' pr-12'}/>
                    <FieldCheck show={firstname.trim().length >= 2} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${sombre ? 'text-white/80' : 'text-black/70'}`}>Adresse email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{MailIcon}</div>
                    <input type="email" required placeholder="nathalie@email.fr" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)} className={inputClass + ' pr-12'}/>
                    <FieldCheck show={emailValide(signupEmail)} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${sombre ? 'text-white/80' : 'text-black/70'}`}>Mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{LockIcon}</div>
                    <input type={showSignupPass?"text":"password"} required placeholder="••••••••" value={signupPassword} onChange={e=>setSignupPassword(e.target.value)} className={inputClass + ' pr-20'}/>
                    <FieldCheck show={allValid} decale />
                    <button type="button" onClick={()=>setShowSignupPass(!showSignupPass)} className={`absolute inset-y-0 right-0 pr-4 flex items-center transition cursor-pointer ${sombre ? 'text-white/35 hover:text-white/70' : 'text-black/30 hover:text-black/60'}`}>{showSignupPass?EyeClosed:EyeOpen}</button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs font-bold">
                    <div className={`flex items-center gap-1.5 transition-colors ${checks.len?chkOn:chkOff}`}>{CheckCircle} 8+ caractères</div>
                    <div className={`flex items-center gap-1.5 transition-colors ${checks.upper?chkOn:chkOff}`}>{CheckCircle} 1 Majuscule</div>
                    <div className={`flex items-center gap-1.5 transition-colors ${checks.num?chkOn:chkOff}`}>{CheckCircle} 1 Chiffre</div>
                    <div className={`flex items-center gap-1.5 transition-colors ${checks.spec?chkOn:chkOff}`}>{CheckCircle} 1 Caractère spécial</div>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${sombre ? 'text-white/80' : 'text-black/70'}`}>Confirmer le mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{LockIcon}</div>
                    <input type={showConfirm?"text":"password"} required placeholder="••••••••" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={inputClass + ' pr-20'}/>
                    <FieldCheck show={matches} decale />
                    <button type="button" onClick={()=>setShowConfirm(!showConfirm)} className={`absolute inset-y-0 right-0 pr-4 flex items-center transition cursor-pointer ${sombre ? 'text-white/35 hover:text-white/70' : 'text-black/30 hover:text-black/60'}`}>{showConfirm?EyeClosed:EyeOpen}</button>
                  </div>
                  {confirmPassword && !matches && <p className={`text-xs font-bold mt-1.5 ${sombre ? 'text-red-400' : 'text-red-600'}`}>Les mots de passe ne correspondent pas.</p>}
                </div>
                <button type="submit" disabled={!canSubmit||signupLoading} className={`w-full font-bold text-lg py-4 rounded-full mt-2 transition flex items-center justify-center gap-2 ${canSubmit&&!signupLoading?'btn-shine bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-700/25 cursor-pointer':sombre?'bg-white/[0.08] text-white/30 cursor-not-allowed':'bg-black/[0.05] text-black/30 cursor-not-allowed'}`}>
                  {signupLoading?'Création en cours...':'Créer mon compte'}
                </button>
              </form>
              <p className={`mt-7 text-center font-medium text-sm ${sombre ? 'text-white/55' : 'text-black/50'}`}>Déjà un compte&nbsp;? <button onClick={()=>switchTo('login')} className="text-purple-400 font-bold hover:text-purple-300 transition ml-1 cursor-pointer">Se connecter</button></p>
            </>
          )}

          <p className={`mt-8 text-center text-xs font-medium leading-relaxed ${sombre ? 'text-white/40' : 'text-black/35'}`}>En continuant sur Prépa ATSEM, vous acceptez nos <a href="/cgu" className={`underline transition ${sombre ? 'hover:text-white/75' : 'hover:text-black/60'}`}>Conditions Générales d&apos;Utilisation</a>.</p>
        </div>
        )}
      </div>

      {/* ===================== COLONNE DROITE : PANNEAU PRODUIT ===================== */}
      <div className="hidden lg:flex items-center justify-center relative pt-[96px] pb-14 px-10">
        {mode === 'login' ? <PileModules /> : <PanneauInscription sombre />}
      </div>
    </section>
  )
}
