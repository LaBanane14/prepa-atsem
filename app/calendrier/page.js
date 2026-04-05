'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function CalendrierPage() {
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

  const navLinks = [
    { href: '/', label: 'Accueil', active: false },
    { href: '/calendrier', label: 'Calendrier', active: true },
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

  const now = new Date()

  const etapes = [
    { date: '24 mars — 29 avril 2026', titre: 'Inscriptions en ligne', desc: 'Inscription sur le site du CDG organisateur de votre département. Créez votre dossier et téléchargez les pièces justificatives.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', deadline: new Date('2026-04-29') },
    { date: '7 mai 2026', titre: 'Date limite du dossier', desc: 'Dernier jour pour envoyer votre dossier complet (diplômes, pièce d\'identité, photo). Envoi en recommandé conseillé.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', deadline: new Date('2026-05-07') },
    { date: 'À partir du 14 octobre 2026', titre: 'Épreuve écrite (admissibilité)', desc: 'QCM de 20 questions en 45 minutes. Coefficient 1. Réponses multiples possibles — il faut toutes les cocher sans erreur.', icon: 'M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z', deadline: new Date('2026-10-14') },
    { date: 'Novembre 2026', titre: 'Résultats d\'admissibilité', desc: 'Publication des résultats par le CDG. Les candidats au-dessus du seuil fixé par le jury sont convoqués à l\'oral.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', deadline: new Date('2026-11-15') },
    { date: 'Décembre 2026 — Janvier 2027', titre: 'Épreuve orale (admission)', desc: 'Entretien de 15 minutes devant un jury de 3 personnes. Coefficient 2 — l\'oral compte double ! Note éliminatoire : 7/20.', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', deadline: new Date('2027-01-15') },
    { date: 'Janvier — Février 2027', titre: 'Résultats définitifs', desc: 'Publication de la liste des lauréats. Inscription sur la liste d\'aptitude valable 2 ans pour postuler auprès des communes.', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', deadline: new Date('2027-02-15') },
  ]

  function getStatus(etape, index) {
    if (now > etape.deadline) return 'passed'
    if (index === 0 || now > etapes[index - 1].deadline) return 'current'
    return 'upcoming'
  }

  return (
    <div className="min-h-screen text-slate-900" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f0ff 15%, #ede9fe 30%, #f5f3ff 50%, #faf5ff 65%, #fdf4ff 80%, #fce7f3 100%)' }}>

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
      <section className="pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-800 text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Concours 2026
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight mb-4 font-bold">Calendrier du concours ATSEM 2026</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Toutes les dates clés du concours externe. Ne manquez aucune échéance.</p>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-200"></div>

            <div className="space-y-8">
              {etapes.map((etape, i) => {
                const status = getStatus(etape, i)
                return (
                  <div key={i} className="relative flex gap-6">
                    {/* Point sur la timeline */}
                    <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      status === 'current' ? 'bg-purple-800 text-white ring-4 ring-purple-200' :
                      status === 'passed' ? 'bg-slate-300 text-white' :
                      'bg-white text-purple-800 border-2 border-purple-200'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={etape.icon}/></svg>
                    </div>

                    {/* Carte */}
                    <div className={`flex-1 rounded-2xl p-6 transition-all ${
                      status === 'current' ? 'bg-white shadow-lg border-2 border-purple-200' :
                      status === 'passed' ? 'bg-white/50 border border-slate-200 opacity-60' :
                      'bg-white/70 border border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          status === 'current' ? 'bg-emerald-100 text-emerald-800' :
                          status === 'passed' ? 'bg-slate-100 text-slate-500' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {status === 'current' ? '● En cours' : status === 'passed' ? 'Terminé' : 'À venir'}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">{etape.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{etape.titre}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{etape.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── INFO CDG ─── */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-200 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Où s'inscrire ?</h2>
            <p className="text-slate-500 mb-6">Le concours est organisé par les Centres de Gestion (CDG) de la Fonction Publique Territoriale. Chaque CDG gère un ou plusieurs départements.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { nom: 'CDG 13 (Bouches-du-Rhône)', region: 'PACA' },
                { nom: 'CDG 31 (Haute-Garonne)', region: 'Occitanie' },
                { nom: 'CDG 33 (Gironde)', region: 'Nouvelle-Aquitaine' },
                { nom: 'CDG 44 (Loire-Atlantique)', region: 'Pays de la Loire' },
                { nom: 'CDG 59 (Nord)', region: 'Hauts-de-France' },
                { nom: 'CDG 69 (Rhône)', region: 'Auvergne-Rhône-Alpes' },
                { nom: 'CDG 75 (Paris)', region: 'Île-de-France' },
                { nom: 'CDG 77 (Seine-et-Marne)', region: 'Île-de-France' },
              ].map((cdg, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{cdg.nom}</p>
                    <p className="text-xs text-slate-400">{cdg.region}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-400 mt-6 text-center">Le concours n'a pas lieu chaque année dans tous les CDG. Renseignez-vous auprès du CDG de votre département.</p>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-3xl p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.05%22%2F%3E%3C%2Fsvg%3E')] opacity-60"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold mb-3">Les inscriptions sont ouvertes !</h2>
              <p className="text-purple-200 mb-6">Commencez à réviser dès maintenant pour être prêt le 14 octobre.</p>
              <a href="/signup" className="inline-block bg-white text-purple-900 px-8 py-3.5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                Commencer l'entraînement
              </a>
            </div>
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
              <li><a href="/calendrier" className="hover:text-white transition">Calendrier 2026</a></li>
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
