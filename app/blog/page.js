'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const LogoSvg = ({ className }) => (
  <svg viewBox="2 -2 36 26" fill="currentColor" className={className}>
    <circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/>
    <path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/>
    <circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/>
    <path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/>
    <path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/>
    <polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/>
    <path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
)

const colorMap = {
  blue: { bg: 'from-blue-50 to-indigo-50', text: 'text-blue-600', icon: 'text-blue-200' },
  amber: { bg: 'from-amber-50 to-orange-50', text: 'text-amber-600', icon: 'text-amber-200' },
  emerald: { bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', icon: 'text-emerald-200' },
  purple: { bg: 'from-purple-50 to-fuchsia-50', text: 'text-purple-600', icon: 'text-purple-200' },
  rose: { bg: 'from-rose-50 to-pink-50', text: 'text-rose-600', icon: 'text-rose-200' },
  red: { bg: 'from-red-50 to-rose-50', text: 'text-red-600', icon: 'text-red-200' }
}

export default function BlogPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 6

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    fetchArticles()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchArticles() {
    if (!supabase) { setLoading(false); return }
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, category_color, date, reading_time, image_url, views')
      .eq('published', true)
      .order('date', { ascending: false })
    if (!error) setArticles(data)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const navLinks = [
    { href: '/', label: 'Accueil', active: false },
    { href: '/calendrier', label: 'Calendrier', active: false },
    { href: '/blog', label: 'Blog', active: true },
    { href: '/tarifs', label: 'Tarifs', active: false }
  ]

  return (
    <div className="min-h-screen text-slate-900 selection:bg-purple-200 flex flex-col" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f0ff 15%, #ede9fe 30%, #f5f3ff 50%, #faf5ff 65%, #fdf4ff 80%, #fce7f3 100%)' }}>
      <style>{`
        .article-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .article-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="bg-purple-800 text-white p-1 rounded-xl shadow-sm">
              <LogoSvg className="w-10 h-10" />
            </div>
            <div style={{ fontFamily: "'Nunito', sans-serif" }} className="translate-y-[2px]">
              <span className="font-black text-lg sm:text-2xl tracking-tight text-slate-900 block leading-none">Prépa <span className="text-purple-800">ATSEM</span></span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 tracking-widest uppercase">Concours ATSEM <svg className="inline w-4 h-3 align-middle ml-0.5 relative -top-[1.5px]" viewBox="0 0 30 20"><rect width="30" height="20" rx="1" stroke="#00000030" strokeWidth="1.5" fill="none"/><rect width="10" height="20" fill="#002395"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ED2939"/></svg></span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-500">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className={link.active ? 'text-purple-800' : 'hover:text-purple-800 transition'}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!authLoading && (user ? (
              <a href="/dashboard" className="hidden md:inline-flex bg-purple-800 hover:bg-purple-900 text-white px-5 py-2.5 rounded-full font-bold shadow-lg transition text-sm">Mon tableau de bord</a>
            ) : (
              <>
                <a href="/login" className="hidden md:block text-slate-500 font-semibold hover:text-slate-900 transition">Connexion</a>
                <a href="/signup" className="hidden md:inline-flex bg-purple-800 hover:bg-purple-900 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg transition">Inscription</a>
              </>
            ))}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white pb-4 shadow-lg absolute w-full z-40">
            <div className="max-w-6xl mx-auto px-4 pt-4 space-y-2">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className={`block py-3 px-4 rounded-xl font-bold transition ${link.active ? 'text-purple-800 bg-purple-50' : 'text-slate-700 hover:bg-slate-50'}`}>{link.label}</a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                {user ? (
                  <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 text-center">Mon espace</a>
                ) : (
                  <>
                    <a href="/login" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Connexion</a>
                    <a href="/signup" className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 transition text-center">Inscription</a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HEADER ─── */}
      <header className="pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight">Toutes les informations pour <span className="text-purple-800">réussir le concours ATSEM</span></h1>
          <p className="text-lg text-slate-600 mx-auto font-medium">Actualités, conseils et astuces pour réussir au mieux votre concours ATSEM.</p>
        </div>
      </header>

      {/* ─── ARTICLES ─── */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage).map((article, index) => {
              const colors = colorMap[article.category_color] || colorMap.blue
              return (
                <a key={article.id} href={`/blog/${article.slug}`} className="article-card bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className={`h-48 relative flex items-center justify-center bg-gradient-to-br ${colors.bg} overflow-hidden`}>
                    {article.image_url ? (
                     <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} width={400} height={200} />
                    ) : (
                    <svg className={`w-16 h-16 ${colors.icon}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    )}
              </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className={`${colors.text} font-bold text-xs uppercase tracking-wider mb-3 block`}>{article.category}</span>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{article.title}</h3>
                    <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3">{article.excerpt}</p>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-3">
                        <span>{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{article.views || 0}</span>
                      </div>
                      <span className="text-slate-900 font-bold hover:text-purple-800 transition-colors flex items-center gap-1">Lire <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
          {/* Pagination */}
          {articles.length > articlesPerPage && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }} disabled={currentPage === 1} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              {Array.from({ length: Math.ceil(articles.length / articlesPerPage) }, (_, i) => (
                <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0) }} className={`w-10 h-10 rounded-xl font-bold text-sm transition cursor-pointer ${currentPage === i + 1 ? 'bg-purple-800 text-white shadow-lg shadow-purple-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => { setCurrentPage(p => Math.min(Math.ceil(articles.length / articlesPerPage), p + 1)); window.scrollTo(0, 0) }} disabled={currentPage === Math.ceil(articles.length / articlesPerPage)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}
          </>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <LogoSvg className="w-5 h-5 text-purple-500" />
              <h4 className="text-white font-bold text-lg">Prépa ATSEM</h4>
            </div>
            <p className="max-w-xs leading-relaxed">La plateforme d'entraînement pour préparer le concours ATSEM. QCM, annales corrigées et simulations d'oral.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources</h4>
            <ul className="space-y-3">
              <li><a href="/calendrier" className="hover:text-white transition">Calendrier 2026</a></li>
              <li><a href="/blog" className="hover:text-white transition">Blog & conseils</a></li>
              <li><a href="/tarifs" className="hover:text-white transition">Nos formules</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Légal</h4>
            <ul className="space-y-3">
              <li><a href="/mentions-legales" className="hover:text-white transition">Mentions légales</a></li>
              <li><a href="/cgu" className="hover:text-white transition">CGV & CGU</a></li>
              <li><span className="text-white text-sm font-medium">support@prepa-atsem.fr</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center">
          <p>&copy; 2026 Prépa ATSEM — LP Labs SAS. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
