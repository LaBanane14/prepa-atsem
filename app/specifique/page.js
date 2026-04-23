'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, ClipboardCheck, Building2, SprayCan, Heart, GraduationCap, Users, Calculator, CheckCircle2, XCircle, ArrowLeft, ArrowRight, ChevronUp } from 'lucide-react'

const LogoIcon = ({size, strokeWidth, className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className} width={size} height={size}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

const sidebarItems = [
  { id: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { id: 'progression', label: 'Mes stats', href: '/dashboard?tab=progression', icon: TrendingUp },
  { id: 'historique', label: 'Historique', href: '/dashboard?tab=historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', href: '/dashboard?tab=profil', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', href: '/dashboard?tab=abonnement', icon: BadgeCheck, premium: true }
]

const CATEGORIES = [
  { id: 'institutionnel', titre: 'Institutionnel', description: 'Statut, missions, hiérarchie, cadre légal', icon: Building2, color: '#8b5cf6', tint: '#ede9fe', soft: '#f5f3ff' },
  { id: 'hygiene', titre: 'Hygiène', description: 'Bionettoyage, dilutions, protocoles, HACCP', icon: SprayCan, color: '#10b981', tint: '#d1fae5', soft: '#ecfdf5' },
  { id: 'sante', titre: 'Santé', description: 'Premiers secours, PAI, gestes d\'urgence', icon: Heart, color: '#64748b', tint: '#e2e8f0', soft: '#f1f5f9' },
  { id: 'pedagogie', titre: 'Pédagogie', description: 'Programme, sieste, ateliers, développement', icon: GraduationCap, color: '#f59e0b', tint: '#fef3c7', soft: '#fffbeb' },
  { id: 'relations', titre: 'Relations pro', description: 'Discrétion, devoir de réserve, communication', icon: Users, color: '#0ea5e9', tint: '#e0f2fe', soft: '#f0f9ff' },
  { id: 'calculs', titre: 'Calculs', description: 'Dilutions, surfaces, proportions', icon: Calculator, color: '#ec4899', tint: '#fce7f3', soft: '#fdf2f8' },
]

export default function SpecifiquePage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAccessBlock, setShowAccessBlock] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [step, setStep] = useState('choix') // choix, loading, epreuve, resultat
  const [selectedCategorie, setSelectedCategorie] = useState(null)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')
  const [loadingCategorie, setLoadingCategorie] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const [current, setCurrent] = useState(0)
  const [reponses, setReponses] = useState({}) // { numero: 'A' } — sélection (avant ou après validation)
  const [validated, setValidated] = useState({}) // { numero: true } — questions validées
  const [score, setScore] = useState(0)

  const [showScrollTop, setShowScrollTop] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      const { data: sub } = await supabase.from('subscriptions').select('status, current_period_end').eq('user_id', session.user.id).eq('status', 'active').single()
      const hasSub = sub && new Date(sub.current_period_end) > new Date()
      if (hasSub) setIsPremium(true)
      const trialMs = 7 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(session.user.created_at))
      if (!hasSub && trialMs <= 0) { setShowAccessBlock(true); setAuthLoading(false); return }
      setAuthLoading(false)
    })
  }, [])

  // Loading progress — progression asymptotique (rapide au début, ralentit vers 99%)
  useEffect(() => {
    if (step !== 'loading') { setLoadingProgress(0); return }
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const t = (now - t0) / 1000
      // Démarre doucement puis asymptote vers 99% : ~5% à 1s, ~15% à 3s, ~46% à 5s, ~82% à 10s
      const v = 99 * (1 - Math.exp(-Math.pow(t, 1.5) / 18))
      setLoadingProgress(v)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step])

  // Scroll-to-top
  useEffect(() => {
    const container = mainRef.current
    if (!container) return
    const handleScroll = () => setShowScrollTop(container.scrollTop > 400)
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [step])

  async function startCategorie(cat) {
    setSelectedCategorie(cat)
    setLoadingCategorie(cat.id)
    setStep('loading')
    setError('')
    setQuestions([])
    setReponses({})
    setValidated({})
    setCurrent(0)

    try {
      const res = await fetch('/api/specifique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generer', categorie: cat.id })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Erreur lors de la génération.')
        setLoadingCategorie(null)
        setStep('choix')
        return
      }
      if (!data.questions || data.questions.length === 0) {
        setError('Aucune question générée. Réessayez.')
        setLoadingCategorie(null)
        setStep('choix')
        return
      }
      setQuestions(data.questions)
      setLoadingCategorie(null)
      setStep('epreuve')
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
      setLoadingCategorie(null)
      setStep('choix')
    }
  }

  function selectAnswer(numero, lettre) {
    if (validated[numero]) return // verrouillé après validation
    setReponses(prev => ({ ...prev, [numero]: lettre }))
  }

  function validateCurrent() {
    if (!data) return
    if (!reponses[data.numero]) return
    setValidated(prev => ({ ...prev, [data.numero]: true }))
  }

  function goNext() {
    if (current < questions.length - 1) setCurrent(current + 1)
  }
  function goPrev() {
    if (current > 0) setCurrent(current - 1)
  }

  function handleAction() {
    if (!validated[data.numero]) {
      validateCurrent()
    } else if (current < questions.length - 1) {
      goNext()
    } else {
      handleSubmit()
    }
  }

  async function handleSubmit() {
    let total = 0
    questions.forEach(q => {
      if (reponses[q.numero] === q.reponse_correcte) total++
    })
    setScore(total)

    try {
      await supabase.from('historique').insert({
        user_id: user.id,
        type: 'Spécifique',
        label: `QCM ${selectedCategorie.titre}`,
        note: total,
        note_max: questions.length,
        nb_questions: questions.length,
        duration_minutes: null,
      })
    } catch (e) { console.error('Erreur sauvegarde:', e) }

    setStep('resultat')
  }

  function restart() {
    setStep('choix'); setQuestions([]); setReponses({}); setValidated({}); setError(''); setLoadingCategorie(null); setSelectedCategorie(null); setCurrent(0); setScore(0)
  }

  function retryCategorie() {
    if (selectedCategorie) startCategorie(selectedCategorie)
    else restart()
  }

  async function handleLogout() { await supabase.auth.signOut(); window.location.href = '/' }

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''
  const data = questions[current]
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0
  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div></div>

  if (showAccessBlock) return (
    <div className="min-h-screen bg-[#eceef1] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-5xl mb-3 mx-auto">😢</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Votre essai gratuit est terminé</h2>
        <p className="text-slate-500 font-medium mb-6">Pour continuer à vous entraîner et accéder à tous les exercices, souscrivez à un abonnement.</p>
        <div className="flex flex-col gap-3">
          <a href="/tarifs" className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm">Voir les tarifs</a>
          <a href="/dashboard" className="text-slate-500 font-medium text-sm hover:text-slate-700 transition">Retour au tableau de bord</a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-slate-900 flex overflow-x-hidden" style={{backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(ellipse 800px 500px at 15% 10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse 700px 500px at 85% 30%, rgba(251,191,36,0.14), transparent 60%), radial-gradient(ellipse 700px 500px at 25% 70%, rgba(236,72,153,0.12), transparent 60%), radial-gradient(ellipse 800px 500px at 80% 90%, rgba(14,165,233,0.12), transparent 60%)', backgroundAttachment: 'fixed', fontFamily: "'Nunito', sans-serif", '--nav-color': selectedCategorie?.color || '#7c3aed', '--nav-tint': selectedCategorie?.tint || '#f5f3ff'}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        html, body { background: #faf8ff; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes premiumScan { 0%, 80% { opacity: 1; } 85% { opacity: 0.4; transform: scale(1.15); } 90% { opacity: 1; transform: scale(1); filter: brightness(1.5); } 95% { filter: brightness(1); } 100% { opacity: 1; } }
        .premium-scan { animation: premiumScan 5s ease-in-out infinite; }
        .v1-card { transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s; }
        .v1-card:hover { transform: translateY(-6px); box-shadow: 0 30px 50px -24px rgba(26, 19, 37, 0.22); }
        .v1-card .v1-icon { transition: transform 0.3s, background 0.3s, color 0.3s; background: var(--c-tint); color: var(--c-color); }
        .v1-card:hover .v1-icon { background: var(--c-color); color: #fff; transform: scale(1.05) rotate(-4deg); }
        .v1-card .v1-arrow { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s, color 0.25s; background: var(--c-tint); color: var(--c-color); }
        .v1-card:hover .v1-arrow { background: var(--c-color); color: #fff; transform: translateX(6px); }
        .v1-card-top { background: var(--c-soft); }
        .v1-num { color: var(--c-color); border-color: var(--c-tint); }
        .v1-qcount { color: var(--c-color); display: flex; align-items: center; gap: 8px; }
        .v1-qcount::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--c-color); }
        .v1-hero-em { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; font-style: normal; }
        .v1-bg > * { position: relative; z-index: 1; }
        .sf-nav-logo { background: var(--nav-color); }
        .sf-nav-item { color: #0f172a; transition: background 0.15s, color 0.15s; }
        .sf-nav-item:hover { background: var(--nav-tint); color: var(--nav-color); }
        .sf-brand-accent { color: var(--nav-color); }

        /* === LoaderArc (écran de chargement après choix de catégorie) === */
        .la-root { font-family: 'Nunito', system-ui, sans-serif; color: #1a1325; }
        .la-page { padding: 24px 8px 40px; position: relative; width: 100%; }
        .la-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
        .la-crumb { font-size: 12px; color: #6b5b8e; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .la-crumb::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--tc-main); box-shadow: 0 0 0 4px var(--tc-soft-2); flex-shrink: 0; }
        .la-crumb span { color: #1a1325; }
        .la-crumb .sep { color: #bfb3d6; font-weight: 700; }
        .la-frame { background: white; border-radius: 24px; border: 1px solid #ece9f0; padding: 32px 28px 28px; max-width: 880px; margin: 0 auto; width: 100%; position: relative; overflow: hidden; box-sizing: border-box; }
        @media (min-width: 640px) { .la-frame { padding: 48px 48px 40px; border-radius: 28px; } }
        .la-frame::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, var(--tc-soft-2), transparent 60%); pointer-events: none; }
        .la-frame > * { position: relative; }
        .lf-head { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .lf-icon-chip { width: 56px; height: 56px; border-radius: 16px; background: var(--tc-tint); color: var(--tc-main); display: grid; place-items: center; flex-shrink: 0; }
        .lf-head-text { flex: 1; min-width: 0; }
        .lf-head-text h2 { margin: 0; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tc-main); }
        .lf-head-text h1 { margin: 2px 0 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; color: #1a1325; }
        .lf-status { margin-left: auto; display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: #6b5b8e; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 14px; border-radius: 999px; background: #f9f6ff; border: 1px solid #ece9f0; flex-shrink: 0; }
        .lf-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--tc-main); animation: lf-status-pulse 1.4s infinite; }
        @keyframes lf-status-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        .lf-title { font-size: 30px; font-weight: 900; letter-spacing: -0.025em; margin: 8px 0 12px; line-height: 1.05; }
        @media (min-width: 640px) { .lf-title { font-size: 42px; } }
        .lf-title em { font-style: normal; background: linear-gradient(135deg, var(--tc-main) 0%, var(--tc-bright) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .lf-sub { font-size: 15px; line-height: 1.55; color: #5e5270; margin: 0 0 32px; max-width: 540px; }
        .anim-arc { display: flex; align-items: center; justify-content: center; gap: 32px; padding: 16px 0 8px; flex-wrap: wrap; }
        @media (min-width: 640px) { .anim-arc { gap: 56px; } }
        .arc-wrap { position: relative; width: 220px; height: 220px; flex-shrink: 0; }
        .arc-svg { transform: rotate(-90deg); }
        .arc-track { stroke: #ece9f0; stroke-width: 10; fill: none; }
        .arc-fill { stroke: var(--tc-main, #8b5cf6); stroke-width: 10; fill: none; stroke-linecap: round; transition: stroke-dashoffset 0.15s linear; }
        .arc-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
        .arc-icon { width: 44px; height: 44px; border-radius: 14px; background: var(--tc-tint); color: var(--tc-main); display: grid; place-items: center; margin-bottom: 4px; }
        .arc-percent { font-size: 36px; font-weight: 900; letter-spacing: -0.03em; color: #1a1325; line-height: 1; font-variant-numeric: tabular-nums; }
        .arc-count { font-size: 12px; font-weight: 700; color: #8b7ea3; letter-spacing: 0.08em; text-transform: uppercase; }
        .arc-count b { color: var(--tc-main); }
        .arc-side { flex: 1; min-width: 220px; max-width: 320px; }
        .arc-step-num { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tc-main); margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
        .arc-step-num::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--tc-main); }
        .arc-side h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; color: #1a1325; }
        .arc-side p { margin: 0; font-size: 14px; line-height: 1.55; color: #5e5270; }
        .lf-footer { display: flex; gap: 10px; margin-top: 28px; padding-top: 20px; border-top: 1px dashed #ece9f0; font-size: 11px; font-weight: 700; flex-wrap: wrap; }
        .lf-pill { padding: 6px 12px; border-radius: 999px; background: #faf8ff; border: 1px solid #ece9f0; color: #5e5270; display: flex; align-items: center; gap: 8px; }
        .lf-pill b { color: var(--tc-main); font-weight: 900; }
        .lf-pill::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--tc-main); }
      `}</style>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-[45] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <div className={`fixed top-14 lg:top-0 bottom-0 left-0 z-50 flex items-start lg:items-center pl-0 lg:pl-3 py-0 lg:py-5 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <aside className="w-[72px] bg-white rounded-none rounded-br-2xl lg:rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/60 border-t-0 lg:border-t flex flex-col items-center py-5 h-full lg:h-[calc(100vh-2.5rem)]">
          <a href="/" className="mb-4"><div className="sf-nav-logo w-10 h-10 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><LogoIcon size={20} strokeWidth={2.5} /></div></a>
          <div className="w-7 h-px bg-slate-200 mb-3"></div>
          <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5">
            {sidebarItems.filter(item => !item.premium || !isPremium).map(item => (
              <a key={item.id} href={item.href} className={`w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[11px] font-bold transition-all text-center group ${item.premium ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600' : 'sf-nav-item'}`}>
                <item.icon size={21} strokeWidth={1.6} className={`transition-transform duration-200 group-hover:scale-125 ${item.premium ? 'premium-scan' : ''}`} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="flex flex-col items-center gap-2 mt-auto pt-3">
            <div className="w-7 h-px bg-slate-200 mb-1"></div>
            <a href="/dashboard?tab=profil" className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition">{firstName.charAt(0).toUpperCase()}</a>
            <button onClick={handleLogout} className="text-slate-900 hover:text-red-500 transition cursor-pointer p-1">
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </div>
        </aside>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[90px] max-w-full overflow-x-hidden">
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
          <span className="font-black text-lg text-slate-900">Prépa <span className="sf-brand-accent">ATSEM</span></span>
          <a href="/dashboard" className="text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </a>
        </header>

        <main ref={mainRef} className="flex-grow w-full mx-auto px-4 py-4 sm:py-5 overflow-x-hidden overflow-y-auto">

          {/* ===== CHOIX CATÉGORIE (design Editorial Cards colorées) ===== */}
          {step === 'choix' && (
            <div className="animate-fade-in v1-bg relative max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-5">

              {/* Croix retour — flottante en haut à droite */}
              <a href="/dashboard" className="!absolute top-3 right-3 sm:top-5 sm:right-8 z-10 w-10 h-10 rounded-xl bg-slate-900 hover:bg-black flex items-center justify-center text-white transition cursor-pointer shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </a>

              {/* Hero */}
              <div className="mb-10 sm:mb-12 max-w-3xl pr-14">
                <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight text-slate-900 mb-4 sm:mb-5">
                  Choisissez votre <em className="v1-hero-em">thématique</em>.
                </h1>
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl">
                  Perfectionnez-vous en vous focalisant sur un thème précis.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2 max-w-xl">
                  <XCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Grid de 6 cartes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon
                  const isLoading = loadingCategorie === cat.id
                  const isDisabled = !!loadingCategorie && !isLoading
                  return (
                    <button
                      key={cat.id}
                      onClick={() => !loadingCategorie && startCategorie(cat)}
                      disabled={isDisabled}
                      className={`v1-card group bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-[300px] text-left cursor-pointer ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{'--c-color': cat.color, '--c-tint': cat.tint, '--c-soft': cat.soft}}
                    >
                      <div className="v1-card-top px-7 pt-6 pb-5 flex items-start justify-between gap-4 border-b border-slate-200">
                        <div className="v1-icon w-14 h-14 rounded-2xl grid place-items-center shrink-0">
                          {isLoading
                            ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            : <Icon size={26} strokeWidth={1.8} />
                          }
                        </div>
                        <div className="v1-num px-2.5 py-1.5 rounded-full bg-white border text-[11px] font-black tracking-[0.15em]">
                          0{i + 1}
                        </div>
                      </div>

                      <div className="px-7 pb-6 pt-5 flex flex-col flex-grow">
                        <h3 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight mb-2">{cat.titre}</h3>
                        <p className="text-[14px] text-slate-500 leading-relaxed mb-auto">{cat.description}</p>
                        <div className="flex items-center justify-between mt-6 pt-5 border-t border-dashed border-slate-200">
                          <span className="v1-qcount text-xs font-black tracking-[0.1em] uppercase">
                            10 questions
                          </span>
                          <span className="v1-arrow w-10 h-10 rounded-full grid place-items-center shrink-0">
                            <ArrowRight size={16} strokeWidth={2} />
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ===== LOADING (LoaderArc) ===== */}
          {step === 'loading' && selectedCategorie && (() => {
            const THEME_VARS = {
              institutionnel: { main: '#8b5cf6', bright: '#c4b5fd', tint: '#ede9fe', soft: 'rgba(139,92,246,0.18)', soft2: 'rgba(139,92,246,0.08)' },
              hygiene:        { main: '#10b981', bright: '#6ee7b7', tint: '#d1fae5', soft: 'rgba(16,185,129,0.18)',  soft2: 'rgba(16,185,129,0.08)' },
              sante:          { main: '#64748b', bright: '#94a3b8', tint: '#e2e8f0', soft: 'rgba(100,116,139,0.18)', soft2: 'rgba(100,116,139,0.08)' },
              pedagogie:      { main: '#f59e0b', bright: '#fcd34d', tint: '#fef3c7', soft: 'rgba(245,158,11,0.18)',  soft2: 'rgba(245,158,11,0.08)' },
              relations:      { main: '#0ea5e9', bright: '#7dd3fc', tint: '#e0f2fe', soft: 'rgba(14,165,233,0.18)',  soft2: 'rgba(14,165,233,0.08)' },
              calculs:        { main: '#ec4899', bright: '#f9a8d4', tint: '#fce7f3', soft: 'rgba(236,72,153,0.18)',  soft2: 'rgba(236,72,153,0.08)' },
            }
            const tv = THEME_VARS[selectedCategorie.id] || THEME_VARS.institutionnel
            const STEPS = [
              { label: "Analyse du référentiel de la catégorie",   at: 0 },
              { label: "Sélection des concepts à évaluer",         at: 18 },
              { label: "Génération des 10 questions par l'IA",     at: 36 },
              { label: "Construction des distracteurs plausibles", at: 58 },
              { label: "Vérification des réponses attendues",      at: 78 },
              { label: "Finalisation et mise en forme",            at: 92 },
            ]
            const progress = loadingProgress
            const r = 92
            const c = 2 * Math.PI * r
            const offset = c - (progress / 100) * c
            const shown = Math.max(1, Math.min(10, Math.round(progress / 10)))
            const stepIdx = STEPS.reduce((a, s, i) => progress >= s.at ? i : a, 0)
            const Icon = selectedCategorie.icon
            return (
              <div className="la-root animate-fade-in fixed top-14 lg:top-0 right-0 bottom-0 left-0 lg:left-[90px] z-40 flex items-center justify-center overflow-y-auto p-4" style={{ '--tc-main': tv.main, '--tc-bright': tv.bright, '--tc-tint': tv.tint, '--tc-soft': tv.soft, '--tc-soft-2': tv.soft2 }}>
                <div className="la-page">
                  <div className="la-frame">
                    <div className="lf-head">
                      <div className="lf-icon-chip"><Icon size={26} strokeWidth={1.8} /></div>
                      <div className="lf-head-text">
                        <h2>{selectedCategorie.description}</h2>
                        <h1>{selectedCategorie.titre}</h1>
                      </div>
                      <button onClick={restart} className="ml-auto shrink-0 bg-slate-900 hover:bg-black text-white font-bold text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer">
                        Quitter l'exercice
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <h2 className="lf-title">Votre quiz est <em>en préparation</em>.</h2>
                    <p className="lf-sub">10 questions générées sur mesure à partir du référentiel de la catégorie <b>{selectedCategorie.titre}</b>.</p>
                    <div className="anim-arc">
                      <div className="arc-wrap">
                        <svg className="arc-svg" width="220" height="220" viewBox="0 0 220 220">
                          <circle className="arc-track" cx="110" cy="110" r={r} />
                          <circle className="arc-fill" cx="110" cy="110" r={r} strokeDasharray={c} strokeDashoffset={offset} />
                        </svg>
                        <div className="arc-center">
                          <div className="arc-icon"><Icon size={22} strokeWidth={1.8} /></div>
                          <div className="arc-percent">{Math.round(progress)}%</div>
                          <div className="arc-count"><b>{shown}</b> / 10 questions</div>
                        </div>
                      </div>
                      <div className="arc-side">
                        <div className="arc-step-num">Étape {stepIdx + 1}/{STEPS.length}</div>
                        <h3>{STEPS[stepIdx].label}</h3>
                        <p>L'IA rédige des questions calibrées sur le thème {selectedCategorie.titre.toLowerCase()}. Vous commencez dès que c'est prêt.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ===== ÉPREUVE (design exact /qcm) ===== */}
          {step === 'epreuve' && data && selectedCategorie && (() => {
            const hasAnswered = !!validated[data.numero]
            const userAnswer = reponses[data.numero]
            const isCorrect = hasAnswered && userAnswer === data.reponse_correcte
            const catColor = selectedCategorie.color
            const catTint = selectedCategorie.tint
            const catSoft = selectedCategorie.soft
            return (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-6 xl:gap-8 items-start w-full" style={{'--c-color': catColor, '--c-tint': catTint, '--c-soft': catSoft}}>

                {/* Colonne 1 : spacer */}
                <div className="hidden xl:block"></div>

                {/* Colonne 2 : QCM CARD */}
                <div className="w-full max-w-2xl mx-auto xl:w-[650px] relative mt-2 sm:mt-4">
                  {/* Croix quitter */}
                  <button onClick={restart} className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 text-white rounded-full flex items-center justify-center transition shadow-lg cursor-pointer hover:brightness-90" style={{backgroundColor: catColor}}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>

                  <div className="rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm" style={{backgroundColor: catSoft}}>
                    <div className="bg-white rounded-xl sm:rounded-[2rem] shadow-xl flex flex-col overflow-hidden relative">
                      {/* Header */}
                      <div className="relative flex flex-wrap justify-between items-center p-3 sm:p-5 border-b border-slate-100 gap-2">
                        <span className="text-slate-600 font-bold text-xs sm:text-sm tracking-wide">Question {current + 1}/{questions.length}</span>
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide uppercase" style={{backgroundColor: catTint, color: catColor}}>{selectedCategorie.titre}</span>
                        <div className="absolute bottom-0 left-0 w-full h-2" style={{backgroundColor: catTint}}>
                          <div className="h-full transition-all duration-500" style={{width: `${progress}%`, backgroundColor: catColor}}></div>
                        </div>
                      </div>

                      {/* Question */}
                      <div className="p-4 sm:p-6 flex-grow">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5 leading-relaxed">{data.enonce}</h2>
                        <div className="space-y-2 sm:space-y-3">
                          {(data.propositions || []).map(prop => {
                            const lettre = String(prop.lettre).toUpperCase()
                            const isSelected = userAnswer === lettre
                            const isGood = data.reponse_correcte === lettre
                            let optClass = 'p-3 sm:p-4 border rounded-xl flex items-center group transition-all '
                            let letterClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold flex items-center justify-center text-xs sm:text-sm shrink-0 transition-all '

                            if (hasAnswered) {
                              if (isGood) {
                                optClass += 'border-green-500 bg-green-50 '
                                letterClass += 'bg-green-500 text-white '
                              } else if (isSelected) {
                                optClass += 'border-red-500 bg-red-50 '
                                letterClass += 'bg-red-500 text-white '
                              } else {
                                optClass += 'border-slate-200 opacity-50 '
                                letterClass += 'bg-slate-100 text-slate-500 '
                              }
                            } else if (isSelected) {
                              optClass += 'cursor-pointer '
                              letterClass += 'text-white '
                            } else {
                              optClass += 'border-slate-200 cursor-pointer hover:bg-slate-50 '
                              letterClass += 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 '
                            }

                            const optInlineStyle = (!hasAnswered && isSelected)
                              ? { borderColor: catColor, backgroundColor: catTint }
                              : {}
                            const letterInlineStyle = (!hasAnswered && isSelected)
                              ? { backgroundColor: catColor }
                              : {}

                            return (
                              <div key={lettre} className={optClass} style={optInlineStyle} onClick={() => selectAnswer(data.numero, lettre)}>
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <span className={letterClass} style={letterInlineStyle}>{lettre}</span>
                                  <span className="font-bold text-slate-800 text-sm sm:text-base">{prop.texte}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 sm:p-5 pt-0 flex gap-3">
                        {current > 0 && (
                          <button onClick={goPrev} className="bg-slate-100 text-slate-700 font-bold py-3 px-4 sm:px-5 rounded-xl transition-colors hover:bg-slate-200 flex items-center justify-center gap-2 text-sm cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg>
                            <span className="hidden sm:inline">Précédent</span>
                          </button>
                        )}
                        <button
                          onClick={handleAction}
                          disabled={!hasAnswered && !userAnswer}
                          style={{backgroundColor: catColor}}
                          className={`flex-grow text-white font-bold py-3 px-4 rounded-xl transition hover:brightness-90 flex items-center justify-center gap-2 text-sm sm:text-base shadow-md ${!hasAnswered && !userAnswer ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {!hasAnswered ? (
                            <>Valider ma réponse <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></>
                          ) : current === questions.length - 1 ? (
                            <>Voir mes résultats <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></>
                          ) : (
                            <>Question suivante <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne 3 : EXPLICATION */}
                <div className="w-full max-w-2xl mx-auto xl:mx-0 flex flex-col justify-start xl:pr-4">
                  {hasAnswered && (
                    <div className={`animate-fade-in mt-2 sm:mt-4 xl:mt-8 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col border-2 transition-colors duration-300 ${isCorrect ? 'bg-green-50 border-green-400 text-green-900' : 'bg-red-50 border-red-400 text-red-900'}`}>
                      <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                          {isCorrect ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          )}
                        </div>
                        <span className="text-lg sm:text-xl font-black">{isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}</span>
                      </div>
                      {data.explication && (
                        <div className="leading-relaxed font-medium text-slate-900 bg-white/60 p-3 sm:p-5 rounded-xl border border-white/40 shadow-sm text-sm sm:text-base">
                          {data.explication}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )
          })()}

          {/* ===== RÉSULTAT ===== */}
          {step === 'resultat' && selectedCategorie && (
            <div className="animate-fade-in max-w-3xl mx-auto pb-8">

              {/* Note globale */}
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-center mb-6 relative">
                <button onClick={restart} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer">
                  <XCircle size={20} />
                </button>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">QCM {selectedCategorie.titre}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black text-white">{score}</span>
                  <span className="text-6xl font-black text-slate-400">/{questions.length}</span>
                </div>
                {(() => {
                  const percent = Math.round((score / questions.length) * 100)
                  return (
                    <div className="mt-4">
                      <div className="w-full max-w-xs mx-auto h-3 bg-white/15 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${percent >= 70 ? 'bg-emerald-400' : percent >= 50 ? 'bg-purple-400' : 'bg-red-400'}`} style={{width: `${percent}%`}}></div>
                      </div>
                      <p className="text-sm font-bold mt-2 text-slate-300">
                        {percent >= 80 ? 'Excellent ! Vous maîtrisez ce thème.' : percent >= 60 ? 'Bien joué ! Continuez ainsi.' : percent >= 40 ? 'Correct, mais des lacunes à combler.' : 'Score insuffisant. Revoyez les fondamentaux.'}
                      </p>
                    </div>
                  )
                })()}
              </div>

              {/* Correction */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                    <ClipboardCheck size={16} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Correction détaillée</h2>
                </div>

                <div className="space-y-4">
                  {questions.map(q => {
                    const userAnswer = reponses[q.numero]
                    const isCorrect = userAnswer === q.reponse_correcte
                    const isAnswered = !!userAnswer

                    return (
                      <div key={q.numero} className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${isCorrect ? 'border-emerald-200' : isAnswered ? 'border-red-200' : 'border-amber-200'}`}>
                        <div className={`px-4 sm:px-6 py-4 flex items-start gap-3 ${isCorrect ? 'bg-emerald-50' : isAnswered ? 'bg-red-50' : 'bg-amber-50'}`}>
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : isAnswered ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{q.numero}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.enonce}</p>
                          </div>
                          <div className="shrink-0 ml-2">
                            {isCorrect ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                <CheckCircle2 size={14} strokeWidth={2.5} />
                                <span className="text-xs font-black">1/1</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
                                <XCircle size={14} strokeWidth={2.5} />
                                <span className="text-xs font-black">0/1</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-4 sm:px-6 py-4 space-y-2">
                          {(q.propositions || []).map(p => {
                            const lettre = String(p.lettre).toUpperCase()
                            const wasSelected = userAnswer === lettre
                            const isGood = q.reponse_correcte === lettre
                            let bgClass = 'bg-white border-slate-100'
                            if (isGood && wasSelected) bgClass = 'bg-emerald-50 border-emerald-200'
                            else if (isGood && !wasSelected) bgClass = 'bg-amber-50 border-amber-300 border-dashed'
                            else if (!isGood && wasSelected) bgClass = 'bg-red-50 border-red-200'
                            return (
                              <div key={lettre} className={`flex items-start gap-3 p-3 rounded-xl border ${bgClass}`}>
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${isGood && wasSelected ? 'bg-emerald-500 text-white' : isGood ? 'bg-amber-500 text-white' : wasSelected ? 'bg-red-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  {lettre}
                                </span>
                                <span className={`text-sm font-medium leading-relaxed pt-0.5 flex-1 ${isGood && !wasSelected ? 'text-amber-800' : isGood ? 'text-slate-800' : wasSelected ? 'text-red-700' : 'text-slate-500'}`}>
                                  {p.texte}
                                </span>
                                <div className="shrink-0 mt-0.5">
                                  {isGood && wasSelected && <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2} />}
                                  {isGood && !wasSelected && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Bonne</span>}
                                  {!isGood && wasSelected && <XCircle size={18} className="text-red-400" strokeWidth={2} />}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {q.explication && (
                          <div className="px-4 sm:px-6 pb-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Explication</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{q.explication}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 pb-4 flex-wrap">
                <button onClick={retryCategorie} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-purple-200/50 text-sm flex items-center gap-2 cursor-pointer">
                  <RotateCcw size={16} />
                  Refaire {selectedCategorie.titre}
                </button>
                <button onClick={restart} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition text-sm">Choisir une autre thématique</button>
                <a href="/dashboard" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition text-sm">Retour au dashboard</a>
              </div>
            </div>
          )}

          {/* Scroll-to-top */}
          {showScrollTop && (
            <button
              onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 w-10 h-10 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition cursor-pointer z-40"
            >
              <ChevronUp size={20} strokeWidth={2.5} />
            </button>
          )}
        </main>
      </div>
    </div>
  )
}
