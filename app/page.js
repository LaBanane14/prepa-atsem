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
    { q: "Y a-t-il une période d'essai gratuite ?", a: "Oui, 7 jours d'essai gratuit dès l'inscription. Accès complet : QCM, annales corrigées et préparation à l'oral." },
    { q: "Combien de temps consacrer aux révisions ?", a: "Nous conseillons 3 à 6 mois avant le concours, 2 à 4 heures par semaine. Révisez à votre rythme, sur mobile ou ordinateur." },
    { q: "Quelles sont les dates du concours ATSEM ?", a: "Les dates varient selon les CDG. Généralement : inscriptions mai-juillet, écrits en octobre, oraux novembre-janvier. Consultez <a href='/blog'>notre blog</a> pour le calendrier par département." },
    { q: "Comment vous contacter ?", a: "Écrivez-nous à <strong>support@prepa-atsem.fr</strong>. Nous répondons sous 24h." }
  ]

  const navLinks = [
    { href: '/', label: 'Accueil', active: true },
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
    <div className="min-h-screen bg-white text-slate-900">

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-800 text-sm font-semibold mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Concours ATSEM 2026
              </div>
              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-[3.5rem] text-slate-900 leading-[1.15] mb-6">
                Préparez le concours <span className="text-purple-800">ATSEM</span> avec confiance.
              </h1>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
                La plateforme complète pour réussir l'écrit et l'oral du concours d'Agent Territorial Spécialisé des Écoles Maternelles. QCM, annales corrigées et simulations d'oral.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a href="/signup" className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-3.5 rounded-2xl font-bold text-center shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5">
                  Commencer gratuitement
                </a>
                <a href="#concours" className="bg-white border-2 border-slate-200 hover:border-purple-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold text-center transition-all">
                  Découvrir le concours
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> 7 jours gratuits</span>
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Sans engagement</span>
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
                  <a href="/qcm" className="bg-purple-800 hover:bg-purple-900 p-4 text-center transition flex items-center justify-center gap-2 cursor-pointer">
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
      <section className="py-8 bg-purple-50/50 border-y border-purple-100/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '500+', label: 'QCM', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
            { num: '10 ans', label: "d'annales", icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { num: 'IA', label: 'Oral simulé', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
            { num: '4.8/5', label: 'Satisfaction', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5 text-purple-600 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/></svg>
              <span className="text-2xl font-extrabold text-slate-900">{s.num}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FONCTIONNALITÉS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Vos outils de révision</h2>
            <p className="text-lg text-slate-500">Tout ce qu'il faut pour arriver sereine le jour du concours.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'QCM thématiques', desc: 'Entraînez-vous sur les 6 familles : hygiène, sécurité, développement de l\'enfant, cadre institutionnel, nutrition et missions ATSEM.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
              { title: 'Annales corrigées', desc: 'Vrais sujets des CDG de 2015 à 2025. Timer 45 min, correction détaillée question par question, percentile.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
              { title: 'Simulation d\'oral', desc: 'L\'IA génère des questions de jury personnalisées : mises en situation, motivations, connaissance du métier d\'ATSEM.', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
              { title: 'Fiches de révision', desc: 'Fiches mémo sur les thèmes clés du concours : sigles, protocoles, réglementation. Consultables sur mobile.', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
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
            <p className="text-slate-400 max-w-xl mx-auto">Le concours externe comprend une épreuve écrite d'admissibilité et un entretien oral d'admission.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 backdrop-blur p-8 rounded-3xl border border-slate-700 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </div>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase">Admissibilité</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Épreuve écrite — 45 min</h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>QCM de 20 questions à choix multiples</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Hygiène, sécurité, développement enfant, nutrition</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Plusieurs bonnes réponses possibles</li>
              </ul>
            </div>
            <div className="bg-slate-800/80 backdrop-blur p-8 rounded-3xl border border-slate-700 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3Z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
                </div>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase">Admission</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Épreuve orale — 15 min</h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Entretien avec jury : mises en situation</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Motivations, travail en équipe, relation enfants</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Coefficient important dans le classement final</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="py-20 bg-[#f1f0fb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-14">Comment ça marche</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-purple-200"></div>
            {[
              { step: '1', title: 'Inscrivez-vous', desc: 'Créez votre compte en 30 secondes. 7 jours d\'essai gratuit, sans carte bancaire.', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
              { step: '2', title: 'Entraînez-vous', desc: 'QCM adaptés, annales chronométrées, fiches mémo. Progressez à votre rythme.', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
              { step: '3', title: 'Réussissez !', desc: 'Arrivez le jour J préparée et sereine. Rejoignez les écoles maternelles.', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' }
            ].map((s, i) => (
              <div key={i} className="text-center relative z-10">
                <div className="w-16 h-16 bg-purple-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ÉLIGIBILITÉ ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-4">Êtes-vous éligible ?</h2>
          <p className="text-center text-slate-500 mb-10">Le concours externe est ouvert à toute personne remplissant ces conditions :</p>
          <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-8 space-y-6">
            {[
              { label: 'Être titulaire du CAP AEPE', sub: '(ou ancien CAP Petite Enfance, ou équivalent)' },
              { label: "S'inscrire auprès du CDG", sub: 'Centre de Gestion de votre département' },
              { label: 'Passer les épreuves', sub: 'Écrit (QCM 45 min) puis oral (15 min)' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-800 text-white rounded-full flex items-center justify-center shrink-0 text-sm font-bold">{i + 1}</div>
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Questions fréquentes</h2>
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

      {/* ─── CTA PRICING ─── */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.05%22%2F%3E%3C%2Fsvg%3E')] opacity-60"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Prête à décrocher le concours ?</h2>
          <p className="text-purple-200 text-lg mb-8 max-w-xl mx-auto">Commencez votre préparation dès aujourd'hui. 7 jours d'essai gratuit, accès complet à tous les outils.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="bg-white text-purple-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
              Commencer gratuitement
            </a>
            <a href="/tarifs" className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
              Voir les tarifs
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <LogoSvg className="w-5 h-5 text-purple-500" />
              <h4 className="text-white font-bold text-lg">Prépa ATSEM</h4>
            </div>
            <p className="max-w-xs leading-relaxed">La plateforme d'entraînement pour préparer le concours ATSEM. QCM, annales corrigées et simulations d'oral.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources</h4>
            <ul className="space-y-3">
              <li><a href="/blog" className="hover:text-white transition">Blog & conseils</a></li>
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
          <p>&copy; 2026 Prépa ATSEM — LP Labs SAS. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
