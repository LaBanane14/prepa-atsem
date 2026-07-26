'use client'
import { useState, useEffect } from 'react'
import FranceMap from '../../../data/france-map'
import { REGIONS, DATES_NATIONALES, OUTRE_MER } from '../../../data/calendrier-atsem-2026'

// MAQUETTE — page calendrier reprise de /calendrier, re-skinnée au design FPC
// (cartes blanches arrondies, accents violets). La nav pilule et le footer
// sombre viennent du layout public.

// Régions organisées conjointement (lien réciproque, scroll vers l'autre carte)
const REGION_LINKS = {
  idf: 'cvl',
  cvl: 'idf',
  pac: 'cor',
  cor: 'pac',
}

const TIMELINE_STEPS = [
  { num: '1', label: 'Inscriptions',     month: 'Jusqu\'au 29 avril', year: '', detail: 'Inscription sur concours-territorial.fr',    cls: 'cal-tl-1', endsAt: '2026-04-29T23:59:59' },
  { num: '2', label: 'Dépôt dossier',    month: '7 mai',    year: '',            detail: 'Pièces justificatives',                     cls: 'cal-tl-2', endsAt: '2026-05-07T23:59:59' },
  { num: '3', label: 'Épreuves écrites', month: '14 oct.',  year: '',            detail: 'QCM de 20 questions en 45 min',             cls: 'cal-tl-3', endsAt: '2026-10-14T23:59:59' },
  { num: '4', label: 'Résultats',        month: 'Nov/Déc',  year: '',            detail: 'Liste des candidats admissibles à l\'oral',  cls: 'cal-tl-4', endsAt: '2026-12-31T23:59:59' },
  { num: '5', label: 'Oraux',            month: 'Déc/Janv', year: '2026 / 2027', detail: 'Entretien avec le jury, admission finale',  cls: 'cal-tl-5', endsAt: '2027-01-31T23:59:59' },
]

export default function CalendrierPage() {
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Fade-in au scroll (même mécanique que l'accueil)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08 })
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function getRegionData(id) {
    return REGIONS.find(r => r.id === id)
  }

  const hoveredData = hoveredRegion ? getRegionData(hoveredRegion) : null
  const selectedData = selectedRegion ? getRegionData(selectedRegion) : null
  const nb2026 = REGIONS.filter(r => r.concours_2026).length
  // Étape en cours selon la date du jour (calculé après mount pour éviter les écarts SSR/CSR)
  const currentStepIdx = mounted
    ? TIMELINE_STEPS.findIndex(s => Date.now() < new Date(s.endsAt).getTime())
    : -1
  // Frise losanges : jours restants avant la prochaine échéance, état de
  // chaque étape, et remplissage de la ligne jusqu'à la position exacte du
  // jour (les centres des 5 losanges sont à 10 / 30 / 50 / 70 / 90 %)
  const joursRestants = mounted && currentStepIdx >= 0
    ? Math.ceil((new Date(TIMELINE_STEPS[currentStepIdx].endsAt).getTime() - Date.now()) / 86400000)
    : null
  const etatEtape = (i) => !mounted ? 'avenir' : (currentStepIdx === -1 || i < currentStepIdx) ? 'fait' : i === currentStepIdx ? 'encours' : 'avenir'
  let remplissage = 0
  if (mounted) {
    if (currentStepIdx === -1) remplissage = 80
    else if (currentStepIdx > 0) {
      const fin = new Date(TIMELINE_STEPS[currentStepIdx].endsAt).getTime()
      const debut = new Date(TIMELINE_STEPS[currentStepIdx - 1].endsAt).getTime()
      const frac = Math.min(1, Math.max(0, (Date.now() - debut) / (fin - debut)))
      remplissage = (currentStepIdx - 1) * 20 + frac * 20
    }
  }

  // Compte les CDG individuels nommés (exclut les entrées agrégées type "CDG rattachés...")
  const nbCdg = REGIONS.reduce((s, r) => {
    if (!r.concours_2026) return s
    const named = r.cdg_organisateurs.filter(c => !/^CDG (rattachés|organisateurs)/i.test(c.nom))
    return s + named.length
  }, 0)

  // SEO : fil d'Ariane + un événement « concours » par région organisatrice
  const regionsActives = REGIONS.filter(r => r.concours_2026)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.prepa-atsem.fr/" },
          { "@type": "ListItem", "position": 2, "name": "Calendrier 2026", "item": "https://www.prepa-atsem.fr/calendrier" }
        ]
      },
      ...regionsActives.map(r => ({
        "@type": "Event",
        "name": `Concours ATSEM 2026 : ${r.nom}`,
        "description": `Épreuves écrites du concours ATSEM 2026 organisées par les CDG de la région ${r.nom}.`,
        "startDate": "2026-10-14",
        "endDate": "2027-01-31",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
          "@type": "Place",
          "name": r.nom,
          "address": { "@type": "PostalAddress", "addressRegion": r.nom, "addressCountry": "FR" }
        },
        "organizer": r.cdg_organisateurs.map(c => ({ "@type": "Organization", "name": c.nom, "url": c.site })),
        "url": `https://www.prepa-atsem.fr/calendrier#${r.id}`,
        "offers": {
          "@type": "Offer",
          "url": "https://www.concours-territorial.fr",
          "availabilityStarts": "2026-03-24",
          "availabilityEnds": "2026-04-29",
          "validFrom": "2026-03-24"
        }
      }))
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        /* TIMELINE — losanges colorés (design d'origine), améliorés : ligne de
           base grise remplie en dégradé jusqu'au jour J, losanges franchis
           remplis avec coche, pastille J-XX sur l'étape en cours */
        .cal-timeline { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .cal-timeline::before {
          content: ''; position: absolute; top: 28px; left: 10%; right: 10%; height: 3px;
          background: rgba(0,0,0,0.07); border-radius: 999px; z-index: 0;
        }
        .cal-tl-fill {
          position: absolute; top: 28px; left: 10%; height: 3px; border-radius: 999px; z-index: 0;
          background-image: linear-gradient(90deg, #9333ea 0%, #ec4899 28%, #2563eb 52%, #e5a50c 76%, #10b981 100%);
          background-repeat: no-repeat;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cal-tl-step { position: relative; text-align: center; z-index: 1; padding: 0 6px; }
        .cal-tl-meta { min-height: 56px; display: flex; flex-direction: column; justify-content: flex-start; margin-bottom: 8px; }
        .cal-tl-dot {
          width: 56px; height: 56px; border-radius: 14px;
          background: white; border: 3px solid currentColor;
          display: grid; place-items: center; margin: 0 auto 30px;
          font-size: 18px; font-weight: 800;
          box-shadow: 0 10px 24px -8px currentColor;
          position: relative; transform: rotate(45deg);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cal-tl-dot > span { display: block; transform: rotate(-45deg); }
        .cal-tl-step:hover .cal-tl-dot { transform: rotate(45deg) scale(1.12) translateY(-3px); }
        .cal-tl-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 14px;
          background: currentColor; opacity: 0.12; z-index: -1; transform: scale(1.3);
          transition: opacity 0.25s;
        }
        .cal-tl-step:hover .cal-tl-dot::after { opacity: 0.22; }
        .cal-tl-month { font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: #0d0d0d; line-height: 1.05; margin-bottom: 4px; }
        .cal-tl-year { font-size: 13px; font-weight: 700; color: rgba(0,0,0,0.4); }
        .cal-tl-label {
          display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 5px 11px; border-radius: 999px;
          background: currentColor; margin-bottom: 8px;
        }
        .cal-tl-label span { color: white; }
        .cal-tl-detail { font-size: 12px; font-weight: 600; color: rgba(0,0,0,0.5); line-height: 1.4; }
        .cal-tl-1 { color: #9333ea; } .cal-tl-2 { color: #ec4899; } .cal-tl-3 { color: #2563eb; } .cal-tl-4 { color: #e5a50c; } .cal-tl-5 { color: #10b981; }

        /* Étape franchie : le losange se remplit de sa couleur, coche blanche */
        .cal-tl-done .cal-tl-dot { background: currentColor; }

        /* Étape en cours : losange agrandi + pulse subtil */
        .cal-tl-current .cal-tl-dot {
          transform: rotate(45deg) scale(1.18) translateY(-3px);
          animation: cal-tl-pulse 2.4s ease-in-out infinite;
        }
        .cal-tl-current:hover .cal-tl-dot { transform: rotate(45deg) scale(1.25) translateY(-4px); }
        .cal-tl-current .cal-tl-dot::after { opacity: 0.2; }
        .cal-tl-current .cal-tl-month { color: currentColor; }
        @keyframes cal-tl-pulse {
          0%, 100% { box-shadow: 0 12px 28px -8px currentColor; }
          50% { box-shadow: 0 12px 36px -4px currentColor; }
        }

        /* Pastille J-XX accolée à la date de l'étape en cours */
        .cal-tl-j { display: inline-block; background: currentColor; border-radius: 999px; padding: 2px 9px; margin-left: 8px; transform: rotate(4deg) translateY(-3px); }
        .cal-tl-j span { color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 0; }

        @media (max-width: 1100px) {
          .cal-timeline { grid-template-columns: 1fr; gap: 28px; }
          .cal-timeline::before {
            top: 0; bottom: 0; left: 27px; right: auto;
            width: 3px; height: auto;
            background: linear-gradient(180deg, #9333ea 0%, #ec4899 25%, #2563eb 50%, #e5a50c 75%, #10b981 100%);
          }
          .cal-tl-fill { display: none; }
          .cal-tl-step { text-align: left; padding-left: 80px; }
          .cal-tl-dot { position: absolute; left: 0; top: 0; margin: 0; }
          .cal-tl-meta { min-height: 0; margin-bottom: 2px; }
          .cal-tl-month { margin-bottom: 0; line-height: 1.1; }
          .cal-tl-current .cal-tl-dot { transform: rotate(45deg) scale(1.15); }
        }

        /* CARTE DE FRANCE */
        .cal-region-path { transition: fill 0.2s; cursor: pointer; outline: none; }
        .cal-region-path.active { fill: #d8b4fe; stroke: white; stroke-width: 1.5; }
        .cal-region-path.active:hover, .cal-region-path.active.selected { fill: #9333ea; }
        .cal-region-path.inactive { fill: #e5e7eb; stroke: white; stroke-width: 1.5; }
        .cal-region-path.inactive:hover, .cal-region-path.inactive.selected { fill: #d1d5db; }

      `}</style>

      {/* ===================== EN-TÊTE ===================== */}
      <section className="relative px-5 pt-[110px] md:pt-[150px] pb-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] leading-[1.08]">
            Le calendrier du <span className="surligne">concours ATSEM 2026</span>
          </h1>
          <p className="mt-4 text-xs font-bold text-black/40">Mis à jour le 20/07/2026</p>
          <p className="mt-6 text-lg sm:text-xl text-black/55 font-medium leading-relaxed">
            Toutes les dates clés, région par région, avec les CDG organisateurs et les départements rattachés. Cliquez sur votre région pour voir le détail.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-[13px] font-bold">
            <span className="inline-flex items-center gap-1.5 bg-white ring-1 ring-black/[0.08] rounded-full px-4 py-2"><b className="font-extrabold text-purple-700">{nb2026}</b> régions organisatrices</span>
            <span className="inline-flex items-center gap-1.5 bg-white ring-1 ring-black/[0.08] rounded-full px-4 py-2"><b className="font-extrabold text-blue-600">{nbCdg}</b> CDG en 2026</span>
            <span className="inline-flex items-center gap-1.5 bg-white ring-1 ring-black/[0.08] rounded-full px-4 py-2"><b className="font-extrabold text-amber-500">~2 500</b> postes attendus</span>
          </div>
        </div>
      </section>

      {/* ===================== TIMELINE NATIONALE ===================== */}
      <section className="px-5 pt-10 sm:pt-14 fade-in-up">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 mb-5 text-[13px] font-extrabold uppercase tracking-[0.15em] text-black/40">
            <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Dates nationales 2026
          </div>
          {/* Frise losanges (design d'origine amélioré) : ligne remplie
              jusqu'au jour J, losanges franchis remplis avec coche, pastille
              J-XX sur la date de l'étape en cours */}
          <div className="bg-white rounded-[24px] ring-1 ring-black/[0.07] p-8 sm:p-10">
            <div className="cal-timeline">
              <div aria-hidden="true" className="cal-tl-fill" style={{ width: `${remplissage}%`, backgroundSize: remplissage > 0 ? `${(80 / remplissage) * 100}% 100%` : '100% 100%' }}></div>
              {TIMELINE_STEPS.map((s, i) => {
                const etat = etatEtape(i)
                return (
                  <div
                    key={i}
                    className={`cal-tl-step ${s.cls} ${etat === 'encours' ? 'cal-tl-current' : ''} ${etat === 'fait' ? 'cal-tl-done' : ''}`}
                    title={`${s.label} · ${s.month}${s.year ? ' ' + s.year : ''} · ${s.detail}`}
                  >
                    <div className="cal-tl-dot">
                      <span>{etat === 'fait' ? (
                        <svg className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      ) : s.num}</span>
                    </div>
                    <div className="cal-tl-label"><span>{s.label}</span></div>
                    <div className="cal-tl-meta">
                      <div className="cal-tl-month">
                        {s.month}
                        {etat === 'encours' && joursRestants != null && <span className="cal-tl-j"><span>J-{joursRestants}</span></span>}
                      </div>
                      {s.year && <div className="cal-tl-year">{s.year}</div>}
                    </div>
                    <div className="cal-tl-detail">{s.detail}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CARTE DES RÉGIONS ===================== */}
      <section className="px-5 pt-12 sm:pt-16 fade-in-up">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 mb-5 text-[13px] font-extrabold uppercase tracking-[0.15em] text-black/40">
            <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
            Carte des régions
          </div>
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-stretch">

            {/* Carte cliquable */}
            <div className="bg-white rounded-[24px] ring-1 ring-black/[0.07] p-7 sm:p-8 flex flex-col items-center">
              <div className="h-9 mb-3 flex items-center justify-center">
                {hoveredData ? (
                  <span className={`px-4 py-1.5 rounded-full text-[13px] font-extrabold ${hoveredData.concours_2026 ? 'bg-purple-100 text-purple-800' : 'bg-black/[0.05] text-black/50'}`}>
                    {hoveredData.nom}{!hoveredData.concours_2026 && ' (2027)'}
                  </span>
                ) : (
                  <span className="text-[13px] font-semibold text-black/30">Survolez une région</span>
                )}
              </div>
              {mounted && (
                <svg viewBox={FranceMap.viewBox} className="w-full max-w-[460px]" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte des régions de France">
                  {FranceMap.locations.map(location => {
                    const region = getRegionData(location.id)
                    const active = region?.concours_2026
                    const isSelected = selectedRegion === location.id
                    return (
                      <a
                        key={location.id}
                        href={region ? `#${region.id}` : '#'}
                        onClick={(e) => { e.preventDefault(); if (region) setSelectedRegion(region.id) }}
                      >
                        <path
                          d={location.path}
                          aria-label={region?.nom || location.name}
                          tabIndex={0}
                          role="link"
                          className={`cal-region-path ${active ? 'active' : 'inactive'} ${isSelected ? 'selected' : ''}`}
                          onMouseEnter={() => setHoveredRegion(location.id)}
                          onMouseLeave={() => setHoveredRegion(null)}
                        >
                          <title>{region?.nom || location.name}{!active ? ' · Prochain concours : 2027' : ''}</title>
                        </path>
                      </a>
                    )
                  })}
                </svg>
              )}
              <div className="flex gap-5 mt-5 text-xs font-bold text-black/55">
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded" style={{background:'#d8b4fe'}}></span> Concours 2026</div>
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded" style={{background:'#e5e7eb'}}></span> Non organisé en 2026</div>
              </div>
            </div>

            {/* Panneau d'information / détail région */}
            <div className="bg-white rounded-[24px] ring-1 ring-black/[0.07] p-7 sm:p-8">
              {selectedData ? (
                <>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${selectedData.concours_2026 ? 'bg-purple-100 text-purple-800' : 'bg-black/[0.05] text-black/50'}`}>
                        {selectedData.concours_2026 ? 'Concours 2026' : 'Prochain : 2027'}
                      </span>
                      <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{selectedData.nom}</h2>
                    </div>
                    <button onClick={() => setSelectedRegion(null)} aria-label="Fermer" className="w-8 h-8 shrink-0 rounded-lg bg-black/[0.05] text-black/50 grid place-items-center hover:bg-[#0d0d0d] hover:text-white transition cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  {selectedData.concours_2026 && (
                    <div className="bg-[#faf8ff] ring-1 ring-black/[0.06] rounded-xl px-4 py-3 mb-4 text-[13px]">
                      <div className="flex justify-between items-center py-1.5"><span className="text-black/50 font-semibold">Inscriptions</span><b className="font-extrabold text-right">{DATES_NATIONALES.inscription_debut} → {DATES_NATIONALES.inscription_fin}</b></div>
                      <div className="flex justify-between items-center py-1.5 border-t border-dashed border-black/[0.08]"><span className="text-black/50 font-semibold">Dépôt dossier</span><b className="font-extrabold text-right">{DATES_NATIONALES.depot_dossier}</b></div>
                      <div className="flex justify-between items-center py-1.5 border-t border-dashed border-black/[0.08]"><span className="text-black/50 font-semibold">Épreuves écrites</span><b className="font-extrabold text-right">{DATES_NATIONALES.epreuves_ecrites}</b></div>
                      <div className="flex justify-between items-center py-1.5 border-t border-dashed border-black/[0.08]"><span className="text-black/50 font-semibold">Oraux</span><b className="font-extrabold text-right">{DATES_NATIONALES.epreuves_orales}</b></div>
                    </div>
                  )}

                  {selectedData.note && <p className="text-xs italic text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mb-4">{selectedData.note}</p>}

                  <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-black/40 mb-2.5">CDG organisateurs</h3>
                  <ul className="space-y-1.5 mb-5">
                    {selectedData.cdg_organisateurs.map((c, i) => (
                      <li key={i} className="ring-1 ring-black/[0.07] rounded-xl px-3.5 py-2.5 text-[13px]">
                        <b className="block font-extrabold">{c.nom}</b>
                        <span className="block text-[11px] font-semibold text-black/40 mb-1">{c.departements.join(', ')}</span>
                        {c.site && <a href={c.site} target="_blank" rel="noopener noreferrer" className="text-purple-700 font-bold text-xs hover:underline">Site officiel →</a>}
                      </li>
                    ))}
                  </ul>

                  {selectedData.concours_2026 && (
                    <a href="https://www.concours-territorial.fr" target="_blank" rel="noopener noreferrer" className="btn-shine flex items-center justify-center gap-2 bg-[#0d0d0d] hover:bg-black/85 text-white font-bold text-[13px] px-4 py-3 rounded-full transition">
                      S&apos;inscrire sur concours-territorial.fr
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold tracking-tight mb-2">Comment ça marche ?</h2>
                  <p className="text-sm text-black/55 font-medium leading-relaxed mb-6">Le concours ATSEM est organisé par les <strong className="font-bold text-black/75">Centres de Gestion (CDG)</strong> de la Fonction Publique Territoriale, regroupés par région. Tous les CDG n&apos;organisent pas le concours chaque année.</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#faf8ff] ring-1 ring-black/[0.06] rounded-2xl px-4 py-3.5">
                      <b className="block text-2xl font-extrabold tracking-tight">{nb2026}<span className="text-sm font-bold text-black/35">/13</span></b>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black/40">Régions en 2026</span>
                    </div>
                    <div className="bg-[#faf8ff] ring-1 ring-black/[0.06] rounded-2xl px-4 py-3.5">
                      <b className="block text-2xl font-extrabold tracking-tight">~3%</b>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black/40">Taux de réussite</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-amber-50 ring-1 ring-amber-200 rounded-2xl px-4 py-3.5 text-[13px] font-semibold text-amber-800 leading-relaxed">
                    <svg className="w-[18px] h-[18px] shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                    <span>Inscriptions clôturées à minuit le dernier jour. Un dossier incomplet = candidature refusée.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TOUTES LES RÉGIONS ===================== */}
      <section className="px-5 pt-12 sm:pt-16 pb-16 sm:pb-24 fade-in-up">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 mb-5 text-[13px] font-extrabold uppercase tracking-[0.15em] text-black/40">
            <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
            Toutes les régions et leurs CDG
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {REGIONS.map((r) => {
              const linkedId = REGION_LINKS[r.id]
              const linked = linkedId ? REGIONS.find(x => x.id === linkedId) : null
              const active = r.concours_2026
              return (
                <article
                  key={r.id}
                  id={r.id}
                  className={`rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-1 scroll-mt-28 ${active ? 'bg-[#0d0d0d] text-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]' : 'bg-white ring-1 ring-black/[0.07]'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className={`text-lg font-extrabold tracking-tight ${active ? 'text-white' : ''}`}>{r.nom}</h3>
                    <span className={`shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${active ? 'bg-purple-600/30 text-purple-200' : 'bg-black/[0.05] text-black/50'}`}>
                      {active ? 'Concours 2026' : 'Prochain : 2027'}
                    </span>
                  </div>
                  {linked && (
                    <a href={`#${linked.id}`} className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full mb-2.5 transition ${active ? 'bg-purple-400/15 text-purple-200 hover:bg-purple-400/25' : 'bg-purple-600/10 text-purple-800 hover:bg-purple-600/20'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      Organisation conjointe avec <b className="font-extrabold">{linked.nom}</b>
                    </a>
                  )}
                  {active && (
                    <p className={`text-xs font-semibold mb-3 ${active ? 'text-white/45' : 'text-black/40'}`}>
                      Inscriptions {DATES_NATIONALES.inscription_debut} → {DATES_NATIONALES.inscription_fin} · Écrits {DATES_NATIONALES.epreuves_ecrites}
                    </p>
                  )}
                  {r.note && !linked && <p className="text-xs italic text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mb-3">{r.note}</p>}
                  <ul>
                    {r.cdg_organisateurs.map((c, i) => (
                      <li key={i} className={`text-[13px] leading-relaxed py-1.5 ${i > 0 ? (active ? 'border-t border-dashed border-white/10' : 'border-t border-dashed border-black/[0.08]') : ''} ${active ? 'text-purple-100/80' : 'text-black/60'}`}>
                        <b className={`font-extrabold ${active ? 'text-white' : 'text-black/85'}`}>{c.nom}</b> <span className={active ? 'text-white/35' : 'text-black/35'}>({c.departements.join(', ')})</span>
                        {c.site && <> · <a href={c.site} target="_blank" rel="noopener noreferrer" className={`font-bold hover:underline ${active ? 'text-purple-300' : 'text-purple-700'}`}>site officiel</a></>}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
            {/* Outre-Mer */}
            <article className="rounded-[20px] p-6 bg-white ring-1 ring-black/[0.07] transition-all duration-300 hover:-translate-y-1 scroll-mt-28" id="outre-mer">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <h3 className="text-lg font-extrabold tracking-tight">Outre-Mer</h3>
                <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap bg-black/[0.05] text-black/50">Calendrier propre</span>
              </div>
              <ul>
                {OUTRE_MER.map((dom, i) => (
                  <li key={i} className={`text-[13px] leading-relaxed py-1.5 text-black/60 ${i > 0 ? 'border-t border-dashed border-black/[0.08]' : ''}`}>
                    <b className="font-extrabold text-black/85">{dom.cdg}</b> <span className="text-black/35">({dom.nom})</span> · inscriptions du {dom.inscription_debut} au {dom.inscription_fin}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

    </>
  )
}
