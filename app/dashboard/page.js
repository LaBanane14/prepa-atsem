'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, CircleX, CreditCard, Lightbulb, MessageCircle, CircleHelp } from 'lucide-react'

const LogoIcon = ({size, strokeWidth, className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className} width={size} height={size}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const menuItems = [
  { id: 'dashboard', label: 'Accueil', icon: Home },
  { id: 'progression', label: 'Mes stats', icon: TrendingUp },
  { id: 'historique', label: 'Historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', icon: BadgeCheck, premium: true }
]

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div></div>}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(searchParams.get('tab') || 'dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trialDays, setTrialDays] = useState(7)
  const [isPremium, setIsPremium] = useState(false)
  const [subscriptionPlan, setSubscriptionPlan] = useState(null)
  const [subscriptionEnd, setSubscriptionEnd] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showReviewPopup, setShowReviewPopup] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSending, setReviewSending] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)
  const [showSupportPopup, setShowSupportPopup] = useState(false)
  const [showBlockPopup, setShowBlockPopup] = useState(false)
  const [supportCategory, setSupportCategory] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportFile, setSupportFile] = useState(null)
  const [supportSending, setSupportSending] = useState(false)
  const [supportSent, setSupportSent] = useState(false)

  const [newLastName, setNewLastName] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [historique, setHistorique] = useState([])
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)

  async function fetchHistorique(userId) {
    const { data } = await supabase
      .from('historique')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setHistorique(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      setNewFirstName(session.user?.user_metadata?.first_name || '')
      setNewLastName(session.user?.user_metadata?.last_name || '')
      fetchHistorique(session.user.id)
      // Fetch subscription puis calcul trial
      const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', session.user.id).eq('status', 'active').single()
      if (sub && new Date(sub.current_period_end) > new Date()) {
        setIsPremium(true)
        setSubscriptionPlan(sub.plan)
        setSubscriptionEnd(sub.current_period_end)
      }
      // Calcul trial
      const created = new Date(session.user.created_at)
      const now = new Date()
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
      setTrialDays(Math.max(0, 7 - diffDays))
      setLoading(false)
      // Afficher la pop-up de succès après paiement
      if (searchParams.get('success') === 'true') {
        setShowSuccessPopup(true)
        window.history.replaceState({}, '', '/dashboard')
      }
      // Vérification des emails de relance (fire-and-forget)
      fetch('/api/emails/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      }).catch(() => {})
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.href = '/auth'
      else setUser(session.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleCheckout(plan) {
    setCheckoutLoading(true)
    try {
      const priceId = plan === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, userEmail: user.email }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutLoading(false)
    }
  }

  async function handleManageSubscription() {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error('Portal error:', err)
    }
  }

  const tips = [
    'Attention : chaque question peut avoir PLUSIEURS bonnes réponses. Cochez-les toutes !',
    'L\'ATSEM est employé par la commune, pas par l\'Éducation Nationale.',
    'Le bionettoyage = nettoyage (détergent) + désinfection (désinfectant).',
    'L\'oral compte double (coeff. 2). Ne le négligez pas !',
    'PAI = Projet d\'Accueil Individualisé (allergies, diabète, asthme...).',
    'L\'ATSEM ne doit JAMAIS administrer de médicament sans PAI.',
    'Épistaxis : tête penchée en AVANT, pas en arrière !',
    'Le programme maternelle comprend 5 domaines d\'apprentissage.',
    'L\'ATSEM assiste l\'enseignant mais ne se substitue jamais à lui.',
    'HACCP = maîtrise de la sécurité alimentaire en restauration scolaire.',
    'Pour les dilutions : 2% = 2 mL de produit pour 100 mL de solution.',
    'Surface = longueur × largeur. Pensez aux commandes de produits.',
    'Obligation de réserve : ne jamais donner son avis sur l\'enseignant aux parents.',
    'Cycle 1 = TPS (2 ans), PS (3 ans), MS (4 ans), GS (5 ans).',
    'Entraînez-vous régulièrement : 20 min/jour valent mieux que 3h une fois.',
    'Pictogramme flamme = inflammable, tête de mort = toxique.',
    'À l\'oral, préparez des exemples concrets de mises en situation.',
    'La laïcité s\'applique aussi à l\'ATSEM : neutralité obligatoire.',
    'Sieste en PS : respecter le rythme de chaque enfant.',
    'Temps scolaire = sous l\'autorité du directeur. Périscolaire = sous l\'autorité du maire.',
    'Un enfant mord un camarade ? Séparer, consoler la victime, prévenir l\'enseignant.',
    'Signes de maltraitance : obligation de signalement (article 434-3 du Code pénal).',
    'Gérez votre stress : respirez 4 secondes, bloquez 4, expirez 4.',
    'Lisez bien TOUTES les propositions avant de répondre au QCM.',
    'La régularité bat l\'intensité : révisez un peu chaque jour.',
  ]

  useEffect(() => {
    const interval = setInterval(() => setShowTip(prev => {
      if (prev) setTipIndex(i => (i + 1) % tips.length)
      return !prev
    }), 10000)
    return () => clearInterval(interval)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function updateProfile(e) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    const updates = { data: { first_name: newFirstName, last_name: newLastName } }
    if (newPassword) updates.password = newPassword
    const { error } = await supabase.auth.updateUser(updates)
    setProfileSaving(false)
    if (error) setProfileMsg('Erreur : ' + error.message)
    else { setProfileMsg('Profil correctement mis à jour !'); setNewPassword(''); setTimeout(() => setProfileMsg(''), 5000) }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div></div>
  }

  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Utilisateur'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const subtitle = hour < 12 ? 'Une petite session de révision ce matin ?' : hour < 18 ? 'C\'est le moment idéal pour réviser !' : 'Une dernière session avant la fin de journée ?'
  const email = user?.email || ''
  const createdAt = new Date(user?.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  // Calcul streak (jours d'affilée)
  const getStreak = () => {
    if (historique.length === 0) return 0
    const uniqueDays = [...new Set(historique.map(h => {
      const d = new Date(h.created_at)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }))].sort().reverse()
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`
    if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) return 0
    let streak = 0
    let checkDate = new Date(today)
    if (uniqueDays[0] !== todayKey) checkDate.setDate(checkDate.getDate() - 1)
    for (let i = 0; i < 365; i++) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
      if (uniqueDays.includes(key)) { streak++; checkDate.setDate(checkDate.getDate() - 1) }
      else break
    }
    return streak
  }
  const streak = getStreak()

  // Objectif semaine : exercices faits cette semaine (lundi à dimanche)
  const getWeekData = () => {
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7 // 0=lundi
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek)
    monday.setHours(0, 0, 0, 0)
    const weekExercises = historique.filter(h => new Date(h.created_at) >= monday)
    const daysWithExercise = new Set()
    weekExercises.forEach(h => {
      const d = new Date(h.created_at)
      daysWithExercise.add((d.getDay() + 6) % 7)
    })
    return { count: weekExercises.length, daysWithExercise }
  }
  const weekData = getWeekData()
  const weekProgress = Math.min(100, (weekData.count / 5) * 100)
  const weekGoalReached = weekData.count >= 5

  // Objectif mois : 20 exercices sur les 30 derniers jours (glissant)
  const getMonthData = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)
    const monthExercises = historique.filter(h => new Date(h.created_at) >= thirtyDaysAgo)
    return { count: monthExercises.length }
  }
  const monthData = getMonthData()
  const monthProgress = Math.min(100, (monthData.count / 20) * 100)

  // Moyenne générale (ramenée sur 10) — exclure Spécifique
  const notesAll = historique.filter(h => h.note != null && h.note_max && h.type !== 'Spécifique')
  const moyenneGenerale = notesAll.length > 0 ? parseFloat((notesAll.reduce((sum, h) => sum + (h.note / h.note_max) * 20, 0) / notesAll.length).toFixed(1)) : null
  // Tendance : comparer moyenne avec et sans le dernier exercice
  const moyenneTendance = (() => {
    if (notesAll.length < 2) return null
    const sorted = [...notesAll].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const withoutLast = sorted.slice(1)
    const moyennePrecedente = withoutLast.reduce((sum, h) => sum + (h.note / h.note_max) * 20, 0) / withoutLast.length
    return moyenneGenerale > moyennePrecedente ? 'up' : moyenneGenerale < moyennePrecedente ? 'down' : null
  })()
  function navigateTo(id) { setPage(id); setSidebarOpen(false) }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex" style={{fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes premiumScan { 0%, 80% { opacity: 1; } 85% { opacity: 0.4; transform: scale(1.15); } 90% { opacity: 1; transform: scale(1); filter: brightness(1.5); } 95% { filter: brightness(1); } 100% { opacity: 1; } }
        .premium-scan { animation: premiumScan 5s ease-in-out infinite; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {sidebarOpen && <div className="fixed top-14 lg:top-0 inset-x-0 bottom-0 bg-black/30 z-[45] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR FLOTTANTE */}
      <div className={`fixed top-14 lg:top-0 bottom-0 left-0 z-50 flex items-start lg:items-center pl-0 lg:pl-3 py-0 lg:py-5 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <aside className="w-[72px] bg-white rounded-none rounded-br-2xl lg:rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/60 border-t-0 lg:border-t flex flex-col items-center py-5 h-full lg:h-[calc(100vh-2.5rem)]" style={{fontFamily: "'Nunito', sans-serif"}}>
          <a href="/" className="mb-4">
            <div className="w-10 h-10 bg-purple-800 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
              <LogoIcon size={20} strokeWidth={2.5} />
            </div>
          </a>
          <div className="w-7 h-px bg-slate-200 mb-3"></div>

          <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5">
            {menuItems.filter(item => !item.premium || !isPremium).map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)} className={`w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center group ${item.premium ? (page === item.id ? 'bg-amber-50 text-amber-600' : 'text-amber-500 hover:bg-amber-50 hover:text-amber-600') : (page === item.id ? 'bg-purple-50 text-purple-800' : 'text-slate-900 hover:bg-purple-50 hover:text-purple-800')}`}>
                <item.icon size={21} strokeWidth={1.6} className={`transition-transform duration-200 group-hover:scale-125 ${item.premium ? 'premium-scan' : ''}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-2 mt-auto pt-3">
            <div className="w-7 h-px bg-slate-200 mb-1"></div>
            <button onClick={() => navigateTo('profil')} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${page === 'profil' ? 'bg-purple-800 text-white ring-2 ring-purple-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {firstName.charAt(0).toUpperCase()}
            </button>
            <button onClick={handleLogout} className="text-slate-900 hover:text-purple-500 transition cursor-pointer p-1">
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </div>
        </aside>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[90px]">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <a href="/" className="flex items-center">
            <span className="font-black text-lg text-slate-900" style={{ fontFamily: "'Nunito', sans-serif" }}>Prépa <span className="text-purple-800">ATSEM</span></span>
          </a>
          <div className="w-9"></div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* Pop-up succès abonnement */}
          {showSuccessPopup && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSuccessPopup(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Abonnement activé !</h2>
                <p className="text-slate-500 font-medium mb-6">Félicitations, vous avez désormais accès à toutes les fonctionnalités premium. Bon entraînement !</p>
                <button onClick={() => setShowSuccessPopup(false)} className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3 rounded-xl transition cursor-pointer shadow-lg">
                  C'est parti !
                </button>
              </div>
            </div>
          )}

          {/* ===== POPUP AVIS ===== */}
          {showReviewPopup && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReviewPopup(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>
                {reviewSent ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Merci pour votre avis !</h2>
                    <p className="text-slate-500 font-medium mb-6">Votre retour nous aide à améliorer la plateforme.</p>
                    <button onClick={() => setShowReviewPopup(false)} className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3 rounded-xl transition cursor-pointer shadow-lg">Fermer</button>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-900 px-6 py-5 relative">
                      <button onClick={() => setShowReviewPopup(false)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                      <h2 className="text-lg font-black text-white pr-8">Évaluez Prépa ATSEM</h2>
                      <p className="text-slate-400 text-sm font-medium mt-1">Votre avis compte pour nous !</p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm font-bold text-slate-700 mb-3">Quelle note donnez-vous au site ?</p>
                      <div className="flex items-center gap-1 mb-6 justify-center">
                        {[1, 2, 3, 4, 5].map(star => {
                          const full = reviewRating >= star
                          const half = !full && reviewRating >= star - 0.5
                          return (
                            <div key={star} className="relative w-10 h-10 cursor-pointer transition-transform hover:scale-125" style={{WebkitTapHighlightColor: 'transparent'}}>
                              {/* Moitié gauche = demi-étoile */}
                              <div className="absolute inset-0 w-1/2 overflow-hidden z-10" onClick={() => setReviewRating(star - 0.5)}>
                                <svg className={`w-10 h-10 transition-colors ${full || half ? 'text-purple-500' : 'text-slate-200'}`} fill={full || half ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              </div>
                              {/* Moitié droite = étoile pleine */}
                              <div className="absolute inset-0 z-10" style={{clipPath: 'inset(0 0 0 50%)'}} onClick={() => setReviewRating(star)}>
                                <svg className={`w-10 h-10 transition-colors ${full ? 'text-purple-500' : 'text-slate-200'}`} fill={full ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              </div>
                              {/* Fond (contour) */}
                              <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-2">Un commentaire ? <span className="font-normal text-slate-400">(optionnel)</span></p>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition h-28"
                        placeholder="Ce que vous aimez, ce qu'on pourrait améliorer..."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        maxLength={2000}
                      />
                      <button
                        onClick={async () => {
                          if (!reviewRating) return
                          setReviewSending(true)
                          try {
                            const res = await fetch('/api/review', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ rating: reviewRating, comment: reviewComment, email: user?.email })
                            })
                            if (res.ok) setReviewSent(true)
                          } catch {}
                          setReviewSending(false)
                        }}
                        disabled={!reviewRating || reviewSending}
                        className={`w-full mt-4 font-bold text-sm px-6 py-3 rounded-xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2 ${reviewRating ? 'bg-purple-800 hover:bg-purple-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        {reviewSending ? (
                          <div className="animate-spin w-5 h-5 border-2 border-black/30 border-t-black rounded-full"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            Envoyer mon avis
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ===== POPUP ESSAI EXPIRÉ ===== */}
          {showBlockPopup && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBlockPopup(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-900 px-6 py-5 relative">
                  <button onClick={() => setShowBlockPopup(false)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                  <div className="text-3xl mb-2">😢</div>
                  <h2 className="text-lg font-black text-white pr-8">Votre essai gratuit est terminé</h2>
                  <p className="text-slate-400 text-sm font-medium mt-1">Abonnez-vous pour continuer à vous entraîner.</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-slate-500 font-medium text-sm mb-6">Pour accéder à tous les exercices, QCM, examens blancs et à la préparation orale, souscrivez à un abonnement.</p>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => { setShowBlockPopup(false); setPage('abonnement') }} className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm cursor-pointer">Voir les tarifs</button>
                    <button onClick={() => setShowBlockPopup(false)} className="text-slate-500 font-medium text-sm hover:text-slate-700 transition cursor-pointer">Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== POPUP SUPPORT ===== */}
          {showSupportPopup && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSupportPopup(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>
                {supportSent ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Message envoyé !</h2>
                    <p className="text-slate-500 font-medium mb-6">Nous reviendrons vers vous le plus vite possible.</p>
                    <button onClick={() => setShowSupportPopup(false)} className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3 rounded-xl transition cursor-pointer shadow-lg">Fermer</button>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-900 px-6 py-5 relative">
                      <button onClick={() => setShowSupportPopup(false)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                      <h2 className="text-lg font-black text-white pr-8">Contacter le support</h2>
                      <p className="text-slate-400 text-sm font-medium mt-1">On vous répond rapidement !</p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm font-bold text-slate-700 mb-3">Catégorie <span className="text-purple-500">*</span></p>
                      <div className="grid grid-cols-2 gap-2 mb-5">
                        {[
                          { id: 'bug', label: 'Bug', icon: <CircleX size={16} strokeWidth={2} /> },
                          { id: 'abonnement', label: 'Abonnement', icon: <CreditCard size={16} strokeWidth={2} /> },
                          { id: 'suggestion', label: 'Suggestion', icon: <Lightbulb size={16} strokeWidth={2} /> },
                          { id: 'autre', label: 'Autre', icon: <MessageCircle size={16} strokeWidth={2} /> },
                        ].map(cat => (
                          <button key={cat.id} onClick={() => setSupportCategory(cat.id)} className={`p-3 rounded-xl border-2 text-sm font-bold transition cursor-pointer flex items-center gap-2 ${supportCategory === cat.id ? 'border-purple-500 bg-purple-50 text-purple-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                            {cat.icon} {cat.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-2">Votre message</p>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition h-28 mb-4"
                        placeholder="Décrivez votre problème ou votre suggestion..."
                        value={supportMessage}
                        onChange={e => setSupportMessage(e.target.value)}
                        maxLength={5000}
                      />
                      <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-700 transition">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed ${supportFile ? 'border-purple-400 bg-purple-50 text-purple-900' : 'border-slate-300 hover:border-slate-400'} transition`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                            {supportFile ? supportFile.name : 'Ajouter une pièce jointe'}
                          </div>
                          <input type="file" className="hidden" accept="image/*,.pdf,.txt,.doc,.docx" onChange={e => setSupportFile(e.target.files?.[0] || null)} />
                        </label>
                        {supportFile && (
                          <button onClick={() => setSupportFile(null)} className="text-xs text-purple-500 hover:text-purple-900 font-bold mt-1 cursor-pointer">Retirer</button>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (!supportCategory || !supportMessage.trim()) return
                          setSupportSending(true)
                          try {
                            const formData = new FormData()
                            formData.append('category', supportCategory)
                            formData.append('message', supportMessage)
                            formData.append('email', user?.email || '')
                            if (supportFile) formData.append('file', supportFile)
                            const res = await fetch('/api/support', { method: 'POST', body: formData })
                            if (res.ok) setSupportSent(true)
                          } catch {}
                          setSupportSending(false)
                        }}
                        disabled={!supportCategory || !supportMessage.trim() || supportSending}
                        className={`w-full font-bold text-sm px-6 py-3 rounded-xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2 ${supportCategory && supportMessage.trim() ? 'bg-purple-800 hover:bg-purple-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        {supportSending ? (
                          <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                            Envoyer
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ============ ACCUEIL ============ */}
          {page === 'dashboard' && (
            <div>
              {/* Header + Trial */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{greeting} {firstName} !</h1>
                  <div className="relative h-10 sm:h-5">
                    <p className={`text-slate-500 font-medium text-sm absolute inset-x-0 sm:whitespace-nowrap transition-all duration-500 ${showTip ? 'opacity-0 -translate-y-3' : 'opacity-100 translate-y-0'}`}>{subtitle}</p>
                    <p className={`text-slate-500 font-medium text-sm absolute inset-x-0 transition-all duration-500 sm:whitespace-nowrap ${showTip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>💡 {tips[tipIndex]}</p>
                  </div>
                </div>
                {isPremium ? (
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-amber-200/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                    <span className="font-black text-sm">Premium {subscriptionPlan === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                        <div onClick={trialDays === 0 ? () => setPage('abonnement') : undefined} className={`${trialDays === 0 ? 'bg-purple-500 text-white cursor-pointer hover:bg-purple-800 transition' : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950'} px-4 py-2 rounded-xl flex items-center gap-2 shadow-md`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          <span className="font-black text-sm">{trialDays === 0 ? 'Essai expiré' : `${trialDays}j restant${trialDays > 1 ? 's' : ''}`}</span>
                        </div>
                        <button onClick={() => setPage('abonnement')} className="bg-slate-900 hover:bg-black text-white font-bold text-sm px-4 py-2 rounded-xl transition shadow-md cursor-pointer">Devenir premium</button>
                      </div>
                  </>
                )}
              </div>

              {/* ENTRAÎNEMENTS */}
              <h2 className="text-lg font-black text-slate-900 mb-4">Commencer à m'entraîner</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <a href="/specifique" onClick={e => { if (trialDays === 0 && !isPremium) { e.preventDefault(); setShowBlockPopup(true) } }} className="bg-white p-5 rounded-2xl border-2 border-purple-600 shadow-sm hover:shadow-md transition group flex flex-col items-center text-center">
                  <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 002 2h2a2 2 0 002-2"/><path d="M9 14l2 2 4-4"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">QCM thématiques</h3>
                  <p className="text-xs text-slate-500 flex-1">Choisissez une famille : hygiène, institutionnel, santé, pédagogie, relations pro, calculs</p>
                  <span className="text-[10px] mt-2 text-purple-600 font-bold">Ne compte pas dans la moyenne</span>
                </a>
                <a href="/annales" onClick={e => { if (trialDays === 0 && !isPremium) { e.preventDefault(); setShowBlockPopup(true) } }} className="bg-white p-5 rounded-2xl border-2 border-blue-600 shadow-sm hover:shadow-md transition group flex flex-col items-center text-center relative">
                  <span className="absolute top-2 right-2 text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">45 min</span>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Annales corrigées</h3>
                  <p className="text-xs text-slate-500 flex-1">Vrais sujets des CDG avec timer 45 min et correction détaillée question par question</p>
                  <span className="text-[10px] font-black text-blue-600 mt-2">Note /20</span>
                </a>
                <a href="/examen" onClick={e => { if (trialDays === 0 && !isPremium) { e.preventDefault(); setShowBlockPopup(true) } }} className="bg-white p-5 rounded-2xl border-2 border-amber-500 shadow-sm hover:shadow-md transition group flex flex-col items-center text-center relative">
                  <span className="absolute top-2 right-2 text-[9px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">45 min</span>
                  <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Examen blanc</h3>
                  <p className="text-xs text-slate-500 flex-1">Conditions réelles : 20 questions générées par IA, 45 min, sans aide. Classement percentile</p>
                  <span className="text-[10px] font-black text-amber-500 mt-2">Note /20</span>
                </a>
                <a href="/oral" onClick={e => { if (trialDays === 0 && !isPremium) { e.preventDefault(); setShowBlockPopup(true) } }} className="bg-white p-5 rounded-2xl border-2 border-pink-400 shadow-sm hover:shadow-md transition group flex flex-col items-center text-center relative">
                  <span className="absolute top-2 right-2 text-[9px] font-black text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md">15 min</span>
                  <div className="w-11 h-11 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Simulation d'oral</h3>
                  <p className="text-xs text-slate-500 flex-1">L'IA génère des questions de jury : mises en situation, motivations, relation ATSEM/enseignant</p>
                  <span className="text-[10px] mt-2 text-pink-500 font-bold">Pas de note</span>
                </a>
              </div>

              {/* STREAK + MOYENNE + OBJECTIF SEMAINE */}
              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {/* Streak */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 relative shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke={streak >= 7 ? '#facc15' : streak > 0 ? '#7e22ce' : '#c084fc'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                    </svg>
                    {streak >= 7 && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm border-2 border-white">{streak}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{streak} <span className="text-xs font-bold text-slate-400">jour(s) d'affilée</span></p>
                  </div>
                </div>

                {/* Ma moyenne */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-black text-slate-900 mb-1">Ma moyenne générale</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black text-slate-900">{moyenneGenerale || '—'}<span className="text-2xl font-black text-slate-400">/20</span></p>
                    {moyenneTendance === 'up' && (
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
                    )}
                    {moyenneTendance === 'down' && (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    )}
                  </div>
                </div>

                {/* Objectif semaine / mois / badge */}
                {monthData.count >= 20 ? (
                  <div className="bg-slate-900 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                    </div>
                    <p className="text-sm font-black text-white">Félicitations pour votre rigueur de travail !</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">{monthData.count} exercices ce mois-ci</p>
                  </div>
                ) : !weekGoalReached ? (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-black text-slate-900">Objectif de la semaine</p>
                      <span className="text-xs font-black text-slate-400">{weekData.count}/5 exercices</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{width: `${weekProgress}%`}}></div>
                    </div>
                    <div className="flex justify-between">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${weekData.daysWithExercise.has(i) ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'}`}>
                          {weekData.daysWithExercise.has(i) ? <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> : day}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-black text-slate-900">Objectif du mois</p>
                      <span className="text-xs font-black text-slate-400">{monthData.count}/20 exercices</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{width: `${monthProgress}%`}}></div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 flex items-center gap-2">
                      <svg viewBox="0 0 60 60" className="w-7 h-7 shrink-0" xmlns="http://www.w3.org/2000/svg">
                        {/* étincelles */}
                        <g fill="#8b5cf6" opacity="0.7">
                          <path d="M8 14 L9 11 L10 14 L13 15 L10 16 L9 19 L8 16 L5 15 Z"/>
                          <path d="M52 42 L53 39 L54 42 L57 43 L54 44 L53 47 L52 44 L49 43 Z"/>
                          <circle cx="50" cy="14" r="1.5"/>
                        </g>
                        {/* cible */}
                        <circle cx="30" cy="32" r="18" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2"/>
                        <circle cx="30" cy="32" r="12" fill="white" stroke="#8b5cf6" strokeWidth="1.8"/>
                        <circle cx="30" cy="32" r="5" fill="#8b5cf6"/>
                        {/* flèche plantée */}
                        <line x1="30" y1="32" x2="48" y2="14" stroke="#1a1325" strokeWidth="2.5" strokeLinecap="round"/>
                        <polygon points="46,14 48,16 50,12" fill="#1a1325"/>
                        <path d="M30 32 L26 28 M30 32 L34 28" stroke="#1a1325" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      <p className="text-xs font-bold text-purple-700 leading-tight">{20 - monthData.count > 0 ? `Plus que ${20 - monthData.count} exercice${20 - monthData.count > 1 ? 's' : ''} pour atteindre l'objectif !` : 'Objectif atteint, bravo !'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* RACCOURCIS UTILES */}
              <h2 className="text-lg font-black text-slate-900 mb-4">Raccourcis utiles</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <a href="/specifique" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition group flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-800 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h3M13 14h3M8 18h3M13 18h3"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">QCM</p>
                    <p className="text-[10px] text-slate-400 font-medium">Entraînement</p>
                  </div>
                </a>
                <a href="/blog" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition group flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Méthodologie</p>
                    <p className="text-[10px] text-slate-400 font-medium">Articles</p>
                  </div>
                </a>
                <button onClick={() => { setShowReviewPopup(true); setReviewRating(0); setReviewComment(''); setReviewSent(false) }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition group flex items-center gap-3 cursor-pointer text-left">
                  <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Évaluez le site</p>
                    <p className="text-[10px] text-slate-400 font-medium">Donnez votre avis</p>
                  </div>
                </button>
                <button onClick={() => { setShowSupportPopup(true); setSupportCategory(''); setSupportMessage(''); setSupportFile(null); setSupportSent(false) }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition group flex items-center gap-3 cursor-pointer text-left">
                  <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <CircleHelp size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Support</p>
                    <p className="text-[10px] text-slate-400 font-medium">Signaler un bug</p>
                  </div>
                </button>
              </div>

              {/* CTA Premium */}
              {!isPremium && (
                <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2"><span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Plan gratuit</span></div>
                    <h3 className="text-lg font-black text-white mb-1">Passez au niveau supérieur</h3>
                    <p className="text-slate-400 font-medium text-sm">Donnez-vous toutes les chances pour réussir votre concours ATSEM.</p>
                    <p className="text-slate-500 font-medium text-xs mt-1">QCM, calculs et examens blancs en illimité.</p>
                  </div>
                  <button onClick={() => setPage('abonnement')} className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-amber-200/50 shrink-0 text-sm cursor-pointer">Voir les offres</button>
                </div>
              )}
            </div>
          )}

          {/* ============ MES STATS ============ */}
          {page === 'progression' && (() => {
            // Exercices par jour (14 derniers jours)
            const dailyData = (() => {
              const days = []
              for (let i = 13; i >= 0; i--) {
                const d = new Date()
                d.setDate(d.getDate() - i)
                d.setHours(0, 0, 0, 0)
                const next = new Date(d)
                next.setDate(next.getDate() + 1)
                const count = historique.filter(h => { const hd = new Date(h.created_at); return hd >= d && hd < next }).length
                days.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, count })
              }
              return days
            })()

            // Répartition par type
            const typeCount = {}
            historique.forEach(h => { typeCount[h.type || 'Autre'] = (typeCount[h.type || 'Autre'] || 0) + 1 })
            const typeLabels = Object.keys(typeCount)
            const typeValues = Object.values(typeCount)
            const typeColors = { Spécifique: '#7e22ce', Examen: '#eab308', Annale: '#2563eb', Oral: '#ec4899', Autre: '#94a3b8' }

            // Évolution de la moyenne (par exercice noté, chronologique) — exclure Spécifique
            const notesChron = [...historique].filter(h => h.note != null && h.note_max && h.type !== 'Spécifique').sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            const moyenneEvolution = notesChron.map((h, i) => {
              const slice = notesChron.slice(0, i + 1)
              const moy = slice.reduce((sum, x) => sum + (x.note / x.note_max) * 20, 0) / slice.length
              return { label: new Date(h.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), moy: parseFloat(moy.toFixed(1)) }
            })

            // Stats rapides
            const totalExos = historique.length
            const notesForStats = historique.filter(h => h.note != null && h.note_max)
            const meilleureNote = notesForStats.length > 0 ? parseFloat(Math.max(...notesForStats.map(h => (h.note / h.note_max) * 20)).toFixed(1)) : null
            const pireNote = notesForStats.length > 0 ? parseFloat(Math.min(...notesForStats.map(h => (h.note / h.note_max) * 20)).toFixed(1)) : null
            const totalMin = historique.reduce((sum, h) => sum + (h.duration_minutes || 0), 0)

            // Badges / Diplômes
            const hasType = (type) => historique.some(h => h.type === type)
            const has2020 = notesForStats.some(h => (h.note / h.note_max) * 20 >= 20)
            const badges = [
              { id: 'premier-pas', label: 'Premier pas', desc: '1er exercice terminé', icon: '🎯', unlocked: totalExos >= 1 },
              { id: 'regulier', label: 'Régulier', desc: '3 jours d\'affilée', icon: '📅', unlocked: streak >= 3 },
              { id: 'assidu', label: 'Assidu', desc: '5 jours d\'affilée', icon: '💪', unlocked: streak >= 5 },
              { id: 'marathonien', label: 'Marathonien', desc: '7 jours d\'affilée', icon: '🏃', unlocked: streak >= 7 },
              { id: 'studieux', label: 'Studieux', desc: '10 exercices terminés', icon: '📚', unlocked: totalExos >= 10 },
              { id: 'infatigable', label: 'Infatigable', desc: '14 jours d\'affilée', icon: '🔥', unlocked: streak >= 14 },
              { id: 'expert', label: 'Expert', desc: '50 exercices terminés', icon: '🎓', unlocked: totalExos >= 50 },
              { id: 'perfectionniste', label: 'Perfectionniste', desc: 'Obtenir 20/20', icon: '⭐', unlocked: has2020 },
              { id: 'polyvalent', label: 'Touche-à-tout', desc: 'Spécifique + Annale + Examen + Oral', icon: '🧩', unlocked: hasType('Spécifique') && hasType('Annale') && hasType('Examen') && hasType('Oral') },
              { id: 'pret', label: 'Prêt pour le concours', desc: '30 jours d\'affilée', icon: '🏆', unlocked: streak >= 30 },
            ]

            const unlockedCount = badges.filter(b => b.unlocked).length

            return (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">Mes stats</h1>
              <p className="text-slate-400 text-sm mb-8">Suivez votre progression et débloquez vos diplômes.</p>

              {historique.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg></div>
                  <h3 className="font-black text-slate-900 text-lg mb-2">Commencez à vous entraîner</h3>
                  <p className="text-slate-500 font-medium text-sm mb-6">Vos statistiques apparaîtront ici dès votre premier entraînement.</p>
                  <a href="/specifique" className="inline-flex items-center gap-2 bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-xl transition text-sm">Choisir une thématique <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></a>
                </div>
              ) : (
                <>
                  {/* Stats rapides - 4 cartes */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                      <div className="w-11 h-11 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{totalExos}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Exercices faits</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                      <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{totalMin < 60 ? `${totalMin}m` : `${Math.floor(totalMin / 60)}h${totalMin % 60 > 0 ? String(totalMin % 60).padStart(2, '0') : ''}`}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Temps total</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                      <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{meilleureNote != null ? meilleureNote : '—'}<span className="text-sm text-slate-400">/20</span></p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Meilleure note</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                      <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{streak}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Jours d'affilée</p>
                      </div>
                    </div>
                  </div>

                  {/* Graphiques */}
                  <div className="grid lg:grid-cols-5 gap-6 mb-8">
                    {/* Barres : exercices par jour */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900 text-sm">Activité des 14 derniers jours</h3>
                        <span className="text-xs text-slate-400 font-medium">{dailyData.reduce((s, d) => s + d.count, 0)} exercices</span>
                      </div>
                      <Bar
                        data={{
                          labels: dailyData.map(d => d.label),
                          datasets: [{
                            label: 'Exercices',
                            data: dailyData.map(d => d.count),
                            backgroundColor: dailyData.map(d => d.count > 0 ? '#7e22ce' : '#f1f5f9'),
                            borderRadius: 8,
                            maxBarThickness: 24,
                            borderSkipped: false
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', titleFont: { weight: 'bold' }, bodyFont: { weight: '600' }, padding: 10, cornerRadius: 8 } },
                          scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1, font: { weight: '600', size: 11 }, color: '#94a3b8' }, grid: { color: '#f8fafc', drawBorder: false }, border: { display: false } },
                            x: { ticks: { font: { size: 10 }, color: '#94a3b8' }, grid: { display: false }, border: { display: false } }
                          }
                        }}
                      />
                    </div>

                    {/* Doughnut : répartition par type */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-900 text-sm mb-5">Répartition</h3>
                      <div className="max-w-[200px] mx-auto">
                        <Doughnut
                          data={{
                            labels: typeLabels,
                            datasets: [{
                              data: typeValues,
                              backgroundColor: typeLabels.map(l => typeColors[l] || '#94a3b8'),
                              borderWidth: 0,
                              spacing: 4
                            }]
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: { backgroundColor: '#0f172a', titleFont: { weight: 'bold' }, bodyFont: { weight: '600' }, padding: 10, cornerRadius: 8 }
                            },
                            cutout: '70%'
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-5">
                        {typeLabels.map((label, i) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeColors[label] || '#94a3b8' }}></div>
                              <span className="text-xs font-semibold text-slate-600">{label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900">{typeValues[i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ligne : évolution de la moyenne */}
                  {moyenneEvolution.length >= 2 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900 text-sm">Évolution de la moyenne</h3>
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">{moyenneEvolution[moyenneEvolution.length - 1].moy}/20</span>
                      </div>
                      <Line
                        data={{
                          labels: moyenneEvolution.map(d => d.label),
                          datasets: [{
                            label: 'Moyenne /20',
                            data: moyenneEvolution.map(d => d.moy),
                            borderColor: '#7e22ce',
                            backgroundColor: (ctx) => {
                              if (!ctx.chart.chartArea) return 'rgba(126, 34, 206, 0.05)'
                              const gradient = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom)
                              gradient.addColorStop(0, 'rgba(126, 34, 206, 0.12)')
                              gradient.addColorStop(1, 'rgba(126, 34, 206, 0)')
                              return gradient
                            },
                            borderWidth: 2.5,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#7e22ce',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: true
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', titleFont: { weight: 'bold' }, bodyFont: { weight: '600' }, padding: 10, cornerRadius: 8 } },
                          scales: {
                            y: { min: 0, max: 20, ticks: { stepSize: 5, font: { weight: '600', size: 11 }, color: '#94a3b8' }, grid: { color: '#f8fafc', drawBorder: false }, border: { display: false } },
                            x: { ticks: { font: { size: 10 }, color: '#94a3b8' }, grid: { display: false }, border: { display: false } }
                          }
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Diplômes */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Diplômes</h3>
                  <span className="text-xs text-slate-400 font-semibold">{unlockedCount}/{badges.length} débloqués</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {badges.map(b => (
                    <div key={b.id} className={`relative rounded-2xl border p-4 text-center transition-all ${b.unlocked ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                      {b.unlocked && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                      )}
                      <span className="text-2xl block mb-2">{b.icon}</span>
                      <p className={`text-xs font-bold leading-tight ${b.unlocked ? 'text-slate-900' : 'text-slate-400'}`}>{b.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )})()}

          {/* ============ MON HISTORIQUE ============ */}
          {page === 'historique' && (() => {

            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
            const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
            const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7

            // Filtrer l'historique pour le mois affiché
            const monthHistory = historique.filter(h => {
              const d = new Date(h.created_at)
              return d.getMonth() === calMonth && d.getFullYear() === calYear
            }).map(h => {
              const d = new Date(h.created_at)
              return {
                ...h,
                day: d.getDate(),
                time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
              }
            })

            const exercisesByDay = {}
            monthHistory.forEach(h => {
              if (!exercisesByDay[h.day]) exercisesByDay[h.day] = []
              exercisesByDay[h.day].push(h)
            })

            const getTypeColor = (type) => {
              if (type === 'Spécifique') return 'purple'
              if (type === 'Examen') return 'yellow'
              if (type === 'Oral') return 'pink'
              if (type === 'Annale') return 'blue'
              return 'blue'
            }

            const getTypesForDay = (day) => {
              const items = exercisesByDay[day] || []
              return [...new Set(items.map(i => i.type))]
            }

            // Stats
            const totalExercices = historique.length
            const notes = historique.filter(h => h.note != null && h.note_max && h.type !== 'Spécifique')
            const moyenne = notes.length > 0 ? parseFloat((notes.reduce((sum, h) => sum + (h.note / h.note_max) * 20, 0) / notes.length).toFixed(1)) : null
            const meilleur = notes.length > 0 ? parseFloat(Math.max(...notes.map(h => (h.note / h.note_max) * 20)).toFixed(1)) : null
            const totalMinutes = historique.reduce((sum, h) => sum + (h.duration_minutes || 0), 0)
            const totalH = Math.floor(totalMinutes / 60)
            const totalM = totalMinutes % 60

            const prevMonth = () => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
              else setCalMonth(calMonth - 1)
              setSelectedDay(null)
            }
            const nextMonth = () => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
              else setCalMonth(calMonth + 1)
              setSelectedDay(null)
            }

            const dayItems = selectedDay ? (exercisesByDay[selectedDay] || []) : []

            return (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Mon historique</h1>
              <p className="text-slate-500 font-medium text-sm mb-6">Retrouvez vos entraînements passés.</p>

              {/* Stats rapides */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{totalExercices}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Exercices</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
                  <p className="text-2xl font-black text-purple-800">{moyenne || '—'}<span className="text-sm">/20</span></p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Moyenne</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{meilleur || '—'}<span className="text-sm">/20</span></p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Meilleur score</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{totalMinutes < 60 ? `${totalMinutes} min` : `${totalH}h${totalM > 0 ? String(totalM).padStart(2, '0') : ''}`}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Temps total</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendrier */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:w-[420px] shrink-0">
                  {/* Navigation mois */}
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <h3 className="font-black text-slate-900">{monthNames[calMonth]} {calYear}</h3>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>

                  {/* Jours de la semaine */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(d => (
                      <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider py-1">{d}</div>
                    ))}
                  </div>

                  {/* Grille des jours */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const types = getTypesForDay(day)
                      const hasExercises = types.length > 0
                      const isSelected = selectedDay === day
                      const today = new Date()
                      const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
                      const dayOfWeek = (new Date(calYear, calMonth, day).getDay())
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                      const signupDate = new Date(user?.created_at)
                      const isSignupDay = day === signupDate.getDate() && calMonth === signupDate.getMonth() && calYear === signupDate.getFullYear()

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(isSelected ? null : day)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm font-bold transition cursor-pointer relative
                            ${isSelected ? 'bg-purple-800 text-white' : isSignupDay ? 'bg-yellow-50 text-yellow-600 border border-yellow-300' : isToday ? 'bg-purple-50 text-purple-800 border border-purple-200' : hasExercises ? 'bg-slate-50 hover:bg-slate-100 text-slate-900' : isWeekend ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                          <span>{day}</span>
                          {hasExercises && !isSelected && (
                            <div className="flex gap-0.5">
                              {types.map(t => (
                                <div key={t} className={`w-1.5 h-1.5 rounded-full ${t === 'Spécifique' ? 'bg-purple-500' : t === 'Examen' ? 'bg-yellow-500' : t === 'Oral' ? 'bg-pink-500' : 'bg-blue-500'}`}></div>
                              ))}
                            </div>
                          )}
                          {hasExercises && isSelected && (
                            <div className="flex gap-0.5">
                              {types.map(t => (
                                <div key={t} className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                              ))}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Légende */}
                  <div className="flex items-center gap-3 flex-wrap mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="text-[10px] font-bold text-slate-400">Spécifique</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-slate-400">Annale</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-[10px] font-bold text-slate-400">Examen</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500"></div><span className="text-[10px] font-bold text-slate-400">Oral</span></div>
                  </div>
                </div>

                {/* Détail du jour sélectionné */}
                <div className="flex-1">
                  {selectedDay ? (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{selectedDay} {monthNames[calMonth]} {calYear}</h3>
                      {(() => {
                        const signupDate = new Date(user?.created_at)
                        const isSignupDay = selectedDay === signupDate.getDate() && calMonth === signupDate.getMonth() && calYear === signupDate.getFullYear()
                        return isSignupDay ? (
                          <div className="bg-white rounded-xl border border-yellow-300 shadow-sm p-4 flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-yellow-100 text-yellow-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-900">Inscription</p>
                              <p className="text-xs text-slate-400 font-medium">Bienvenue sur Prépa ATSEM !</p>
                            </div>
                            <span className="text-sm font-black text-yellow-500">Jour 1</span>
                          </div>
                        ) : null
                      })()}
                      {dayItems.length > 0 ? (
                        <div className="space-y-3">
                          {dayItems.map(item => {
                            const color = getTypeColor(item.type)
                            const scoreNorm = item.note != null && item.note_max ? (item.note / item.note_max) * 20 : null
                            return (
                              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color === 'purple' ? 'bg-purple-100 text-purple-800' : color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : color === 'pink' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {item.type === 'Spécifique' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
                                  {item.type === 'Examen' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
                                  {item.type === 'Annale' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
                                  {item.type === 'Oral' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-slate-900 truncate">{item.label}</p>
                                  <p className="text-xs text-slate-400 font-medium">{item.time}{item.nb_questions ? ` · ${item.nb_questions} questions` : ''}{item.duration_minutes ? ` · ${item.duration_minutes} min` : ''}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  {item.note != null ? (
                                    <span className={`text-sm font-black ${scoreNorm >= 15 ? 'text-emerald-600' : scoreNorm >= 10 ? 'text-amber-600' : 'text-purple-800'}`}>{item.note}/{item.note_max}</span>
                                  ) : (
                                    <span className="text-sm font-black text-emerald-600">Terminé</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (() => {
                        const sd = new Date(user?.created_at)
                        const isSd = selectedDay === sd.getDate() && calMonth === sd.getMonth() && calYear === sd.getFullYear()
                        return !isSd ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                          <p className="text-slate-400 font-bold text-sm">Aucun exercice ce jour-là.</p>
                        </div>
                        ) : null
                      })()}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center h-full flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </div>
                      <p className="font-bold text-slate-900 mb-1">Sélectionnez un jour</p>
                      <p className="text-sm text-slate-400 font-medium">Cliquez sur un jour du calendrier pour voir vos exercices.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })()}

          {/* ============ MON COMPTE ============ */}
          {page === 'profil' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Mon compte</h1>
              <p className="text-slate-500 font-medium text-sm mb-8">Gérez vos informations personnelles.</p>
              {profileMsg && <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${profileMsg.startsWith('Erreur') ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>{profileMsg}</div>}
              <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                <form onSubmit={updateProfile} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse email</label>
                    <input type="email" value={email} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed"/>
                    <p className="text-xs text-slate-400 mt-1">L'email ne peut pas être modifié.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Prénom</label>
                      <input type="text" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none font-medium"/>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom</label>
                      <input type="text" value={newLastName} onChange={e => setNewLastName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none font-medium"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mot de passe</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => { supabase.auth.resetPasswordForEmail(email); setProfileMsg('Email de réinitialisation envoyé !'); setTimeout(() => setProfileMsg(''), 5000) }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-5 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Modifier le mot de passe
                      </button>
                      <button type="button" onClick={() => isPremium ? handleManageSubscription() : navigateTo('abonnement')} className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm px-5 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer">
                        <BadgeCheck size={16} strokeWidth={2} />
                        {isPremium ? 'Gérer mon abonnement' : 'Devenir Premium'}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={profileSaving} className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-purple-800/20 text-sm">{profileSaving ? 'Enregistrement...' : 'Sauvegarder'}</button>
                  </div>
                </form>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:w-[380px]">
                  <h3 className="font-black text-slate-900 mb-4">Informations du compte</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500 font-medium">Email</span><span className="font-bold text-slate-900">{email}</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500 font-medium">Membre depuis</span><span className="font-bold text-slate-900">{createdAt}</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500 font-medium">Connexion</span><span className="font-bold text-slate-900">{user?.app_metadata?.provider === 'google' ? 'Google' : 'Email'}</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500 font-medium">Dernière connexion</span><span className="font-bold text-slate-900">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span></div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Email vérifié</span>
                      {user?.email_confirmed_at ? (
                        <span className="flex items-center gap-1.5 text-purple-800 font-bold"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Vérifié</span>
                      ) : (
                        <button onClick={async () => { await supabase.auth.resend({ type: 'signup', email }); setProfileMsg('Email de vérification envoyé !') }} className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          Vérifier mon email
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Premium</span>
                      {isPremium ? (
                        <span className="text-purple-800 font-bold">Oui</span>
                      ) : (
                        <span className="text-slate-400 font-bold">Non</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ DEVENIR PREMIUM ============ */}
          {page === 'abonnement' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Devenir Premium</h1>
              <p className="text-slate-500 font-medium text-sm mb-8">Choisissez la formule qui s'adapte le plus à votre besoin.</p>
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 w-full">

                {/* Essai Gratuit */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition hover:shadow-md">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Essai Gratuit</h3>
                    <p className="text-slate-500 font-bold text-sm">Testez la plateforme pendant 7 jours.</p>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">0€</span>
                      <span className="text-slate-500 font-bold">/ 7 jours</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold mt-1 uppercase">Sans carte bancaire</p>
                  </div>
                  <div className="flex-1">
                    <ul className="space-y-3 mb-8">
                      {["QCM ATSEM illimités", "Annales corrigées chronométrées", "Simulation d'oral par IA", "Dashboard personnalisé"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-900 font-bold text-sm">
                          <div className="bg-slate-200 p-0.5 rounded-md shrink-0"><svg className="w-3.5 h-3.5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-full py-3.5 bg-slate-50 border border-slate-200 text-slate-700 font-black rounded-xl text-center text-sm">{trialDays === 0 ? 'Expiré' : `Expire dans ${trialDays} jour${trialDays > 1 ? 's' : ''}`}</div>
                </div>

                {/* Formule Mensuelle */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition hover:shadow-md">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Formule Mensuelle</h3>
                    <p className="text-slate-500 font-bold text-sm">Flexibilité totale, sans engagement.</p>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1 text-purple-800">
                      <span className="text-3xl font-black tracking-tight">9,99€</span>
                      <span className="text-slate-500 font-bold">/mois</span>
                    </div>
                    <p className="text-purple-500 text-xs font-bold mt-1 uppercase">Renouvellement automatique</p>
                  </div>
                  <div className="flex-1">
                    <ul className="space-y-3 mb-8">
                      {["QCM ATSEM illimités", "Annales corrigées chronométrées", "Simulation d'oral par IA", "Dashboard personnalisé", "Résiliable à tout moment"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-900 font-bold text-sm">
                          <div className="bg-purple-100 p-0.5 rounded-md shrink-0"><svg className="w-3.5 h-3.5 text-purple-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => handleCheckout('monthly')} disabled={checkoutLoading} className="w-full py-3.5 bg-purple-800 hover:bg-purple-900 text-white font-black rounded-xl text-center transition shadow-lg shadow-purple-200 text-sm cursor-pointer disabled:opacity-50">{checkoutLoading ? 'Redirection...' : "S'abonner maintenant"}</button>
                </div>

                {/* Pack Concours 6 mois */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-purple-800 shadow-lg shadow-purple-100 relative flex flex-col overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">17% d'Économie</div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Pack Concours</h3>
                    <p className="text-slate-500 font-bold text-sm">Accès complet pendant 6 mois.</p>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1 text-purple-800">
                      <span className="text-3xl font-black tracking-tight">49,99€</span>
                      <span className="text-slate-500 font-bold">pour 6 mois</span>
                    </div>
                    <p className="text-purple-500 text-xs font-black mt-1 uppercase">1 seul paiement · Pas de renouvellement</p>
                    <p className="text-slate-400 text-xs mt-1">soit 8,33€/mois au lieu de 9,99€</p>
                  </div>
                  <div className="flex-1">
                    <ul className="space-y-3 mb-8">
                      {["QCM ATSEM illimités", "Annales corrigées chronométrées", "Simulation d'oral par IA", "Dashboard personnalisé"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-900 font-bold text-sm">
                          <div className="bg-purple-100 p-0.5 rounded-md shrink-0"><svg className="w-3.5 h-3.5 text-purple-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => handleCheckout('yearly')} disabled={checkoutLoading} className="w-full py-3.5 bg-purple-800 hover:bg-purple-900 text-white font-black rounded-xl text-center transition shadow-lg shadow-purple-200 text-sm cursor-pointer disabled:opacity-50">{checkoutLoading ? 'Redirection...' : "S'abonner maintenant"}</button>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
