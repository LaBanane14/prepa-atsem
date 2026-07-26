'use client'
// Chrome partagé de la maquette (partie non connectée) : nav pilule, nav
// mobile, footer et styles communs. Rendu par le layout serveur (layout.js),
// qui porte les métadonnées SEO. Toutes les pages de app/maquette/ en héritent.
// Design repris de la refonte Prépa FPC, adapté au branding ATSEM (violet).
// Sur l'accueil la nav suit le défilement ; sur les autres pages elle reste en haut.
// Si une session Supabase existe, la nav remplace Connexion/Inscription
// par « Mon tableau de bord ».
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// Logo ATSEM (deux silhouettes autour d'une étoile) — currentColor
const LogoAtsem = ({ className }) => (
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

export default function MaquetteChrome({ children }) {
  const surAccueil = usePathname() === '/maquette'
  const [connecte, setConnecte] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => setConnecte(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setConnecte(!!session))
    return () => subscription.unsubscribe()
  }, [])
  return (
    <div className="min-h-screen bg-white text-[#0d0d0d] antialiased" style={{fontFamily: "'Inter', system-ui, -apple-system, sans-serif"}}>
      {/* Le noindex de la maquette est porté par les métadonnées du layout serveur */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(13,13,13,0.9); color: #fff; }
        .fade-in-up { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        .fade-in-up.visible { opacity: 1; transform: translateY(0); }

        /* Reflet qui balaie le bouton principal */
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content: ''; position: absolute; top: 0; bottom: 0; left: -120%; width: 50%; transform: skewX(-45deg); background: rgba(255,255,255,0.35); transition: left 0.8s ease; }
        .btn-shine:hover::after { left: 130%; }

        /* Grille fine du hero, estompée vers le bas */
        .hero-grid {
          background-image: linear-gradient(to right, rgba(15,23,42,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.1) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 85% 75% at 50% 0%, black 35%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 85% 75% at 50% 0%, black 35%, transparent 100%);
        }

        /* Surlignage au marqueur : bande translucide aux bords irréguliers */
        .surligne {
          background: linear-gradient(100deg, rgba(168,85,247,0) 0.8%, rgba(168,85,247,0.38) 2.8%, rgba(168,85,247,0.30) 50%, rgba(168,85,247,0.38) 97%, rgba(168,85,247,0) 99.2%);
          border-radius: 0.45em 0.2em 0.55em 0.25em;
          padding: 0.04em 0.22em;
          margin: 0 -0.06em;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }

        /* Changement de statistique : simple fondu montant */
        .stat-swap { animation: stat-swap 0.35s ease-out; }
        @keyframes stat-swap { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        /* La nouvelle tuile de la pile avance depuis l'arrière au lieu d'apparaître d'un coup */
        @keyframes tuile-entree { from { transform: translateY(-7px) scale(0.92); opacity: 0.55; } to { transform: none; opacity: 1; } }
        .tuile-entree { animation: tuile-entree 0.55s cubic-bezier(0.22, 1, 0.36, 1); }

        /* Mot du titre : la nouvelle couleur balaie le mot de gauche à droite */
        .balaye-mot { animation: balaye-mot 0.6s cubic-bezier(0.65,0,0.35,1) forwards; clip-path: inset(-0.15em 100% -0.15em 0); }
        @keyframes balaye-mot { to { clip-path: inset(-0.15em -0.05em -0.15em 0); } }

        /* Indice de scroll : chevrons qui descendent en boucle */
        @keyframes scroll-cue { 0% { transform: translateY(-4px); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateY(6px); opacity: 0; } }
        .scroll-cue-1 { animation: scroll-cue 1.6s ease-in-out infinite; }
        .scroll-cue-2 { animation: scroll-cue 1.6s ease-in-out infinite 0.25s; }

        /* Micro qui « écoute » : ondes concentriques qui s'étendent et s'estompent */
        @keyframes micro-pulse { 0% { transform: scale(0.65); opacity: 0.9; } 100% { transform: scale(1.7); opacity: 0; } }
        .micro-pulse { animation: micro-pulse 1.8s ease-out infinite; }
        .micro-pulse-retard { animation: micro-pulse 1.8s ease-out infinite 0.6s; }
        @keyframes micro-beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        .micro-beat { animation: micro-beat 1.8s ease-in-out infinite; }

        /* Tracé cardiaque du chrono (défilement du trait) */
        @keyframes heartbeat-line { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
        .heartbeat-anim { animation: heartbeat-line 1.5s linear infinite; }

        /* Survol nav : le lien survolé reste net, les autres s'estompent */
        .nav-dim a { transition: opacity 0.25s ease, filter 0.25s ease; }
        .nav-dim:hover a { opacity: 0.3; filter: blur(0.6px); }
        .nav-dim a:hover { opacity: 1; filter: none; }
      `}</style>

      {/* ===================== NAVIGATION (pilule flottante) ===================== */}
      <nav className={`hidden md:flex ${surAccueil ? 'fixed' : 'absolute'} left-1/2 top-6 -translate-x-1/2 z-50 h-[60px] w-[min(880px,calc(100vw-40px))] items-center gap-x-3 lg:gap-x-6 rounded-full bg-[hsla(0,0%,93%,0.72)] backdrop-blur-xl px-4 lg:px-6 py-2`}>
        <a href="/maquette" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 shrink-0">
          <div className="bg-purple-800 text-white px-1 py-1.5 rounded-xl shadow-sm">
            <LogoAtsem className="w-8 h-6" />
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">Prépa <span className="text-purple-800">ATSEM</span></span>
        </a>
        <div className="nav-dim flex items-center gap-x-1 mx-auto">
          <a href="/maquette" className="px-2.5 lg:px-3.5 py-2 text-[0.95rem] font-bold text-[#0d0d0d]">Accueil</a>
          <a href="/maquette/calendrier" className="px-2.5 lg:px-3.5 py-2 whitespace-nowrap text-[0.95rem] font-bold text-[#0d0d0d]">Calendrier</a>
          <a href="/maquette/blog" className="px-2.5 lg:px-3.5 py-2 text-[0.95rem] font-bold text-[#0d0d0d]">Blog</a>
          <a href="/maquette/tarifs" className="px-2.5 lg:px-3.5 py-2 text-[0.95rem] font-bold text-[#0d0d0d]">Tarifs</a>
        </div>
        <div className="flex items-center gap-x-3 lg:gap-x-5 shrink-0">
          {connecte ? (
            <a href="/dashboard" className="inline-flex items-center justify-center h-[44px] bg-[#141414] hover:bg-black/80 text-white text-[0.95rem] font-bold px-4 rounded-full transition">Mon tableau de bord</a>
          ) : (
            <>
              <a href="/maquette/auth" className="w-fit text-[0.95rem] font-bold text-[#0d0d0d] transition-opacity hover:opacity-80">Connexion</a>
              <a href="/maquette/auth?mode=signup" className="inline-flex items-center justify-center h-[44px] bg-[#141414] hover:bg-black/80 text-white text-[0.95rem] font-bold px-4 rounded-full transition">Inscription</a>
            </>
          )}
        </div>
      </nav>

      {/* Nav mobile (la pilule est masquée sous 720px) */}
      <nav className={`md:hidden ${surAccueil ? 'sticky top-0' : 'relative'} z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 px-5 h-14 flex items-center justify-between`}>
        <a href="/maquette" className="flex items-center gap-2">
          <div className="bg-purple-800 text-white px-0.5 py-1 rounded-lg">
            <LogoAtsem className="w-7 h-5" />
          </div>
          <span className="font-black text-base tracking-tight">Prépa <span className="text-purple-800">ATSEM</span></span>
        </a>
        <div className="flex items-center gap-2">
          {connecte ? (
            <a href="/dashboard" className="inline-flex items-center bg-[#141414] text-white text-sm font-bold px-4 py-2 rounded-full">Mon tableau de bord</a>
          ) : (
            <a href="/maquette/auth?mode=signup" className="inline-flex items-center bg-[#141414] text-white text-sm font-bold px-4 py-2 rounded-full">Essayer</a>
          )}
          <button
            type="button"
            onClick={() => setMenuOuvert(!menuOuvert)}
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOuvert}
            className="w-10 h-10 -mr-1.5 flex items-center justify-center rounded-full active:bg-black/5 cursor-pointer"
          >
            {menuOuvert ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>
            )}
          </button>
        </div>
        {/* Panneau du menu mobile */}
        {menuOuvert && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-[0_24px_50px_rgba(0,0,0,0.12)] px-5 pt-1 pb-4">
            {[
              { href: '/maquette', label: 'Accueil' },
              { href: '/maquette/calendrier', label: 'Calendrier' },
              { href: '/maquette/blog', label: 'Blog' },
              { href: '/maquette/tarifs', label: 'Tarifs' },
            ].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOuvert(false)} className="block py-3.5 text-[17px] font-bold text-[#0d0d0d] border-b border-black/[0.05]">{l.label}</a>
            ))}
            {connecte ? (
              <a href="/dashboard" onClick={() => setMenuOuvert(false)} className="block py-3.5 text-[17px] font-bold text-purple-700">Mon tableau de bord</a>
            ) : (
              <a href="/maquette/auth" onClick={() => setMenuOuvert(false)} className="block py-3.5 text-[17px] font-bold text-purple-700">Connexion</a>
            )}
          </div>
        )}
      </nav>

      {children}

      {/* ===================== FOOTER ===================== */}
      <footer className="relative bg-[#0a0a0a] text-white overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 70% 90% at 50% 40%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 90% at 50% 40%, black 30%, transparent 100%)'}}></div>
        <div aria-hidden="true" className="absolute -bottom-32 -right-24 w-[28rem] h-[20rem] bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div aria-hidden="true" className="absolute -bottom-28 -left-20 w-[24rem] h-[18rem] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-10 pt-[72px] pb-6">
          <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-x-8 gap-y-12">
            <div className="col-span-2 md:col-span-1">
              <a href="/maquette" className="inline-flex items-center gap-2.5">
                <div className="bg-purple-700 text-white px-1 py-1.5 rounded-xl">
                  <LogoAtsem className="w-7 h-5" />
                </div>
                <span className="font-extrabold text-lg tracking-tight">Prépa ATSEM</span>
              </a>
              <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-[280px]">La plateforme d&apos;entraînement dédiée aux candidats du concours ATSEM. QCM, annales corrigées et simulations d&apos;oral, dans les conditions réelles du concours.</p>
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest mb-4">Produit</h4>
              <ul className="space-y-3 text-[15px] text-white/85">
                <li><a href="/maquette#entrainement-qcm" className="hover:text-white transition">QCM thématiques</a></li>
                <li><a href="/maquette#annales" className="hover:text-white transition">Annales corrigées</a></li>
                <li><a href="/maquette#examen-blanc" className="hover:text-white transition">Examens blancs</a></li>
                <li><a href="/maquette#preparation-oral" className="hover:text-white transition">Préparation à l&apos;oral</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest mb-4">Ressources</h4>
              <ul className="space-y-3 text-[15px] text-white/85">
                <li><a href="/maquette/blog" className="hover:text-white transition">Blog</a></li>
                <li><a href="/maquette/calendrier" className="hover:text-white transition">Calendrier 2026</a></li>
                <li><a href="mailto:support@prepa-atsem.fr" className="font-bold text-white hover:text-white/80 transition">support@prepa-atsem.fr</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest mb-4">Informations</h4>
              <ul className="space-y-3 text-[15px] text-white/85">
                <li><a href="/maquette/tarifs" className="hover:text-white transition">Tarifs</a></li>
                <li><a href="/maquette/mentions-legales" className="hover:text-white transition">Mentions légales</a></li>
                <li><a href="/maquette/cgu" className="hover:text-white transition">CGV &amp; CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/45">
            <span>© 2026 Prépa ATSEM</span>
            <span>Fait avec ❤️ en France</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
