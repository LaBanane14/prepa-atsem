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
const Check = ({className}) => <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>

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
    <div className="min-h-screen text-slate-900" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f0ff 15%, #ede9fe 30%, #f5f3ff 50%, #faf5ff 65%, #fdf4ff 80%, #fce7f3 100%)' }}>
      <style>{`html { scroll-behavior: smooth; scroll-padding-top: 7rem; }`}</style>

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

      {/* ─── HEADER TARIFS ─── */}
      <header className="pt-16 pb-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight">Préparez le concours ATSEM <span className="text-purple-800">sereinement</span></h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">Accédez à tous les outils pour réussir le concours ATSEM : QCM, annales, oral et fiches de révision.</p>
        </div>
      </header>

      {/* ─── SECTION CARTES DE PRIX ─── */}
      <section className="py-12 md:py-16 relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, #581c87 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">

            {/* Plan Mensuel */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative transition hover:shadow-md">
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Formule Mensuelle</h3>
                <p className="text-slate-500 font-bold text-sm">Flexibilité totale pour réviser à votre rythme.<br/>Sans engagement.</p>
              </div>
              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">9,99€</span>
                  <span className="text-slate-500 font-bold">/mois</span>
                </div>
                <p className="text-slate-400 text-xs font-bold mt-2 uppercase">- Renouvellement automatique</p>
              </div>
              <div className="flex-1">
                <ul className="space-y-4 mb-10">
                  {["QCM ATSEM illimités", "Annales corrigées chronométrées", "Simulation d'oral par IA", "Dashboard personnalisé", "Fiches de révision"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <Check className="w-5 h-5 text-slate-900 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="/signup" className="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white font-black rounded-2xl text-center transition shadow-lg block">S'abonner maintenant</a>
            </div>

            {/* Pack Concours 6 mois */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border-2 border-purple-800 shadow-[0_20px_50px_rgba(88,28,135,0.1)] relative flex flex-col transform md:scale-105 z-10 overflow-hidden">
              <div className="absolute -right-10 -top-10 text-purple-100 opacity-10 transform rotate-12">
                <LogoSvg className="w-48 h-48" />
              </div>
              <div className="absolute top-6 right-8">
                <div className="bg-purple-50 text-purple-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Économie</div>
              </div>
              <div className="mb-8 relative">
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Pack Concours 6 mois</h3>
                <p className="text-slate-500 font-bold text-sm">Accès complet au site pendant 6 mois.</p>
              </div>
              <div className="mb-10 relative">
                <div className="flex items-baseline gap-1 text-purple-800">
                  <span className="text-4xl font-black tracking-tight">49,99€</span>
                  <span className="text-slate-500 font-bold">pour 6 mois</span>
                </div>
                <p className="text-purple-600 text-xs font-black mt-2 uppercase tracking-wide">- 1 seul paiement<br/>- Pas de renouvellement automatique</p>
              </div>
              <div className="flex-1 relative">
                <ul className="space-y-4 mb-10">
                  {["QCM ATSEM illimités", "Annales corrigées chronométrées", "Simulation d'oral par IA", "Dashboard personnalisé", "Fiches de révision"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-900 font-bold text-sm">
                      <div className="bg-purple-100 p-1 rounded-md flex-shrink-0"><Check className="w-4 h-4 text-purple-800" /></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="/signup" className="w-full py-5 px-6 bg-purple-800 hover:bg-purple-900 text-white font-black rounded-2xl text-center transition shadow-lg shadow-purple-800/30 text-lg relative block">S'abonner maintenant</a>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION RÉASSURANCE ─── */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
          <div className="flex flex-col items-center text-center">
            <svg className="w-8 h-8 text-purple-600 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Paiement 100% sécurisé</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <svg className="w-8 h-8 text-purple-600 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Cartes bancaires</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <svg className="w-8 h-8 text-purple-600 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Activation immédiate</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <svg className="w-8 h-8 text-purple-600 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Sans engagement (Mensuel)</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-[#635BFF] rounded-lg flex items-center justify-center mb-3">
              <svg className="h-4" viewBox="0 0 60 25" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M60 12.8C60 8.55 57.95 5.18 54.04 5.18C50.11 5.18 47.72 8.55 47.72 12.77C47.72 17.73 50.53 20.33 54.52 20.33C56.47 20.33 57.95 19.87 59.08 19.22V16.08C57.95 16.66 56.65 17.01 55.01 17.01C53.4 17.01 51.97 16.43 51.79 14.5H59.96C59.96 14.29 60 13.33 60 12.8ZM51.73 11.73C51.73 9.88 52.78 9.1 54.02 9.1C55.22 9.1 56.21 9.88 56.21 11.73H51.73ZM41.3 5.18C39.67 5.18 38.6 5.95 38.01 6.48L37.81 5.41H34.38V24.84L38.19 24.03V20.1C38.8 20.53 39.69 21.14 41.28 21.14C44.54 21.14 47.5 18.55 47.5 12.72C47.48 7.41 44.48 5.18 41.3 5.18ZM40.45 17.36C39.36 17.36 38.72 16.97 38.29 16.5L38.19 9.36C38.66 8.83 39.32 8.47 40.45 8.47C42.22 8.47 43.45 10.42 43.45 12.9C43.45 15.43 42.24 17.36 40.45 17.36ZM29.1 4.13L32.93 3.32V0.12L29.1 0.92V4.13ZM29.1 5.43H32.93V20.85H29.1V5.43ZM24.76 6.62L24.52 5.43H21.15V20.85H24.96V9.75C25.87 8.55 27.4 8.78 27.87 8.95V5.43C27.38 5.24 25.67 4.9 24.76 6.62ZM17.01 1.69L13.28 2.48L13.26 16.29C13.26 18.57 14.95 20.35 17.23 20.35C18.48 20.35 19.4 20.12 19.91 19.85V16.64C19.42 16.83 17.01 17.53 17.01 15.25V8.73H19.91V5.43H17.01V1.69ZM5.26 9.36C5.26 8.7 5.8 8.43 6.67 8.43C7.94 8.43 9.54 8.83 10.81 9.55V5.93C9.42 5.37 8.05 5.16 6.67 5.16C3.49 5.16 1.38 6.86 1.38 9.55C1.38 13.76 7.08 13.1 7.08 14.89C7.08 15.68 6.42 15.95 5.49 15.95C4.1 15.95 2.33 15.39 0.92 14.58V18.25C2.49 18.93 4.08 19.22 5.49 19.22C8.75 19.22 10.98 17.57 10.98 14.84C10.96 10.29 5.26 11.09 5.26 9.36Z" fill="white"/></svg>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Partenaire de paiement</span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <LogoSvg className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-bold text-lg">Prépa ATSEM</h4>
            </div>
            <p className="max-w-xs leading-relaxed">La plateforme d'entraînement dédiée aux candidats qui préparent le concours ATSEM. Entraînez-vous dans les conditions réelles du concours.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources ATSEM</h4>
            <ul className="space-y-3">
              <li><a href="/calendrier" className="hover:text-white transition">Calendrier du concours</a></li>
              <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
              <li><a href="/tarifs" className="hover:text-white transition">Tarifs</a></li>
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
          <p>&copy; 2026 Prépa ATSEM — LP Labs SAS. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
