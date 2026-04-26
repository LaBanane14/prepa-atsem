'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, Timer, Sparkles, ClipboardCheck, GraduationCap, CheckCircle2, XCircle, ChevronUp, Info } from 'lucide-react'
import { getBareme, scoreQuestion, BAREME_FAMILIES, getRegionsForFamily, NIVEAUX, getRegionDisplayName } from '../../lib/baremes-atsem'
import FranceMapData from '../../data/france-map'

// Mapping id du fichier data/france-map.js → nom utilisé par getBareme()
const REGION_ID_TO_NAME = {
  ara: 'Auvergne-Rhône-Alpes',
  bfc: 'Bourgogne-Franche-Comté',
  bre: 'Bretagne',
  cvl: 'Centre-Val de Loire',
  cor: 'Corse',
  ges: 'Grand Est',
  hdf: 'Hauts-de-France',
  idf: 'Île-de-France',
  nor: 'Normandie',
  naq: 'Nouvelle-Aquitaine',
  occ: 'Occitanie',
  pdl: 'Pays de la Loire',
  pac: 'PACA',
}

// Groupes liés : régions qui partagent la même pénalité exacte et qu'on veut highlighter ensemble
// PACA & Corse utilisent toutes deux F4 avec override −1 → on les lie visuellement
const LINKED_GROUPS = [
  ['pac', 'cor'], // PACA + Corse
]
function getLinkedIds(id) {
  const group = LINKED_GROUPS.find(g => g.includes(id))
  return group || [id]
}

function FranceMap({ onRegionClick, hoveredRegion, setHoveredRegion }) {
  // Couleur par famille pour le fill de chaque région
  const familyFill = { 1: '#a7f3d0', 2: '#fde68a', 3: '#fde68a', 4: '#fecdd3' }
  const familyHoverFill = { 1: '#34d399', 2: '#f59e0b', 3: '#f59e0b', 4: '#f43f5e' }
  const linkedIds = hoveredRegion ? getLinkedIds(hoveredRegion) : []

  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg
        viewBox={FranceMapData.viewBox}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Carte des régions de France"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.08))' }}
      >
        {FranceMapData.locations.map(loc => {
          const regionName = REGION_ID_TO_NAME[loc.id]
          const bareme = regionName ? getBareme(regionName) : null
          const family = bareme?.id || null
          const isHovered = linkedIds.includes(loc.id)
          const fill = family
            ? (isHovered ? familyHoverFill[family] : familyFill[family])
            : '#e2e8f0'
          return (
            <path
              key={loc.id}
              d={loc.path}
              aria-label={loc.name}
              tabIndex={family ? 0 : -1}
              role={family ? 'button' : undefined}
              fill={fill}
              stroke="white"
              strokeWidth="1.5"
              style={{ cursor: family ? 'pointer' : 'default', transition: 'fill 0.15s' }}
              onClick={family ? () => onRegionClick(regionName) : undefined}
              onKeyDown={family ? (e) => { if (e.key === 'Enter') onRegionClick(regionName) } : undefined}
              onMouseEnter={() => setHoveredRegion(loc.id)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <title>{loc.name}{bareme ? ` — Famille ${bareme.id} (${NIVEAUX.find(n => n.id === bareme.niveau)?.label})` : ''}</title>
            </path>
          )
        })}
      </svg>
    </div>
  )
}

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
  // Steps: null (popup), choix_region, loading, epreuve, correcting, resultat
  const [step, setStep] = useState('loading')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [error, setError] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [correctingStep, setCorrectingStep] = useState(0)

  // QCM state
  const [questions, setQuestions] = useState([])
  const [correction, _setCorrection] = useState([])
  const correctionRef = useRef([])
  function setCorrection(val) { correctionRef.current = val; _setCorrection(val) }
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
        setStep('choix_region')
      } else {
        setShowInfoPopup(true)
        setStep(null)
      }
    })
  }, [])

  // Loading progress — asymptotique, démarre doucement puis ralentit vers 99%
  useEffect(() => {
    if (step !== 'loading') { setLoadingProgress(0); return }
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const t = (now - t0) / 1000
      const v = 99 * (1 - Math.exp(-Math.pow(t, 1.5) / 18))
      setLoadingProgress(v)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
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
    setStep('choix_region')
  }

  function selectRegionAndStart(regionName) {
    setSelectedRegion(regionName)
    genererSujets()
  }

  // Ref pour stocker la correction en background
  const correctionPromise = useRef(null)

  async function genererSujets() {
    setError('')
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
      if (!res.ok || data.error) { setError(data.error || 'Erreur lors de la génération du QCM.'); setStep('choix_region'); return }

      let parsedQuestions = data.questions || []

      if (parsedQuestions.length === 0) {
        setError('Format de QCM inattendu. Veuillez réessayer.')
        setStep('choix_region')
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
          // La correction est déjà dans l'ordre des questions mélangées (envoyées telles quelles)
          setCorrection(d.correction)
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

    // Si la correction n'est pas encore prête, afficher le loading et attendre
    if (correctionRef.current.length === 0) {
      setStep('correcting')
      if (correctionPromise.current) {
        await correctionPromise.current
      }
    }

    // Scorer — selon la famille de barème de la région choisie
    const corr = correctionRef.current
    if (corr.length > 0) {
      const bareme = getBareme(selectedRegion) || { id: 1, penalty: 0 }
      let total = 0
      corr.forEach(c => {
        const userAnswers = reponses[c.numero] || []
        const correctAnswers = c.reponses_correctes || []
        const { points } = scoreQuestion(bareme, userAnswers, correctAnswers)
        total += points
      })
      setScore(total)

      const timeUsed = Math.round((EXAM_DURATION - timeLeft) / 60)
      try {
        await supabase.from('historique').insert({
          user_id: user.id,
          type: 'Examen',
          label: `Examen blanc — ${selectedRegion || 'ATSEM'}`,
          note: total,
          note_max: 20,
          nb_questions: questions.length,
          duration_minutes: timeUsed || 1,
        })
      } catch (e) { console.error('Erreur sauvegarde historique:', e) }

      setStep('resultat')
    } else {
      setError('Erreur lors de la correction. Réessayez.')
      setStep('epreuve')
    }
  }

  function restart() {
    setQuestions([]); setCorrection([]); setReponses({}); setScore(null)
    setError(''); setTimeLeft(EXAM_DURATION); setTimerActive(false)
    setSelectedRegion(null)
    setStep('choix_region')
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

  // Nettoyer l'énoncé si Claude a inclus les propositions dedans
  function cleanEnonce(enonce) {
    if (!enonce) return ''
    // Supprimer les patterns "A-...", "A)...", "A. ..." en fin d'énoncé
    return enonce
      .replace(/\s*[A-F]\s*[-–)\.]\s*[A-ZÀÂÉÈÊËÏÎÔÙÛÜÇ][^?]*$/g, '')
      .replace(/\s*[A-F]\s*[-–)\.]\s*[A-ZÀÂÉÈÊËÏÎÔÙÛÜÇ].*$/gm, '')
      .trim()
  }

  if (showAccessBlock) return (<div className="min-h-screen bg-[#eceef1] flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"><div className="text-5xl mb-3 mx-auto">😢</div><h2 className="text-2xl font-black text-slate-900 mb-2">Votre essai gratuit est terminé</h2><p className="text-slate-500 font-medium mb-6">Pour continuer à vous entraîner et accéder à tous les exercices, souscrivez à un abonnement.</p><div className="flex flex-col gap-3"><a href="/tarifs" className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm">Voir les tarifs</a><a href="/dashboard" className="text-slate-500 font-medium text-sm hover:text-slate-700 transition">Retour au tableau de bord</a></div></div></div>)

  return (
    <div className="min-h-screen text-slate-900 flex" style={{backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(ellipse 800px 500px at 15% 10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse 700px 500px at 85% 30%, rgba(251,191,36,0.14), transparent 60%), radial-gradient(ellipse 700px 500px at 25% 70%, rgba(236,72,153,0.12), transparent 60%), radial-gradient(ellipse 800px 500px at 80% 90%, rgba(14,165,233,0.12), transparent 60%)', backgroundAttachment: 'fixed', fontFamily: "var(--font-nunito), sans-serif"}}>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .v1-hero-em { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; font-style: normal; }

        /* === LoaderArc (écran de chargement examen) === */
        .la-root { font-family: var(--font-nunito), system-ui, sans-serif; color: #1a1325; }
        .la-page { padding: 24px 8px 40px; position: relative; width: 100%; }
        .la-frame { background: white; border-radius: 20px; border: 1px solid #ece9f0; padding: 20px 16px 18px; max-width: 880px; margin: 0 auto; width: 100%; position: relative; overflow: hidden; box-sizing: border-box; }
        @media (min-width: 640px) { .la-frame { padding: 48px 48px 40px; border-radius: 28px; } }
        .la-frame::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, var(--tc-soft-2), transparent 60%); pointer-events: none; }
        .la-frame > * { position: relative; }
        .lf-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        @media (min-width: 640px) { .lf-head { gap: 16px; margin-bottom: 28px; } }
        .lf-icon-chip { width: 44px; height: 44px; border-radius: 12px; background: var(--tc-tint); color: var(--tc-main); display: grid; place-items: center; flex-shrink: 0; }
        @media (min-width: 640px) { .lf-icon-chip { width: 56px; height: 56px; border-radius: 16px; } }
        .lf-head-text { flex: 1; min-width: 0; }
        .lf-head-text h2 { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tc-main); }
        @media (min-width: 640px) { .lf-head-text h2 { font-size: 12px; letter-spacing: 0.12em; } }
        .lf-head-text h1 { margin: 2px 0 0; font-size: 18px; font-weight: 900; letter-spacing: -0.02em; color: #1a1325; }
        @media (min-width: 640px) { .lf-head-text h1 { font-size: 24px; } }
        .lf-title { font-size: 24px; font-weight: 900; letter-spacing: -0.025em; margin: 6px 0 8px; line-height: 1.1; }
        @media (min-width: 640px) { .lf-title { font-size: 42px; margin: 8px 0 12px; line-height: 1.05; } }
        .lf-title em { font-style: normal; background: linear-gradient(135deg, var(--tc-main) 0%, var(--tc-bright) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .lf-sub { font-size: 13px; line-height: 1.5; color: #5e5270; margin: 0 0 20px; max-width: 540px; }
        @media (min-width: 640px) { .lf-sub { font-size: 15px; line-height: 1.55; margin: 0 0 32px; } }
        .anim-arc { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 8px 0 4px; flex-wrap: wrap; }
        @media (min-width: 640px) { .anim-arc { gap: 56px; padding: 16px 0 8px; } }
        .arc-wrap { position: relative; width: 180px; height: 180px; flex-shrink: 0; }
        @media (min-width: 640px) { .arc-wrap { width: 220px; height: 220px; } }
        .arc-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
        .arc-track { stroke: #ece9f0; stroke-width: 10; fill: none; }
        .arc-fill { stroke: var(--tc-main, #f59e0b); stroke-width: 10; fill: none; stroke-linecap: round; }
        .arc-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
        @media (min-width: 640px) { .arc-center { gap: 6px; } }
        .arc-icon { width: 36px; height: 36px; border-radius: 12px; background: var(--tc-tint); color: var(--tc-main); display: grid; place-items: center; margin-bottom: 2px; }
        @media (min-width: 640px) { .arc-icon { width: 44px; height: 44px; border-radius: 14px; margin-bottom: 4px; } }
        .arc-percent { font-size: 28px; font-weight: 900; letter-spacing: -0.03em; color: #1a1325; line-height: 1; font-variant-numeric: tabular-nums; }
        @media (min-width: 640px) { .arc-percent { font-size: 36px; } }
        .arc-count { font-size: 10px; font-weight: 700; color: #8b7ea3; letter-spacing: 0.06em; text-transform: uppercase; }
        @media (min-width: 640px) { .arc-count { font-size: 12px; letter-spacing: 0.08em; } }
        .arc-count b { color: var(--tc-main); }
        .arc-side { flex: 1; min-width: 0; max-width: 320px; text-align: center; }
        @media (min-width: 640px) { .arc-side { min-width: 220px; text-align: left; } }
        .arc-step-num { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tc-main); margin-bottom: 4px; display: inline-flex; align-items: center; gap: 6px; }
        @media (min-width: 640px) { .arc-step-num { font-size: 11px; letter-spacing: 0.12em; margin-bottom: 6px; gap: 8px; } }
        .arc-step-num::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--tc-main); }
        .arc-side h3 { margin: 0 0 6px; font-size: 15px; font-weight: 800; letter-spacing: -0.02em; color: #1a1325; }
        @media (min-width: 640px) { .arc-side h3 { font-size: 18px; margin: 0 0 8px; } }
        .arc-side p { margin: 0; font-size: 12px; line-height: 1.5; color: #5e5270; }
        @media (min-width: 640px) { .arc-side p { font-size: 14px; line-height: 1.55; } }
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
        <aside className="w-[72px] bg-white rounded-none rounded-br-2xl lg:rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/60 border-t-0 lg:border-t flex flex-col items-center py-5 h-full lg:h-[calc(100vh-2.5rem)]" style={{fontFamily: "var(--font-nunito), sans-serif"}}>
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

        <main className="flex-grow w-full mx-auto px-4 py-4 sm:py-5 overflow-x-hidden overflow-y-auto">

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

          {/* ===== CHOIX RÉGION ===== */}
          {step === 'choix_region' && (
            <div className="animate-fade-in relative max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-5">
              {/* Croix retour — flottante en haut à droite */}
              <a href="/dashboard" className="absolute top-3 right-3 sm:top-5 sm:right-8 z-10 w-10 h-10 rounded-xl bg-slate-900 hover:bg-black flex items-center justify-center text-white transition cursor-pointer shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </a>

              <div className="mb-10 sm:mb-12 max-w-3xl pr-14">
                <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight text-slate-900 mb-4 sm:mb-5">Choisissez votre<br/><em className="v1-hero-em">région</em> d'examen.</h1>
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl">Cela permettra de vous habituer aux barèmes réels.</p>
              </div>

              {/* Légende niveaux (remontée sous le sous-titre) */}
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Barème :</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Souple
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-black">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>Normal
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-600 font-black">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>Difficile
                </span>
              </div>

              <div className="max-w-[400px] mx-auto px-2">
                {error && (
                  <div className="mb-3 bg-red-50 border border-red-200 text-red-700 font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <XCircle size={18} className="shrink-0" />
                    {error}
                  </div>
                )}

                {/* Indication région survolée */}
                <div className="text-center mb-1 h-5">
                  {hoveredRegion && (
                    <span className="text-sm font-black text-slate-900">
                      {(hoveredRegion === 'pac' || hoveredRegion === 'cor')
                        ? 'PACA + Corse'
                        : REGION_ID_TO_NAME[hoveredRegion] || FranceMapData.locations.find(l => l.id === hoveredRegion)?.name}
                    </span>
                  )}
                </div>

                {/* Carte interactive */}
                <FranceMap onRegionClick={selectRegionAndStart} hoveredRegion={hoveredRegion} setHoveredRegion={setHoveredRegion} />
              </div>
            </div>
          )}

          {/* ===== LOADING (arc style Spécifique, 4 étapes examen) ===== */}
          {step === 'loading' && (() => {
            const tv = { main: '#f59e0b', bright: '#fcd34d', tint: '#fef3c7', soft: 'rgba(245,158,11,0.18)', soft2: 'rgba(245,158,11,0.08)' }
            const STEPS = [
              { label: 'Analyse des sujets CDG', desc: 'Lecture des annales récentes et du référentiel officiel du concours ATSEM.', at: 0 },
              { label: 'Génération des 20 questions QCM', desc: 'L\'IA rédige des énoncés réalistes, calibrés sur les situations concrètes du métier.', at: 25 },
              { label: 'Répartition des 7 thématiques', desc: 'Statut, hygiène, santé, maladies, vie scolaire, développement, protection de l\'enfance.', at: 55 },
              { label: 'Mise en forme de l\'épreuve', desc: 'Finalisation du QCM et préparation de la correction détaillée.', at: 85 },
            ]
            const progress = loadingProgress
            const r = 92
            const c = 2 * Math.PI * r
            const offset = c - (progress / 100) * c
            const shown = Math.max(1, Math.min(20, Math.round(progress / 5)))
            const stepIdx = STEPS.reduce((a, s, i) => progress >= s.at ? i : a, 0)
            return (
              <div className="la-root animate-fade-in fixed top-14 lg:top-0 right-0 bottom-0 left-0 lg:left-[90px] z-40 flex items-center justify-center overflow-y-auto p-4" style={{ '--tc-main': tv.main, '--tc-bright': tv.bright, '--tc-tint': tv.tint, '--tc-soft': tv.soft, '--tc-soft-2': tv.soft2 }}>
                <div className="la-page">
                  <div className="la-frame">
                    <div className="lf-head">
                      <div className="lf-icon-chip"><ClipboardCheck size={26} strokeWidth={1.8} /></div>
                      <div className="lf-head-text">
                        <h2>Concours ATSEM — conditions réelles</h2>
                        <h1>Examen blanc{selectedRegion ? ` — ${selectedRegion}` : ''}</h1>
                      </div>
                      <button onClick={() => setStep('choix_region')} className="ml-auto shrink-0 bg-slate-900 hover:bg-black text-white font-bold text-sm px-3 py-2.5 sm:px-5 rounded-xl transition flex items-center gap-2 cursor-pointer">
                        <span className="hidden sm:inline">Quitter l'exercice</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <h2 className="lf-title">Votre examen est <em>en préparation</em>.</h2>
                    <p className="lf-sub">20 questions générées par IA à partir des annales CDG.<br/>Durée 45 min, note sur 20.</p>
                    <div className="anim-arc">
                      <div className="arc-wrap">
                        <svg className="arc-svg" width="220" height="220" viewBox="0 0 220 220">
                          <circle className="arc-track" cx="110" cy="110" r={r} />
                          <circle className="arc-fill" cx="110" cy="110" r={r} strokeDasharray={c} strokeDashoffset={offset} />
                        </svg>
                        <div className="arc-center">
                          <div className="arc-icon"><ClipboardCheck size={22} strokeWidth={1.8} /></div>
                          <div className="arc-percent">{Math.round(progress)}%</div>
                          <div className="arc-count"><b>{shown}</b> / 20 questions</div>
                        </div>
                      </div>
                      <div className="arc-side">
                        <div className="arc-step-num">Étape {stepIdx + 1}/{STEPS.length}</div>
                        <h3>{STEPS[stepIdx].label}</h3>
                        <p>{STEPS[stepIdx].desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ===== EPREUVE QCM ===== */}
          {step === 'epreuve' && questions.length > 0 && (
            <div className="animate-fade-in overflow-x-hidden">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-full lg:h-[calc(100vh-2.5rem)] flex flex-col overflow-hidden">

                {/* Barre du haut */}
                <div className="bg-slate-900 rounded-t-2xl px-3 sm:px-6 py-3 sm:py-5 overflow-hidden shrink-0">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-2xl font-black text-white truncate mr-3">Examen blanc{selectedRegion ? ` — ${selectedRegion}` : ' ATSEM'}</h2>
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
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Note sur 20 — Durée : 45 min</p>
                    </div>
                  </div>
                </div>

                <div ref={mainRef} className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative">

                  {(() => {
                    const family = getBareme(selectedRegion)
                    if (!family) return null
                    const palette = {
                      emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-800', textDark: 'text-emerald-900', icon: 'text-emerald-500', marker: 'marker:text-emerald-400', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', stratBg: 'bg-emerald-100/70', stratBorder: 'border-emerald-300' },
                      amber:   { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800', textDark: 'text-amber-900', icon: 'text-amber-500', marker: 'marker:text-amber-400', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', stratBg: 'bg-amber-100/70', stratBorder: 'border-amber-300' },
                      rose:    { border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', textDark: 'text-rose-800', icon: 'text-rose-400', marker: 'marker:text-rose-300', badgeBg: 'bg-rose-100', badgeText: 'text-rose-600', stratBg: 'bg-rose-100/70', stratBorder: 'border-rose-200' },
                    }
                    const p = palette[family.couleur] || palette.amber
                    return (
                      <div className={`${p.bg} border ${p.border} rounded-xl p-4 mb-6 flex items-start gap-3`}>
                        <Info className={`w-5 h-5 ${p.icon} shrink-0 mt-0.5`} strokeWidth={2} />
                        <div className={`text-sm ${p.text} font-medium flex-1`}>
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <p className={`font-black ${p.textDark}`}>Cette région utilise ce barème</p>
                            <span className={`${p.badgeBg} ${p.badgeText} px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider`}>
                              Famille {family.id} — {family.titre}
                            </span>
                          </div>

                          <div className="flex items-stretch gap-1 mb-4 max-w-md">
                            {NIVEAUX.map(niv => {
                              const isActive = niv.id === family.niveau
                              const activeColors = {
                                1: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                                2: 'bg-amber-100 text-amber-700 border-amber-300',
                                3: 'bg-rose-100 text-rose-600 border-rose-200',
                              }
                              return (
                                <div key={niv.id} className={`flex-1 text-center py-1.5 px-2 rounded-md text-[11px] font-black uppercase tracking-wider transition border ${isActive ? activeColors[niv.id] : 'bg-white/50 text-slate-400 border-slate-200'}`}>
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
                  })()}

                  <div className="space-y-6">
                    {questions.map((q) => {
                      const selected = reponses[q.numero] || []
                      return (
                        <div key={q.numero} id={`question-${q.numero}`} className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <span className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0">{q.numero}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed">{cleanEnonce(q.enonce)}</p>
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
                            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{cleanEnonce(q.enonce)}</p>
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
                            else if (isGoodAnswer && !wasSelected) bgClass = 'bg-amber-50 border-amber-300 border-dashed'
                            else if (!isGoodAnswer && wasSelected) bgClass = 'bg-red-50 border-red-200'

                            return (
                              <div key={prop.lettre} className={`flex items-start gap-3 p-3 rounded-xl border ${bgClass}`}>
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${isGoodAnswer && wasSelected ? 'bg-emerald-500 text-white' : isGoodAnswer ? 'bg-amber-500 text-white' : wasSelected ? 'bg-red-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  {prop.lettre}
                                </span>
                                <span className={`text-sm font-medium leading-relaxed pt-0.5 flex-1 ${isGoodAnswer && !wasSelected ? 'text-amber-800' : isGoodAnswer ? 'text-slate-800' : wasSelected ? 'text-red-700' : 'text-slate-500'}`}>
                                  {prop.texte}
                                </span>
                                <div className="shrink-0 mt-0.5">
                                  {isGoodAnswer && wasSelected && <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2} />}
                                  {isGoodAnswer && !wasSelected && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Manquée</span>}
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
