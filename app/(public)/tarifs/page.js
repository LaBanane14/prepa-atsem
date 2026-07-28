'use client'
import { useEffect } from 'react'

// Coche / tiret des lignes du comparatif
const Check = ({ stroke, size = 'w-4 h-4' }) => (
  <svg className={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
)
const Tiret = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/></svg>
)

// Une ligne du tableau : libellé + valeur mensuel + valeur pack
const LIGNES = [
  { label: 'QCM thématiques illimités', mensuel: true, pack: true },
  { label: 'Annales corrigées chronométrées', mensuel: true, pack: true },
  { label: 'Examen blanc généré par IA', mensuel: true, pack: true },
  { label: "Simulation d'oral par IA", mensuel: true, pack: true },
  { label: 'Dashboard personnalisé', mensuel: true, pack: true },
  { label: 'Résiliable à tout moment', mensuel: true, pack: false },
]

// Styles inline de la colonne Pack (surlignage continu sur toute la hauteur)
const COL_S = { background: 'rgba(147,51,234,0.12)', borderLeft: '2px solid #9333ea', borderRight: '2px solid #9333ea' }
// Colonne mensuelle : fond translucide continu pour la détacher du noir de la page
const COL_M = { background: 'rgba(255,255,255,0.06)' }

export default function TarifsPage() {
  // Fade-in au scroll (même mécanique que la page d'accueil)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative bg-[#0d0d0d] overflow-hidden">
      {/* Halo violet en haut à droite, comme la page d'inscription */}
      <div aria-hidden="true" className="absolute -top-32 -right-24 w-[32rem] h-[24rem] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      {/* ===================== EN-TÊTE ===================== */}
      <section className="relative px-5 pt-[110px] md:pt-[150px] pb-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] leading-[1.08] text-white">
            Aborder le concours ATSEM <span className="surligne">sereinement</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/55 font-medium leading-relaxed">
            Accédez à tous les outils en illimité pour réussir aussi bien l&apos;écrit que l&apos;oral du concours ATSEM.
          </p>
        </div>
      </section>

      {/* ===================== COMPARATIF DES FORMULES ===================== */}
      <section className="relative px-5 pt-10 pb-16 sm:pt-14 sm:pb-24 fade-in-up">
        {/* Décorations */}
        <div aria-hidden="true" className="absolute top-24 -left-24 w-80 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div aria-hidden="true" className="absolute bottom-10 -right-20 w-72 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        {/* Annotation manuscrite vers la colonne Pack */}
        <div aria-hidden="true" className="absolute hidden lg:block pointer-events-none z-20" style={{top: '-14px', right: '6%'}}>
          <p className="text-[1.55rem] text-purple-400 rotate-3" style={{fontFamily: "'Caveat', cursive", fontWeight: 700}}>Le plus populaire&nbsp;!</p>
          <svg className="w-14 h-14 text-purple-400/80 ml-8 mt-1" viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M52 5 C 42 24, 28 36, 12 41"/><path d="M22 43 12 41 14 31"/></svg>
        </div>

        {/* ===== Version mobile : deux cartes empilées (le tableau ne tient pas en largeur) ===== */}
        <div className="sm:hidden relative max-w-md mx-auto space-y-5">
          {/* Pack Concours, mis en avant en premier */}
          <div className="rounded-[24px] p-6" style={{background: 'rgba(147,51,234,0.12)', border: '2px solid #9333ea'}}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Pack Concours 6 mois</p>
              <span className="micro-beat shrink-0 bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-purple-600/25">−36&nbsp;%</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-[-0.03em] tabular-nums text-purple-400">49,99€</span>
              <span className="text-white/45 font-bold text-sm">pour 6 mois</span>
            </div>
            <p className="mt-1.5 text-[13px] font-bold"><span className="line-through text-white/30">77,94€</span> <span className="text-purple-400">soit 8,33€/mois</span></p>
            <p className="text-white/45 text-[12px] font-bold mt-1.5 leading-snug">1 seul paiement, pas de renouvellement automatique</p>
            <ul className="mt-5 space-y-2.5">
              {LIGNES.map((l, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[14px] text-white/70 font-medium">
                  {l.pack
                    ? <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-purple-500/20"><Check stroke="#c084fc" size="w-3 h-3" /></span>
                    : <span className="shrink-0 w-5 h-5 flex items-center justify-center"><Tiret /></span>}
                  <span className={l.pack ? '' : 'text-white/35'}>{l.label}</span>
                </li>
              ))}
            </ul>
            <a href="/auth?mode=signup" className="btn-shine mt-6 w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[15px] py-3 rounded-full transition shadow-lg shadow-purple-600/25 group">
              S&apos;abonner
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </a>
          </div>
          {/* Formule mensuelle */}
          <div className="rounded-[24px] p-6" style={COL_M}>
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/50 mb-4">Formule mensuelle</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-[-0.03em] tabular-nums text-white">12,99€</span>
              <span className="text-white/45 font-bold text-sm">/mois</span>
            </div>
            <p className="text-white/45 text-[12px] font-bold mt-1.5 leading-snug">Renouvellement automatique, résiliable en un clic</p>
            <ul className="mt-5 space-y-2.5">
              {LIGNES.map((l, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[14px] text-white/70 font-medium">
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center">{l.mensuel ? <Check stroke="#ffffff" /> : <Tiret />}</span>
                  {l.label}
                </li>
              ))}
            </ul>
            <a href="/auth?mode=signup" className="mt-6 w-full inline-flex items-center justify-center bg-white hover:bg-white/90 text-[#0d0d0d] font-bold text-[15px] py-3 rounded-full transition">S&apos;abonner</a>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto hidden sm:grid" style={{gridTemplateColumns: '1.35fr 0.9fr 1fr'}}>

          {/* Ligne d'en-tête : noms des formules et prix */}
          <div></div>
          <div className="px-3 sm:px-5 pt-7 pb-6 text-center rounded-t-[24px]" style={COL_M}>
            <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-white/50 mb-3">Formule mensuelle</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] tabular-nums text-white">12,99€</span>
              <span className="text-white/45 font-bold text-xs sm:text-sm">/mois</span>
            </div>
            <p className="text-white/45 text-[11px] font-bold mt-2.5 leading-snug">Renouvellement automatique, résiliable en un clic</p>
          </div>
          <div className="relative px-3 sm:px-5 pt-7 pb-6 text-center rounded-t-[24px]" style={{...COL_S, borderTop: '2px solid #9333ea'}}>
            <div className="micro-beat inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-purple-600/25 mb-3">−36&nbsp;%</div>
            <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-3">Pack Concours 6 mois</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] tabular-nums text-purple-400">49,99€</span>
              <span className="text-white/45 font-bold text-xs sm:text-sm">pour 6 mois</span>
            </div>
            <p className="mt-1.5 text-[12px] font-bold"><span className="line-through text-white/30">77,94€</span> <span className="text-purple-400">soit 8,33€/mois</span></p>
            <p className="text-white/45 text-[11px] font-bold mt-1.5 leading-snug">1 seul paiement, pas de renouvellement automatique</p>
          </div>

          {/* Lignes d'avantages */}
          {LIGNES.map((l, i) => (
            <div key={i} className="contents">
              <div className="flex items-center gap-2 py-4 pr-3 sm:pr-6 border-b border-white/10 text-[13px] sm:text-[15px] text-white/70 font-medium leading-snug">
                {l.label}
              </div>
              <div className="flex items-center justify-center py-4 border-b border-white/10" style={COL_M}>
                {l.mensuel ? <Check stroke="#ffffff" /> : <Tiret />}
              </div>
              <div className="flex items-center justify-center py-4" style={{...COL_S, borderBottom: i < LIGNES.length - 1 ? '1px solid rgba(192,132,252,0.18)' : 'none'}}>
                {l.pack
                  ? <span className="w-6 h-6 rounded-full flex items-center justify-center bg-purple-500/20"><Check stroke="#c084fc" size="w-3.5 h-3.5" /></span>
                  : <Tiret />}
              </div>
            </div>
          ))}

          {/* Ligne des boutons */}
          <div></div>
          <div className="px-2 sm:px-4 pt-6 pb-7 flex items-start justify-center rounded-b-[24px]" style={COL_M}>
            <a href="/auth?mode=signup" className="w-full max-w-[210px] inline-flex items-center justify-center bg-white hover:bg-white/90 text-[#0d0d0d] font-bold text-[13px] sm:text-[15px] py-3 rounded-full transition">S&apos;abonner</a>
          </div>
          <div className="px-3 sm:px-5 pt-6 pb-7 flex items-start justify-center rounded-b-[24px]" style={{...COL_S, borderBottom: '2px solid #9333ea'}}>
            <a href="/auth?mode=signup" className="btn-shine w-full max-w-[230px] inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[13px] sm:text-[15px] py-3 rounded-full transition shadow-lg shadow-purple-600/25 group">
              S&apos;abonner
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </a>
          </div>

        </div>

        {/* Réassurance sous le comparatif */}
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-[13px] font-bold text-white/55">
          {["7 jours d'essai gratuit", 'Sans carte bancaire pour essayer', 'Paiement sécurisé'].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center"><Check stroke="#c084fc" size="w-3 h-3" /></span>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Espace sous le comparatif */}
      <div className="pb-10 sm:pb-14"></div>
    </div>
  )
}
