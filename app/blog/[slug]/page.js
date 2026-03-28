'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const Stethoscope = ({className}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>

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
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Article introuvable</h1>
          <a href="/blog" className="text-red-600 font-bold hover:text-red-700">Retour au blog</a>
        </div>
      </div>
    )
  }

  const colors = colorMap[article.category_color] || colorMap.blue

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Organization', name: 'Prépa FPC', url: 'https://prepa-fpc.vercel.app' },
    publisher: { '@type': 'Organization', name: 'Prépa FPC', url: 'https://prepa-fpc.vercel.app' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://prepa-fpc.vercel.app/blog/${params.slug}` },
    ...(article.image_url && { image: article.image_url }),
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-200 flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-xl shadow-sm"><Stethoscope className="w-7 h-7" /></div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900 block leading-none">Prépa <span className="text-red-600">FPC</span></span>
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">La passerelle IFSI</span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            {[{href:'/',label:'Accueil'},{href:'/calculs-doses',label:'Calculs de doses'},{href:'/blog',label:'Blog',active:true},{href:'/tarifs',label:'Tarifs'}].map(link => (
              <a key={link.label} href={link.href} className={link.active ? 'text-red-600' : 'hover:text-red-600 transition'}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {!authLoading && (user ? (
              <>
                <a href="/dashboard" className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-red-200 transition transform hover:-translate-y-0.5 text-sm">Mon tableau de bord</a>
                <button onClick={handleLogout} className="hidden md:block text-slate-400 hover:text-red-600 transition cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
              </>
            ) : (
              <>
                <a href="/login" className="hidden md:block text-slate-600 font-bold hover:text-slate-900 transition text-sm">Connexion</a>
                <a href="/signup" className="hidden md:inline-flex bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-slate-200 transition transform hover:-translate-y-0.5 text-sm">Inscription</a>
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
              {[{href:'/',label:'Accueil'},{href:'/calculs-doses',label:'Calculs de doses'},{href:'/blog',label:'Blog',active:true},{href:'/tarifs',label:'Tarifs'}].map(link => (
                <a key={link.label} href={link.href} className={`block py-3 px-4 rounded-xl font-bold transition ${link.active ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}>{link.label}</a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Mon espace</a>
                    <button onClick={handleLogout} className="block py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition text-center w-full">Déconnexion</button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Connexion</a>
                    <a href="/signup" className="block py-3 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-black transition text-center">Inscription</a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ARTICLE */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-grow">
        <a href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition mb-8">
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
          [&_li]:relative [&_li]:pl-7 [&_li]:text-slate-600 [&_li]:font-medium [&_li]:leading-relaxed [&_li]:before:content-['▸'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-red-400 [&_li]:before:font-bold
          [&_blockquote]:border-l-4 [&_blockquote]:border-red-300 [&_blockquote]:bg-red-50/50 [&_blockquote]:rounded-r-xl [&_blockquote]:pl-6 [&_blockquote]:pr-6 [&_blockquote]:py-4 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote_p]:mb-0 [&_blockquote_p]:text-slate-700
          [&_mark]:bg-red-100 [&_mark]:text-inherit [&_mark]:px-1 [&_mark]:py-0.5 [&_mark]:rounded
          [&_a]:text-red-600 [&_a]:font-bold [&_a]:underline [&_a]:decoration-red-200 [&_a]:underline-offset-2 hover:[&_a]:decoration-red-400 [&_a]:transition
          [&_strong]:text-slate-800
        `} dangerouslySetInnerHTML={{__html: article.content}}></div>

        {/* Like / Dislike */}
        <div className="mt-12 flex items-start gap-3">
          <button onClick={() => handleVote('like')} disabled={!!vote} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${vote === 'like' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : vote ? 'bg-slate-50 text-slate-300 border border-slate-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            {article.likes || 0}
          </button>
          <button onClick={() => handleVote('dislike')} disabled={!!vote} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${vote === 'dislike' ? 'bg-red-100 text-red-700 border-2 border-red-300' : vote ? 'bg-slate-50 text-slate-300 border border-slate-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
            {article.dislikes || 0}
          </button>
        </div>

        {!user && (
      <div className="mt-12 bg-slate-900 rounded-3xl p-10 text-center shadow-xl">
        <h3 className="text-xl font-black text-white mb-3">Prêt(e) à vous entraîner ?</h3>
        <p className="text-slate-400 font-medium mb-6">Rejoignez Prépa FPC et commencez vos révisions dès maintenant.</p>
        <a href="/signup" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-red-200/30">
          Inscrivez-vous dès maintenant <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </a>
      </div>
)}
      </article>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><Stethoscope className="w-5 h-5 text-red-500" /><h4 className="text-white font-bold text-lg">Prépa FPC</h4></div>
            <p className="max-w-xs leading-relaxed">La plateforme d'entraînement dédiée aux candidats en reconversion professionnelle qui préparent le concours FPC. Entraînez-vous dans les conditions réelles du concours.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources IFSI</h4>
            <ul className="space-y-3">
              <li><a href="/blog/dates-concours-fpc-infirmier-2026" className="hover:text-white transition">Dates concours FPC</a></li>
              <li><a href="/blog" className="hover:text-white transition">Dossier Passerelle AS/AP</a></li>
              <li><a href="/calculs-doses" className="hover:text-white transition">Formules calculs de doses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Légal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
              <li><a href="#" className="hover:text-white transition">CGV &amp; CGU</a></li>
              <li><a href="mailto:contact@prepa-fpc.fr" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center">
          <p>&copy; 2026 Prépa FPC (prepa-fpc.fr). Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
