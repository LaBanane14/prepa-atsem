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
  blue: { bg: 'linear-gradient(135deg, #eff6ff, #eef2ff)', text: '#2563eb', icon: '#bfdbfe' },
  amber: { bg: 'linear-gradient(135deg, #fffbeb, #fff7ed)', text: '#d97706', icon: '#fde68a' },
  emerald: { bg: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', text: '#059669', icon: '#a7f3d0' },
  purple: { bg: 'linear-gradient(135deg, #f5f3ff, #fdf4ff)', text: '#7e22ce', icon: '#d8b4fe' },
  rose: { bg: 'linear-gradient(135deg, #fff1f2, #fdf2f8)', text: '#e11d48', icon: '#fecdd3' },
  red: { bg: 'linear-gradient(135deg, #fef2f2, #fff1f2)', text: '#dc2626', icon: '#fecaca' },
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

  const totalPages = Math.ceil(articles.length / articlesPerPage)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#faf8ff', color: '#1a1325', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        .b-wrap { position: relative; padding: 56px 0 80px; flex: 1; }
        .b-wrap::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 15% 0%, rgba(139,92,246,0.20), transparent 55%),
            radial-gradient(ellipse at 85% 8%, rgba(251,191,36,0.15), transparent 55%),
            radial-gradient(ellipse at 55% 0%, rgba(236,72,153,0.12), transparent 60%),
            radial-gradient(ellipse at 10% 45%, rgba(14,165,233,0.10), transparent 55%),
            radial-gradient(ellipse at 95% 55%, rgba(139,92,246,0.13), transparent 55%),
            radial-gradient(ellipse at 30% 80%, rgba(236,72,153,0.10), transparent 55%),
            radial-gradient(ellipse at 80% 95%, rgba(251,191,36,0.10), transparent 55%);
          pointer-events: none;
        }
        .b-wrap > * { position: relative; }
        .b-inner { max-width: 1180px; margin: 0 auto; padding: 0 48px; }

        /* HERO */
        .b-hero { margin-bottom: 56px; max-width: 1080px; }
        .b-hero h1 { font-size: 52px; font-weight: 900; line-height: 1.05; margin: 0 0 20px; letter-spacing: -0.03em; color: #1a1325; }
        .b-hero h1 em {
          font-style: normal;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .b-hero p { font-size: 18px; line-height: 1.5; color: #5e5270; margin: 0; max-width: 680px; }

        /* GRID ARTICLES */
        .b-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 980px) { .b-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .b-grid { grid-template-columns: 1fr; } }

        .b-card {
          background: white; border: 1px solid #ece9f0; border-radius: 24px;
          overflow: hidden; display: flex; flex-direction: column;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s;
        }
        .b-card:hover { transform: translateY(-4px); box-shadow: 0 24px 40px -24px rgba(20, 10, 40, 0.18); }
        .b-card-cover {
          height: 192px; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .b-card-cover img { width: 100%; height: 100%; object-fit: cover; }
        .b-card-cover svg { width: 64px; height: 64px; }
        .b-card-body { padding: 24px; display: flex; flex-direction: column; flex-grow: 1; }
        .b-card-cat { font-size: 11px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
        .b-card-title { font-size: 20px; font-weight: 800; color: #1a1325; margin: 0 0 12px; line-height: 1.25; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .b-card-excerpt { font-size: 14px; color: #5e5270; line-height: 1.55; margin: 0 0 24px; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .b-card-foot {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 16px; border-top: 1px dashed #ece9f0;
          font-size: 13px; color: #6b5b8e; font-weight: 600;
        }
        .b-card-meta { display: flex; align-items: center; gap: 12px; }
        .b-card-meta .b-views { display: inline-flex; align-items: center; gap: 4px; }
        .b-card-meta svg { width: 14px; height: 14px; }
        .b-card-cta {
          display: inline-flex; align-items: center; gap: 4px;
          color: #1a1325; font-weight: 800;
          transition: color 0.15s, gap 0.15s;
        }
        .b-card:hover .b-card-cta { color: #8b5cf6; gap: 8px; }
        .b-card-cta svg { width: 12px; height: 12px; }

        /* PAGINATION */
        .b-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 56px; }
        .b-pag-btn {
          min-width: 40px; height: 40px; padding: 0 14px;
          border: 1px solid #ece9f0; background: white; color: #3a2f4a;
          border-radius: 10px; font-weight: 800; font-size: 14px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          cursor: pointer;
        }
        .b-pag-btn:hover:not(:disabled) { background: #f3efff; border-color: #d8ccff; color: #1a1325; }
        .b-pag-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .b-pag-btn.active { background: #1a1325; color: white; border-color: #1a1325; }
        .b-pag-btn svg { width: 16px; height: 16px; }

        /* LOADING */
        .b-loading { display: flex; align-items: center; justify-content: center; padding: 80px 0; }
        .b-loading-dot { width: 32px; height: 32px; border: 4px solid #8b5cf6; border-top-color: transparent; border-radius: 50%; animation: b-spin 0.8s linear infinite; }
        @keyframes b-spin { to { transform: rotate(360deg); } }

        @media (max-width: 1100px) {
          .b-wrap { padding: 40px 0 60px; }
          .b-inner { padding: 0 32px; }
        }
        @media (max-width: 720px) {
          .b-wrap { padding: 28px 0 56px; }
          .b-inner { padding: 0 18px; }
          .b-hero h1 { font-size: 32px; }
        }
      `}</style>

      {/* ─── NAVBAR (conservée) ─── */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
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
          <div className="hidden md:flex items-center gap-8 font-bold text-slate-500">
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

      {/* ─── CONTENU ─── */}
      <div className="b-wrap">
        <div className="b-inner">
          {/* HERO */}
          <header className="b-hero">
            <h1>Toutes les infos pour réussir le concours <em>ATSEM</em></h1>
            <p>Actualités, conseils et astuces pour préparer au mieux votre concours ATSEM.</p>
          </header>

          {/* ARTICLES */}
          {loading ? (
            <div className="b-loading"><div className="b-loading-dot"></div></div>
          ) : (
            <>
              <div className="b-grid">
                {articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage).map((article, index) => {
                  const colors = colorMap[article.category_color] || colorMap.blue
                  return (
                    <a key={article.id} href={`/blog/${article.slug}`} className="b-card">
                      <div className="b-card-cover" style={{ background: colors.bg }}>
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} width={400} height={200} />
                        ) : (
                          <svg fill="none" stroke={colors.icon} strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        )}
                      </div>
                      <div className="b-card-body">
                        <span className="b-card-cat" style={{ color: colors.text }}>{article.category}</span>
                        <h3 className="b-card-title">{article.title}</h3>
                        <p className="b-card-excerpt">{article.excerpt}</p>
                        <div className="b-card-foot">
                          <div className="b-card-meta">
                            <span>{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="b-views"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{article.views || 0}</span>
                          </div>
                          <span className="b-card-cta">Lire <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg></span>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="b-pagination">
                  <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }} disabled={currentPage === 1} className="b-pag-btn" aria-label="Page précédente">
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0) }} className={`b-pag-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }} disabled={currentPage === totalPages} className="b-pag-btn" aria-label="Page suivante">
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── FOOTER (conservé) ─── */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <LogoSvg className="w-5 h-5 text-purple-500" />
              <h4 className="text-white font-bold text-lg">Prépa ATSEM</h4>
            </div>
            <p className="max-w-xs leading-relaxed">La seule plateforme d'entraînement pour préparer le concours ATSEM. QCM, annales corrigées et simulations d'oral, avec un suivi en temps réel de votre progression !</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources</h4>
            <ul className="space-y-3">
              <li><a href="/calendrier" className="hover:text-white transition">Calendrier 2026</a></li>
              <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
              <li><a href="/tarifs" className="hover:text-white transition">Nos formules</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Légal</h4>
            <ul className="space-y-3">
              <li><a href="/mentions-legales" className="hover:text-white transition">Mentions légales</a></li>
              <li><a href="/cgu" className="hover:text-white transition">CGV &amp; CGU</a></li>
              <li><span className="text-white text-sm font-medium">support@prepa-atsem.fr</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center">
          <p>&copy; 2026 Prépa ATSEM. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
