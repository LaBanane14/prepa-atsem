'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Home, TrendingUp, RotateCcw, UserRound, BadgeCheck, LogOut, BookOpen, CheckCircle2, Clock } from 'lucide-react'

const LogoIcon = ({size, strokeWidth, className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className} width={size} height={size}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

const sidebarItems = [
  { id: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { id: 'progression', label: 'Mes stats', href: '/dashboard?tab=progression', icon: TrendingUp },
  { id: 'historique', label: 'Historique', href: '/dashboard?tab=historique', icon: RotateCcw },
  { id: 'profil', label: 'Compte', href: '/dashboard?tab=profil', icon: UserRound },
  { id: 'abonnement', label: 'Devenir Premium', href: '/dashboard?tab=abonnement', icon: BadgeCheck, premium: true }
]

const regionColors = {
  'Auvergne-Rhône-Alpes': 'bg-blue-100 text-blue-800 border-blue-200',
  'Bretagne': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Grand Est': 'bg-purple-100 text-purple-800 border-purple-200',
  'Hauts-de-France': 'bg-amber-100 text-amber-800 border-amber-200',
  'Île-de-France': 'bg-rose-100 text-rose-800 border-rose-200',
  'Nouvelle-Aquitaine': 'bg-orange-100 text-orange-800 border-orange-200',
  'Normandie': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Occitanie': 'bg-red-100 text-red-800 border-red-200',
  'Provence-Alpes-Côte d\'Azur': 'bg-sky-100 text-sky-800 border-sky-200',
  'Pays de la Loire': 'bg-teal-100 text-teal-800 border-teal-200',
}

export default function AnnalesPage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [annales, setAnnales] = useState([])
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRegion, setFilterRegion] = useState('')
  const [filterYear, setFilterYear] = useState('')

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      const { data: sub } = await supabase.from('subscriptions').select('status, current_period_end').eq('user_id', session.user.id).eq('status', 'active').single()
      if (sub && new Date(sub.current_period_end) > new Date()) setIsPremium(true)
      setAuthLoading(false)

      // Charger les annales
      const { data: annalesData } = await supabase
        .from('annales')
        .select('id, region, region_nom, cdg, annee, nb_questions, duree_minutes, bareme')
        .order('annee', { ascending: false })
      setAnnales(annalesData || [])

      // Charger les meilleurs scores de l'utilisateur
      const { data: scoresData } = await supabase
        .from('scores_annales')
        .select('annale_id, score, score_max')
        .eq('user_id', session.user.id)
      setScores(scoresData || [])

      setLoading(false)
    })
  }, [])

  function getBestScore(annaleId) {
    const s = scores.filter(s => s.annale_id === annaleId)
    if (s.length === 0) return null
    return Math.max(...s.map(x => x.score))
  }

  const regions = [...new Set(annales.map(a => a.region_nom))].sort()
  const years = [...new Set(annales.map(a => a.annee))].sort((a, b) => b - a)

  const filtered = annales.filter(a => {
    if (filterRegion && a.region_nom !== filterRegion) return false
    if (filterYear && a.annee !== parseInt(filterYear)) return false
    return true
  })

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

        <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen size={22} strokeWidth={1.8} />
              </div>
              Annales corrigées
            </h1>
            <p className="text-slate-500 text-sm">Entraînez-vous sur les vrais sujets QCM des CDG en conditions réelles.</p>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Toutes les régions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Toutes les années</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {(filterRegion || filterYear) && (
              <button onClick={() => { setFilterRegion(''); setFilterYear('') }} className="text-sm text-purple-800 font-bold hover:underline cursor-pointer">Réinitialiser</button>
            )}
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <BookOpen size={48} className="text-slate-300 mx-auto mb-4" strokeWidth={1} />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune annale trouvée</h3>
              <p className="text-slate-500 text-sm">{annales.length === 0 ? 'Les annales seront bientôt disponibles.' : 'Essayez de modifier vos filtres.'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(annale => {
                const best = getBestScore(annale.id)
                const color = regionColors[annale.region_nom] || 'bg-slate-100 text-slate-800 border-slate-200'

                return (
                  <a key={annale.id} href={`/annales/${annale.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col group cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>{annale.region_nom}</span>
                      <span className="text-2xl font-black text-slate-900">{annale.annee}</span>
                    </div>

                    {annale.cdg && (
                      <p className="text-xs text-slate-400 font-semibold mb-3">{annale.cdg}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Clock size={14} /> {annale.duree_minutes || 45} min</span>
                      <span className="flex items-center gap-1"><BookOpen size={14} /> {annale.nb_questions || 20} questions</span>
                    </div>

                    {best !== null ? (
                      <div className="flex items-center gap-2 mt-auto">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-600">Meilleur score : {best}/{annale.nb_questions || 20}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="text-sm font-semibold text-slate-400">Pas encore fait</span>
                      </div>
                    )}
                  </a>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
