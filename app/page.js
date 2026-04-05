'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getReorderedQuiz } from '../lib/quizData'

export default function HomePage() {
  // Auth state
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
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

  // Fade-in au scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''

  // QCM state
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [answered, setAnswered] = useState(false)

  const reorderedQuiz = getReorderedQuiz()
  const todayQuestion = reorderedQuiz[0]
  const options = todayQuestion.options
  const correctIndex = todayQuestion.correct

  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null)
  const faqRefs = useRef([])

  function toggleFaq(index) {
    setActiveFaq(activeFaq === index ? null : index)
  }

  function validateAnswer() {
    if (answered) return
    if (selectedIndex === null) { alert("Veuillez sélectionner une réponse !"); return }
    setAnswered(true)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const faqData = [
    { q: "Quelles sont les conditions pour passer le concours ATSEM ?", a: "Le concours externe d'ATSEM est ouvert aux titulaires du CAP Accompagnant Éducatif Petite Enfance (CAP AEPE, ex CAP Petite Enfance). Il existe aussi un concours interne pour les agents publics et un 3e concours pour les personnes ayant une expérience dans le domaine de la petite enfance." },
    { q: "En quoi consiste l'épreuve écrite du concours ATSEM ?", a: "L'épreuve écrite d'admissibilité est un QCM de 20 questions portant sur l'hygiène, la sécurité, le développement de l'enfant, la nutrition, le cadre réglementaire et les missions de l'ATSEM. La durée est de 45 minutes. Attention : plusieurs réponses peuvent être correctes pour une même question !" },
    { q: "Comment se déroule l'épreuve orale ?", a: "L'épreuve orale d'admission dure 15 minutes. Elle consiste en un entretien avec un jury qui évalue vos motivations, vos connaissances du métier d'ATSEM et votre aptitude à travailler en équipe avec les enseignants. Des mises en situation professionnelle sont fréquentes." },
    { q: "La plateforme est-elle adaptée aux débutantes ?", a: "Absolument ! Nos QCM couvrent les 6 familles thématiques du concours avec des corrections détaillées. Que vous soyez en reconversion ou que vous prépariez le concours pour la première fois, chaque question est accompagnée d'une explication complète." },
    { q: "Y a-t-il une période d'essai gratuite ?", a: "Oui, vous bénéficiez de 7 jours d'essai gratuit dès votre inscription. Pendant cette période, vous avez accès à toutes les fonctionnalités : QCM thématiques, annales corrigées et préparation à l'oral." },
    { q: "Combien de temps dois-je consacrer aux révisions ?", a: "Nous conseillons de démarrer vos révisions 3 à 6 mois avant le concours, à raison de 2 à 4 heures par semaine. Notre plateforme vous permet de réviser à votre rythme, sur mobile, tablette ou ordinateur." },
    { q: "Quelles sont les dates du concours ATSEM ?", a: "Les dates varient selon les Centres de Gestion (CDG). Généralement, les inscriptions ouvrent entre mai et juillet, les épreuves écrites ont lieu en octobre, et les oraux entre novembre et janvier. Consultez <a href='/blog'>notre blog</a> pour le calendrier à jour par département." },
    { q: "J'ai un problème, comment vous contacter ?", a: "Vous pouvez nous écrire à <strong>support@prepa-atsem.fr</strong>. Nous vous répondrons dans les plus brefs délais." }
  ]

  const navLinks = [
    { href: '/', label: 'Accueil', active: true },
    { href: '/blog', label: 'Blog', active: false },
    { href: '/tarifs', label: 'Tarifs', active: false }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-violet-200">
      <style>{`
        html { scroll-behavior: smooth; scroll-padding-top: 2rem; }
        .spin-border { position: relative; }
        .spin-border::before { content: ''; position: absolute; inset: -3px; border-radius: 9999px; border: 3px solid transparent; border-top-color: #7c3aed; animation: spin-smooth 1.5s linear infinite; }
        @keyframes spin-smooth { to { transform: rotate(360deg); } }
        .faq-content { transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out; overflow: hidden; }
        ::selection { background: rgba(124, 58, 237, 0.2); color: inherit; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
        .fade-in-up.visible { opacity: 1; transform: translateY(0); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .qcm-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="bg-violet-600 text-white p-2 rounded-xl shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><circle cx="12" cy="4" r="2.5"/><path d="M12 6.5v3"/><path d="M8 19c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M9.5 12.5l-2 3.5"/><path d="M14.5 12.5l2 3.5"/><polygon points="19,2 19.9,4.8 22.8,4.8 20.5,6.5 21.3,9.3 19,7.6 16.7,9.3 17.5,6.5 15.2,4.8 18.1,4.8" fill="currentColor" stroke="none"/></svg>
            </div>
            <div>
              <span className="font-black text-lg sm:text-2xl tracking-tight text-slate-900 block leading-none">Prépa <span className="text-violet-600">ATSEM</span></span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 tracking-widest uppercase">Concours ATSEM 2026</span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className={link.active ? 'text-violet-600' : 'hover:text-violet-600 transition'}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
           {!authLoading && (user ? (
              <>
                <a href="/dashboard" className="hidden md:inline-flex bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-slate-200 transition transform hover:-translate-y-0.5 text-sm">Mon tableau de bord</a>
              </>
            ) : (
              <>
                <a href="/login" className="hidden md:block text-slate-600 font-semibold hover:text-slate-900 transition">Connexion</a>
                <a href="/signup" className="hidden md:inline-flex bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-slate-200 transition transform hover:-translate-y-0.5">Inscription</a>
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
                <a key={link.label} href={link.href} className={`block py-3 px-4 rounded-xl font-bold transition ${link.active ? 'text-violet-600 bg-violet-50' : 'text-slate-700 hover:bg-slate-50'}`}>{link.label}</a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Mon espace</a>
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

      {/* HERO SECTION */}
      <section className="relative pt-8 pb-20 lg:pt-12 lg:pb-24 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-sm font-bold mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Concours ATSEM 2026
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
                Réussissez le concours <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">ATSEM</span> sans stress.
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 font-medium leading-relaxed">
                La première plateforme de révision conçue pour préparer le concours d'Agent Territorial Spécialisé des Écoles Maternelles. QCM, annales corrigées et <strong className="text-slate-800">simulations d'oral</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a href="/qcm" className="flex-1 bg-slate-900 hover:bg-black text-white px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2 group">
                  Commencer l'entraînement
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="#composition-examen" className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2">
                  Découvrir la composition de l'examen
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                <div className="flex -space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-violet-500 flex items-center justify-center text-[10px] sm:text-xs text-white font-bold z-40">M</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-slate-700 flex items-center justify-center text-[10px] sm:text-xs text-white font-bold z-30">S</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-violet-400 flex items-center justify-center text-[10px] sm:text-xs text-white font-bold z-20">L</div>
               </div>
                <p>Rejoignez <span className="text-slate-800 font-bold">nos candidates</span> au concours ATSEM</p>
              </div>
            </div>

            {/* QCM Interactif */}
            <div className="relative lg:ml-auto w-full max-w-md mx-auto mt-8 lg:mt-0 qcm-float">
              <div className="absolute -inset-4 bg-gradient-to-tr from-violet-100 to-violet-50 rounded-[3rem] transform rotate-1 scale-105 -z-10"></div>
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-sm">Question du jour</span>
                  <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs font-bold">{todayQuestion.category}</span>
                </div>
                <div className="p-6">
                  <p className="font-bold text-slate-900 text-lg mb-6 leading-snug">{todayQuestion.question}</p>
                  <div className="space-y-3">
                    {options.map((opt, index) => {
                      let classes = 'p-4 rounded-xl border-2 transition flex items-center justify-between group '
                      if (answered) {
                        if (index === correctIndex) classes += 'border-green-500 bg-green-50'
                        else if (selectedIndex === index) classes += 'border-violet-500 bg-violet-50'
                        else classes += 'border-slate-100 opacity-50'
                      } else {
                        classes += 'cursor-pointer '
                        classes += selectedIndex === index ? 'border-violet-500 bg-violet-50' : 'border-slate-100 hover:border-violet-300'
                      }
                      return (
                        <div key={index} className={classes} onClick={() => { if (!answered) setSelectedIndex(index) }}>
                          <span className={`font-bold ${answered ? (index === correctIndex ? 'text-green-700' : (selectedIndex === index ? 'text-violet-700 line-through' : 'text-slate-400')) : (selectedIndex === index ? 'text-violet-700' : 'text-slate-700')}`}>{opt}</span>
                          {answered && index === correctIndex && (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                          )}
                          {answered && selectedIndex === index && index !== correctIndex && (
                            <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div>
                          )}
                          {!answered && (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedIndex === index ? 'border-violet-500' : 'border-slate-300 group-hover:border-violet-300'}`}>
                              {selectedIndex === index && <div className="w-2.5 h-2.5 bg-violet-500 rounded-full"></div>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                {answered && (
                  <div className={`${selectedIndex === correctIndex ? 'bg-green-600' : 'bg-violet-600'} px-4 py-3 flex items-center justify-center gap-2`}>
                    {selectedIndex === correctIndex ? (
                      <><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span className="text-white font-bold text-sm">Bonne réponse ! {todayQuestion.explanation.replace(/<[^>]*>/g, '').split('\n')[0].substring(0, 80)}</span></>
                    ) : (
                      <><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg><span className="text-white font-bold text-sm">Raté ! La réponse était {todayQuestion.options[todayQuestion.correct]}</span></>
                    )}
                  </div>
                )}
                {answered ? (
                  <a href={`/qcm?start=1&a=${selectedIndex}`} className="bg-slate-900 hover:bg-black p-4 text-center transition flex items-center justify-center gap-2 group cursor-pointer">
                    <span className="text-white font-bold text-sm">Lancer l'entraînement complet</span>
                    <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </a>
                ) : (
                  <div onClick={validateAnswer} className="bg-slate-900 hover:bg-black cursor-pointer p-4 text-center transition flex items-center justify-center gap-2 group">
                    <span className="text-white font-bold text-sm">Valider ma réponse</span>
                    <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION ÉLIGIBILITÉ */}
      <section className="py-24 bg-[#eceef1] border-b border-slate-200 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 fade-in-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Êtes-vous éligible au concours ATSEM ?</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Le concours externe d'ATSEM est ouvert aux titulaires du CAP AEPE (ou ancien CAP Petite Enfance).<br/>Voici les conditions requises :</p>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 max-w-5xl mx-auto relative z-10">
            <div className="w-full lg:w-1/3 bg-violet-500 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] overflow-hidden relative border border-violet-400 z-10 hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-violet-300"></div>
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-white text-violet-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Avoir le CAP AEPE</h3>
                <p className="text-violet-100 font-medium leading-relaxed">CAP Petite Enfance<br/>ou équivalent</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-2 lg:py-0">
              <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-violet-500 spin-border">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14"/></svg>
              </div>
            </div>
            <div className="w-full lg:w-1/3 bg-violet-500 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] overflow-hidden relative border border-violet-400 z-10 hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-violet-300"></div>
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-white text-violet-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg></div>
                <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">S'inscrire au CDG</h3>
                <p className="text-violet-100 font-medium leading-relaxed">Inscription auprès du<br/><strong className="text-white">Centre de Gestion</strong> de votre département</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-2 lg:py-0">
              <div className="text-slate-900 hidden lg:block drop-shadow-sm animate-pulse"><svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></div>
              <div className="text-slate-900 block lg:hidden drop-shadow-sm animate-pulse"><svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7-7 7-7-7"/></svg></div>
            </div>
            <div className="w-full lg:w-1/3 relative group">
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-20 h-20 sm:w-32 sm:h-32 bg-slate-400/50 rounded-full z-0 transition-transform duration-500 group-hover:scale-110"></div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 bg-slate-500/40 rounded-full z-0 transition-transform duration-500 group-hover:scale-110"></div>
              <div className="bg-[#0f172a] rounded-3xl p-8 shadow-2xl relative z-10 border border-slate-800 flex flex-col items-center justify-center h-full min-h-[220px]">
                <div className="w-14 h-14 bg-slate-800 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div>
                <div className="bg-violet-950/40 border border-violet-900/40 text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Vous êtes éligible !</div>
                <h3 className="text-5xl font-black text-white mb-2 tracking-tight">ATSEM</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION COMPOSITION DE L'EXAMEN */}
      <section id="composition-examen" className="py-20 bg-slate-900 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-violet-500/10 rounded-full mix-blend-screen blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-blue-500/10 rounded-full mix-blend-screen blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 fade-in-up">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm font-bold mb-6 border border-slate-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> Composition de l'épreuve
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Déroulement du concours ATSEM</h2>
            <p className="text-lg text-slate-400 font-medium">Le concours externe comprend une épreuve écrite d'admissibilité et un entretien oral d'admission.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 relative overflow-hidden text-white hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-slate-900/50">
              <div className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">Admissibilité</div>
              <div className="w-14 h-14 bg-violet-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></div>
              <h3 className="text-2xl font-black text-white mb-6">Épreuve écrite — 45 min</h3>
              <div className="space-y-4 text-slate-300 font-medium">
                <div className="flex items-start gap-3"><div className="bg-violet-500/30 p-1.5 rounded-lg mt-0.5 shrink-0"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div><p><strong className="text-white">QCM de 20 questions</strong> : hygiène, sécurité, développement de l'enfant, cadre institutionnel, nutrition</p></div>
                <div className="flex items-start gap-3"><div className="bg-violet-500/30 p-1.5 rounded-lg mt-0.5 shrink-0"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div><p><strong className="text-white">Choix multiples</strong> : plusieurs bonnes réponses possibles par question — soyez attentif !</p></div>
                <div className="flex items-start gap-3"><div className="bg-violet-500/30 p-1.5 rounded-lg mt-0.5 shrink-0"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><p><strong className="text-white">Seuls les meilleurs scores</strong> sont convoqués à l'oral d'admission</p></div>
              </div>
            </div>
            <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 relative overflow-hidden text-white hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-slate-900/50">
              <div className="absolute top-4 right-4 bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Admission</div>
              <div className="w-14 h-14 bg-slate-700 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
              <h3 className="text-2xl font-black text-white mb-6">Épreuve orale — 15 min</h3>
              <div className="space-y-4 text-slate-300 font-medium">
                <div className="flex items-start gap-3"><div className="bg-slate-700 p-1.5 rounded-lg mt-0.5 shrink-0"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div><p><strong className="text-white">Entretien avec le jury</strong> : mise en situation professionnelle, questions sur les missions de l'ATSEM</p></div>
                <div className="flex items-start gap-3"><div className="bg-slate-700 p-1.5 rounded-lg mt-0.5 shrink-0"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div><p><strong className="text-white">Motivations et projet</strong> : pourquoi ATSEM, relation avec les enfants, travail en équipe</p></div>
                <div className="flex items-start gap-3"><div className="bg-slate-700 p-1.5 rounded-lg mt-0.5 shrink-0"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><p><strong className="text-white">Coefficient important</strong> : l'oral peut faire la différence dans le classement final</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION BÉNÉFICES */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">La méthode pour réussir le concours ATSEM</h2>
            <p className="text-lg text-slate-600 font-medium">Des outils d'entraînement conçus sur mesure pour maîtriser le QCM et l'oral du concours !</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">QCM illimités</h3>
              <p className="text-slate-600 font-medium leading-relaxed">Entraînez-vous sur les <strong className="text-slate-800">6 familles thématiques</strong> du concours : hygiène, sécurité, développement de l'enfant, cadre institutionnel et plus.</p>
            </div>
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Simulation d'oral</h3>
              <p className="text-slate-600 font-medium leading-relaxed">Notre IA génère des <strong className="text-slate-800">questions personnalisées</strong> de jury : mises en situation, motivations, connaissances du métier d'ATSEM.</p>
            </div>
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Annales corrigées</h3>
              <p className="text-slate-600 font-medium leading-relaxed">Entraînez-vous avec les <strong className="text-slate-800">vrais sujets des CDG</strong> de 2015 à 2025 en conditions réelles avec timer et correction détaillée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Schema pour Google */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a }
        }))
      })}} />

      {/* SECTION FAQ */}
      <section className="py-20 bg-[#eceef1] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Questions fréquentes</h2>
          </div>
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-300 transition-colors">
                <button className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none" onClick={() => toggleFaq(index)}>
                  <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                  <div className="shrink-0 bg-slate-100 p-2 rounded-full text-slate-500">
                    <svg className={`w-5 h-5 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
                  </div>
                </button>
                <div className="px-6 overflow-hidden transition-all duration-300" style={{ maxHeight: activeFaq === index ? '500px' : '0', opacity: activeFaq === index ? 1 : 0 }}>
                  <p className="pb-6 text-slate-600 font-medium leading-relaxed [&_a]:text-violet-600 [&_a]:font-bold [&_a]:underline" dangerouslySetInnerHTML={{__html: faq.a}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION TARIFS */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-in-up">
          <h2 className="text-3xl font-black mb-8">Découvrez nos formules d'accompagnement</h2>
          <p className="text-lg text-slate-400 font-medium mb-10 max-w-2xl mx-auto">Sans engagement ou jusqu'au concours, trouvez le rythme qui correspond à votre projet de reconversion.</p>
          <a href="/tarifs" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-violet-900/50">
            Voir les tarifs en détail <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2.5"/><path d="M12 6.5v3"/><path d="M8 19c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M9.5 12.5l-2 3.5"/><path d="M14.5 12.5l2 3.5"/><polygon points="19,2 19.9,4.8 22.8,4.8 20.5,6.5 21.3,9.3 19,7.6 16.7,9.3 17.5,6.5 15.2,4.8 18.1,4.8" fill="currentColor" stroke="none"/></svg>
              <h4 className="text-white font-bold text-lg">Prépa ATSEM</h4>
            </div>
            <p className="max-w-xs leading-relaxed">La plateforme d'entraînement dédiée aux candidates qui préparent le concours ATSEM. QCM, annales corrigées et simulations d'oral.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources ATSEM</h4>
            <ul className="space-y-3">
              <li><a href="/blog" className="hover:text-white transition">Blog & conseils</a></li>
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
          <p>&copy; 2026 Prépa ATSEM — LP Labs SAS. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}