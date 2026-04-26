'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const LogoSvg = ({className}) => <svg viewBox="2 -2 36 26" fill="currentColor" className={className}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>

const colorMap = {
  blue: { bg: 'from-blue-50 to-indigo-50', text: 'text-blue-600', icon: 'text-blue-200' },
  amber: { bg: 'from-amber-50 to-orange-50', text: 'text-amber-600', icon: 'text-amber-200' },
  emerald: { bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', icon: 'text-emerald-200' },
  purple: { bg: 'from-purple-50 to-fuchsia-50', text: 'text-purple-600', icon: 'text-purple-200' },
  rose: { bg: 'from-rose-50 to-pink-50', text: 'text-rose-600', icon: 'text-rose-200' },
  red: { bg: 'from-red-50 to-rose-50', text: 'text-red-600', icon: 'text-red-200' }
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [vote, setVote] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setAuthLoading(false)
    })
    fetchArticle()
    const saved = localStorage.getItem(`vote-${params.slug}`)
    if (saved) setVote(saved)
  }, [])

  async function fetchArticle() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', params.slug)
      .eq('published', true)
      .single()
    if (!error && data) {
      setArticle(data)
      // Incrémenter le compteur de vues
      supabase.from('articles').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then(() => {})
    }
    setLoading(false)
  }

  async function handleVote(type) {
    if (vote) return
    setVote(type)
    localStorage.setItem(`vote-${params.slug}`, type)
    const field = type === 'like' ? 'likes' : 'dislikes'
    await supabase.from('articles').update({ [field]: (article[field] || 0) + 1 }).eq('id', article.id)
    setArticle(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!loading && !article) {
    return (
      <div className="min-h-screen bg-[#eceef1] flex items-center justify-center px-4" style={{fontFamily: "'Nunito', sans-serif"}}>
        <div className="text-center max-w-lg">
          <div className="relative mb-6 flex items-center justify-center gap-0">
            <span className="text-[120px] sm:text-[180px] font-black text-slate-900 leading-none select-none">4</span>
            <div className="relative inline-block">
              <svg className="w-[100px] h-[130px] sm:w-[140px] sm:h-[180px]" viewBox="0 0 140 180">
                <ellipse cx="70" cy="90" rx="52" ry="70" fill="none" stroke="#0f172a" strokeWidth="16" strokeLinecap="round"/>
                <ellipse cx="52" cy="75" rx="7" ry="8" fill="white"/><ellipse cx="54" cy="75" rx="5" ry="6" fill="#0f172a"/><ellipse cx="55" cy="73" rx="2" ry="2.5" fill="white"/>
                <ellipse cx="88" cy="75" rx="7" ry="8" fill="white"/><ellipse cx="90" cy="75" rx="5" ry="6" fill="#0f172a"/><ellipse cx="91" cy="73" rx="2" ry="2.5" fill="white"/>
                <path d="M55 103 Q70 117 85 103" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[120px] sm:text-[180px] font-black text-slate-900 leading-none select-none">4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Article introuvable</h1>
          <p className="text-slate-500 font-medium mb-8">Cet article n'existe pas ou a été supprimé.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/blog" className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg>
              Retour au blog
            </a>
            <a href="/" className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl transition text-sm">
              Accueil
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!article) return null

  const colors = colorMap[article.category_color] || colorMap.blue

  const SITE_URL = 'https://prepa-atsem.fr'
  const articleUrl = `${SITE_URL}/blog/${params.slug}`

  const blogPostingLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updated_at || article.date,
    author: { '@type': 'Organization', name: 'Prépa ATSEM', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Prépa ATSEM',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    articleSection: article.category,
    ...(article.image_url && { image: article.image_url }),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl }
    ]
  }

  let schemaExtra = null
  if (article.schema_extra) {
    try { schemaExtra = JSON.parse(article.schema_extra) } catch {}
  }

  return (
    <div className="min-h-screen text-slate-900 selection:bg-purple-200 flex flex-col" style={{ backgroundColor: '#ffffff', color: '#1a1325', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .ba-wrap { flex: 1; display: flex; flex-direction: column; }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {schemaExtra && (Array.isArray(schemaExtra) ? schemaExtra : [schemaExtra]).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      {/* NAVIGATION */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="bg-purple-800 text-white p-1 rounded-xl shadow-sm"><LogoSvg className="w-10 h-10" /></div>
            <div style={{ fontFamily: "'Nunito', sans-serif" }} className="translate-y-[2px]">
              <span className="font-black text-lg sm:text-2xl tracking-tight text-slate-900 block leading-none">Prépa <span className="text-purple-800">ATSEM</span></span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 tracking-widest uppercase">Concours ATSEM</span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8 font-bold text-slate-500">
            {[{href:'/',label:'Accueil'},{href:'/calendrier',label:'Calendrier'},{href:'/blog',label:'Blog',active:true},{href:'/tarifs',label:'Tarifs'}].map(link => (
              <a key={link.label} href={link.href} className={link.active ? 'text-purple-800' : 'hover:text-purple-800 transition'}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {!authLoading && (user ? (
              <>
                <a href="/dashboard" className="hidden md:inline-flex bg-purple-800 hover:bg-purple-900 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-purple-200 transition transform hover:-translate-y-0.5 text-sm">Mon tableau de bord</a>
              </>
            ) : (
              <>
                <a href="/login" className="hidden md:block text-slate-600 font-semibold hover:text-purple-800 transition">Connexion</a>
                <a href="/signup" className="hidden md:inline-flex bg-purple-800 hover:bg-purple-900 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-purple-200 transition transform hover:-translate-y-0.5">Inscription</a>
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
              {[{href:'/',label:'Accueil'},{href:'/calendrier',label:'Calendrier'},{href:'/blog',label:'Blog',active:true},{href:'/tarifs',label:'Tarifs'}].map(link => (
                <a key={link.label} href={link.href} className={`block py-3 px-4 rounded-xl font-bold transition ${link.active ? 'text-purple-800 bg-purple-50' : 'text-slate-700 hover:bg-slate-50'}`}>{link.label}</a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Mon espace</a>
                    <button onClick={handleLogout} className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 hover:bg-purple-900 transition text-center w-full">Déconnexion</button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Connexion</a>
                    <a href="/signup" className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 hover:bg-purple-900 transition text-center">Inscription</a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ARTICLE */}
      <div className="ba-wrap">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-grow w-full">
        <a href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-purple-800 transition mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg> Retour au blog
        </a>

        <div className="mb-10">
          <span className={`${colors.text} font-bold text-xs uppercase tracking-wider mb-3 block`}>{article.category}</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {article.reading_time}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {article.views || 0} vue{(article.views || 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {article.image_url ? (
      <img src={article.image_url} alt={article.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-10 border border-slate-100" />
    ) : (
      <div className={`h-64 sm:h-80 bg-gradient-to-br ${colors.bg} rounded-3xl flex items-center justify-center mb-10 border border-slate-100`}>
    <svg className={`w-20 h-20 ${colors.icon}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  </div>
)}

        <div className={`prose prose-slate max-w-none
          [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-slate-200
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-8 [&_h3]:mb-3
          [&_p]:text-slate-600 [&_p]:font-medium [&_p]:leading-relaxed [&_p]:mb-5
          [&_hr]:my-10 [&_hr]:border-slate-200
          [&_ul]:my-6 [&_ul]:space-y-2 [&_ul]:list-none [&_ul]:pl-0
          [&_li]:relative [&_li]:pl-7 [&_li]:text-slate-600 [&_li]:font-medium [&_li]:leading-relaxed [&_li]:before:content-['▸'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-purple-500 [&_li]:before:font-bold
          [&_blockquote]:border-l-4 [&_blockquote]:border-purple-300 [&_blockquote]:bg-purple-50/50 [&_blockquote]:rounded-r-xl [&_blockquote]:pl-6 [&_blockquote]:pr-6 [&_blockquote]:py-4 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote_p]:mb-0 [&_blockquote_p]:text-slate-700
          [&_mark]:bg-purple-100 [&_mark]:text-inherit [&_mark]:px-1 [&_mark]:py-0.5 [&_mark]:rounded
          [&_a]:text-purple-800 [&_a]:font-bold [&_a]:underline [&_a]:decoration-purple-300 [&_a]:underline-offset-2 hover:[&_a]:decoration-purple-500 [&_a]:transition
          [&_strong]:text-slate-800
          [&_table]:!w-full [&_table]:!my-8 [&_table]:!border-collapse [&_table]:!rounded-xl [&_table]:!overflow-hidden [&_table]:!border [&_table]:!border-slate-200 [&_table]:!shadow-sm [&_table]:!text-sm [&_table]:!table-auto
          [&_thead]:!bg-gradient-to-r [&_thead]:!from-purple-100 [&_thead]:!to-purple-50
          [&_th]:!px-4 [&_th]:!py-3 [&_th]:!text-left [&_th]:!font-black [&_th]:!text-purple-900 [&_th]:!text-xs [&_th]:!uppercase [&_th]:!tracking-wide [&_th]:!border-b-2 [&_th]:!border-purple-300
          [&_td]:!px-4 [&_td]:!py-3 [&_td]:!text-slate-700 [&_td]:!border-b [&_td]:!border-slate-100 [&_td]:!font-medium [&_td]:!align-middle
          [&_tbody_tr:last-child_td]:!border-b-0
          [&_tbody_tr:nth-child(even)]:!bg-slate-50/70
          [&_tbody_tr:hover]:!bg-purple-50/40 [&_tbody_tr]:!transition-colors
        `} dangerouslySetInnerHTML={{__html: article.content}}></div>

        {/* Like / Dislike */}
        <div className="mt-12 flex items-start gap-3">
          <button onClick={() => handleVote('like')} disabled={!!vote} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${vote === 'like' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : vote ? 'bg-slate-50 text-slate-300 border border-slate-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          </button>
          <button onClick={() => handleVote('dislike')} disabled={!!vote} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${vote === 'dislike' ? 'bg-red-100 text-red-700 border-2 border-red-300' : vote ? 'bg-slate-50 text-slate-300 border border-slate-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
          </button>
        </div>

        {!user && (
      <div className="mt-12 rounded-3xl p-10 text-center shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a1325 0%, #2d1b4e 100%)' }}>
        <div className="absolute" style={{ width: 320, height: 320, right: -80, top: -100, background: 'radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%)', pointerEvents: 'none' }}></div>
        <div className="absolute" style={{ width: 240, height: 240, left: -80, bottom: -90, background: 'radial-gradient(circle, rgba(236,72,153,0.30), transparent 70%)', pointerEvents: 'none' }}></div>
        <div className="relative">
          <h3 className="text-xl font-black text-white mb-3">Prêt(e) à préparer le concours <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 50%, #fcd34d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>ATSEM</em> ?</h3>
          <p className="text-purple-100 font-medium mb-6">Rejoignez Prépa ATSEM et commencez votre entraînement dès maintenant.</p>
          <a href="/signup" className="inline-flex items-center gap-2 bg-white hover:bg-purple-50 text-slate-900 font-black px-8 py-4 rounded-full transition shadow-lg">
            Inscrivez-vous dès maintenant <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
)}
      </article>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><LogoSvg className="w-5 h-5 text-purple-500" /><h4 className="text-white font-bold text-lg">Prépa ATSEM</h4></div>
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
