'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { getBaremeFamily, NIVEAUX } from '../../../lib/baremes-atsem'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, Timer, Sparkles, ClipboardCheck, GraduationCap, CheckCircle2, XCircle, ChevronUp } from 'lucide-react'

const LogoIcon = ({size, strokeWidth, className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className} width={size} height={size}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

const sidebarItems = [
  { id: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { id: 'progression', label: 'Mes stats', href: '/dashboard?tab=progression', icon: TrendingUp },
  { id: 'historique', label: 'Historique', href: '/dashboard?tab=historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', href: '/dashboard?tab=profil', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', href: '/dashboard?tab=abonnement', icon: BadgeCheck, premium: true }
]

export default function AnnalePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [annale, setAnnale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  // Exam state
  const [step, setStep] = useState('info') // info, exam, result
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [reponses, setReponses] = useState({})
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  // Scroll-to-top
  const [showScrollTop, setShowScrollTop] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      const { data: sub } = await supabase.from('subscriptions').select('status, current_period_end').eq('user_id', session.user.id).eq('status', 'active').single()
      const hasSub = sub && new Date(sub.current_period_end) > new Date()
      if (hasSub) setIsPremium(true)
      setAuthLoading(false)

      // Charger l'annale
      const { data, error } = await supabase
        .from('annales')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        window.location.href = '/dashboard'
        return
      }
      setAnnale(data)
      setTimeLeft((data.duree_minutes || 45) * 60)
      setLoading(false)

      if (localStorage.getItem('annale_skip_info') === 'true') {
        setStep('exam')
        setTimerActive(true)
        setReponses({})
      }
    })
  }, [id])

  // Timer
  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setTimerActive(false)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerActive])

  // Scroll-to-top visibility
  useEffect(() => {
    const container = mainRef.current
    if (!container) return
    const handleScroll = () => setShowScrollTop(container.scrollTop > 400)
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [step])

  async function handleLogout() { await supabase.auth.signOut(); window.location.href = '/' }

  function startExam() {
    if (dontShowAgain) localStorage.setItem('annale_skip_info', 'true')
    setStep('exam')
    setTimerActive(true)
    setReponses({})
  }

  function toggleProposition(qNum, lettre) {
    setReponses(prev => {
      const current = prev[qNum] || []
      if (current.includes(lettre)) {
        return { ...prev, [qNum]: current.filter(l => l !== lettre) }
      } else {
        return { ...prev, [qNum]: [...current, lettre] }
      }
    })
  }

  async function handleSubmit(auto = false) {
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)

    const questions = annale.questions || []
    let total = 0

    questions.forEach(q => {
      const userAnswers = (reponses[q.numero] || []).sort()
      const correctAnswers = (q.reponses_correctes || []).map(r => r.toLowerCase()).sort()
      if (correctAnswers.length > 0 && userAnswers.length === correctAnswers.length && userAnswers.every((v, i) => v === correctAnswers[i])) {
        total++
      }
    })

    setScore(total)

    // Sauvegarder dans Supabase
    const timeUsed = Math.round(((annale.duree_minutes || 45) * 60 - timeLeft) / 60)
    try {
      await supabase.from('scores_annales').insert({
        user_id: user.id,
        annale_id: annale.id,
        score: total,
        score_max: questions.length,
        temps_passe: timeUsed,
        reponses
      })
      await supabase.from('historique').insert({
        user_id: user.id,
        type: 'Annale',
        label: `Annale ${annale.region_nom} ${annale.annee}${annale.cdg ? ' (' + annale.cdg + ')' : ''}`,
        note: total,
        note_max: questions.length,
        nb_questions: questions.length,
        duration_minutes: timeUsed || 1,
      })
    } catch (e) { console.error('Erreur sauvegarde:', e) }

    setStep('result')
  }

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''
  const EXAM_DURATION = (annale?.duree_minutes || 45) * 60
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timePercent = (timeLeft / EXAM_DURATION) * 100
  const isUrgent = timeLeft < 5 * 60
  const questions = annale?.questions || []
  const answeredCount = Object.values(reponses).filter(arr => arr.length > 0).length
  const annaleTitle = annale ? `${annale.region_nom} ${annale.annee}` : ''
  const annaleFull = annale ? `Annale ${annale.region_nom} ${annale.annee}` : ''

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
  if (!annale) return null

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex" style={{backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bellSwing { 0%, 100% { transform: rotate(0deg); } 15% { transform: rotate(8deg); } 30% { transform: rotate(-6deg); } 45% { transform: rotate(4deg); } 60% { transform: rotate(-2deg); } 75% { transform: rotate(0deg); } }
        @keyframes premiumScan { 0%, 80% { opacity: 1; } 85% { opacity: 0.4; transform: scale(1.15); } 90% { opacity: 1; transform: scale(1); filter: brightness(1.5); } 95% { filter: brightness(1); } 100% { opacity: 1; } }
        .premium-scan { animation: premiumScan 5s ease-in-out infinite; }
        @keyframes pulse-urgent { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse-urgent { animation: pulse-urgent 1s ease-in-out infinite; }
      `}</style>

      {sidebarOpen && <div className="fixed top-14 lg:top-0 inset-x-0 bottom-0 bg-black/30 z-[45] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <div className={`fixed top-14 lg:top-0 bottom-0 left-0 z-50 flex items-start lg:items-center pl-0 lg:pl-3 py-0 lg:py-5 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <aside className="w-[72px] bg-white rounded-none rounded-br-2xl lg:rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/60 border-t-0 lg:border-t flex flex-col items-center py-5 h-full lg:h-[calc(100vh-2.5rem)]" style={{fontFamily: "'Nunito', sans-serif"}}>
          <a href="/" className="mb-4"><div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><LogoIcon size={20} strokeWidth={2.5} /></div></a>
          <div className="w-7 h-px bg-slate-200 mb-3"></div>
          <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5">
            {sidebarItems.filter(item => !item.premium || !isPremium).map(item => (
              <a key={item.id} href={item.href} className={`w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[11px] font-bold transition-all text-center group ${item.premium ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600' : 'text-slate-900 hover:bg-blue-50 hover:text-blue-600'}`}>
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
          <span className="font-black text-lg text-slate-900" style={{fontFamily: "'Nunito', sans-serif"}}>Prépa <span className="text-blue-500">ATSEM</span></span>
          <a href="/dashboard" className="text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </a>
        </header>

        <main className="flex-1 min-h-0 w-full mx-auto px-4 py-4 sm:py-5 lg:flex lg:flex-col lg:overflow-hidden">

          {/* ===== INFO POPUP ===== */}
          {step === 'info' && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { window.location.href = '/dashboard' }}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>

                <div className="bg-slate-900 px-6 py-5 relative">
                  <button onClick={() => { window.location.href = '/dashboard' }} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                  <h2 className="text-lg font-black text-white pr-8">{annaleFull}</h2>
                  <p className="text-slate-400 text-sm font-medium mt-1">Conditions réelles</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {[
                      { icon: <ClipboardCheck size={18} strokeWidth={2} />, title: `QCM de ${questions.length} questions`, text: 'Comme au vrai concours ATSEM : questions à choix multiples sur les situations concrètes du métier.' },
                      { icon: <Timer size={18} strokeWidth={2} />, title: `Chronomètre de ${annale.duree_minutes || 45} minutes`, text: 'Le compte à rebours démarre dès le début. À la fin du temps, vos réponses sont envoyées automatiquement.' },
                      { icon: <Sparkles size={18} strokeWidth={2} />, title: 'Réponses multiples', text: 'Chaque question peut avoir une ou plusieurs bonnes réponses. Il faut toutes les cocher sans erreur pour obtenir le point.' },
                      { icon: <GraduationCap size={18} strokeWidth={2} />, title: 'Barème spécifique à cette annale', text: 'Chaque annale a son propre barème de correction. Il sera détaillé en haut de l\'épreuve.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">{item.icon}</div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={startExam} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-200/50 text-sm flex items-center justify-center gap-2 cursor-pointer mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    Commencer l'annale
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer justify-center">
                    <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-xs text-slate-400 font-medium">Ne plus afficher ce message</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ===== EXAM QCM ===== */}
          {step === 'exam' && questions.length > 0 && (
            <div className="animate-fade-in overflow-x-hidden">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-full lg:h-[calc(100vh-2.5rem)] flex flex-col overflow-hidden">

                {/* Barre du haut */}
                <div className="bg-slate-900 rounded-t-2xl px-3 sm:px-6 py-3 sm:py-5 overflow-hidden shrink-0">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-2xl font-black text-white truncate mr-3">{annaleFull}</h2>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className={`flex items-center gap-2 sm:gap-3 ${isUrgent ? 'pulse-urgent' : ''}`}>
                        <div className="w-24 sm:w-32 h-2 bg-white/15 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-blue-400'}`} style={{width: `${timePercent}%`}}></div>
                        </div>
                        <div className={`flex items-center gap-1 sm:gap-2 font-black text-sm sm:text-lg tabular-nums ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation: 'bellSwing 2s ease-in-out infinite', transformOrigin: 'top center'}}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                      </div>
                      <a href="/dashboard" className="hidden sm:flex bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition items-center gap-2">
                        Quitter l'annale
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-blue-300">
                        QCM {questions.length} questions
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-blue-300">
                        Réponses multiples
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-blue-300">
                        Annale {annaleTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Note sur {questions.length} — Durée : {annale.duree_minutes || 45} min</p>
                    </div>
                  </div>
                </div>

                <div ref={mainRef} className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative">

                  {(() => {
                    const family = getBaremeFamily(annale.region_nom)
                    if (family) {
                      const palette = {
                        emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-800', textDark: 'text-emerald-900', icon: 'text-emerald-500', marker: 'marker:text-emerald-400', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', stratBg: 'bg-emerald-100/70', stratBorder: 'border-emerald-300' },
                        sky:     { border: 'border-sky-200', bg: 'bg-sky-50', text: 'text-sky-800', textDark: 'text-sky-900', icon: 'text-sky-500', marker: 'marker:text-sky-400', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700', stratBg: 'bg-sky-100/70', stratBorder: 'border-sky-300' },
                        amber:   { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800', textDark: 'text-amber-900', icon: 'text-amber-500', marker: 'marker:text-amber-400', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', stratBg: 'bg-amber-100/70', stratBorder: 'border-amber-300' },
                        rose:    { border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-800', textDark: 'text-rose-900', icon: 'text-rose-500', marker: 'marker:text-rose-400', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700', stratBg: 'bg-rose-100/70', stratBorder: 'border-rose-300' },
                      }
                      const p = palette[family.couleur] || palette.sky
                      return (
                        <div className={`${p.bg} border ${p.border} rounded-xl p-4 mb-6 flex items-start gap-3`}>
                          <svg className={`w-5 h-5 ${p.icon} shrink-0 mt-0.5`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
                          <div className={`text-sm ${p.text} font-medium flex-1`}>
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <p className={`font-black ${p.textDark}`}>Barème de cette annale</p>
                              <span className={`${p.badgeBg} ${p.badgeText} px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider`}>
                                Famille {family.id} — {family.titre}
                              </span>
                            </div>

                            {/* Barre de niveau de difficulté */}
                            <div className="flex items-stretch gap-1 mb-4 max-w-md">
                              {NIVEAUX.map(niv => {
                                const isActive = niv.id === family.niveau
                                return (
                                  <div
                                    key={niv.id}
                                    className={`flex-1 text-center py-1.5 px-2 rounded-md text-[11px] font-black uppercase tracking-wider transition ${isActive ? `${p.badgeBg} ${p.badgeText} border ${p.stratBorder}` : 'bg-white/50 text-slate-400 border border-slate-200'}`}
                                  >
                                    {niv.label}
                                  </div>
                                )
                              })}
                            </div>

                            <ul className={`space-y-1 list-disc pl-5 ${p.marker} mb-3`}>
                              {family.regle.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                            <div className={`${p.stratBg} border ${p.stratBorder} rounded-lg px-3 py-2 flex items-start gap-2`}>
                              <svg className={`w-4 h-4 ${p.icon} shrink-0 mt-0.5`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.39 7.36H22l-6.2 4.5 2.38 7.36L12 16.72l-6.18 4.5L8.2 13.86 2 9.36h7.61z"/></svg>
                              <div>
                                <p className={`font-black ${p.textDark} text-xs uppercase tracking-wider mb-0.5`}>Stratégie recommandée</p>
                                <p className={`${p.textDark} text-sm`}>{family.strategie}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    // Fallback : région non mappée → affiche le bareme brut s'il existe
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
                        <div className="text-sm text-blue-800 font-medium flex-1">
                          <p className="font-black mb-2">Barème de cette annale</p>
                          <p>{annale.bareme || 'Barème spécifique à cette annale — consultez l\'énoncé original pour le détail.'}</p>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="space-y-6">
                    {questions.map((q) => {
                      const selected = reponses[q.numero] || []
                      return (
                        <div key={q.numero} id={`question-${q.numero}`} className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <span className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0">{q.numero}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed">{q.enonce}</p>
                            </div>
                            <span className="text-xs font-bold text-slate-400 shrink-0 ml-2">1 pt</span>
                          </div>

                          <div className="space-y-2 ml-0 sm:ml-12">
                            {(q.propositions || []).map((prop) => {
                              const l = prop.lettre.toLowerCase()
                              const isSelected = selected.includes(l)
                              return (
                                <button
                                  key={prop.lettre}
                                  onClick={() => toggleProposition(q.numero, l)}
                                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left cursor-pointer group ${isSelected ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-all ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                    {prop.lettre.toUpperCase()}
                                  </span>
                                  <span className={`text-sm font-medium leading-relaxed pt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {prop.texte}
                                  </span>
                                  <div className={`ml-auto shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-8 pb-4">
                    <a href="/dashboard" className="text-slate-500 hover:text-slate-700 font-bold text-sm transition cursor-pointer">Abandonner l'annale</a>
                    <button onClick={() => handleSubmit(false)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-200/50 text-sm flex items-center gap-2 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                      Soumettre ({answeredCount}/{questions.length})
                    </button>
                  </div>

                  {/* Scroll to top button */}
                  {showScrollTop && (
                    <button
                      onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="fixed bottom-6 right-6 w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition cursor-pointer z-40"
                    >
                      <ChevronUp size={20} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== RESULT ===== */}
          {step === 'result' && (
            <div className="animate-fade-in max-w-4xl mx-auto pb-8">

              {/* Note globale */}
              <div className="bg-slate-900 rounded-2xl p-8 text-center mb-6 relative">
                <a href="/dashboard" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </a>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Note globale — {annaleFull}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black text-white">{score}</span>
                  <span className="text-6xl font-black text-slate-400">/{questions.length}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span className="text-sm font-bold">Temps : {Math.round((EXAM_DURATION - timeLeft) / 60)} min</span>
                </div>
                {(() => {
                  const percent = Math.round((score / questions.length) * 100)
                  return (
                    <div className="mt-4">
                      <div className="w-full max-w-xs mx-auto h-3 bg-white/15 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${percent >= 70 ? 'bg-emerald-400' : percent >= 50 ? 'bg-blue-400' : 'bg-red-400'}`} style={{width: `${percent}%`}}></div>
                      </div>
                      <p className="text-sm font-bold mt-2 text-slate-300">
                        {percent >= 80 ? 'Excellent ! Vous maîtrisez ce sujet !' : percent >= 60 ? 'Bien joué ! Continuez ainsi.' : percent >= 40 ? 'Correct, mais des lacunes à combler.' : 'Score insuffisant. Revoyez les fondamentaux.'}
                      </p>
                    </div>
                  )
                })()}
              </div>

              {/* Correction détaillée */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <ClipboardCheck size={16} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Correction détaillée</h2>
                </div>

                <div className="space-y-4">
                  {questions.map(q => {
                    const userAnswers = (reponses[q.numero] || []).sort()
                    const correctAnswers = (q.reponses_correctes || []).map(r => r.toLowerCase()).sort()
                    const hasCorrection = correctAnswers.length > 0
                    const isCorrect = hasCorrection && userAnswers.length === correctAnswers.length && userAnswers.every((v, i) => v === correctAnswers[i])

                    return (
                      <div key={q.numero} className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${isCorrect ? 'border-emerald-200' : hasCorrection ? 'border-red-200' : 'border-slate-200'}`}>
                        {/* Question header */}
                        <div className={`px-4 sm:px-6 py-4 flex items-start gap-3 ${isCorrect ? 'bg-emerald-50' : hasCorrection ? 'bg-red-50' : 'bg-slate-50'}`}>
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : hasCorrection ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{q.numero}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.enonce}</p>
                          </div>
                          <div className="shrink-0 ml-2">
                            {hasCorrection && (
                              isCorrect ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                  <CheckCircle2 size={14} strokeWidth={2.5} />
                                  <span className="text-xs font-black">1/1</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
                                  <XCircle size={14} strokeWidth={2.5} />
                                  <span className="text-xs font-black">0/1</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Propositions with correction */}
                        <div className="px-4 sm:px-6 py-4 space-y-2">
                          {(q.propositions || []).map(p => {
                            const l = p.lettre.toLowerCase()
                            const wasSelected = userAnswers.includes(l)
                            const isGood = correctAnswers.includes(l)

                            let bgClass = 'bg-white border-slate-100'
                            if (hasCorrection) {
                              if (isGood && wasSelected) bgClass = 'bg-emerald-50 border-emerald-200'
                              else if (isGood && !wasSelected) bgClass = 'bg-amber-50 border-amber-300 border-dashed'
                              else if (!isGood && wasSelected) bgClass = 'bg-red-50 border-red-200'
                            } else if (wasSelected) {
                              bgClass = 'bg-blue-50 border-blue-300'
                            }

                            return (
                              <div key={p.lettre} className={`flex items-start gap-3 p-3 rounded-xl border ${bgClass}`}>
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${isGood && wasSelected ? 'bg-emerald-500 text-white' : isGood ? 'bg-amber-500 text-white' : wasSelected ? 'bg-red-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  {p.lettre.toUpperCase()}
                                </span>
                                <span className={`text-sm font-medium leading-relaxed pt-0.5 flex-1 ${isGood && !wasSelected ? 'text-amber-800' : isGood ? 'text-slate-800' : wasSelected ? 'text-red-700' : 'text-slate-500'}`}>
                                  {p.texte}
                                </span>
                                <div className="shrink-0 mt-0.5">
                                  {hasCorrection && isGood && wasSelected && <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2} />}
                                  {hasCorrection && isGood && !wasSelected && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Manquée</span>}
                                  {hasCorrection && !isGood && wasSelected && <XCircle size={18} className="text-red-400" strokeWidth={2} />}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Explication */}
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
              <div className="flex items-center justify-center gap-4 pb-4">
                <button onClick={() => { setStep('info'); setReponses({}); setTimeLeft((annale.duree_minutes || 45) * 60) }} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-200/50 text-sm flex items-center gap-2 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  Refaire cette annale
                </button>
                <a href="/dashboard" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition text-sm">Retour au dashboard</a>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
