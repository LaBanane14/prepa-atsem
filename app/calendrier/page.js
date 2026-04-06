'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import FranceMap from '@svg-maps/france.regions'
import { REGIONS, DATES_NATIONALES } from '../../data/calendrier-atsem-2026'

export default function CalendrierPage() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

  function getRegionData(id) {
    return REGIONS.find(r => r.id === id)
  }

  const selected = selectedRegion ? getRegionData(selectedRegion) : null
  const hoveredData = hoveredRegion ? getRegionData(hoveredRegion) : null

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
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-16 pb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight mb-3 font-bold whitespace-nowrap">Calendrier du concours ATSEM 2026</h1>
          <p className="text-base text-slate-500">Cliquez sur votre région pour voir les dates et les CDG organisateurs.</p>
          {/* Légende */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-purple-500"></span> Concours 2026</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-slate-300"></span> Non organisé en 2026</span>
          </div>
        </div>
      </section>

      {/* ─── CARTE + PANNEAU ─── */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* Carte de France — 3 colonnes */}
            <div className="lg:col-span-3 bg-white/70 backdrop-blur rounded-3xl border border-slate-200 p-6 sm:p-8">
              {/* Nom région au hover */}
              <div className="text-center h-10 mb-3 flex items-center justify-center">
                {hoveredData ? (
                  <span className={`text-base font-bold px-4 py-1.5 rounded-full ${hoveredData.concours_2026 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'}`}>
                    {hoveredData.nom} {!hoveredData.concours_2026 && '— 2027'}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">Survolez une région</span>
                )}
              </div>
              {mounted && <svg viewBox={FranceMap.viewBox} className="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte des régions de France">
                {FranceMap.locations.map(location => {
                  const region = getRegionData(location.id)
                  const is2026 = region?.concours_2026
                  const isSelected = selectedRegion === location.id
                  const isHovered = hoveredRegion === location.id

                  return (
                    <path
                      key={location.id}
                      d={location.path}
                      aria-label={region?.nom || location.name}
                      tabIndex={0}
                      role="button"
                      className={`transition-all duration-200 cursor-pointer outline-none focus:outline-2 focus:outline-purple-500 ${
                        isSelected
                          ? 'fill-purple-600 stroke-purple-400 stroke-[2.5]'
                          : isHovered
                          ? is2026 ? 'fill-purple-500 stroke-white stroke-[1.5]' : 'fill-slate-400 stroke-white stroke-[1.5]'
                          : is2026 ? 'fill-purple-300 stroke-white stroke-[1.5]' : 'fill-slate-200 stroke-white stroke-[1.5]'
                      }`}
                      onClick={() => setSelectedRegion(location.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRegion(location.id) }}
                      onMouseEnter={() => setHoveredRegion(location.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <title>{region?.nom || location.name}{!is2026 ? ' — Prochain concours : 2027' : ''}</title>
                    </path>
                  )
                })}
              </svg>}
            </div>

            {/* Panneau détail — 2 colonnes */}
            <div className="lg:col-span-2" role="region" aria-live="polite">
              {selected ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in-up" style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}>
                  {/* Header */}
                  <div className={`p-6 ${selected.concours_2026 ? 'bg-purple-800' : 'bg-slate-700'} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${selected.concours_2026 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <div>
                          <h2 className="text-lg font-bold">{selected.nom}</h2>
                          <p className="text-sm opacity-75">{selected.concours_2026 ? 'Concours organisé en 2026' : 'Pas de concours ATSEM en 2026'}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedRegion(null)} className="opacity-60 hover:opacity-100 transition p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {selected.concours_2026 ? (
                      <>
                        {/* Dates */}
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                          Dates
                        </h3>
                        <div className="space-y-2 mb-6">
                          {[
                            { label: 'Inscriptions', value: `Du ${DATES_NATIONALES.inscription_debut} au ${DATES_NATIONALES.inscription_fin}` },
                            { label: 'Dépôt dossier', value: DATES_NATIONALES.depot_dossier },
                            { label: 'Épreuves écrites', value: DATES_NATIONALES.epreuves_ecrites },
                            { label: 'Résultats', value: DATES_NATIONALES.resultats_admissibilite },
                            { label: 'Oraux', value: DATES_NATIONALES.epreuves_orales },
                          ].map((d, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-500">{d.label}</span>
                              <span className="font-semibold text-slate-900 text-right">{d.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* CDG */}
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                          CDG organisateurs
                        </h3>
                        <div className="space-y-3 mb-6">
                          {selected.cdg_organisateurs.map((cdg, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 text-sm">{cdg.nom}</p>
                                <a href={cdg.site} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 transition text-xs font-semibold">
                                  Site →
                                </a>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{cdg.departements.join(', ')}</p>
                            </div>
                          ))}
                        </div>

                        {/* Note */}
                        {selected.note && (
                          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-4">
                            <p className="text-xs text-purple-800"><strong>Note :</strong> {selected.note}</p>
                          </div>
                        )}

                        <a href="https://www.concours-territorial.fr" target="_blank" rel="noopener noreferrer" className="block w-full bg-purple-800 hover:bg-purple-900 text-white text-center font-bold py-3 rounded-xl transition text-sm">
                          S'inscrire sur concours-territorial.fr →
                        </a>
                      </>
                    ) : (
                      <>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                          <p className="text-sm text-amber-800 font-medium">{selected.note}</p>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">CDG de référence</h3>
                        <div className="space-y-3 mb-6">
                          {selected.cdg_organisateurs.map((cdg, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-3">
                              <p className="font-bold text-slate-900 text-sm">{cdg.nom}</p>
                              <p className="text-xs text-slate-500 mt-1">{cdg.departements.join(', ')}</p>
                              <a href={cdg.site} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 transition text-xs font-semibold">Voir le site →</a>
                            </div>
                          ))}
                        </div>

                        <button onClick={() => setSelectedRegion(null)} className="block w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-center font-bold py-3 rounded-xl transition text-sm">
                          Voir les régions qui organisent en 2026
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Dates nationales 2026
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Inscriptions', value: `Du ${DATES_NATIONALES.inscription_debut} au ${DATES_NATIONALES.inscription_fin}` },
                      { label: 'Dépôt dossier', value: `${DATES_NATIONALES.depot_dossier} (dernier délai)` },
                      { label: 'Épreuves écrites', value: `À partir du ${DATES_NATIONALES.epreuves_ecrites}` },
                      { label: 'Résultats', value: DATES_NATIONALES.resultats_admissibilite },
                      { label: 'Oraux', value: DATES_NATIONALES.epreuves_orales },
                    ].map((d, i) => (
                      <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500">{d.label}</span>
                        <span className="font-semibold text-slate-900 text-right">{d.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-4">Cliquez sur une région pour voir les CDG organisateurs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── DATES NATIONALES ─── */}
      <section className="pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Le concours ATSEM 2026
            </h2>
            <div className="space-y-3 text-sm text-slate-500">
              <p>Le concours ATSEM est organisé par les <strong className="text-slate-900">Centres de Gestion (CDG)</strong> de la Fonction Publique Territoriale. Les CDG se regroupent par région pour organiser le concours.</p>
              <p>Tous les CDG n'organisent pas le concours chaque année. Certaines régions comme la Normandie, la Bretagne et les Pays de la Loire ont organisé le concours en 2025 et ne le feront qu'en 2027. <strong className="text-slate-900">Vous pouvez passer le concours dans une autre région</strong> — la réussite est valable sur tout le territoire national.</p>
              <p>Les candidats doivent s'inscrire auprès d'un seul CDG organisateur via le portail <a href="https://www.concours-territorial.fr" target="_blank" rel="noopener noreferrer" className="text-purple-800 font-semibold underline">concours-territorial.fr</a>. Il n'est pas possible de s'inscrire à plusieurs CDG simultanément.</p>
            </div>
            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800 font-medium">Les inscriptions se clôturent à minuit le dernier jour. Un dossier incomplet = candidature refusée.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ─── CTA ─── */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-3xl p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold mb-3">Le concours ATSEM, c'est 3% de taux d'admission.</h2>
              <p className="text-purple-200 mb-6">Plus de 80 000 candidats pour environ 2 500 postes.<br/>Préparez-vous sérieusement dès maintenant.</p>
              <a href="/auth" className="inline-block bg-white text-purple-900 px-8 py-3.5 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                Commencer ma préparation gratuitement →
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
