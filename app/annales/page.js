'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, BookOpen, Shuffle } from 'lucide-react'

const LogoIcon = ({size, strokeWidth, className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className} width={size} height={size}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

const sidebarItems = [
  { id: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { id: 'progression', label: 'Mes stats', href: '/dashboard?tab=progression', icon: TrendingUp },
  { id: 'historique', label: 'Historique', href: '/dashboard?tab=historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', href: '/dashboard?tab=profil', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', href: '/dashboard?tab=abonnement', icon: BadgeCheck, premium: true }
]

export default function AnnalesPage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [annales, setAnnales] = useState([])
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      const { data: sub } = await supabase.from('subscriptions').select('status, current_period_end').eq('user_id', session.user.id).eq('status', 'active').single()
      if (sub && new Date(sub.current_period_end) > new Date()) setIsPremium(true)
      setAuthLoading(false)

      const { data: annalesData } = await supabase
        .from('annales')
        .select('id, region_nom, annee, nb_questions')
        .order('annee', { ascending: false })
      setAnnales(annalesData || [])
      setLoading(false)
    })
  }, [])

  function launchRandom() {
    if (annales.length === 0) return
    setRedirecting(true)
    const random = annales[Math.floor(Math.random() * annales.length)]
    window.location.href = `/annales/${random.id}`
  }

  async function handleLogout() { await supabase.auth.signOut(); window.location.href = '/' }

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div></div>

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {sidebarOpen && <div className="fixed top-14 lg:top-0 inset-x-0 bottom-0 bg-black/30 z-[45] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <div className={`fixed top-14 lg:top-0 bottom-0 left-0 z-50 flex items-start lg:items-center pl-0 lg:pl-3 py-0 lg:py-5 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <aside className="w-[72px] bg-white rounded-none rounded-br-2xl lg:rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/60 border-t-0 lg:border-t flex flex-col items-center py-5 h-full lg:h-[calc(100vh-2.5rem)]" style={{fontFamily: "'Nunito', sans-serif"}}>
          <a href="/" className="mb-4"><div className="w-10 h-10 bg-purple-800 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><LogoIcon size={20} strokeWidth={2.5} /></div></a>
          <div className="w-7 h-px bg-slate-200 mb-3"></div>
          <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5">
            {sidebarItems.filter(item => !item.premium || !isPremium).map(item => (
              <a key={item.id} href={item.href} className={`w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[11px] font-bold transition-all text-center group ${item.premium ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-500 hover:bg-purple-50 hover:text-purple-800'}`}>
                <item.icon size={21} strokeWidth={1.6} className="transition-transform duration-200 group-hover:scale-125" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition mt-auto cursor-pointer"><LogOut size={20} strokeWidth={1.6} /></button>
        </aside>
      </div>

      {/* MAIN */}
      <div className="flex-1 lg:pl-[96px]">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <span className="font-black text-lg text-slate-900" style={{fontFamily: "'Nunito', sans-serif"}}>Prépa <span className="text-purple-800">ATSEM</span></span>
          <div className="w-8"></div>
        </div>

        <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] lg:min-h-screen p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen size={36} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Annales corrigées</h1>
            <p className="text-slate-500 mb-2">Entraînez-vous sur les vrais sujets QCM des CDG.</p>
            <p className="text-slate-400 text-sm mb-8">{loading ? 'Chargement...' : `${annales.length} annales disponibles (2015-2025)`}</p>

            <button
              onClick={launchRandom}
              disabled={loading || annales.length === 0 || redirecting}
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-purple-200 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
            >
              {redirecting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
              ) : (
                <>
                  <Shuffle size={22} />
                  Lancer une annale au hasard
                </>
              )}
            </button>

            {!loading && annales.length === 0 && (
              <p className="text-amber-600 text-sm font-semibold mt-4">Les annales seront bientôt disponibles.</p>
            )}

            <a href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600 transition mt-6 inline-block">Retour au tableau de bord</a>
          </div>
        </main>
      </div>
    </div>
  )
}
