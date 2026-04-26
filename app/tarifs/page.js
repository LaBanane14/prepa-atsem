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
  'Examen blanc généré par IA',
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
        .t-hero { margin-bottom: 56px; max-width: 1080px; }
        .t-hero h1 { font-size: 52px; font-weight: 900; line-height: 1.02; margin: 0 0 20px; letter-spacing: -0.03em; color: #1a1325; white-space: nowrap; }
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
        .t-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
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
        .t-foot-note.t-foot-above { margin-top: -16px; margin-bottom: 18px; }

        /* REASSURE — pay strip (sobre & pro) */
        .t-reassure { margin-top: 32px; }
        .t-pay {
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
          padding: 22px 32px;
          background: white; border: 1px solid #ece9f0; border-radius: 20px;
          flex-wrap: wrap;
        }
        .t-pay-secure {
          display: flex; align-items: center; gap: 14px;
          padding-right: 24px; border-right: 1px solid #f3effc;
        }
        .t-pay-secure .t-pay-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white; display: grid; place-items: center;
          box-shadow: 0 8px 20px -8px rgba(16, 185, 129, 0.6);
        }
        .t-pay-secure svg { width: 22px; height: 22px; }
        .t-pay-secure-text { display: flex; flex-direction: column; }
        .t-pay-secure b { font-size: 14px; font-weight: 900; color: #1a1325; }
        .t-pay-secure span { font-size: 12px; color: #6b5b8e; font-weight: 600; }
        .t-pay-logos { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1; justify-content: center; }
        .t-pay-logo {
          height: 32px; padding: 0 12px;
          border: 1px solid #ece9f0; border-radius: 8px; background: white;
          display: flex; align-items: center; justify-content: center;
        }
        .t-pay-logo svg { display: block; height: 18px; width: auto; }
        .t-pay-stripe {
          padding-left: 24px; border-left: 1px solid #f3effc;
          font-size: 12px; font-weight: 700; color: #6b5b8e;
          display: flex; align-items: center; gap: 8px;
        }
        .t-pay-stripe svg { height: 18px; width: auto; }
        @media (max-width: 980px) {
          .t-pay { flex-direction: column; align-items: stretch; gap: 18px; padding: 20px 22px; }
          .t-pay-secure { padding-right: 0; padding-bottom: 16px; border-right: none; border-bottom: 1px solid #f3effc; }
          .t-pay-stripe { padding-left: 0; padding-top: 16px; border-left: none; border-top: 1px solid #f3effc; text-align: center; }
        }

        @media (max-width: 1100px) {
          .t-wrap { padding: 40px 0 60px; }
          .t-inner { padding: 0 32px; }
        }
        @media (max-width: 720px) {
          .t-wrap { padding: 28px 0 56px; }
          .t-inner { padding: 0 18px; }
          .t-hero h1 { font-size: 32px; white-space: normal; }
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
            <h1>Préparez le concours <em>ATSEM</em> sereinement</h1>
            <p>Accédez à tous les outils pour réussir le concours ATSEM : <b>QCM</b>, <b>annales</b>, <b>oral</b>.</p>
          </header>

          {/* PRICING */}
          <section className="t-section">
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
                  <li className="t-feat">Renouvellement automatique</li>
                </ul>
                <a href="/signup" className="t-cta t-cta-light">
                  S'abonner maintenant
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
              </article>

              {/* Pack 6 mois */}
              <article className="t-card light">
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
                  <li className="t-feat">1 seul paiement · Pas de renouvellement automatique</li>
                </ul>
                <a href="/signup" className="t-cta t-cta-dark">
                  S'abonner maintenant
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
              </article>
            </div>

            {/* RÉASSURANCE — bandeau paiement sobre */}
            <div className="t-reassure">
              <div className="t-pay">
                <div className="t-pay-secure">
                  <div className="t-pay-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div className="t-pay-secure-text">
                    <b>Paiement 100% sécurisé</b>
                    <span>Cryptage SSL · 3D Secure</span>
                  </div>
                </div>
                <div className="t-pay-logos">
                  {/* VISA */}
                  <div className="t-pay-logo" aria-label="Visa">
                    <svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
                      <text x="0" y="16" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="-0.5">VISA</text>
                    </svg>
                  </div>
                  {/* Mastercard */}
                  <div className="t-pay-logo" aria-label="Mastercard">
                    <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="12" r="9" fill="#EB001B"/>
                      <circle cx="26" cy="12" r="9" fill="#F79E1B" fillOpacity="0.85"/>
                    </svg>
                  </div>
                  {/* American Express */}
                  <div className="t-pay-logo" aria-label="American Express" style={{padding: 0, border: 'none'}}>
                    <svg viewBox="0 0 60 22" xmlns="http://www.w3.org/2000/svg" style={{height: 22}}>
                      <rect width="60" height="22" rx="3" fill="#006FCF"/>
                      <text x="30" y="15" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="10" fontWeight="900" fill="white" letterSpacing="0.5">AMEX</text>
                    </svg>
                  </div>
                  {/* Apple Pay */}
                  <div className="t-pay-logo" aria-label="Apple Pay">
                    <svg viewBox="0 0 56 22" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 5.4c0.5-0.6 0.8-1.4 0.7-2.2-0.7 0-1.5 0.4-2 1-0.4 0.5-0.8 1.4-0.7 2.1 0.8 0.1 1.5-0.4 2-0.9zm1 1.6c-1.1 0-2 0.6-2.5 0.6-0.5 0-1.3-0.6-2.2-0.6-1.1 0-2.2 0.7-2.7 1.7-1.2 2-0.3 5 0.8 6.6 0.6 0.8 1.2 1.7 2.1 1.7 0.9 0 1.2-0.5 2.2-0.5 1 0 1.3 0.5 2.2 0.5 0.9 0 1.5-0.8 2.1-1.7 0.7-1 0.9-2 1-2-0.1-0.1-2-0.7-2-2.9 0-1.8 1.5-2.7 1.6-2.7-0.9-1.3-2.2-1.3-2.6-1.3z" fill="#1A1325"/>
                      <text x="16" y="15" fontFamily="-apple-system, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1A1325">Pay</text>
                    </svg>
                  </div>
                  {/* SEPA */}
                  <div className="t-pay-logo" aria-label="SEPA">
                    <svg viewBox="0 0 56 20" xmlns="http://www.w3.org/2000/svg">
                      <text x="0" y="16" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="900" fill="#003399" letterSpacing="0.3">SEPA</text>
                    </svg>
                  </div>
                </div>
                <div className="t-pay-stripe">
                  Sécurisé par
                  <svg viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
                    <path fillRule="evenodd" clipRule="evenodd" d="M60 12.8C60 8.55 57.95 5.18 54.04 5.18C50.11 5.18 47.72 8.55 47.72 12.77C47.72 17.73 50.53 20.33 54.52 20.33C56.47 20.33 57.95 19.87 59.08 19.22V16.08C57.95 16.66 56.65 17.01 55.01 17.01C53.4 17.01 51.97 16.43 51.79 14.5H59.96C59.96 14.29 60 13.33 60 12.8ZM51.73 11.73C51.73 9.88 52.78 9.1 54.02 9.1C55.22 9.1 56.21 9.88 56.21 11.73H51.73ZM41.3 5.18C39.67 5.18 38.6 5.95 38.01 6.48L37.81 5.41H34.38V24.84L38.19 24.03V20.1C38.8 20.53 39.69 21.14 41.28 21.14C44.54 21.14 47.5 18.55 47.5 12.72C47.48 7.41 44.48 5.18 41.3 5.18ZM40.45 17.36C39.36 17.36 38.72 16.97 38.29 16.5L38.19 9.36C38.66 8.83 39.32 8.47 40.45 8.47C42.22 8.47 43.45 10.42 43.45 12.9C43.45 15.43 42.24 17.36 40.45 17.36ZM29.1 4.13L32.93 3.32V0.12L29.1 0.92V4.13ZM29.1 5.43H32.93V20.85H29.1V5.43ZM24.76 6.62L24.52 5.43H21.15V20.85H24.96V9.75C25.87 8.55 27.4 8.78 27.87 8.95V5.43C27.38 5.24 25.67 4.9 24.76 6.62ZM17.01 1.69L13.28 2.48L13.26 16.29C13.26 18.57 14.95 20.35 17.23 20.35C18.48 20.35 19.4 20.12 19.91 19.85V16.64C19.42 16.83 17.01 17.53 17.01 15.25V8.73H19.91V5.43H17.01V1.69ZM5.26 9.36C5.26 8.7 5.8 8.43 6.67 8.43C7.94 8.43 9.54 8.83 10.81 9.55V5.93C9.42 5.37 8.05 5.16 6.67 5.16C3.49 5.16 1.38 6.86 1.38 9.55C1.38 13.76 7.08 13.1 7.08 14.89C7.08 15.68 6.42 15.95 5.49 15.95C4.1 15.95 2.33 15.39 0.92 14.58V18.25C2.49 18.93 4.08 19.22 5.49 19.22C8.75 19.22 10.98 17.57 10.98 14.84C10.96 10.29 5.26 11.09 5.26 9.36Z" fill="#635BFF"/>
                  </svg>
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
