'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, Stethoscope, Target, BookOpen, Sparkles, ClipboardCheck } from 'lucide-react'

const sidebarItems = [
  { id: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { id: 'progression', label: 'Mes stats', href: '/dashboard?tab=progression', icon: TrendingUp },
  { id: 'historique', label: 'Historique', href: '/dashboard?tab=historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', href: '/dashboard?tab=profil', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', href: '/dashboard?tab=abonnement', icon: BadgeCheck, premium: true }
]

const familles = [
  {
    id: 'operations',
    titre: 'Opérations décimales',
    description: 'Additions, soustractions, multiplications et divisions de nombres décimaux sans calculatrice.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    color: 'blue'
  },
  {
    id: 'pourcentages',
    titre: 'Pourcentages et proportionnalité',
    description: 'Pourcentages, augmentations, remises et problèmes de proportionnalité.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    color: 'amber'
  },
  {
    id: 'conversions',
    titre: 'Conversions d\'unités',
    description: 'Heures, masses, volumes, surfaces : maîtrisez les tableaux de conversion.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-9L21 12m0 0-4.5 4.5M21 12H7.5"/></svg>,
    color: 'emerald'
  },
  {
    id: 'equations',
    titre: 'Équations et problèmes',
    description: 'Mise en équation et résolution de problèmes concrets de logique.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12h16"/><path d="M4 6h16"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>,
    color: 'purple'
  }
]

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', hoverBorder: 'hover:border-blue-400', iconBg: 'bg-blue-100', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50', badge: 'bg-blue-50 text-blue-600', wrapper: 'bg-blue-100/60', card: 'bg-blue-50 border-blue-200', progressBar: 'bg-blue-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', hoverBorder: 'hover:border-amber-400', iconBg: 'bg-amber-100', gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50', badge: 'bg-amber-50 text-amber-600', wrapper: 'bg-amber-100/60', card: 'bg-amber-50 border-amber-200', progressBar: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', hoverBorder: 'hover:border-emerald-400', iconBg: 'bg-emerald-100', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', badge: 'bg-emerald-50 text-emerald-600', wrapper: 'bg-emerald-100/60', card: 'bg-emerald-50 border-emerald-200', progressBar: 'bg-emerald-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', hoverBorder: 'hover:border-purple-400', iconBg: 'bg-purple-100', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50', badge: 'bg-purple-50 text-purple-600', wrapper: 'bg-purple-100/60', card: 'bg-purple-50 border-purple-200', progressBar: 'bg-purple-500' }
}

const letters = ['A', 'B', 'C', 'D']

export default function SpecifiquePage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [showInfoPopup, setShowInfoPopup] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [step, setStep] = useState('choix') // null, choix, loading, epreuve, resultat
  const [selectedFamille, setSelectedFamille] = useState(null)
  const [sujet, setSujet] = useState(null)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)

  // QCM state
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [qState, setQState] = useState('questioning') // questioning, answered

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      setAuthLoading(false)
      const skipPopup = localStorage.getItem('specifique_skip_info') === 'true'
      if (!skipPopup) {
        setShowInfoPopup(true)
        setStep(null)
      }
    })
  }, [])

  useEffect(() => {
    if (step !== 'loading') return
    const interval = setInterval(() => {
      setLoadingStep(prev => prev < 3 ? prev + 1 : prev)
    }, 4000)
    return () => clearInterval(interval)
  }, [step])

  async function handleLogout() { await supabase.auth.signOut(); window.location.href = '/' }

  async function startExercice(famille) {
    setSelectedFamille(famille)
    setError('')
    setLoadingStep(0)
    setStep('loading')

    try {
      const res = await fetch('/api/specifique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generer', famille: famille.id })
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Erreur lors de la génération.'); setStep('choix'); return }
      setSujet(data.sujet)
      setAnswers(new Array(data.sujet.questions.length).fill(null))
      setCurrent(0)
      setSelected(null)
      setQState('questioning')
      setStep('epreuve')
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
      setStep('choix')
    }
  }

  function selectOption(index) {
    if (qState !== 'questioning') return
    setSelected(index)
  }

  function validate() {
    if (selected === null) return
    const newAnswers = [...answers]
    newAnswers[current] = selected
    setAnswers(newAnswers)
    setQState('answered')
  }

  function goNext() {
    if (current < sujet.questions.length - 1) {
      setCurrent(current + 1)
      setSelected(null)
      setQState(answers[current + 1] !== null ? 'answered' : 'questioning')
    } else {
      finishQuiz()
    }
  }

  function goPrev() {
    if (current > 0) {
      setCurrent(current - 1)
      setSelected(answers[current - 1])
      setQState(answers[current - 1] !== null ? 'answered' : 'questioning')
    }
  }

  function handleAction() {
    if (qState === 'questioning') validate()
    else goNext()
  }

  async function finishQuiz() {
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === sujet.questions[index].correct ? 1 : 0)
    }, 0)

    await supabase.from('historique').insert({
      user_id: user.id,
      type: 'Spécifique',
      label: selectedFamille.titre,
      note: score,
      note_max: sujet.questions.length,
      nb_questions: sujet.questions.length,
      duration_minutes: null,
    })

    setStep('resultat')
  }

  function restart() {
    setStep('choix'); setSujet(null); setAnswers([]); setError(''); setLoadingStep(0); setSelectedFamille(null); setCurrent(0); setSelected(null); setQState('questioning')
  }

  function retryFamille() {
    if (selectedFamille) startExercice(selectedFamille)
    else restart()
  }

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''
  const isPremium = false
  const c = selectedFamille ? colorMap[selectedFamille.color] : colorMap.blue

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>

  // QCM derived state
  const data = sujet?.questions?.[current]
  const hasAnswered = answers[current] !== null
  const isCorrect = hasAnswered && answers[current] === data?.correct
  const progress = sujet ? ((current + 1) / sujet.questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes morph { 0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; } 33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; } 66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; } }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
      </div>

      {/* ===== POPUP INFO ===== */}
      {showInfoPopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowInfoPopup(false); window.location.href = '/dashboard' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>

            <div className="bg-slate-900 px-6 py-5 relative">
              <button onClick={() => { setShowInfoPopup(false); window.location.href = '/dashboard' }} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h2 className="text-lg font-black text-white pr-8">Entraînement spécifique</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Avant de commencer, voici le déroulement de l'épreuve.</p>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                {[
                  { icon: <Target size={18} strokeWidth={2} />, title: 'Choisissez votre famille', text: 'Opérations, pourcentages, conversions ou équations : travaillez vos points faibles.' },
                  { icon: <BookOpen size={18} strokeWidth={2} />, title: '10-15 questions par session', text: 'Des QCM ciblés, sans calculatrice, pour progresser efficacement.' },
                  { icon: <Sparkles size={18} strokeWidth={2} />, title: 'Exercices générés par notre IA', text: 'Des exercices spécifiques et ciblées pour progresser rapidement !' },
                  { icon: <ClipboardCheck size={18} strokeWidth={2} />, title: 'Correction détaillée', text: 'Chaque réponse est corrigée avec une explication pas à pas pour comprendre la méthode.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => { if (dontShowAgain) localStorage.setItem('specifique_skip_info', 'true'); setShowInfoPopup(false); setStep('choix') }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-200/50 text-sm flex items-center justify-center gap-2 cursor-pointer mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                C'est parti !
              </button>

              <label className="flex items-center gap-2 cursor-pointer justify-center">
                <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-xs text-slate-400 font-medium">Ne plus afficher ce message</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHOIX FAMILLE ===== */}
      {step === 'choix' && (
        <div className="animate-fade-in min-h-screen flex flex-col items-center justify-center px-4 relative">
          <a href="/dashboard" className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </a>

          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Choisissez une famille</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm px-5 py-3 rounded-xl mb-6 flex items-center gap-2 max-w-2xl w-full">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl w-full">
            {familles.map(f => {
              const fc = colorMap[f.color]
              return (
                <button key={f.id} onClick={() => startExercice(f)} className={`bg-white p-6 rounded-2xl border-2 ${fc.border} ${fc.hoverBorder} shadow-sm hover:shadow-md transition text-left cursor-pointer group`}>
                  <div className={`w-12 h-12 ${fc.iconBg} ${fc.text} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h2 className="text-base font-black text-slate-900 mb-1">{f.titre}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== LOADING ===== */}
      {step === 'loading' && selectedFamille && (
        <div className="animate-fade-in min-h-screen flex items-center justify-center px-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl w-full flex flex-col items-center justify-center py-12 px-8">
            <div className={`w-24 h-24 bg-gradient-to-br ${colorMap[selectedFamille.color].gradient} shadow-xl mb-8`} style={{animation: 'morph 4s ease-in-out infinite'}}></div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Génération des exercices...</h2>
            <p className="text-slate-500 font-medium text-sm text-center mb-8">Préparation de votre entraînement « {selectedFamille.titre} »</p>
            <div className="w-full max-w-md space-y-3">
              {[
                { label: 'Analyse des annales' },
                { label: 'Sélection des exercices' },
                { label: 'Préparation des explications' },
                { label: 'Mise en forme' }
              ].map((ls, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${i <= loadingStep ? `${colorMap[selectedFamille.color].light} border ${colorMap[selectedFamille.color].border}` : 'bg-slate-50 border border-slate-100 opacity-40'}`}>
                  <span className={`font-bold text-sm flex-grow ${i <= loadingStep ? colorMap[selectedFamille.color].text : 'text-slate-400'}`}>{ls.label}</span>
                  {i < loadingStep && <svg className={`w-5 h-5 ${colorMap[selectedFamille.color].text} shrink-0`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  {i === loadingStep && <div className={`w-4 h-4 border-2 ${colorMap[selectedFamille.color].text} border-t-transparent rounded-full animate-spin shrink-0`} style={{borderColor: undefined}}></div>}
                  <span className="text-xs font-bold text-slate-400">{i + 1}/4</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ÉPREUVE QCM ===== */}
      {step === 'epreuve' && sujet && data && selectedFamille && (
        <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 py-4 sm:py-6 overflow-x-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-6 xl:gap-8 items-start w-full">

            <div className="hidden xl:block"></div>

            <div className="w-full max-w-2xl mx-auto xl:w-[650px] relative mt-2 sm:mt-4">
              <a href="/dashboard" className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 hover:bg-black text-white rounded-full flex items-center justify-center transition shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </a>

              <div className={`${c.wrapper} rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-6 shadow-sm`}>
              <div className="bg-white rounded-xl sm:rounded-[2rem] shadow-xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="relative flex flex-wrap justify-between items-center p-3 sm:p-5 border-b border-slate-100 gap-2">
                  <span className="text-slate-600 font-bold text-xs sm:text-sm tracking-wide">Question {current + 1}/{sujet.questions.length}</span>
                  <span className={`${c.badge} px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide uppercase transition-colors duration-300`}>{selectedFamille.titre}</span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                    <div className={`h-full ${c.progressBar} transition-all duration-500`} style={{width: `${progress}%`}}></div>
                  </div>
                </div>

                {/* Question */}
                <div className="p-4 sm:p-6 flex-grow">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5 leading-relaxed">{data.question}</h2>
                  <div className="space-y-2 sm:space-y-3">
                    {data.options.map((option, index) => {
                      let optClass = 'p-3 sm:p-4 border rounded-xl flex justify-between items-center group transition-all '
                      let letterClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold flex items-center justify-center text-xs sm:text-sm shrink-0 transition-all '
                      let circleContent = null

                      if (hasAnswered) {
                        if (index === data.correct) {
                          optClass += 'border-green-500 bg-green-50 '
                          letterClass += 'bg-green-500 text-white '
                          circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                        } else if (index === answers[current]) {
                          optClass += 'border-red-500 bg-red-50 '
                          letterClass += 'bg-red-500 text-white '
                          circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div>
                        } else {
                          optClass += 'border-slate-200 opacity-50 '
                          letterClass += 'bg-slate-100 text-slate-500 '
                          circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-300"></div>
                        }
                      } else if (selected === index) {
                        optClass += 'border-slate-900 bg-slate-50 shadow-[0_0_0_4px_rgba(15,23,42,0.05)] cursor-pointer '
                        letterClass += 'bg-slate-900 text-white '
                        circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-900 flex items-center justify-center"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-900 rounded-full"></div></div>
                      } else {
                        optClass += 'border-slate-200 cursor-pointer hover:bg-slate-50 '
                        letterClass += 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 '
                        circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-300"></div>
                      }

                      return (
                        <div key={index} className={optClass} onClick={() => !hasAnswered && selectOption(index)}>
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className={letterClass}>{letters[index]}</span>
                            <span className="font-bold text-slate-800 text-sm sm:text-base">{option}</span>
                          </div>
                          {circleContent}
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
                  <button onClick={handleAction} className={`flex-grow bg-slate-900 text-white font-bold py-3 px-4 rounded-xl transition-colors hover:bg-black flex items-center justify-center gap-2 text-sm sm:text-base shadow-md ${qState === 'questioning' && selected === null ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
                    {qState === 'questioning' ? (
                      <>Valider ma réponse <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></>
                    ) : current === sujet.questions.length - 1 ? (
                      <>Voir mes résultats <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></>
                    ) : (
                      <>Question suivante <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></>
                    )}
                  </button>
                </div>
              </div>
            </div>
            </div>

            {/* Explanation panel */}
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
                  <div className="leading-relaxed font-medium text-slate-900 bg-white/60 p-3 sm:p-5 rounded-xl border border-white/40 shadow-sm text-sm sm:text-base" dangerouslySetInnerHTML={{__html: data.explanation}}></div>
                </div>
              )}
            </div>

          </div>
        </main>
      )}

      {/* ===== RÉSULTATS ===== */}
      {step === 'resultat' && sujet && selectedFamille && (
        <main className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="max-w-3xl w-full bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-slate-100 relative overflow-hidden text-center">

            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            <a href="/dashboard" className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors z-20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </a>

            <div className="relative z-10">
              <div className="mb-2">
                <span className={`${c.badge} px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase`}>{selectedFamille.titre}</span>
              </div>

              <div className="flex justify-center items-center mb-4 mt-4">
                <span className={`text-6xl sm:text-7xl font-black ${c.text} tracking-tighter`}>{answers.reduce((acc, a, i) => acc + (a === sujet.questions[i].correct ? 1 : 0), 0)}</span>
                <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter">/{sujet.questions.length}</span>
              </div>

              <p className="text-slate-600 mb-8 font-medium text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                {(() => {
                  const score = answers.reduce((acc, a, i) => acc + (a === sujet.questions[i].correct ? 1 : 0), 0)
                  const pct = (score / sujet.questions.length) * 100
                  if (pct >= 80) return 'Excellent ! Vous maîtrisez très bien cette famille d\'exercices.'
                  if (pct >= 60) return 'Bien joué ! Continuez à vous entraîner pour consolider vos acquis.'
                  if (pct >= 40) return 'Des bases solides, mais il reste des points à travailler. N\'hésitez pas à recommencer !'
                  return 'Cette famille nécessite encore du travail. Relisez les explications et réessayez !'
                })()}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <button onClick={retryFamille} className={`bg-gradient-to-r ${c.gradient} text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg text-sm flex items-center gap-2 cursor-pointer`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  Recommencer
                </button>
                <button onClick={restart} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition text-sm cursor-pointer">
                  Changer de famille
                </button>
                <a href="/dashboard" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition text-sm">
                  Dashboard
                </a>
              </div>

              {/* Revue des questions */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 text-left">
                <h3 className="font-bold text-slate-800 mb-4 text-sm sm:text-base">Revue de vos réponses :</h3>
                <div className="space-y-3">
                  {sujet.questions.map((q, i) => {
                    const correct = answers[i] === q.correct
                    return (
                      <div key={i} className={`p-3 sm:p-4 rounded-xl border shadow-sm transition-transform hover:-translate-y-0.5 ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{i + 1}</div>
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-slate-800 text-sm mb-1">{q.question}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {!correct && <span className="text-xs font-bold text-red-600">Votre réponse : {q.options[answers[i]]}</span>}
                              <span className="text-xs font-bold text-green-700">Réponse : {q.options[q.correct]}</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${correct ? 'bg-green-500' : 'bg-red-500'}`}>
                            {correct ? (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            ) : (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
