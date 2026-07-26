'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const colorMap = {
  blue: { bg: 'from-blue-50 to-indigo-50', text: 'text-blue-600', pill: 'bg-blue-600/10', icon: 'text-blue-200' },
  amber: { bg: 'from-amber-50 to-orange-50', text: 'text-amber-600', pill: 'bg-amber-600/10', icon: 'text-amber-200' },
  emerald: { bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', pill: 'bg-emerald-600/10', icon: 'text-emerald-200' },
  purple: { bg: 'from-purple-50 to-fuchsia-50', text: 'text-purple-600', pill: 'bg-purple-600/10', icon: 'text-purple-200' },
  rose: { bg: 'from-rose-50 to-pink-50', text: 'text-rose-600', pill: 'bg-rose-600/10', icon: 'text-rose-200' },
  red: { bg: 'from-red-50 to-rose-50', text: 'text-red-600', pill: 'bg-red-600/10', icon: 'text-red-200' }
}

export default function MaquetteBlogPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 6

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, category_color, date, reading_time, image_url, views')
      .eq('published', true)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setArticles(data)
        setLoading(false)
      })
  }, [])

  const nbPages = Math.ceil(articles.length / articlesPerPage)

  return (
    <>
      {/* ===================== EN-TÊTE ===================== */}
      <section className="relative px-5 pt-[110px] md:pt-[150px] pb-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] leading-[1.08]">
            Toutes les clés pour <span className="surligne">réussir le concours ATSEM</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-black/55 font-medium leading-relaxed">
            Actualités, conseils et astuces pour réussir au mieux votre concours ATSEM.
          </p>
        </div>
      </section>

      {/* ===================== ARTICLES ===================== */}
      <section className="relative overflow-hidden px-5 pt-10 pb-16 sm:pt-12 sm:pb-24">
        {/* Décorations */}
        <div aria-hidden="true" className="absolute top-32 -left-24 w-80 h-64 bg-purple-500/[0.06] rounded-full blur-3xl pointer-events-none"></div>
        <div aria-hidden="true" className="absolute bottom-24 -right-20 w-72 h-56 bg-indigo-500/[0.05] rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage).map((article, index) => {
                  const colors = colorMap[article.category_color] || colorMap.blue
                  return (
                    <a key={article.id} href={`/maquette/blog/${article.slug}`} className="group bg-white rounded-[24px] ring-1 ring-black/[0.07] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                      <div className={`h-44 relative flex items-center justify-center bg-gradient-to-br ${colors.bg} overflow-hidden`}>
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} width={400} height={200} />
                        ) : (
                          <svg className={`w-16 h-16 ${colors.icon}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <span className={`${colors.text} ${colors.pill} self-start font-extrabold text-[11px] uppercase tracking-wider mb-3.5 px-2.5 py-1 rounded-full`}>{article.category}</span>
                        <h3 className="text-lg font-extrabold tracking-tight leading-snug mb-2.5 line-clamp-2">{article.title}</h3>
                        <p className="text-black/55 font-medium text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">{article.excerpt}</p>
                        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between mt-auto text-[13px] text-black/45 font-semibold">
                          <div className="flex items-center gap-3">
                            <span>{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{article.views || 0}</span>
                          </div>
                          <span className="font-bold text-black/70 group-hover:text-purple-700 transition-colors flex items-center gap-1">Lire <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></span>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>

              {/* Pagination */}
              {articles.length > articlesPerPage && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-full ring-1 ring-black/10 bg-white font-bold text-sm hover:bg-black/5 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  {Array.from({ length: nbPages }, (_, i) => (
                    <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0) }} className={`w-10 h-10 rounded-full font-bold text-sm transition cursor-pointer ${currentPage === i + 1 ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/25' : 'bg-white ring-1 ring-black/10 text-black/70 hover:bg-black/5'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => { setCurrentPage(p => Math.min(nbPages, p + 1)); window.scrollTo(0, 0) }} disabled={currentPage === nbPages} className="w-10 h-10 flex items-center justify-center rounded-full ring-1 ring-black/10 bg-white font-bold text-sm hover:bg-black/5 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
