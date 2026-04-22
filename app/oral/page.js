'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, Upload, Shuffle, Sparkles, MessageCircleQuestion, Mic, MicOff, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'

const LogoIcon = ({size, strokeWidth, className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className} width={size} height={size}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

const catColors = {
  'Motivation et parcours': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  'Missions de l\'ATSEM': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  'Collectivités et droit public': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  'Santé et sécurité': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  'Mise en situation': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700' },
  'Hygiène et entretien': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700' },
  'Développement de l\'enfant': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700' },
  'Protection de l\'enfance': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  'Question piège': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' },
}

const defaultColors = { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' }

const sidebarItems = [
  { id: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { id: 'progression', label: 'Mes stats', href: '/dashboard?tab=progression', icon: TrendingUp },
  { id: 'historique', label: 'Historique', href: '/dashboard?tab=historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', href: '/dashboard?tab=profil', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', href: '/dashboard?tab=abonnement', icon: BadgeCheck, premium: true }
]

export default function OralPage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAccessBlock, setShowAccessBlock] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  // Mode: null = selection, 'cv', 'aleatoire'
  const [mode, setMode] = useState(null)
  // Steps: null (mode selection), 'upload', 'loading', 'questions', 'done'
  const [step, setStep] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  // Timer (elapsed)
  const [elapsed, setElapsed] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  // Speech recognition (Mode CV)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)

  // Mode Aléatoire state
  const [showAnswer, setShowAnswer] = useState(false)
  const [selfEvals, setSelfEvals] = useState({}) // { [id]: 'savais' | 'hesite' | 'passu' }

  // Auth
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

  // Loading animation for CV mode
  useEffect(() => {
    if (step !== 'loading') return
    setLoadingStep(0)
    const t1 = setTimeout(() => setLoadingStep(1), 3000)
    const t2 = setTimeout(() => setLoadingStep(2), 6000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [step])

  // Timer
  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerActive])

  async function handleLogout() { await supabase.auth.signOut(); window.location.href = '/' }

  // === MODE CV ===
  function startModeCV() {
    setMode('cv')
    setStep('upload')
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Seuls les fichiers PDF sont acceptés.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Le fichier ne doit pas dépasser 10 Mo.'); return }

    setFileName(file.name)
    setError('')
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 3000)
    setLoadingStep(0)
    setStep('loading')

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const startTime = Date.now()
      const res = await fetch('/api/oral', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || "Erreur lors de l'analyse du CV."); setStep('upload'); return }
      const elapsedMs = Date.now() - startTime
      if (elapsedMs < 9000) await new Promise(r => setTimeout(r, 9000 - elapsedMs))
      setQuestions(data.questions)
      setElapsed(0)
      setTimerActive(true)
      setCurrentQ(0)
      setAnswers({})
      setStep('questions')
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
      setStep('upload')
    }
  }

  // === MODE ALEATOIRE ===
  async function startModeAleatoire() {
    setMode('aleatoire')
    setError('')
    setStep('loading')
    setLoadingStep(0)

    try {
      const res = await fetch('/api/oral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'aleatoire', nb_questions: 20 })
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Erreur lors du chargement des questions.'); setStep(null); setMode(null); return }
      setQuestions(data.questions)
      setElapsed(0)
      setTimerActive(true)
      setCurrentQ(0)
      setSelfEvals({})
      setShowAnswer(false)
      setStep('questions')
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
      setStep(null)
      setMode(null)
    }
  }

  // Speech recognition (Mode CV)
  function toggleRecording() {
    const q = questions[currentQ]
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setError('La reconnaissance vocale n\'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    recognition.continuous = !isMobile
    recognition.interimResults = true
    recognitionRef.current = recognition
    let finalTranscript = answers[q?.id] || ''
    let shouldRestart = true
    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      setAnswers(prev => ({ ...prev, [q.id]: finalTranscript + (interim ? ' ' + interim : '') }))
    }
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Veuillez autoriser l\'accès au microphone.')
      shouldRestart = false
      setIsRecording(false)
    }
    recognition.onend = () => {
      if (isMobile && shouldRestart && isRecording) {
        try { recognition.start() } catch { setIsRecording(false) }
      } else {
        setIsRecording(false)
      }
    }
    try {
      recognition.start()
      setIsRecording(true)
    } catch {
      setError('Impossible de démarrer le micro. Vérifiez les permissions.')
    }
  }

  // Self evaluation for aleatoire mode
  function handleSelfEval(questionId, value) {
    setSelfEvals(prev => ({ ...prev, [questionId]: value }))
    setShowAnswer(false)
    // Auto-advance to next question
    if (currentQ < questions.length - 1) {
      setTimeout(() => {
        setCurrentQ(prev => prev + 1)
        setShowAnswer(false)
      }, 300)
    } else {
      // Last question => done
      setTimeout(() => finishExercice(), 300)
    }
  }

  // Finish
  async function finishExercice() {
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    const durationUsed = Math.round(elapsed / 60)

    if (mode === 'aleatoire') {
      const savais = Object.values(selfEvals).filter(v => v === 'savais').length
      const hesite = Object.values(selfEvals).filter(v => v === 'hesite').length
      const passu = Object.values(selfEvals).filter(v => v === 'passu').length

      try {
        await supabase.from('historique').insert({
          user_id: user.id,
          type: 'Oral',
          label: 'Oral ATSEM — Questions au sort',
          note: savais,
          note_max: questions.length,
          nb_questions: questions.length,
          duration_minutes: durationUsed || 1,
        })
      } catch (e) { console.error('Erreur sauvegarde historique:', e) }
    } else {
      try {
        await supabase.from('historique').insert({
          user_id: user.id,
          type: 'Oral',
          label: 'Oral ATSEM — Avec mon CV',
          note: null,
          note_max: null,
          nb_questions: questions.length,
          duration_minutes: durationUsed || 1,
        })
      } catch (e) { console.error('Erreur sauvegarde historique:', e) }
    }

    setStep('done')
  }

  function restart() {
    setStep(null); setMode(null); setQuestions([]); setCurrentQ(0); setAnswers({}); setSelfEvals({}); setShowAnswer(false); setFileName(''); setError(''); setLoadingStep(0); setElapsed(0); setTimerActive(false)
  }

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''
  const q = questions[currentQ]
  const colors = q ? (catColors[q.category] || defaultColors) : defaultColors
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0
  const oralMinutes = Math.floor(elapsed / 60)
  const oralSeconds = elapsed % 60

  // Aleatoire score
  const scoreSavais = Object.values(selfEvals).filter(v => v === 'savais').length
  const scoreHesite = Object.values(selfEvals).filter(v => v === 'hesite').length
  const scorePassu = Object.values(selfEvals).filter(v => v === 'passu').length

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div></div>

  if (showAccessBlock) return (
    <div className="min-h-screen bg-[#eceef1] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-5xl mb-3 mx-auto">😢</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Votre essai gratuit est terminé</h2>
        <p className="text-slate-500 font-medium mb-6">Pour continuer à vous entraîner et accéder à tous les exercices, souscrivez à un abonnement.</p>
        <div className="flex flex-col gap-3">
          <a href="/tarifs" className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm">Voir les tarifs</a>
          <a href="/dashboard" className="bg-slate-900 hover:bg-black text-white font-bold text-sm px-6 py-3 rounded-xl transition">Retour au tableau de bord</a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-slate-900 flex" style={{backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(ellipse 800px 500px at 15% 10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse 700px 500px at 85% 30%, rgba(251,191,36,0.14), transparent 60%), radial-gradient(ellipse 700px 500px at 25% 70%, rgba(236,72,153,0.12), transparent 60%), radial-gradient(ellipse 800px 500px at 80% 90%, rgba(14,165,233,0.12), transparent 60%)', backgroundAttachment: 'fixed'}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes premiumScan { 0%, 80% { opacity: 1; } 85% { opacity: 0.4; transform: scale(1.15); } 90% { opacity: 1; transform: scale(1); filter: brightness(1.5); } 95% { filter: brightness(1); } 100% { opacity: 1; } }
        .premium-scan { animation: premiumScan 5s ease-in-out infinite; }
        @keyframes morph { 0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; } 33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; } 66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; } }
        .v1-hero-em { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; font-style: normal; }
      `}</style>

      {/* TOAST */}
      {uploadSuccess && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-900 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg animate-fade-in flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          Fichier {fileName} uploadé avec succès !
        </div>
      )}

      {sidebarOpen && <div className="fixed top-14 lg:top-0 inset-x-0 bottom-0 bg-black/30 z-[45] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <div className={`fixed top-14 lg:top-0 bottom-0 left-0 z-50 flex items-start lg:items-center pl-0 lg:pl-3 py-0 lg:py-5 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <aside className="w-[72px] bg-white rounded-none rounded-br-2xl lg:rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/60 border-t-0 lg:border-t flex flex-col items-center py-5 h-full lg:h-[calc(100vh-2.5rem)]" style={{fontFamily: "'Nunito', sans-serif"}}>
          <a href="/" className="mb-4"><div className="w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><LogoIcon size={20} strokeWidth={2.5} /></div></a>
          <div className="w-7 h-px bg-slate-200 mb-3"></div>
          <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5">
            {sidebarItems.filter(item => !item.premium || !isPremium).map(item => (
              <a key={item.id} href={item.href} className={`w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[11px] font-bold transition-all text-center group ${item.premium ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600' : 'text-slate-900 hover:bg-purple-50 hover:text-purple-800'}`}>
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
        {/* Mobile header */}
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
          <span className="font-black text-lg text-slate-900" style={{ fontFamily: "'Nunito', sans-serif" }}>Prépa <span className="text-purple-800 translate-y-[2px] inline-block">ATSEM</span></span>
          <a href="/dashboard" className="text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </a>
        </header>

        <main className="flex-grow w-full mx-auto px-4 py-4 sm:py-5">

          {error && step !== 'questions' && (
            <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm p-4 rounded-xl mb-6 text-center max-w-2xl mx-auto">{error}</div>
          )}

          {/* ===== MODE SELECTION ===== */}
          {step === null && (
            <div className="animate-fade-in min-h-[calc(100vh-6rem)] flex items-center justify-center">
              <div className="max-w-3xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight text-slate-900 mb-4 sm:mb-5">Préparez-vous à l'<em className="v1-hero-em">oral</em> ATSEM.</h1>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">Choisissez votre mode d'entraînement</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Card 1: Avec mon CV */}
                  <button onClick={startModeCV} className="bg-white border-2 border-slate-200 hover:border-indigo-600 rounded-2xl p-6 sm:p-8 text-left transition-all hover:shadow-lg hover:shadow-indigo-100 group cursor-pointer">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Upload size={26} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Avec mon CV</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Uploadez votre CV et l'IA génère 10 questions personnalisées basées sur votre parcours</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      Commencer
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    </div>
                  </button>

                  {/* Card 2: Questions au sort */}
                  <button onClick={startModeAleatoire} className="bg-white border-2 border-slate-200 hover:border-pink-600 rounded-2xl p-6 sm:p-8 text-left transition-all hover:shadow-lg hover:shadow-pink-100 group cursor-pointer">
                    <div className="w-14 h-14 bg-pink-600 text-white rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Shuffle size={26} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Questions au sort</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">20 questions tirées aléatoirement parmi 300 questions réelles du concours</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-pink-600 font-bold text-sm">
                      Commencer
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    </div>
                  </button>
                </div>

                <div className="text-center mt-6">
                  <a href="/dashboard" className="bg-slate-900 hover:bg-black text-white font-bold text-sm px-6 py-3 rounded-xl transition">Retour au tableau de bord</a>
                </div>
              </div>
            </div>
          )}

          {/* ===== UPLOAD (Mode CV) ===== */}
          {step === 'upload' && (
            <div className="animate-fade-in min-h-[calc(100vh-6rem)] flex items-center justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-2xl w-full p-6 sm:p-10">

                <div className="flex items-center justify-between mb-6">
                  <button onClick={restart} className="text-slate-500 hover:text-slate-700 font-bold text-sm flex items-center gap-1 transition cursor-pointer">
                    <ChevronLeft size={16} /> Retour
                  </button>
                  <a href="/dashboard" className="bg-slate-900 hover:bg-black text-white font-bold text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2">
                    Quitter l'exercice
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </a>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm p-4 rounded-xl mb-6 text-center">{error}</div>}

                <label className="block cursor-pointer mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-3xl p-8 sm:p-12 lg:p-16 text-center transition-all hover:shadow-lg hover:shadow-purple-100 group">
                    <div className="w-20 h-20 bg-white text-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
                    </div>
                    <p className="font-black text-slate-800 text-xl mb-2">Déposez votre CV ici</p>
                    <p className="text-slate-500 font-medium mb-6">ou cliquez pour parcourir vos fichiers</p>
                    <div className="inline-flex items-center gap-2 bg-purple-800 hover:bg-purple-900 text-white font-bold px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl transition shadow-lg shadow-purple-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Importer mon CV
                    </div>
                    <p className="text-xs text-slate-400 mt-4">PDF uniquement — 10 Mo max</p>
                  </div>
                  <input type="file" accept=".pdf,application/pdf" onChange={handleUpload} className="hidden" />
                </label>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
                  <p className="text-sm text-amber-800 font-medium"><strong>Pas de notation !</strong> Le but est seulement de vous préparer au mieux pour le jour J.</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== LOADING ===== */}
          {step === 'loading' && (
            <div className="animate-fade-in min-h-[calc(100vh-6rem)] flex items-center justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl w-full flex flex-col items-center justify-center py-12 px-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-800 to-violet-600 shadow-xl shadow-purple-200 mb-8" style={{animation: 'morph 4s ease-in-out infinite'}}></div>
                <h2 className="text-xl font-black text-slate-900 mb-2">
                  {mode === 'cv' ? 'Analyse de votre CV en cours...' : 'Préparation des questions...'}
                </h2>
                <p className="text-slate-500 font-medium text-sm text-center mb-8">
                  {mode === 'cv' ? 'Nous parcourons votre CV et préparons vos questions personnalisées.' : 'Tirage aléatoire parmi 300 questions du concours ATSEM.'}
                </p>
                {mode === 'cv' && (
                  <div className="w-full max-w-md space-y-3">
                    {[
                      { label: 'Analyse de votre CV' },
                      { label: 'Personnalisation des questions' },
                      { label: "Préparation de l'entretien" }
                    ].map((ls, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${i < loadingStep ? 'bg-green-50 border border-green-200' : i === loadingStep ? 'bg-purple-50 border border-purple-200' : 'bg-slate-50 border border-slate-100 opacity-40'}`}>
                        <span className={`font-bold text-sm flex-grow ${i < loadingStep ? 'text-green-700' : i === loadingStep ? 'text-purple-800' : 'text-slate-400'}`}>{ls.label}</span>
                        {i < loadingStep && <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                        {i === loadingStep && <div className="w-4 h-4 border-2 border-purple-800 border-t-transparent rounded-full animate-spin shrink-0"></div>}
                        <span className="text-xs font-bold text-slate-400">{i + 1}/3</span>
                      </div>
                    ))}
                  </div>
                )}
                {mode === 'aleatoire' && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-bold text-purple-800">Chargement...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== QUESTIONS (Mode CV) ===== */}
          {step === 'questions' && mode === 'cv' && q && (
            <div className="animate-fade-in min-h-[calc(100vh-6rem)] flex items-center justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col w-full max-w-4xl">

                {/* Header sombre */}
                <div className="bg-slate-900 rounded-t-2xl px-3 sm:px-6 py-3 sm:py-5 overflow-hidden">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-2xl font-black text-white truncate mr-3">Préparation à l'oral</h2>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className="flex items-center gap-1 sm:gap-2 font-black text-sm sm:text-lg tabular-nums text-white">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {String(oralMinutes).padStart(2, '0')}:{String(oralSeconds).padStart(2, '0')}
                      </div>
                      <a href="/dashboard" className="hidden sm:flex bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition items-center gap-2">
                        Quitter
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-purple-300">
                      Question {currentQ + 1}/{questions.length}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${colors.badge}`}>
                      {q.category}
                    </span>
                  </div>
                  <div className="mt-3 w-full h-1 bg-white/10 rounded-full">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-relaxed">{q.question}</h2>

                  <div className="mb-3 relative">
                    <textarea
                      rows={3}
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Rédigez votre réponse ou utilisez le micro pour dicter..."
                      className="w-full px-4 py-3 pr-14 bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-purple-400 outline-none font-medium text-sm resize-y transition"
                    />
                    <button onClick={toggleRecording} className={`absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-purple-100 hover:text-purple-800'}`} title={isRecording ? 'Arrêter le micro' : 'Dicter ma réponse'}>
                      {isRecording ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                      )}
                    </button>
                  </div>

                  {error && <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm p-3 rounded-xl mb-3 text-center">{error}</div>}

                  <div className="flex justify-between mt-4">
                    {currentQ > 0 ? (
                      <button onClick={() => setCurrentQ(currentQ - 1)} className="bg-slate-100 text-slate-700 font-bold py-3 px-4 sm:px-5 rounded-xl hover:bg-slate-200 flex items-center gap-2 text-sm transition cursor-pointer">
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Précédent</span>
                      </button>
                    ) : <div></div>}
                    {currentQ < questions.length - 1 ? (
                      <button onClick={() => setCurrentQ(currentQ + 1)} className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 sm:px-5 rounded-xl text-sm flex items-center gap-2 shadow-md transition cursor-pointer">
                        <span className="hidden sm:inline">Question suivante</span>
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button onClick={finishExercice} className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-3 px-4 sm:px-5 rounded-xl text-sm flex items-center gap-2 shadow-md transition cursor-pointer">
                        Terminer l'exercice
                        <Check size={16} />
                      </button>
                    )}
                  </div>

                  {/* Grille navigation */}
                  <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-md mx-auto">
                    {questions.map((qq, i) => (
                      <button key={qq.id} onClick={() => setCurrentQ(i)} className={`aspect-square rounded-lg text-xs font-bold transition cursor-pointer bg-slate-900 text-white ${i === currentQ ? 'ring-2 ring-offset-2 ring-slate-900' : answers[qq.id] ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== QUESTIONS (Mode Aléatoire) ===== */}
          {step === 'questions' && mode === 'aleatoire' && q && (
            <div className="animate-fade-in min-h-[calc(100vh-6rem)] flex items-center justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col w-full max-w-4xl">

                {/* Header sombre */}
                <div className="bg-slate-900 rounded-t-2xl px-3 sm:px-6 py-3 sm:py-5 overflow-hidden">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-2xl font-black text-white truncate mr-3">Questions au sort</h2>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className="flex items-center gap-1 sm:gap-2 font-black text-sm sm:text-lg tabular-nums text-white">
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {String(oralMinutes).padStart(2, '0')}:{String(oralSeconds).padStart(2, '0')}
                      </div>
                      <a href="/dashboard" className="hidden sm:flex bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition items-center gap-2">
                        Quitter
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/15 text-pink-400">
                      Question {currentQ + 1}/{questions.length}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${colors.badge}`}>
                      {q.category}
                    </span>
                  </div>
                  <div className="mt-3 w-full h-1 bg-white/10 rounded-full">
                    <div className="h-full bg-pink-400 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 leading-relaxed">{q.question}</h2>

                  {/* Bouton réponse attendue */}
                  {!showAnswer && !selfEvals[q.id] && (
                    <button onClick={() => setShowAnswer(true)} className="w-full bg-purple-50 border-2 border-purple-200 hover:border-purple-400 text-purple-800 font-bold py-4 px-6 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-sm mb-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      Voir la réponse attendue
                    </button>
                  )}

                  {/* Réponse attendue */}
                  {(showAnswer || selfEvals[q.id]) && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5 animate-fade-in">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Réponse attendue</p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{q.reponse_attendue}</p>
                    </div>
                  )}

                  {/* Self evaluation buttons */}
                  {showAnswer && !selfEvals[q.id] && (
                    <div className="animate-fade-in">
                      <p className="text-sm font-bold text-slate-600 text-center mb-3">Comment avez-vous répondu ?</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => handleSelfEval(q.id, 'savais')} className="bg-pink-50 border-2 border-pink-200 hover:border-pink-500 hover:bg-pink-100 text-pink-700 font-bold py-3 px-3 rounded-xl transition cursor-pointer text-sm flex flex-col items-center gap-1">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          Je savais
                        </button>
                        <button onClick={() => handleSelfEval(q.id, 'hesite')} className="bg-amber-50 border-2 border-amber-200 hover:border-amber-500 hover:bg-amber-100 text-amber-700 font-bold py-3 px-3 rounded-xl transition cursor-pointer text-sm flex flex-col items-center gap-1">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
                          J'ai hésité
                        </button>
                        <button onClick={() => handleSelfEval(q.id, 'passu')} className="bg-red-50 border-2 border-red-200 hover:border-red-500 hover:bg-red-100 text-red-700 font-bold py-3 px-3 rounded-xl transition cursor-pointer text-sm flex flex-col items-center gap-1">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          Je ne savais pas
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Already evaluated indicator */}
                  {selfEvals[q.id] && (
                    <div className={`text-center text-sm font-bold py-2 rounded-xl ${selfEvals[q.id] === 'savais' ? 'text-pink-600' : selfEvals[q.id] === 'hesite' ? 'text-amber-600' : 'text-red-600'}`}>
                      {selfEvals[q.id] === 'savais' ? 'Vous saviez' : selfEvals[q.id] === 'hesite' ? 'Vous avez hésité' : 'Vous ne saviez pas'}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    {currentQ > 0 ? (
                      <button onClick={() => { setCurrentQ(currentQ - 1); setShowAnswer(false) }} className="bg-slate-100 text-slate-700 font-bold py-3 px-4 sm:px-5 rounded-xl hover:bg-slate-200 flex items-center gap-2 text-sm transition cursor-pointer">
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Précédent</span>
                      </button>
                    ) : <div></div>}
                    {selfEvals[q.id] && currentQ < questions.length - 1 && (
                      <button onClick={() => { setCurrentQ(currentQ + 1); setShowAnswer(false) }} className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 sm:px-5 rounded-xl text-sm flex items-center gap-2 shadow-md transition cursor-pointer">
                        <span className="hidden sm:inline">Question suivante</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                    {selfEvals[q.id] && currentQ === questions.length - 1 && (
                      <button onClick={finishExercice} className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-3 px-4 sm:px-5 rounded-xl text-sm flex items-center gap-2 shadow-md transition cursor-pointer">
                        Voir mes résultats
                        <Check size={16} />
                      </button>
                    )}
                  </div>

                  {/* Grille navigation */}
                  <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-md mx-auto">
                    {questions.map((qq, i) => {
                      const ev = selfEvals[qq.id]
                      const bgColor = ev === 'savais' ? 'bg-pink-500 text-white' : ev === 'hesite' ? 'bg-amber-500 text-white' : ev === 'passu' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white opacity-40'
                      return (
                        <button key={qq.id} onClick={() => { setCurrentQ(i); setShowAnswer(false) }} className={`aspect-square rounded-lg text-xs font-bold transition cursor-pointer ${bgColor} ${i === currentQ ? 'ring-2 ring-offset-2 ring-slate-900 opacity-100' : ev ? 'opacity-100' : 'hover:opacity-60'}`}>
                          {i + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== DONE (Mode CV) ===== */}
          {step === 'done' && mode === 'cv' && (
            <div className="animate-fade-in min-h-[calc(100vh-6rem)] flex items-center justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-lg w-full p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Entretien terminé !</h2>
                <p className="text-slate-500 font-medium text-sm mb-2">Vous avez répondu à {questions.length} questions en {String(oralMinutes).padStart(2, '0')}:{String(oralSeconds).padStart(2, '0')}.</p>
                <p className="text-slate-400 text-sm mb-8">Votre entraînement a été enregistré dans votre historique.</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={restart} className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm cursor-pointer">
                    Nouvel entraînement
                  </button>
                  <a href="/dashboard" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition text-sm">
                    Tableau de bord
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ===== DONE (Mode Aléatoire) ===== */}
          {step === 'done' && mode === 'aleatoire' && (
            <div className="animate-fade-in min-h-[calc(100vh-6rem)] flex items-center justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-lg w-full p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Check size={32} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Entraînement terminé !</h2>
                  <p className="text-slate-500 font-medium text-sm">{questions.length} questions en {String(oralMinutes).padStart(2, '0')}:{String(oralSeconds).padStart(2, '0')}</p>
                </div>

                {/* Score recap */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 bg-pink-50 border border-pink-200 rounded-xl p-4">
                    <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-black text-lg">{scoreSavais}</div>
                    <div>
                      <p className="font-black text-pink-700 text-sm">Je savais</p>
                      <p className="text-pink-600 text-xs font-medium">{questions.length > 0 ? Math.round((scoreSavais / questions.length) * 100) : 0}% de bonnes réponses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-lg">{scoreHesite}</div>
                    <div>
                      <p className="font-black text-amber-700 text-sm">J'ai hésité</p>
                      <p className="text-amber-600 text-xs font-medium">{questions.length > 0 ? Math.round((scoreHesite / questions.length) * 100) : 0}% à revoir</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-lg">{scorePassu}</div>
                    <div>
                      <p className="font-black text-red-700 text-sm">Je ne savais pas</p>
                      <p className="text-red-600 text-xs font-medium">{questions.length > 0 ? Math.round((scorePassu / questions.length) * 100) : 0}% à apprendre</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={restart} className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm cursor-pointer">
                    Nouvel entraînement
                  </button>
                  <a href="/dashboard" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition text-sm text-center">
                    Tableau de bord
                  </a>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
