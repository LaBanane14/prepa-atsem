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

const FEATURES = [
  'QCM ATSEM illimités',
  'Annales corrigées chronométrées',
  'Simulation d\'oral par IA',
  'Dashboard personnalisé',
]

export default function TarifsPage() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const navLinks = [
    { href: '/', label: 'Accueil', active: false },
    { href: '/calendrier', label: 'Calendrier', active: false },
    { href: '/blog', label: 'Blog', active: false },
    { href: '/tarifs', label: 'Tarifs', active: true }
  ]

  return (
    <div className="min-h-screen" style={{ background: '#faf8ff', color: '#1a1325', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        html { scroll-behavior: smooth; scroll-padding-top: 7rem; }

        .t-wrap { position: relative; padding: 56px 0 80px; min-height: 100vh; }
        .t-wrap::before {
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
        .t-wrap > * { position: relative; }
        .t-inner { max-width: 1180px; margin: 0 auto; padding: 0 48px; }

        /* HERO */
        .t-hero { margin-bottom: 56px; max-width: 920px; }
        .t-hero h1 { font-size: 64px; font-weight: 900; line-height: 1.02; margin: 0 0 20px; letter-spacing: -0.03em; color: #1a1325; }
        .t-hero h1 em {
          font-style: normal;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .t-hero p { font-size: 18px; line-height: 1.5; color: #5e5270; margin: 0; max-width: 680px; }
        .t-hero-meta { display: flex; gap: 10px; margin-top: 28px; flex-wrap: wrap; font-size: 13px; font-weight: 700; }
        .t-hero-meta span {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 999px;
          background: white; border: 1px solid #ece9f0; color: #3a2f4a;
        }
        .t-hero-meta b { font-weight: 900; }
        .t-hero-meta span:nth-child(1) b { color: #8b5cf6; }
        .t-hero-meta span:nth-child(2) b { color: #ec4899; }
        .t-hero-meta span:nth-child(3) b { color: #f59e0b; }

        /* SECTION HEAD */
        .t-section { margin-bottom: 56px; }
        .t-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .t-section-title {
          font-size: 13px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase; color: #6b5b8e;
          display: flex; align-items: center; gap: 10px;
        }
        .t-section-title svg { width: 16px; height: 16px; color: #8b5cf6; }

        /* PRICING GRID */
        .t-pricing-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 28px; }
        @media (max-width: 980px) { .t-pricing-grid { grid-template-columns: 1fr; } }

        .t-card { border-radius: 28px; padding: 44px 40px 40px; position: relative; overflow: hidden; display: flex; flex-direction: column; }

        .t-card.light {
          background: white; border: 1px solid #ece9f0;
          box-shadow: 0 18px 40px -24px rgba(20, 10, 40, 0.18);
        }
        .t-card.light::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(139,92,246,0.07), transparent 55%), radial-gradient(circle at 100% 100%, rgba(236,72,153,0.06), transparent 55%);
          pointer-events: none;
        }
        .t-card.light > * { position: relative; }

        .t-card.dark {
          background: #1a1325; color: white;
          box-shadow: 0 30px 60px -28px rgba(139, 92, 246, 0.55), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .t-card.dark::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 90% 0%, rgba(168, 85, 247, 0.35), transparent 55%),
            radial-gradient(ellipse at 0% 100%, rgba(236, 72, 153, 0.22), transparent 55%),
            radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.06), transparent 60%);
          pointer-events: none;
        }
        .t-card.dark > * { position: relative; }
        .t-card.dark .t-tagline, .t-card.dark .t-period { color: rgba(255,255,255,0.7); }
        .t-card.dark .t-feat { color: rgba(255,255,255,0.92); }
        .t-card.dark .t-feat::before { background-color: rgba(168, 85, 247, 0.2); background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23d8b4fe' stroke-width='3' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M5 13l4 4L19 7'/%3E%3C/svg%3E"); }
        .t-card.dark .t-divider { border-color: rgba(255,255,255,0.1); }
        .t-card.dark .t-foot-note { color: rgba(255,255,255,0.55); }

        .t-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 12px; flex-wrap: wrap; }
        .t-eyebrow { font-size: 12px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; color: #6b5b8e; }
        .t-card.dark .t-eyebrow { color: rgba(255,255,255,0.65); }
        .t-ribbon {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          background: linear-gradient(135deg, #f59e0b, #ec4899);
          color: white; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
          box-shadow: 0 6px 18px -6px rgba(236,72,153,0.6);
        }

        .t-name { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; margin: 0 0 8px; }
        .t-tagline { font-size: 15px; line-height: 1.5; color: #5e5270; margin: 0 0 28px; max-width: 38ch; }

        .t-price { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 4px; }
        .t-amount {
          font-size: 64px; font-weight: 900; letter-spacing: -0.03em; line-height: 1;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .t-card.dark .t-amount {
          background: linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 50%, #fcd34d 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .t-period { font-size: 16px; font-weight: 700; color: #6b5b8e; padding-bottom: 10px; }
        .t-strike { font-size: 13px; font-weight: 700; color: #9b8eb8; margin: 0 0 22px; }
        .t-strike s { opacity: 0.7; margin-right: 8px; }
        .t-strike b { color: #ec4899; }
        .t-card.dark .t-strike { color: rgba(255,255,255,0.6); }
        .t-card.dark .t-strike b { color: #fcd34d; }

        .t-divider { height: 1px; border: 0; border-top: 1px dashed #ece9f0; margin: 8px 0 26px; }

        .t-feats { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .t-feat { display: flex; align-items: flex-start; gap: 14px; font-size: 15px; font-weight: 600; color: #2d2540; line-height: 1.4; }
        .t-feat::before {
          content: ''; flex: 0 0 22px; height: 22px; border-radius: 50%;
          background-color: #ede9fe;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%236b21a8' stroke-width='3' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M5 13l4 4L19 7'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: center; background-size: 13px 13px;
          margin-top: 1px;
        }

        .t-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 18px 28px; border-radius: 999px;
          font-size: 15px; font-weight: 900; letter-spacing: 0.02em;
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
        }
        .t-cta svg { width: 18px; height: 18px; }
        .t-cta-light { background: #1a1325; color: white; }
        .t-cta-light:hover { background: #2d1b4e; transform: translateY(-2px); box-shadow: 0 18px 30px -14px rgba(20,10,40,0.5); }
        .t-cta-dark { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; box-shadow: 0 18px 30px -10px rgba(139,92,246,0.55); }
        .t-cta-dark:hover { transform: translateY(-2px); box-shadow: 0 24px 40px -12px rgba(236,72,153,0.6); }

        .t-foot-note { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #6b5b8e; text-align: center; margin-top: 14px; text-transform: uppercase; }

        /* REASSURE — trust strip */
        .t-reassure { margin-top: 32px; }
        .t-trust {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          background: white; border: 1px solid #ece9f0; border-radius: 20px;
          overflow: hidden; box-shadow: 0 12px 28px -20px rgba(20,10,40,0.15);
        }
        .t-trust .t-rs-item { display: flex; align-items: center; gap: 14px; padding: 22px 24px; border-right: 1px solid #f3effc; }
        .t-trust .t-rs-item:last-child { border-right: none; }
        .t-trust .t-rs-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
        .t-trust .t-rs-icon svg { width: 20px; height: 20px; }
        .t-trust .t-rs-item:nth-child(1) .t-rs-icon { background: #ecfdf5; color: #047857; }
        .t-trust .t-rs-item:nth-child(2) .t-rs-icon { background: #f3efff; color: #6d28d9; }
        .t-trust .t-rs-item:nth-child(3) .t-rs-icon { background: #fef3c7; color: #b45309; }
        .t-trust .t-rs-item:nth-child(4) .t-rs-icon { background: #fce7f3; color: #be185d; }
        .t-trust .t-rs-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .t-trust .t-rs-title { font-size: 13px; font-weight: 900; color: #1a1325; letter-spacing: -0.01em; }
        .t-trust .t-rs-sub { font-size: 12px; font-weight: 600; color: #6b5b8e; }
        @media (max-width: 980px) {
          .t-trust { grid-template-columns: repeat(2, 1fr); }
          .t-trust .t-rs-item:nth-child(2) { border-right: none; }
          .t-trust .t-rs-item:nth-child(1), .t-trust .t-rs-item:nth-child(2) { border-bottom: 1px solid #f3effc; }
        }

        @media (max-width: 1100px) {
          .t-wrap { padding: 40px 0 60px; }
          .t-inner { padding: 0 32px; }
        }
        @media (max-width: 720px) {
          .t-wrap { padding: 28px 0 56px; }
          .t-inner { padding: 0 18px; }
          .t-hero h1 { font-size: 36px; }
          .t-amount { font-size: 48px; }
          .t-card { padding: 32px 26px 28px; }
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
                  <>
                    <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Mon espace</a>
                    <button onClick={handleLogout} className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 hover:bg-purple-900 transition text-center w-full">Déconnexion</button>
                  </>
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

      {/* ─── CONTENU NEW DESIGN ─── */}
      <div className="t-wrap">
        <div className="t-inner">

          {/* HERO */}
          <header className="t-hero">
            <h1>Préparez le concours ATSEM sereinement</h1>
            <p>Accédez à tous les outils pour réussir le concours ATSEM : QCM, annales, oral et fiches de révision.</p>
          </header>

          {/* PRICING */}
          <section className="t-section">
            <div className="t-section-head">
              <div className="t-section-title">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7a6 6 0 100 10M5 10h8M5 14h8"/></svg>
                Nos formules
              </div>
            </div>

            <div className="t-pricing-grid">
              {/* Mensuel */}
              <article className="t-card light">
                <div className="t-card-head">
                  <span className="t-eyebrow">Formule Mensuelle</span>
                </div>
                <h2 className="t-name">Mensuel</h2>
                <p className="t-tagline">Flexibilité totale pour réviser à votre rythme. Sans engagement.</p>
                <div className="t-price">
                  <span className="t-amount">9,99€</span>
                  <span className="t-period">/ mois</span>
                </div>
                <hr className="t-divider" />
                <ul className="t-feats">
                  {FEATURES.map((f, i) => <li key={i} className="t-feat">{f}</li>)}
                </ul>
                <a href="/signup" className="t-cta t-cta-light">
                  S'abonner maintenant
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
                <p className="t-foot-note">Renouvellement automatique</p>
              </article>

              {/* Pack 6 mois */}
              <article className="t-card dark">
                <div className="t-card-head">
                  <span className="t-eyebrow">Pack Concours 6 mois</span>
                  <span className="t-ribbon">Économie</span>
                </div>
                <h2 className="t-name">Pack 6 mois</h2>
                <p className="t-tagline">Accès complet au site pendant 6 mois.</p>
                <div className="t-price">
                  <span className="t-amount">49,99€</span>
                  <span className="t-period">pour 6 mois</span>
                </div>
                <hr className="t-divider" />
                <ul className="t-feats">
                  {FEATURES.map((f, i) => <li key={i} className="t-feat">{f}</li>)}
                </ul>
                <a href="/signup" className="t-cta t-cta-dark">
                  S'abonner maintenant
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
                <p className="t-foot-note">1 seul paiement · Pas de renouvellement automatique</p>
              </article>
            </div>

            {/* RÉASSURANCE */}
            <div className="t-reassure">
              <div className="t-trust">
                <div className="t-rs-item">
                  <div className="t-rs-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div className="t-rs-text">
                    <span className="t-rs-title">Paiement sécurisé</span>
                    <span className="t-rs-sub">Stripe · 3D Secure</span>
                  </div>
                </div>
                <div className="t-rs-item">
                  <div className="t-rs-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
                  </div>
                  <div className="t-rs-text">
                    <span className="t-rs-title">Activation immédiate</span>
                    <span className="t-rs-sub">Accès en 30 secondes</span>
                  </div>
                </div>
                <div className="t-rs-item">
                  <div className="t-rs-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </div>
                  <div className="t-rs-text">
                    <span className="t-rs-title">Tous moyens de paiement</span>
                    <span className="t-rs-sub">CB · Apple Pay · SEPA</span>
                  </div>
                </div>
                <div className="t-rs-item">
                  <div className="t-rs-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
                  <div className="t-rs-text">
                    <span className="t-rs-title">Essai gratuit 7 jours</span>
                    <span className="t-rs-sub">Sans carte bancaire</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
