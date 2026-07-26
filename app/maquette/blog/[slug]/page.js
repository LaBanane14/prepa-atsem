'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

const colorMap = {
  blue: { bg: 'from-blue-50 to-indigo-50', text: 'text-blue-600', pill: 'bg-blue-600/10', icon: 'text-blue-200' },
  amber: { bg: 'from-amber-50 to-orange-50', text: 'text-amber-600', pill: 'bg-amber-600/10', icon: 'text-amber-200' },
  emerald: { bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', pill: 'bg-emerald-600/10', icon: 'text-emerald-200' },
  purple: { bg: 'from-purple-50 to-fuchsia-50', text: 'text-purple-600', pill: 'bg-purple-600/10', icon: 'text-purple-200' },
  rose: { bg: 'from-rose-50 to-pink-50', text: 'text-rose-600', pill: 'bg-rose-600/10', icon: 'text-rose-200' },
  red: { bg: 'from-red-50 to-rose-50', text: 'text-red-600', pill: 'bg-red-600/10', icon: 'text-red-200' }
}

export default function MaquetteArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [vote, setVote] = useState(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null))
    supabase
      .from('articles')
      .select('*')
      .eq('slug', params.slug)
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setArticle(data)
        // Pas d'incrément de vues sur la maquette (contenu dupliqué)
        setLoading(false)
      })
    const saved = localStorage.getItem(`vote-${params.slug}`)
    if (saved) setVote(saved)
  }, [])

  async function handleVote(type) {
    if (vote) return
    setVote(type)
    localStorage.setItem(`vote-${params.slug}`, type)
    const field = type === 'like' ? 'likes' : 'dislikes'
    await supabase.from('articles').update({ [field]: (article[field] || 0) + 1 }).eq('id', article.id)
    setArticle(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <section className="min-h-screen flex items-center justify-center px-5 pt-[96px] pb-16">
        <div className="text-center max-w-lg">
          <p className="text-[7rem] sm:text-[9rem] font-extrabold tracking-[-0.05em] leading-none mb-4 select-none">4<span className="text-purple-700">0</span>4</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Article introuvable</h1>
          <p className="text-black/50 font-medium mb-9">Cet article n&apos;existe pas ou a été supprimé.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/maquette/blog" className="inline-flex items-center gap-2 bg-[#0d0d0d] hover:bg-black/85 text-white font-bold px-6 py-3.5 rounded-full transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg>
              Retour au blog
            </a>
            <a href="/maquette" className="inline-flex items-center font-bold px-6 py-3.5 rounded-full ring-1 ring-black/10 hover:bg-black/5 transition">Accueil</a>
          </div>
        </div>
      </section>
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
    author: { '@type': 'Organization', name: 'Prépa ATSEM', url: 'https://www.prepa-atsem.fr' },
    publisher: { '@type': 'Organization', name: 'Prépa ATSEM', url: 'https://www.prepa-atsem.fr' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.prepa-atsem.fr/blog/${params.slug}` },
    ...(article.image_url && { image: article.image_url }),
  }

  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-6 pt-[110px] md:pt-[140px] pb-16 sm:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="/maquette/blog" className="inline-flex items-center gap-2 text-sm font-bold text-black/45 hover:text-purple-700 transition mb-9">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg> Retour au blog
      </a>

      <div className="mb-10">
        <span className={`${colors.text} ${colors.pill} inline-block font-extrabold text-[11px] uppercase tracking-wider mb-4 px-2.5 py-1 rounded-full`}>{article.category}</span>
        <h1 className="text-3xl sm:text-[2.6rem] font-extrabold tracking-[-0.03em] leading-[1.12] mb-5">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-black/45 font-semibold">
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
        <img src={article.image_url} alt={article.title} className="w-full h-64 sm:h-80 object-cover rounded-[28px] mb-12 ring-1 ring-black/[0.06]" />
      ) : (
        <div className={`h-64 sm:h-80 bg-gradient-to-br ${colors.bg} rounded-[28px] flex items-center justify-center mb-12 ring-1 ring-black/[0.06]`}>
          <svg className={`w-20 h-20 ${colors.icon}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
      )}

      <div className={`max-w-none
        [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-black/[0.08]
        [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3
        [&_p]:text-black/60 [&_p]:font-medium [&_p]:leading-relaxed [&_p]:mb-5
        [&_hr]:my-10 [&_hr]:border-black/[0.08]
        [&_ul]:my-6 [&_ul]:space-y-2 [&_ul]:list-none [&_ul]:pl-0
        [&_li]:relative [&_li]:pl-7 [&_li]:text-black/60 [&_li]:font-medium [&_li]:leading-relaxed [&_li]:before:content-['▸'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-purple-400 [&_li]:before:font-bold
        [&_blockquote]:border-l-4 [&_blockquote]:border-purple-300 [&_blockquote]:bg-purple-50/50 [&_blockquote]:rounded-r-xl [&_blockquote]:pl-6 [&_blockquote]:pr-6 [&_blockquote]:py-4 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-black/70 [&_blockquote_p]:mb-0 [&_blockquote_p]:text-black/70
        [&_mark]:bg-purple-100 [&_mark]:text-inherit [&_mark]:px-1 [&_mark]:py-0.5 [&_mark]:rounded
        [&_a]:text-purple-700 [&_a]:font-bold [&_a]:underline [&_a]:decoration-purple-200 [&_a]:underline-offset-2 hover:[&_a]:decoration-purple-400 [&_a]:transition
        [&_strong]:text-black/80
      `} dangerouslySetInnerHTML={{__html: article.content}}></div>

      {/* Utile ou pas ? */}
      <div className="mt-12 flex items-start gap-3">
        <button onClick={() => handleVote('like')} disabled={!!vote} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition cursor-pointer ${vote === 'like' ? 'bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/40' : vote ? 'bg-black/[0.03] text-black/20 ring-1 ring-black/[0.06]' : 'bg-white text-black/70 ring-1 ring-black/10 hover:bg-emerald-500/10 hover:text-emerald-600'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        </button>
        <button onClick={() => handleVote('dislike')} disabled={!!vote} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition cursor-pointer ${vote === 'dislike' ? 'bg-red-500/10 text-red-600 ring-2 ring-red-500/40' : vote ? 'bg-black/[0.03] text-black/20 ring-1 ring-black/[0.06]' : 'bg-white text-black/70 ring-1 ring-black/10 hover:bg-red-500/10 hover:text-red-600'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
        </button>
      </div>

      {/* Appel à l'action */}
      {!user && (
        <div className="relative overflow-hidden mt-14 bg-[#0d0d0d] rounded-[28px] p-10 text-center">
          <div aria-hidden="true" className="absolute -top-16 -right-16 w-64 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative">
            <h3 className="text-2xl font-extrabold tracking-tight text-white mb-3">Prêt à vous entraîner&nbsp;?</h3>
            <p className="text-white/55 font-medium mb-7">Rejoignez Prépa ATSEM et commencez vos révisions dès maintenant.</p>
            <a href="/maquette/auth?mode=signup" className="btn-shine inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-8 py-4 rounded-full transition shadow-lg shadow-purple-700/25 group">
              Inscrivez-vous dès maintenant
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      )}
    </article>
  )
}
