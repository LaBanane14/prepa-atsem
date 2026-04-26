'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getReorderedQuiz } from '../lib/quizData'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { window.location.href = '/dashboard'; return }
      setUser(null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible') })
    }, { threshold: 0.15 })
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // QCM
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [answered, setAnswered] = useState(false)
  const reorderedQuiz = getReorderedQuiz()
  const todayQuestion = reorderedQuiz[0]

  function validateAnswer() {
    if (answered) return
    if (selectedIndex === null) { alert("Sélectionnez une réponse !"); return }
    setAnswered(true)
  }

  // FAQ
  const [activeFaq, setActiveFaq] = useState(null)

  const faqData = [
    { q: "Quelles sont les conditions pour passer le concours ATSEM ?", a: "Le concours externe est ouvert aux titulaires du CAP AEPE (ex CAP Petite Enfance). Il existe aussi un concours interne (agents publics) et un 3e concours (expérience petite enfance)." },
    { q: "En quoi consiste l'épreuve écrite ?", a: "L'épreuve écrite est un QCM de 20 questions portant sur l'hygiène, la sécurité, le développement de l'enfant, la nutrition et le cadre réglementaire. Durée : 45 minutes. Attention : plusieurs réponses peuvent être correctes !" },
    { q: "Comment se déroule l'épreuve orale ?", a: "L'oral d'admission dure 15 minutes. Un entretien avec un jury qui évalue vos motivations, connaissances du métier et aptitude au travail en équipe. Des mises en situation sont fréquentes." },
    { q: "La plateforme est-elle adaptée aux débutantes ?", a: "Absolument ! Nos QCM couvrent les 6 familles thématiques du concours avec des corrections détaillées. Chaque question est accompagnée d'une explication complète." },
    { q: "Y a-t-il une période d'essai gratuite ?", a: "Oui, 7 jours d'essai gratuit dès l'inscription. Accès illimité : QCM, annales corrigées et préparation à l'oral." },
    { q: "Combien de temps consacrer aux révisions ?", a: "Nous conseillons 3 à 6 mois avant le concours, 2 à 4 heures par semaine. Révisez à votre rythme, sur mobile ou ordinateur." },
    { q: "Quelles sont les dates du concours ATSEM ?", a: "Les dates varient selon les CDG. Généralement : inscriptions mai-juillet, écrits en octobre, oraux novembre-janvier. Consultez <a href='/blog'>notre blog</a> pour le calendrier par département." },
    { q: "Comment vous contacter ?", a: "Écrivez-nous à <strong>support@prepa-atsem.fr</strong>. Nous répondons sous 24h." }
  ]

  const navLinks = [
    { href: '/', label: 'Accueil', active: true },
    { href: '/calendrier', label: 'Calendrier', active: false },
    { href: '/blog', label: 'Blog', active: false },
    { href: '/tarifs', label: 'Tarifs', active: false }
  ]

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

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(ellipse at 15% 0%, rgba(139,92,246,0.20), transparent 55%), radial-gradient(ellipse at 85% 8%, rgba(251,191,36,0.15), transparent 55%), radial-gradient(ellipse at 55% 0%, rgba(236,72,153,0.12), transparent 60%), radial-gradient(ellipse at 10% 45%, rgba(14,165,233,0.10), transparent 55%), radial-gradient(ellipse at 95% 55%, rgba(139,92,246,0.13), transparent 55%), radial-gradient(ellipse at 30% 80%, rgba(236,72,153,0.10), transparent 55%), radial-gradient(ellipse at 80% 95%, rgba(251,191,36,0.10), transparent 55%)', backgroundAttachment: 'fixed', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ─── NAVBAR ─── */}
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

      {/* ─── HERO ─── */}
      <section className="pt-12 pb-20 lg:pt-20 lg:pb-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        {/* Dessins d'enfants en arrière-plan */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.33]">
          {/* Bonhomme bâton 1 - bras levés */}
          <svg className="absolute top-16 left-[5%] w-24 h-24 text-purple-800" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="30" cy="12" r="8"/><line x1="30" y1="20" x2="30" y2="50"/><line x1="30" y1="50" x2="20" y2="70"/><line x1="30" y1="50" x2="40" y2="70"/><line x1="30" y1="30" x2="15" y2="18"/><line x1="30" y1="30" x2="45" y2="18"/></svg>
          {/* Soleil enfantin */}
          <svg className="absolute top-8 right-[8%] w-28 h-28" viewBox="0 0 80 80" fill="none" strokeWidth="2">{/* Soleil */}<g className="sun-phase" stroke="#f59e0b"><circle cx="40" cy="40" r="14"/><line x1="40" y1="10" x2="40" y2="20"/><line x1="40" y1="60" x2="40" y2="70"/><line x1="10" y1="40" x2="20" y2="40"/><line x1="60" y1="40" x2="70" y2="40"/><line x1="19" y1="19" x2="26" y2="26"/><line x1="54" y1="54" x2="61" y2="61"/><line x1="61" y1="19" x2="54" y2="26"/><line x1="19" y1="61" x2="26" y2="54"/></g>{/* Lune */}<g className="moon-phase" stroke="#a78bfa"><path d="M48 26a16 16 0 1 0 0 28a12 12 0 0 1 0-28z" strokeWidth="2"/><circle cx="55" cy="30" r="1" fill="#a78bfa"/><circle cx="60" cy="42" r="1.5" fill="#a78bfa"/><circle cx="50" cy="50" r="1" fill="#a78bfa"/></g></svg>
          {/* Maison d'enfant */}
          <svg className="absolute bottom-48 left-[3%] w-24 h-24 text-purple-700" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{/* Toit */}<path d="M5 30 L30 8 L55 30"/>{/* Murs */}<rect x="12" y="30" width="36" height="25" rx="1"/>{/* Porte */}<rect x="23" y="38" width="14" height="17" rx="1"/><circle cx="34" cy="47" r="1.5" fill="currentColor"/>{/* Fenêtre gauche */}<rect x="15" y="34" width="7" height="7" rx="1"/><line x1="18.5" y1="34" x2="18.5" y2="41"/><line x1="15" y1="37.5" x2="22" y2="37.5"/>{/* Fenêtre droite */}<rect x="40" y="34" width="7" height="7" rx="1"/><line x1="43.5" y1="34" x2="43.5" y2="41"/><line x1="40" y1="37.5" x2="47" y2="37.5"/>{/* Cheminée */}<rect x="40" y="12" width="6" height="14" rx="1"/>{/* Fumée animée */}<circle className="smoke-1" cx="43" cy="10" r="2.5" fill="currentColor" opacity="0" stroke="none"/><circle className="smoke-2" cx="45" cy="8" r="3" fill="currentColor" opacity="0" stroke="none"/><circle className="smoke-3" cx="42" cy="9" r="2" fill="currentColor" opacity="0" stroke="none"/></svg>
          {/* Fleur */}
          <svg className="absolute top-40 left-[50%] w-20 h-20 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="25" cy="18" r="6"/><circle cx="18" cy="25" r="6"/><circle cx="32" cy="25" r="6"/><circle cx="20" cy="33" r="6"/><circle cx="30" cy="33" r="6"/><circle cx="25" cy="26" r="4" fill="currentColor"/><line x1="25" y1="34" x2="25" y2="55"/><path d="M25 45 Q18 40 15 43"/><path d="M25 48 Q32 43 35 46"/></svg>
          {/* Arbre d'enfant */}
          <svg className="absolute top-[35%] right-[6%] w-24 h-28" viewBox="0 0 50 65" fill="none" strokeLinecap="round" strokeLinejoin="round">{/* Tronc */}<path d="M23 40 Q21 50 22 60 M27 40 Q29 52 27 60 M22 60 Q25 62 27 60" stroke="#8B6914" strokeWidth="2"/><path d="M24 48 Q18 46 14 48" stroke="#8B6914" strokeWidth="1.5"/>{/* Feuillage (disparaît) */}<g className="tree-leaves"><path d="M10 30 Q5 20 15 15 Q20 8 28 10 Q35 5 40 12 Q48 18 42 28 Q45 35 35 38 Q28 42 20 38 Q12 36 10 30Z" stroke="#22c55e" strokeWidth="2" fill="none"/><path d="M15 28 Q12 20 20 16" stroke="#22c55e" strokeWidth="1.5"/><path d="M30 28 Q35 22 32 15" stroke="#22c55e" strokeWidth="1.5"/><path d="M22 22 Q25 18 28 22" stroke="#22c55e" strokeWidth="1.5"/></g>{/* Branches nues (apparaissent) */}<g className="tree-branches"><path d="M25 40 L20 28 L14 18" stroke="#8B6914" strokeWidth="1.5"/><path d="M25 40 L30 25 L38 15" stroke="#8B6914" strokeWidth="1.5"/><path d="M20 28 L15 25" stroke="#8B6914" strokeWidth="1.2"/><path d="M30 25 L35 22" stroke="#8B6914" strokeWidth="1.2"/><path d="M25 35 L18 30" stroke="#8B6914" strokeWidth="1.2"/><path d="M25 32 L33 28" stroke="#8B6914" strokeWidth="1.2"/></g>{/* Feuilles qui tombent */}<circle className="falling-leaf-1" cx="15" cy="35" r="2" fill="#22c55e" opacity="0"/><circle className="falling-leaf-2" cx="30" cy="33" r="1.5" fill="#f59e0b" opacity="0"/><circle className="falling-leaf-3" cx="22" cy="36" r="1.8" fill="#ef4444" opacity="0"/></svg>
          {/* Bonhomme bâton 2 - petite fille */}
          <svg className="absolute bottom-24 right-[10%] w-20 h-20 text-purple-800" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="25" cy="10" r="7"/><line x1="25" y1="17" x2="25" y2="40"/><line x1="25" y1="40" x2="17" y2="55"/><line x1="25" y1="40" x2="33" y2="55"/><line x1="25" y1="25" x2="13" y2="33"/><line x1="25" y1="25" x2="37" y2="33"/><path d="M18 10 Q15 3 18 0" strokeWidth="1.5"/><path d="M32 10 Q35 3 32 0" strokeWidth="1.5"/></svg>
          {/* Étoile dessinée à la main */}
          <svg className="absolute top-[55%] left-[80%] w-16 h-16 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon className="star-fill" points="20,3 25,14 37,16 28,24 30,36 20,30 10,36 12,24 3,16 15,14"/></svg>
          {/* Nuage */}
          <svg className="absolute top-4 left-[35%] w-20 h-16 text-purple-600" viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 35 Q5 35 5 25 Q5 15 15 15 Q15 5 28 5 Q40 5 42 15 Q50 13 52 22 Q55 32 45 35 Z"/><line className="rain-1" x1="15" y1="36" x2="13" y2="44" strokeWidth="1.5" strokeLinecap="round"/><line className="rain-2" x1="25" y1="36" x2="23" y2="44" strokeWidth="1.5" strokeLinecap="round"/><line className="rain-3" x1="35" y1="36" x2="33" y2="44" strokeWidth="1.5" strokeLinecap="round"/><line className="rain-4" x1="20" y1="36" x2="18" y2="44" strokeWidth="1.5" strokeLinecap="round"/><line className="rain-5" x1="40" y1="36" x2="38" y2="44" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {/* Papillon */}
          <svg className="absolute bottom-8 left-[55%] w-16 h-16 text-pink-500" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="15" cy="18" rx="10" ry="14" transform="rotate(-20 15 18)"/><ellipse cx="33" cy="18" rx="10" ry="14" transform="rotate(20 33 18)"/><line x1="24" y1="8" x2="24" y2="38"/><path d="M24 8 Q20 2 18 0"/><path d="M24 8 Q28 2 30 0"/></svg>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-800 text-sm font-semibold mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Concours ATSEM 2026
              </div>
              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-[3.5rem] text-slate-900 leading-[1.15] mb-6 font-bold">
                Préparer le concours <span className="text-purple-800">ATSEM 2026</span> en ligne.
              </h1>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
                La plateforme de référence pour préparer le concours ATSEM (Agent Territorial Spécialisé des Écoles Maternelles) : QCM illimités, annales corrigées des CDG (2015-2025) et simulations d'oral par IA.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a href="/signup" className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-3.5 rounded-2xl font-bold text-center shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5">
                  Commencer l'entraînement
                </a>
                <a href="#concours" className="bg-white border-2 border-slate-200 hover:border-purple-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold text-center transition-all">
                  Découvrir le concours
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> 7 jours gratuits</span>
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Sans engagement</span>
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Accès illimité</span>
              </div>
            </div>

            {/* QCM interactif */}
            <div className="relative lg:ml-auto w-full max-w-md mx-auto animate-fade-in-up-delay">
              <div className="absolute -inset-6 bg-purple-100/30 rounded-[3rem] -z-10 blur-xl"></div>
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-sm">Question du jour</span>
                  <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg text-xs font-bold">{todayQuestion.category}</span>
                </div>
                <div className="p-6">
                  <p className="font-bold text-slate-900 text-lg mb-6 leading-snug">{todayQuestion.question}</p>
                  <div className="space-y-3">
                    {todayQuestion.options.map((opt, index) => {
                      let cls = 'p-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer '
                      if (answered) {
                        if (index === todayQuestion.correct) cls += 'border-emerald-500 bg-emerald-50'
                        else if (selectedIndex === index) cls += 'border-red-400 bg-red-50'
                        else cls += 'border-slate-100 opacity-40'
                      } else {
                        cls += selectedIndex === index ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-200'
                      }
                      return (
                        <div key={index} className={cls} onClick={() => { if (!answered) setSelectedIndex(index) }}>
                          <span className={`font-semibold text-sm ${answered ? (index === todayQuestion.correct ? 'text-emerald-700' : selectedIndex === index ? 'text-red-600 line-through' : 'text-slate-400') : selectedIndex === index ? 'text-purple-800' : 'text-slate-700'}`}>{opt}</span>
                          {!answered && (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedIndex === index ? 'border-purple-500' : 'border-slate-300'}`}>
                              {selectedIndex === index && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>}
                            </div>
                          )}
                          {answered && index === todayQuestion.correct && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                {answered ? (
                  <a href={`/qcm?start=1&a=${selectedIndex}`} className="bg-purple-800 hover:bg-purple-900 p-4 text-center transition flex items-center justify-center gap-2 cursor-pointer">
                    <span className="text-white font-bold text-sm">Lancer l'entraînement complet</span>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </a>
                ) : (
                  <div onClick={validateAnswer} className="bg-purple-800 hover:bg-purple-900 cursor-pointer p-4 text-center transition flex items-center justify-center gap-2">
                    <span className="text-white font-bold text-sm">Valider ma réponse</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-10 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {[
            { num: 'Illimités', label: 'QCM générés par IA', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
            { num: '6', label: 'Familles thématiques', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { num: 'x2', label: "L'oral compte double", icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
            { num: '3%', label: "Taux d'admission", icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { num: '600', label: 'Candidats inscrits', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M20 8v6M23 11h-6M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5 text-purple-400 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/></svg>
              <span className="text-2xl font-extrabold text-white">{s.num}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FONCTIONNALITÉS ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.33]">
          {/* Chat */}
          <svg className="absolute top-8 left-[4%] w-18 h-18 text-purple-700" viewBox="0 0 45 45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 15 L5 5 L12 11"/><path d="M32 15 L35 5 L28 11"/><circle cx="20" cy="22" r="12"/><circle cx="16" cy="20" r="1.5" fill="currentColor"/><circle cx="24" cy="20" r="1.5" fill="currentColor"/><path d="M20 24 L18 26 L22 26z" fill="currentColor" stroke="none"/><path d="M20 26 L20 28"/><path d="M13 24 L5 22"/><path d="M13 26 L6 27"/><path d="M27 24 L35 22"/><path d="M27 26 L34 27"/><path d="M20 34 Q20 40 25 42" strokeWidth="2"/></svg>

          {/* ABC */}
          <svg className="absolute bottom-8 left-[5%] w-24 h-12 text-purple-800" fill="currentColor" style={{ fontFamily: 'Comic Sans MS, cursive' }}><text x="0" y="30" fontSize="28" fontWeight="bold">ABC</text></svg>
          {/* Étoile */}
          <svg className="absolute top-[30%] right-[3%] w-14 h-14 text-amber-400 rotate-[10deg]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon className="star-fill" points="20,3 25,14 37,16 28,24 30,36 20,30 10,36 12,24 3,16 15,14"/></svg>
          {/* Bonhomme qui court */}
          <svg className="absolute bottom-16 right-[3%] w-16 h-20 text-purple-700" viewBox="0 0 40 55" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="20" cy="6" r="5"/><path d="M20 11 L20 30"/><path d="M20 18 L10 25"/><path d="M20 18 L30 22"/><path d="M20 30 L12 45"/><path d="M20 30 L28 42"/></svg>
          {/* Livre ouvert */}
          <svg className="absolute top-[55%] left-[3%] w-18 h-14 text-purple-600" viewBox="0 0 50 35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M25 8 Q15 5 5 8 L5 30 Q15 27 25 30"/><path d="M25 8 Q35 5 45 8 L45 30 Q35 27 25 30"/><line x1="25" y1="8" x2="25" y2="30"/><line x1="10" y1="14" x2="20" y2="13"/><line x1="10" y1="19" x2="20" y2="18"/><line x1="30" y1="13" x2="40" y2="14"/><line x1="30" y1="18" x2="40" y2="19"/></svg>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Vos outils de révision</h2>
            <p className="text-lg text-slate-500">Tout ce qu'il faut pour arriver serein le jour du concours.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'QCM dynamiques par IA', desc: 'Entraînez-vous sur les 6 familles thématiques avec des QCM à réponses multiples — comme au vrai concours. Corrections détaillées à chaque question.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
              { title: 'Annales chronométrées', desc: 'Vrais sujets des CDG (2015-2025). Timer 45 min, correction détaillée, classement percentile. Conditions réelles du concours.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Simulation d\'oral par IA', desc: 'L\'oral compte double ! Notre IA simule un jury : mises en situation, motivations, relation ATSEM/enseignant. Préparez l\'épreuve que tout le monde néglige.', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
              { title: 'Fiches mémo', desc: 'PAI, HACCP, bionettoyage, symboles de danger, sigles... Toutes les fiches essentielles du concours, consultables partout.', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2zM11 3v5a2 2 0 002 2h5M9 17h6M9 13h6' }
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex gap-5">
                <div className="w-12 h-12 bg-purple-100 text-purple-800 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LE CONCOURS ─── */}
      <section id="concours" className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 fade-in-up">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm font-semibold mb-4 border border-slate-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/></svg>
              Le concours en détail
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Déroulement du concours ATSEM</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Le concours externe comprend 2 épreuves : une épreuve écrite d'admissibilité et un entretien oral d'admission.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 backdrop-blur p-8 rounded-3xl border border-slate-700 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </div>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase">Étape 1 — Admissibilité</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Épreuve écrite — 45 min <span className="text-purple-300 text-sm font-semibold">(coeff. 1)</span></h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>QCM de 20 questions sur les 6 familles thématiques</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span><strong className="text-white">Réponses multiples</strong> : il faut cocher TOUTES les bonnes réponses sans aucune erreur</span></li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Le jury fixe un <strong className="text-white">seuil d'admissibilité</strong> (ex : 13/20). Au-dessus = convoqué à l'oral</span></li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>En dessous du seuil, <strong className="text-white">c'est terminé</strong></span></li>
              </ul>
            </div>
            <div className="bg-slate-800/80 backdrop-blur p-8 rounded-3xl border border-slate-700 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3Z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
                </div>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase">Étape 2 — Admission</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Épreuve orale — 15 min <span className="text-blue-300 text-sm font-semibold">(coeff. 2 — compte DOUBLE)</span></h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Jury de 3 personnes : parcours, motivations et mises en situation</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span><strong className="text-white">Note finale</strong> = note écrit + (note oral × 2). L'oral fait la différence !</span></li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Classement par total : seuls les meilleurs sont lauréats</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span><strong className="text-white">Note éliminatoire</strong> : en dessous de 7/20</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ÉLIGIBILITÉ ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-4">3 voies d'accès au concours</h2>
          <p className="text-center text-slate-500 mb-10">Choisissez la voie qui correspond à votre profil :</p>
          <div className="space-y-4">
            {[
              { voie: 'Externe', pct: '30% des postes', condition: 'Titulaire du CAP AEPE (Petite Enfance)', color: 'purple' },
              { voie: 'Interne', pct: '60% des postes', condition: 'Agent public + 2 ans de service auprès d\'enfants', color: 'blue' },
              { voie: '3ème concours', pct: '10% des postes', condition: '4 ans d\'expérience pro (privé, associatif)', color: 'emerald' }
            ].map((item, i) => (
              <div key={i} className={`bg-white/70 backdrop-blur border border-${item.color}-200/50 rounded-2xl p-6 flex items-center gap-5`}>
                <div className={`w-12 h-12 bg-${item.color}-100 text-${item.color}-800 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg`}>{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900">Concours {item.voie}</h3>
                    <span className={`text-xs font-bold bg-${item.color}-100 text-${item.color}-800 px-2 py-0.5 rounded-full`}>{item.pct}</span>
                  </div>
                  <p className="text-sm text-slate-500">{item.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className={`bg-white border rounded-2xl transition-all ${activeFaq === index ? 'border-purple-200 shadow-sm' : 'border-slate-200'}`}>
                <button className="w-full px-6 py-5 text-left flex justify-between items-center" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                  <span className="font-bold text-slate-900 pr-4 text-sm">{faq.q}</span>
                  <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: activeFaq === index ? '300px' : '0', opacity: activeFaq === index ? 1 : 0 }}>
                  <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed [&_a]:text-purple-800 [&_a]:font-bold [&_a]:underline" dangerouslySetInnerHTML={{ __html: faq.a }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Schema ─── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({ "@type": "Question", "name": faq.q, "acceptedAnswer": { "@type": "Answer", "text": faq.a } }))
      })}} />


      {/* ─── FOOTER ─── */}
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
              <li><a href="/cgu" className="hover:text-white transition">CGV & CGU</a></li>
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
