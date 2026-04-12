'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, Timer, Sparkles, ClipboardCheck, GraduationCap, CheckCircle2, XCircle, ChevronUp } from 'lucide-react'

const LogoIcon = ({size, strokeWidth, className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className} width={size} height={size}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

const THEME_LABELS = {
  missions_statut: 'Missions & Statut',
  hygiene_produits: 'Hygiène & Produits',
  sante_secours: 'Santé & Secours',
  maladies_evictions: 'Maladies & Évictions',
  vie_scolaire: 'Vie scolaire',
  developpement_enfant: 'Développement enfant',
  protection_enfance: 'Protection enfance',
}

const sidebarItems = [
  { id: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { id: 'progression', label: 'Mes stats', href: '/dashboard?tab=progression', icon: TrendingUp },
  { id: 'historique', label: 'Historique', href: '/dashboard?tab=historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', href: '/dashboard?tab=profil', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', href: '/dashboard?tab=abonnement', icon: BadgeCheck, premium: true }
]

export default function ExamenPage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [showInfoPopup, setShowInfoPopup] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [showAccessBlock, setShowAccessBlock] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  // Steps: null (popup), loading, epreuve, correcting, resultat
  const [step, setStep] = useState('loading')
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [correctingStep, setCorrectingStep] = useState(0)

  // QCM state
  const [questions, setQuestions] = useState([])
  const [correction, setCorrection] = useState([])
  const [reponses, setReponses] = useState({}) // { [numero]: ['A', 'C'] }
  const [score, setScore] = useState(null)

  // Chrono — 45 minutes
  const EXAM_DURATION = 45 * 60
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  // Scroll-to-top
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
      const skipPopup = localStorage.getItem('examen_skip_info') === 'true'
      if (skipPopup) {
        genererSujets()
      } else {
        setShowInfoPopup(true)
        setStep(null)
      }
    })
  }, [])

  // Loading animation — 8s par étape, step 4 reste en loading
  useEffect(() => {
    if (step !== 'loading') return
    const delays = [5000, 5000, 5000]
    let currentStep = 0
    function advance() {
      if (currentStep < 3) {
        setTimeout(() => {
          setLoadingStep(prev => prev + 1)
          currentStep++
          advance()
        }, delays[currentStep])
      }
    }
    advance()
  }, [step])

  // Correcting animation
  useEffect(() => {
    if (step !== 'correcting') return
    setCorrectingStep(0)
    const interval = setInterval(() => {
      setCorrectingStep(prev => prev < 4 ? prev + 1 : prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [step])

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

  function handleStartFromPopup() {
    if (dontShowAgain) localStorage.setItem('examen_skip_info', 'true')
    setShowInfoPopup(false)
    genererSujets()
  }

  // Ref pour stocker la correction en background
  const correctionPromise = useRef(null)

  async function genererSujets() {
    setError('')
    setLoadingStep(0)
    setStep('loading')

    try {
      const startTime = Date.now()

      // Étape 1 : générer uniquement les questions (rapide)
      const res = await fetch('/api/maths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generer_questions' })
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Erreur lors de la génération du QCM.'); setStep(null); setShowInfoPopup(true); return }

      let parsedQuestions = data.questions || []

      if (parsedQuestions.length === 0) {
        setError('Format de QCM inattendu. Veuillez réessayer.')
        setStep(null); setShowInfoPopup(true)
        return
      }

      // Mélanger l'ordre des questions
      const indices = parsedQuestions.map((_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
      const shuffledQuestions = indices.map((idx, newIdx) => ({ ...parsedQuestions[idx], numero: newIdx + 1 }))

      // Étape 2 : lancer la génération de la correction en arrière-plan
      correctionPromise.current = fetch('/api/maths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generer_correction', questions: shuffledQuestions })
      }).then(r => r.json()).then(d => {
        if (d.correction) {
          // Renuméroter la correction pour correspondre aux questions mélangées
          const mappedCorrection = shuffledQuestions.map((q, i) => {
            const original = d.correction.find(c => c.numero === parsedQuestions[indices[i]].numero)
            return original ? { ...original, numero: i + 1 } : { numero: i + 1, reponses_correctes: [], explication: '' }
          })
          setCorrection(mappedCorrection)
        }
      }).catch(e => console.error('Erreur correction background:', e))

      const elapsed = Date.now() - startTime
      if (elapsed < 5000) await new Promise(r => setTimeout(r, 5000 - elapsed))

      setQuestions(shuffledQuestions)
      setReponses({})
      setTimeLeft(EXAM_DURATION)
      setStep('epreuve')
      setTimerActive(true)
    } catch (err) {
      setError('Erreur de connexion.')
      window.location.href = '/dashboard'
    }
  }

  function toggleProposition(questionNumero, lettre) {
    setReponses(prev => {
      const current = prev[questionNumero] || []
      if (current.includes(lettre)) {
        return { ...prev, [questionNumero]: current.filter(l => l !== lettre) }
      } else {
        return { ...prev, [questionNumero]: [...current, lettre] }
      }
    })
  }

  async function handleSubmit(autoSubmit = false) {
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (!autoSubmit) {
      const hasAnswers = Object.values(reponses).some(arr => arr.length > 0)
      if (!hasAnswers) { setError('Veuillez répondre à au moins une question avant de soumettre.'); return }
    }
    setError('')
    setCorrectingStep(0)
    setStep('correcting')

    // Attendre la correction background si pas encore arrivée
    if (correction.length === 0 && correctionPromise.current) {
      await correctionPromise.current
    }

    // Score locally
    if (correction.length > 0) {
      const startTime = Date.now()
      let total = 0
      correction.forEach(c => {
        const userAnswers = (reponses[c.numero] || []).sort()
        const correctAnswers = (c.reponses_correctes || []).sort()
        if (userAnswers.length === correctAnswers.length && userAnswers.every((v, i) => v === correctAnswers[i])) {
          total++
        }
      })
      const elapsed = Date.now() - startTime
      if (elapsed < 12000) await new Promise(r => setTimeout(r, 12000 - elapsed))
      setScore(total)

      // Sauvegarder dans l'historique
      const timeUsed = Math.round((EXAM_DURATION - timeLeft) / 60)
      try {
        await supabase.from('historique').insert({
          user_id: user.id,
          type: 'Examen',
          label: 'Examen blanc QCM ATSEM',
          note: total,
          note_max: 20,
          nb_questions: questions.length,
          duration_minutes: timeUsed || 1,
        })
      } catch (e) { console.error('Erreur sauvegarde historique:', e) }

      setStep('resultat')
      return
    }

    // Fallback: send to API for correction
    try {
      const startTime = Date.now()
      const res = await fetch('/api/maths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'corriger', exercices: questions, reponses })
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Erreur lors de la correction.'); setStep('epreuve'); return }
      const elapsed = Date.now() - startTime
      if (elapsed < 12000) await new Promise(r => setTimeout(r, 12000 - elapsed))

      if (data.correction) {
        setScore(data.correction.note || 0)
        setCorrection(data.correction.corrections || [])
      }

      const timeUsed = Math.round((EXAM_DURATION - timeLeft) / 60)
      try {
        await supabase.from('historique').insert({
          user_id: user.id,
          type: 'Examen',
          label: 'Examen blanc QCM ATSEM',
          note: data.correction?.note || 0,
          note_max: 20,
          nb_questions: questions.length,
          duration_minutes: timeUsed || 1,
        })
      } catch (e) { console.error('Erreur sauvegarde historique:', e) }

      setStep('resultat')
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
      setStep('epreuve')
    }
  }

  function restart() {
    setQuestions([]); setCorrection([]); setReponses({}); setScore(null)
    setError(''); setLoadingStep(0); setTimeLeft(EXAM_DURATION); setTimerActive(false)
    genererSujets()
  }

  function getQuestionResult(numero) {
    const c = correction.find(c => c.numero === numero)
    if (!c) return null
    const userAnswers = (reponses[numero] || []).sort()
    const correctAnswers = (c.reponses_correctes || []).sort()
    const isCorrect = userAnswers.length === correctAnswers.length && userAnswers.every((v, i) => v === correctAnswers[i])
    return { ...c, isCorrect, userAnswers }
  }

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timePercent = (timeLeft / EXAM_DURATION) * 100
  const isUrgent = timeLeft < 5 * 60
  const answeredCount = Object.values(reponses).filter(arr => arr.length > 0).length

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div></div>

  if (showAccessBlock) return (<div className="min-h-screen bg-[#eceef1] flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"><div className="text-5xl mb-3 mx-auto">😢</div><h2 className="text-2xl font-black text-slate-900 mb-2">Votre essai gratuit est terminé</h2><p className="text-slate-500 font-medium mb-6">Pour continuer à vous entraîner et accéder à tous les exercices, souscrivez à un abonnement.</p><div className="flex flex-col gap-3"><a href="/tarifs" className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm">Voir les tarifs</a><a href="/dashboard" className="text-slate-500 font-medium text-sm hover:text-slate-700 transition">Retour au tableau de bord</a></div></div></div>)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex" style={{backgroundImage: 'radial-gradient(#eab308 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bellSwing { 0%, 100% { transform: rotate(0deg); } 15% { transform: rotate(8deg); } 30% { transform: rotate(-6deg); } 45% { transform: rotate(4deg); } 60% { transform: rotate(-2deg); } 75% { transform: rotate(0deg); } }
        @keyframes premiumScan { 0%, 80% { opacity: 1; } 85% { opacity: 0.4; transform: scale(1.15); } 90% { opacity: 1; transform: scale(1); filter: brightness(1.5); } 95% { filter: brightness(1); } 100% { opacity: 1; } }
        .premium-scan { animation: premiumScan 5s ease-in-out infinite; }
        @keyframes pulse-urgent { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse-urgent { animation: pulse-urgent 1s ease-in-out infinite; }
        @keyframes heartbeat-line { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
        .heartbeat-anim { animation: heartbeat-line 1.5s linear infinite; }
        .gooey-loader { width: 180px; height: 180px; position: relative; filter: url('#goo'); animation: goo-spin 4s ease-in-out infinite alternate; margin: 0 auto; }
        .goo-drop { position: absolute; top: 50%; left: 50%; background: #eab308; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(-50%, -50%); }
        .goo-yin, .goo-yang { width: 70px; height: 70px; }
        .goo-yin { animation: goo-move-yin 2.5s ease-in-out infinite, goo-morph 3.5s ease-in-out infinite; }
        .goo-yang { animation: goo-move-yang 2.5s ease-in-out infinite, goo-morph 3.5s ease-in-out infinite reverse; }
        @keyframes goo-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes goo-morph { 0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } }
        @keyframes goo-move-yin { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, calc(-50% - 50px)) scale(0.9); } }
        @keyframes goo-move-yang { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, calc(-50% + 50px)) scale(0.9); } }
        .loading-dot { display: inline-block; width: 4px; height: 4px; background-color: currentColor; border-radius: 50%; margin: 0 2px; animation: dot-blink 1.4s infinite; opacity: 0; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot-blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      `}</style>

      {sidebarOpen && <div className="fixed top-14 lg:top-0 inset-x-0 bottom-0 bg-black/30 z-[45] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <div className={`fixed top-14 lg:top-0 bottom-0 left-0 z-50 flex items-start lg:items-center pl-0 lg:pl-3 py-0 lg:py-5 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <aside className="w-[72px] bg-white rounded-none rounded-br-2xl lg:rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/60 border-t-0 lg:border-t flex flex-col items-center py-5 h-full lg:h-[calc(100vh-2.5rem)]" style={{fontFamily: "'Nunito', sans-serif"}}>
          <a href="/" className="mb-4"><div className="w-10 h-10 bg-yellow-500 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><LogoIcon size={20} strokeWidth={2.5} /></div></a>
          <div className="w-7 h-px bg-slate-200 mb-3"></div>
          <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5">
            {sidebarItems.filter(item => !item.premium || !isPremium).map(item => (
              <a key={item.id} href={item.href} className={`w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[11px] font-bold transition-all text-center group ${item.premium ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600' : 'text-slate-900 hover:bg-yellow-50 hover:text-yellow-600'}`}>
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
          <span className="font-black text-lg text-slate-900">Prépa <span className="text-yellow-500">ATSEM</span></span>
          <a href="/dashboard" className="text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </a>
        </header>

        <main className="flex-1 min-h-0 w-full mx-auto px-4 py-4 sm:py-5 lg:flex lg:flex-col lg:overflow-hidden">

          {/* ===== POPUP INFO ===== */}
          {showInfoPopup && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowInfoPopup(false); window.location.href = '/dashboard' }}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>

                <div className="bg-slate-900 px-6 py-5 relative">
                  <button onClick={() => { setShowInfoPopup(false); window.location.href = '/dashboard' }} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                  <h2 className="text-lg font-black text-white pr-8">Examen blanc ATSEM</h2>
                  <p className="text-slate-400 text-sm font-medium mt-1">Conditions réelles</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {[
                      { icon: <ClipboardCheck size={18} strokeWidth={2} />, title: 'QCM de 20 questions (45 min)', text: 'Comme au vrai concours ATSEM : 20 questions à choix multiples sur les situations concrètes du métier.' },
                      { icon: <Timer size={18} strokeWidth={2} />, title: 'Chronomètre de 45 minutes', text: 'Le compte à rebours démarre dès le début. À la fin du temps, vos réponses sont envoyées automatiquement.' },
                      { icon: <Sparkles size={18} strokeWidth={2} />, title: 'Réponses multiples', text: 'Chaque question peut avoir une ou plusieurs bonnes réponses. Il faut toutes les cocher sans erreur pour obtenir le point.' },
                      { icon: <GraduationCap size={18} strokeWidth={2} />, title: 'Note sur 20 + correction', text: '1 point par question uniquement si toutes les bonnes réponses sont cochées et aucune mauvaise. Correction détaillée avec explications.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">{item.icon}</div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleStartFromPopup} className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3.5 rounded-xl transition shadow-lg shadow-yellow-200/50 text-sm flex items-center justify-center gap-2 cursor-pointer mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    Commencer l'examen blanc
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer justify-center">
                    <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer" />
                    <span className="text-xs text-slate-400 font-medium">Ne plus afficher ce message</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ===== LOADING ===== */}
          {step === 'loading' && (
            <div className="animate-fade-in min-h-full lg:h-[calc(100vh-2.5rem)] flex items-center justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md sm:max-w-xl w-full flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-8" style={{fontFamily: "'Nunito', sans-serif"}}>
                <div className="mb-6 sm:mb-8">
                  <svg viewBox="0 0 200 140" className="w-48 h-32 sm:w-56 sm:h-36" xmlns="http://www.w3.org/2000/svg">
                    {/* Ciel */}
                    <rect width="200" height="140" fill="#e0f2fe"/>
                    {/* Soleil qui tourne */}
                    <g>
                      <circle cx="170" cy="30" r="16" fill="#fbbf24"/>
                      <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                        <line x1="170" y1="8" x2="170" y2="3"><animateTransform attributeName="transform" type="rotate" from="0 170 30" to="360 170 30" dur="20s" repeatCount="indefinite"/></line>
                        <line x1="170" y1="52" x2="170" y2="57"><animateTransform attributeName="transform" type="rotate" from="0 170 30" to="360 170 30" dur="20s" repeatCount="indefinite"/></line>
                        <line x1="148" y1="30" x2="143" y2="30"><animateTransform attributeName="transform" type="rotate" from="0 170 30" to="360 170 30" dur="20s" repeatCount="indefinite"/></line>
                        <line x1="192" y1="30" x2="197" y2="30"><animateTransform attributeName="transform" type="rotate" from="0 170 30" to="360 170 30" dur="20s" repeatCount="indefinite"/></line>
                      </g>
                      <animateTransform attributeName="transform" type="rotate" from="0 170 30" to="360 170 30" dur="20s" repeatCount="indefinite"/>
                    </g>
                    {/* Prairie */}
                    <rect x="0" y="100" width="200" height="40" fill="#86efac" rx="0"/>
                    <path d="M0 100 Q50 90 100 100 Q150 110 200 100 L200 140 L0 140Z" fill="#4ade80"/>
                    {/* Herbe */}
                    <g stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="15" y1="105" x2="13" y2="95"/><line x1="20" y1="103" x2="22" y2="93"/>
                      <line x1="55" y1="107" x2="53" y2="97"/><line x1="60" y1="105" x2="62" y2="95"/>
                      <line x1="140" y1="106" x2="138" y2="96"/><line x1="145" y1="104" x2="147" y2="94"/>
                      <line x1="180" y1="105" x2="178" y2="95"/><line x1="185" y1="103" x2="187" y2="93"/>
                    </g>
                    {/* Petites fleurs */}
                    <circle cx="30" cy="103" r="3" fill="#f472b6"/><circle cx="30" cy="103" r="1" fill="#fbbf24"/>
                    <circle cx="160" cy="105" r="3" fill="#c084fc"/><circle cx="160" cy="105" r="1" fill="#fbbf24"/>
                    <circle cx="120" cy="102" r="2.5" fill="#fb923c"/><circle cx="120" cy="102" r="0.8" fill="#fbbf24"/>
                    {/* Maison qui pousse */}
                    <g>
                      <animateTransform attributeName="transform" type="translate" values="0 40;0 0" dur="8s" fill="freeze"/>
                      <animate attributeName="opacity" values="0;0;1;1" dur="8s" fill="freeze" keyTimes="0;0.1;0.4;1"/>
                      {/* Murs */}
                      <rect x="60" y="68" width="40" height="32" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" rx="1"/>
                      {/* Toit */}
                      <path d="M55 68 L80 48 L105 68Z" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.5" strokeLinejoin="round"/>
                      {/* Porte */}
                      <rect x="75" y="80" width="10" height="20" fill="#92400e" rx="1"/>
                      <circle cx="83" cy="91" r="1" fill="#fbbf24"/>
                      {/* Fenetre */}
                      <rect x="64" y="75" width="8" height="8" fill="#bfdbfe" stroke="#d97706" strokeWidth="1" rx="0.5"/>
                      <line x1="68" y1="75" x2="68" y2="83" stroke="#d97706" strokeWidth="0.8"/>
                      <line x1="64" y1="79" x2="72" y2="79" stroke="#d97706" strokeWidth="0.8"/>
                      {/* Cheminee */}
                      <rect x="90" y="52" width="6" height="12" fill="#92400e" rx="0.5"/>
                      {/* Fumee */}
                      <circle cx="93" cy="48" r="3" fill="#94a3b8" opacity="0.4">
                        <animate attributeName="cy" values="48;35;22" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.4;0.2;0" dur="3s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="95" cy="45" r="2.5" fill="#94a3b8" opacity="0.3">
                        <animate attributeName="cy" values="45;32;19" dur="3s" repeatCount="indefinite" begin="1s"/>
                        <animate attributeName="r" values="2.5;4;2" dur="3s" repeatCount="indefinite" begin="1s"/>
                        <animate attributeName="opacity" values="0.3;0.15;0" dur="3s" repeatCount="indefinite" begin="1s"/>
                      </circle>
                    </g>
                    {/* Arbre qui pousse */}
                    <g>
                      <animateTransform attributeName="transform" type="translate" values="0 30;0 0" dur="6s" fill="freeze"/>
                      <animate attributeName="opacity" values="0;1;1" dur="4s" fill="freeze"/>
                      {/* Tronc */}
                      <rect x="33" y="78" width="6" height="22" fill="#92400e" rx="1"/>
                      {/* Feuillage */}
                      <circle cx="36" cy="68" r="14" fill="#22c55e" opacity="0.7"/>
                      <circle cx="28" cy="72" r="10" fill="#16a34a" opacity="0.6"/>
                      <circle cx="44" cy="72" r="10" fill="#16a34a" opacity="0.6"/>
                      <circle cx="36" cy="60" r="10" fill="#4ade80" opacity="0.7"/>
                      {/* Feuillage qui grandit */}
                      <circle cx="36" cy="65" r="0" fill="#86efac" opacity="0.5">
                        <animate attributeName="r" values="0;12" dur="6s" fill="freeze" begin="3s"/>
                      </circle>
                    </g>
                    {/* Nuage qui passe */}
                    <g opacity="0.6">
                      <animate attributeName="opacity" values="0;0.6;0.6;0" dur="12s" repeatCount="indefinite"/>
                      <ellipse rx="18" ry="8" fill="white">
                        <animate attributeName="cx" values="-20;220" dur="12s" repeatCount="indefinite"/>
                        <animate attributeName="cy" values="25;25" dur="12s" repeatCount="indefinite"/>
                      </ellipse>
                      <ellipse rx="12" ry="6" fill="white">
                        <animate attributeName="cx" values="-10;230" dur="12s" repeatCount="indefinite"/>
                        <animate attributeName="cy" values="20;20" dur="12s" repeatCount="indefinite"/>
                      </ellipse>
                    </g>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-2 text-center">Préparation de l'examen blanc...</h2>
                <p className="text-slate-500 font-medium text-xs sm:text-sm text-center mb-6 sm:mb-8">Nous générons votre QCM de 20 questions.</p>
                <div className="w-full max-w-md space-y-3">
                  {[
                    { label: 'Analyse des sujets CDG' },
                    { label: 'Génération des 20 questions QCM' },
                    { label: 'Répartition des 7 thématiques' },
                    { label: 'Mise en forme de l\'épreuve' }
                  ].map((ls, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${i <= loadingStep ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50 border border-slate-100 opacity-40'}`}>
                      <span className={`font-bold text-sm flex-grow ${i <= loadingStep ? 'text-yellow-700' : 'text-slate-400'}`}>{ls.label}</span>
                      {i < loadingStep && <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                      {i === loadingStep && <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin shrink-0"></div>}
                      <span className="text-xs font-bold text-slate-400">{i + 1}/4</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== EPREUVE QCM ===== */}
          {step === 'epreuve' && questions.length > 0 && (
            <div className="animate-fade-in overflow-x-hidden">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-full lg:h-[calc(100vh-2.5rem)] flex flex-col overflow-hidden">

                {/* Barre du haut */}
                <div className="bg-slate-900 rounded-t-2xl px-3 sm:px-6 py-3 sm:py-5 overflow-hidden shrink-0">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-2xl font-black text-white truncate mr-3">Examen blanc ATSEM</h2>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className={`flex items-center gap-2 sm:gap-3 ${isUrgent ? 'pulse-urgent' : ''}`}>
                        <div className="w-24 sm:w-32 h-2 bg-white/15 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-yellow-400'}`} style={{width: `${timePercent}%`}}></div>
                        </div>
                        <div className={`flex items-center gap-1 sm:gap-2 font-black text-sm sm:text-lg tabular-nums ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation: 'bellSwing 2s ease-in-out infinite', transformOrigin: 'top center'}}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                      </div>
                      <a href="/dashboard" className="hidden sm:flex bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition items-center gap-2">
                        Quitter l'examen
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-yellow-300">
                        QCM 20 questions
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-yellow-300">
                        Réponses multiples
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-yellow-300">
                        Calculatrice interdite
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-white">
                        Sujet généré par IA
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-bold">{answeredCount}/20 répondues</span>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Note sur 20 — Durée : 45 min</p>
                    </div>
                  </div>
                </div>

                <div ref={mainRef} className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative">

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
                    <p className="text-sm text-amber-800 font-medium">Chaque question comporte <strong>une ou plusieurs réponses exactes</strong>. Cochez la ou les cases correspondantes. 1 point par question uniquement si toutes les bonnes réponses sont cochées et aucune mauvaise.</p>
                  </div>

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
                              const isSelected = selected.includes(prop.lettre)
                              return (
                                <button
                                  key={prop.lettre}
                                  onClick={() => toggleProposition(q.numero, prop.lettre)}
                                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left cursor-pointer group ${isSelected ? 'bg-yellow-50 border-yellow-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-all ${isSelected ? 'bg-yellow-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                    {prop.lettre}
                                  </span>
                                  <span className={`text-sm font-medium leading-relaxed pt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {prop.texte}
                                  </span>
                                  <div className={`ml-auto shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${isSelected ? 'bg-yellow-500 border-yellow-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
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

                  {error && <p className="text-red-600 font-bold text-sm mt-4">{error}</p>}

                  <div className="flex items-center justify-between mt-8 pb-4">
                    <a href="/dashboard" className="text-slate-500 hover:text-slate-700 font-bold text-sm transition cursor-pointer">Abandonner l'examen</a>
                    <button onClick={() => handleSubmit(false)} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-yellow-200/50 text-sm flex items-center gap-2 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                      Soumettre ({answeredCount}/20)
                    </button>
                  </div>

                  {/* Scroll to top button */}
                  {showScrollTop && (
                    <button
                      onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="fixed bottom-6 right-6 w-10 h-10 bg-yellow-500 text-slate-900 rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-600 transition cursor-pointer z-40"
                    >
                      <ChevronUp size={20} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== CORRECTING ===== */}
          {step === 'correcting' && (
            <div className="animate-fade-in min-h-full lg:h-[calc(100vh-2.5rem)] flex items-center justify-center">
              <svg style={{width:0,height:0,position:'absolute'}}>
                <defs>
                  <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                  </filter>
                </defs>
              </svg>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl w-full flex flex-col items-center justify-center py-12 px-8">
                <div className="gooey-loader mb-8">
                  <div className="goo-drop goo-yin"></div>
                  <div className="goo-drop goo-yang"></div>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Correction en cours...</h2>
                <p className="text-slate-500 font-medium text-sm text-center mb-8">Nous comparons vos réponses avec les bonnes réponses.</p>
                <div className="w-full max-w-md space-y-3">
                  {[
                    { label: 'Lecture de vos réponses' },
                    { label: 'Comparaison avec les bonnes réponses' },
                    { label: 'Calcul de votre score' },
                    { label: 'Génération de la correction détaillée' },
                    { label: 'Sauvegarde dans l\'historique' }
                  ].map((ls, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${i <= correctingStep ? 'bg-yellow-50 border border-yellow-300' : 'bg-slate-50 border border-slate-100 opacity-40'}`}>
                      <span className={`font-bold text-sm flex-grow ${i <= correctingStep ? 'text-yellow-700' : 'text-slate-400'}`}>{ls.label}</span>
                      {i < correctingStep && <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                      {i === correctingStep && <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin shrink-0"></div>}
                      <span className="text-xs font-bold text-slate-400">{i + 1}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== RESULTAT ===== */}
          {step === 'resultat' && (
            <div className="animate-fade-in max-w-4xl mx-auto pb-8">

              {/* Note globale */}
              <div className="bg-slate-900 rounded-2xl p-8 text-center mb-6 relative">
                <a href="/dashboard" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </a>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Note globale -- Examen blanc QCM ATSEM</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black text-white">{score !== null ? score : '?'}</span>
                  <span className="text-6xl font-black text-slate-400">/20</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span className="text-sm font-bold">Temps : {Math.round((EXAM_DURATION - timeLeft) / 60)} min</span>
                </div>
                {score !== null && (
                  <div className="mt-4">
                    <div className="w-full max-w-xs mx-auto h-3 bg-white/15 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${score >= 14 ? 'bg-emerald-400' : score >= 10 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{width: `${(score / 20) * 100}%`}}></div>
                    </div>
                    <p className="text-sm font-bold mt-2 text-slate-300">
                      {score >= 16 ? 'Excellent ! Vous êtes prêt(e) pour le concours !' : score >= 14 ? 'Très bien ! Continuez ainsi.' : score >= 10 ? 'Correct, mais vous pouvez encore progresser.' : score >= 6 ? 'Des lacunes à combler. Poursuivez vos révisions.' : 'Score insuffisant. Revoyez les fondamentaux.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Correction detaillee */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                    <ClipboardCheck size={16} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Correction détaillée</h2>
                </div>

                <div className="space-y-4">
                  {questions.map((q) => {
                    const result = getQuestionResult(q.numero)
                    const userAnswers = reponses[q.numero] || []
                    const correctAnswers = result?.reponses_correctes || []
                    const isCorrect = result?.isCorrect || false

                    return (
                      <div key={q.numero} className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                        {/* Question header */}
                        <div className={`px-4 sm:px-6 py-4 flex items-start gap-3 ${isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{q.numero}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.enonce}</p>
                            {q.theme && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/80 text-slate-500 border border-slate-200">
                                {THEME_LABELS[q.theme] || q.theme}
                              </span>
                            )}
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

                        {/* Propositions with correction */}
                        <div className="px-4 sm:px-6 py-4 space-y-2">
                          {(q.propositions || []).map((prop) => {
                            const wasSelected = userAnswers.includes(prop.lettre)
                            const isGoodAnswer = correctAnswers.includes(prop.lettre)
                            let bgClass = 'bg-white border-slate-100'
                            if (isGoodAnswer && wasSelected) bgClass = 'bg-emerald-50 border-emerald-200'
                            else if (isGoodAnswer && !wasSelected) bgClass = 'bg-emerald-50 border-emerald-300 border-dashed'
                            else if (!isGoodAnswer && wasSelected) bgClass = 'bg-red-50 border-red-200'

                            return (
                              <div key={prop.lettre} className={`flex items-start gap-3 p-3 rounded-xl border ${bgClass}`}>
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${isGoodAnswer ? 'bg-emerald-500 text-white' : wasSelected ? 'bg-red-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  {prop.lettre}
                                </span>
                                <span className={`text-sm font-medium leading-relaxed pt-0.5 flex-1 ${isGoodAnswer ? 'text-slate-800' : wasSelected ? 'text-red-700' : 'text-slate-500'}`}>
                                  {prop.texte}
                                </span>
                                <div className="shrink-0 mt-0.5">
                                  {isGoodAnswer && wasSelected && <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2} />}
                                  {isGoodAnswer && !wasSelected && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Manquée</span>}
                                  {!isGoodAnswer && wasSelected && <XCircle size={18} className="text-red-400" strokeWidth={2} />}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Explanation */}
                        {result?.explication && (
                          <div className="px-4 sm:px-6 pb-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Explication</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{result.explication}</p>
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
                <button onClick={restart} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-yellow-200/50 text-sm flex items-center gap-2 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  Nouvel examen blanc
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
