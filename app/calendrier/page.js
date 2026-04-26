'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import FranceMap from '../../data/france-map'
import { REGIONS, DATES_NATIONALES, OUTRE_MER } from '../../data/calendrier-atsem-2026'

// FAQ pour le SEO + utilisateurs
const FAQ_ITEMS = [
  {
    q: "Quand a lieu le concours ATSEM 2026 ?",
    r: "Les inscriptions au concours ATSEM 2026 ouvrent le 24 mars 2026 et se terminent le 29 avril 2026. Le dossier d'inscription doit être déposé au plus tard le 7 mai 2026. Les épreuves écrites se déroulent à partir du 14 octobre 2026, les résultats d'admissibilité tombent fin novembre / décembre 2026, et les oraux ont lieu en décembre 2026 et janvier 2027."
  },
  {
    q: "Quels CDG organisent le concours ATSEM en 2026 ?",
    r: "En 2026, les régions Île-de-France, Centre-Val de Loire, Auvergne-Rhône-Alpes, PACA, Corse, Grand Est, Hauts-de-France, Occitanie et Nouvelle-Aquitaine organisent le concours ATSEM. Chaque région regroupe plusieurs CDG (Centres de Gestion de la Fonction Publique Territoriale). Les régions Normandie, Bretagne, Pays de la Loire et Bourgogne-Franche-Comté n'organisent pas en 2026 — leur prochain concours est prévu en 2027."
  },
  {
    q: "Comment s'inscrire au concours ATSEM 2026 ?",
    r: "L'inscription au concours ATSEM se fait exclusivement en ligne via le portail concours-territorial.fr. Vous choisissez un seul CDG organisateur (un seul à la fois — pas d'inscription multiple). Le dossier complet (pièces justificatives, diplôme CAP AEPE, etc.) doit ensuite être renvoyé au CDG choisi avant la date limite du 7 mai 2026."
  },
  {
    q: "Peut-on s'inscrire au concours ATSEM dans une autre région ?",
    r: "Oui, la réussite au concours ATSEM est valable sur tout le territoire national. Si votre région n'organise pas le concours en 2026 (par exemple Normandie ou Bretagne), vous pouvez vous inscrire dans une région voisine qui l'organise. Vous pourrez ensuite postuler dans n'importe quelle commune française une fois reçu sur la liste d'aptitude."
  },
  {
    q: "Combien y a-t-il de postes au concours ATSEM 2026 ?",
    r: "Le concours ATSEM ouvre environ 2 500 postes en France pour plus de 80 000 candidats — un taux de réussite proche de 3%. Le nombre exact de postes par CDG est publié dans l'arrêté d'ouverture du concours par chaque centre de gestion (généralement quelques semaines avant l'ouverture des inscriptions)."
  }
]

// Régions organisées conjointement (lien réciproque, scroll vers l'autre carte)
const REGION_LINKS = {
  idf: 'cvl',
  cvl: 'idf',
  pac: 'cor',
  cor: 'pac',
}

const TIMELINE_STEPS = [
  { num: '1', label: 'Inscriptions',     month: 'Jusqu\'au 29 avril', year: '', detail: 'Inscription sur concours-territorial.fr',           cls: 'cal-tl-1', endsAt: '2026-04-29T23:59:59' },
  { num: '2', label: 'Dépôt dossier',    month: '7 mai',    year: '',                   detail: 'Pièces justificatives',                            cls: 'cal-tl-2', endsAt: '2026-05-07T23:59:59' },
  { num: '3', label: 'Épreuves écrites', month: '14 oct.',  year: '',                   detail: 'QCM de 20 questions en 45 min',                    cls: 'cal-tl-3', endsAt: '2026-10-14T23:59:59' },
  { num: '4', label: 'Résultats',        month: 'Nov/Déc',  year: '',                   detail: 'Liste des candidats admissibles à l\'oral',         cls: 'cal-tl-4', endsAt: '2026-12-31T23:59:59' },
  { num: '5', label: 'Oraux',            month: 'Déc/Janv', year: '2026 / 2027',        detail: 'Entretien avec le jury, admission finale',         cls: 'cal-tl-5', endsAt: '2027-01-31T23:59:59' },
]

export default function CalendrierPage() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
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

  const hoveredData = hoveredRegion ? getRegionData(hoveredRegion) : null
  const selectedData = selectedRegion ? getRegionData(selectedRegion) : null
  const nb2026 = REGIONS.filter(r => r.concours_2026).length
  // Étape en cours selon la date du jour (calculé seulement après mount pour éviter les écarts SSR/CSR)
  const currentStepIdx = mounted
    ? TIMELINE_STEPS.findIndex(s => Date.now() < new Date(s.endsAt).getTime())
    : -1
  // Compte les CDG individuels nommés (exclut les entrées agrégées type "CDG rattachés..." ou "CDG organisateurs...")
  const nbCdg = REGIONS.reduce((s, r) => {
    if (!r.concours_2026) return s
    const named = r.cdg_organisateurs.filter(c => !/^CDG (rattachés|organisateurs)/i.test(c.nom))
    return s + named.length
  }, 0)

  // ─── SEO : JSON-LD (Event + FAQ + Breadcrumb + Organization) ───
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
      {
        "@type": "Organization",
        "name": "Prépa ATSEM",
        "url": "https://www.prepa-atsem.fr",
        "logo": "https://www.prepa-atsem.fr/logo.png",
        "description": "Plateforme de préparation au concours ATSEM (Agent Territorial Spécialisé des Écoles Maternelles)."
      },
      {
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.r }
        }))
      },
      ...regionsActives.map(r => ({
        "@type": "Event",
        "name": `Concours ATSEM 2026 — ${r.nom}`,
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
    <div className="min-h-screen" style={{ background: '#faf8ff', color: '#1a1325', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        .cal-wrap { position: relative; padding: 56px 0 80px; min-height: 100vh; }
        .cal-inner { max-width: 1180px; margin: 0 auto; padding: 0 48px; }
        .cal-wrap::before {
          content: '';
          position: absolute; inset: 0;
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
        .cal-wrap > * { position: relative; }

        /* HERO */
        .cal-hero { margin-bottom: 56px; max-width: 920px; }
        .cal-hero h1 { font-size: 64px; font-weight: 900; line-height: 1.02; margin: 0 0 20px; letter-spacing: -0.03em; color: #1a1325; }
        .cal-hero h1 em {
          font-style: normal;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .cal-hero p { font-size: 18px; line-height: 1.5; color: #5e5270; margin: 0; max-width: 680px; }
        .cal-hero-meta { display: flex; gap: 10px; margin-top: 28px; flex-wrap: wrap; font-size: 13px; font-weight: 700; }
        .cal-hero-meta span {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 999px;
          background: white; border: 1px solid #ece9f0; color: #3a2f4a;
        }
        .cal-hero-meta b { font-weight: 900; }
        .cal-hero-meta span:nth-child(1) b { color: #8b5cf6; }
        .cal-hero-meta span:nth-child(2) b { color: #ec4899; }
        .cal-hero-meta span:nth-child(3) b { color: #f59e0b; }

        /* SECTION HEAD */
        .cal-section { margin-bottom: 48px; }
        .cal-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .cal-section-title {
          font-size: 13px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase; color: #6b5b8e;
          display: flex; align-items: center; gap: 10px;
        }
        .cal-section-title svg { width: 16px; height: 16px; color: #8b5cf6; }

        /* TIMELINE */
        .cal-timeline-card { background: white; border: 1px solid #ece9f0; border-radius: 28px; padding: 44px 40px 36px; position: relative; overflow: hidden; }
        .cal-timeline-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(139,92,246,0.06), transparent 50%), radial-gradient(circle at 100% 100%, rgba(236,72,153,0.05), transparent 50%);
          pointer-events: none;
        }
        .cal-timeline { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .cal-timeline::before {
          content: ''; position: absolute; top: 28px; left: 10%; right: 10%; height: 3px;
          background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 28%, #f43f5e 52%, #f59e0b 76%, #10b981 100%);
          border-radius: 999px; opacity: 0.6; z-index: 0;
        }
        .cal-tl-step { position: relative; text-align: center; z-index: 1; padding: 0 6px; }
        .cal-tl-meta { min-height: 56px; display: flex; flex-direction: column; justify-content: flex-start; margin-bottom: 8px; }
        .cal-tl-dot {
          width: 56px; height: 56px; border-radius: 14px;
          background: white; border: 3px solid currentColor;
          display: grid; place-items: center; margin: 0 auto 30px;
          font-size: 18px; font-weight: 900;
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
        .cal-tl-month { font-size: 26px; font-weight: 900; letter-spacing: -0.025em; color: #1a1325; line-height: 1.05; margin-bottom: 4px; }
        .cal-tl-year { font-size: 13px; font-weight: 800; color: #8b7ea3; margin-bottom: 0; }
        .cal-tl-label {
          display: inline-block; font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 5px 11px; border-radius: 999px;
          background: currentColor; margin-bottom: 8px;
        }
        .cal-tl-label span { color: white; }
        .cal-tl-detail { font-size: 12px; font-weight: 600; color: #5e5270; line-height: 1.4; }
        .cal-tl-1 { color: #8b5cf6; } .cal-tl-2 { color: #ec4899; } .cal-tl-3 { color: #f43f5e; } .cal-tl-4 { color: #f59e0b; } .cal-tl-5 { color: #10b981; }

        /* Étape en cours : losange légèrement agrandi + pulse subtil */
        .cal-tl-current .cal-tl-dot {
          transform: rotate(45deg) scale(1.18) translateY(-3px);
          box-shadow: 0 12px 28px -8px currentColor;
          animation: cal-tl-pulse 2.4s ease-in-out infinite;
        }
        .cal-tl-current:hover .cal-tl-dot { transform: rotate(45deg) scale(1.25) translateY(-4px); }
        .cal-tl-current .cal-tl-dot::after { opacity: 0.2; }
        .cal-tl-current .cal-tl-month { color: currentColor; }
        .cal-tl-current .cal-tl-label { box-shadow: 0 4px 12px -3px currentColor; }
        @keyframes cal-tl-pulse {
          0%, 100% { box-shadow: 0 12px 28px -8px currentColor; }
          50% { box-shadow: 0 12px 36px -4px currentColor; }
        }
        @media (max-width: 1100px) {
          .cal-tl-current .cal-tl-dot { transform: rotate(45deg) scale(1.15); }
          .cal-tl-current:hover .cal-tl-dot { transform: rotate(45deg) scale(1.22); }
        }

        /* MAP */
        .cal-map-wrap { display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; align-items: stretch; }
        .cal-map-card, .cal-map-info { background: white; border: 1px solid #ece9f0; border-radius: 24px; padding: 32px; }
        .cal-map-card { display: flex; flex-direction: column; align-items: center; }
        .cal-map-svg { width: 100%; max-width: 460px; }
        .cal-region-path { transition: fill 0.2s; cursor: pointer; outline: none; }
        .cal-region-path.active { fill: #c4b5fd; stroke: white; stroke-width: 1.5; }
        .cal-region-path.active:hover, .cal-region-path.active.selected { fill: #8b5cf6; }
        .cal-region-path.inactive { fill: #e5e1ed; stroke: white; stroke-width: 1.5; }
        .cal-region-path.inactive:hover, .cal-region-path.inactive.selected { fill: #cbc5d6; }

        /* Détail région dans le panneau */
        .cal-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
        .cal-detail-close {
          width: 32px; height: 32px; border-radius: 8px;
          background: #f3efff; color: #6b5b8e;
          display: grid; place-items: center;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .cal-detail-close:hover { background: #1a1325; color: white; }
        .cal-detail-close svg { width: 16px; height: 16px; }
        .cal-detail-dates { background: #faf8ff; border: 1px solid #ece9f0; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; }
        .cal-detail-date-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; }
        .cal-detail-date-row + .cal-detail-date-row { border-top: 1px dashed #ece9f0; }
        .cal-detail-date-row span { color: #6b5b8e; font-weight: 600; }
        .cal-detail-date-row b { color: #1a1325; font-weight: 800; text-align: right; }
        .cal-detail-subtitle { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #6b5b8e; margin: 0 0 10px; }
        .cal-detail-cdg { list-style: none; padding: 0; margin: 0 0 18px; }
        .cal-detail-cdg li { background: white; border: 1px solid #ece9f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 6px; font-size: 13px; }
        .cal-detail-cdg li b { display: block; color: #1a1325; font-weight: 800; margin-bottom: 2px; }
        .cal-detail-cdg li .cal-deps { display: block; color: #8b7ea3; font-size: 11px; font-weight: 600; margin-bottom: 4px; }
        .cal-detail-cdg li a { color: #8b5cf6; font-weight: 700; font-size: 12px; }
        .cal-detail-cdg li a:hover { text-decoration: underline; }
        .cal-detail-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #1a1325; color: white;
          padding: 12px 16px; border-radius: 12px;
          font-weight: 800; font-size: 13px;
          transition: background 0.15s;
        }
        .cal-detail-cta:hover { background: #2d1b4e; }
        .cal-detail-cta svg { width: 16px; height: 16px; }
        .cal-region-name-display { text-align: center; height: 36px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; }
        .cal-pill { padding: 7px 16px; border-radius: 999px; font-size: 13px; font-weight: 800; }
        .cal-pill.active { background: #ede9fe; color: #6b21a8; }
        .cal-pill.inactive { background: #f3f0f7; color: #6b5b8e; }
        .cal-pill.empty { background: transparent; color: #b5acc4; font-weight: 600; }
        .cal-legend { display: flex; gap: 18px; margin-top: 16px; font-size: 12px; font-weight: 700; color: #5e5270; }
        .cal-legend-item { display: flex; align-items: center; gap: 8px; }
        .cal-legend-swatch { width: 14px; height: 14px; border-radius: 4px; }
        .cal-map-info h2 { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; margin: 0 0 8px; color: #1a1325; }
        .cal-map-info > p { font-size: 14px; color: #5e5270; line-height: 1.55; margin: 0 0 22px; }
        .cal-info-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 22px; }
        .cal-info-stat { background: linear-gradient(135deg, #f3efff, #faf8ff); border: 1px solid #ece9f0; border-radius: 14px; padding: 14px 16px; }
        .cal-info-stat b { display: block; font-size: 26px; font-weight: 900; color: #1a1325; letter-spacing: -0.02em; }
        .cal-info-stat span { font-size: 11px; font-weight: 700; color: #8b7ea3; letter-spacing: 0.08em; text-transform: uppercase; }
        .cal-alert {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 14px 16px;
          font-size: 13px; color: #92400e; font-weight: 600; line-height: 1.45;
          display: flex; align-items: flex-start; gap: 10px;
        }
        .cal-alert svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; color: #d97706; }

        /* REGIONS GRID — style "dark" (actives en sombre) */
        .cal-regions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        .cal-region-card {
          background: white; border: 1px solid #ece9f0; border-radius: 20px;
          padding: 22px 26px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          position: relative; scroll-margin-top: 100px;
        }
        .cal-region-card.active {
          background: linear-gradient(160deg, #1a1325 0%, #2d1b4e 100%);
          border-color: transparent; color: white;
        }
        .cal-region-card.active h3 { color: white; }
        .cal-region-card.inactive { background: #f8fafc; }
        .cal-region-card:hover { transform: translateY(-4px); box-shadow: 0 30px 50px -20px rgba(26,19,37,0.4); }
        .cal-region-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .cal-region-card-head h3 { font-size: 18px; font-weight: 900; margin: 0; letter-spacing: -0.01em; color: #1a1325; }
        .cal-badge { font-size: 10px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; padding: 5px 10px; border-radius: 999px; white-space: nowrap; }
        .cal-region-card.active .cal-badge.active { background: rgba(139,92,246,0.3); color: #d4c5ff; }
        .cal-region-card.inactive .cal-badge.inactive { background: #f3f0f7; color: #6b5b8e; }
        .cal-region-card .cal-meta-line { font-size: 12px; color: #8b7ea3; margin: 0 0 12px; font-weight: 600; }
        .cal-region-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
          padding: 5px 10px; border-radius: 999px;
          background: rgba(139,92,246,0.12); color: #6b21a8;
          margin: 0 0 10px;
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .cal-region-link:hover { background: rgba(139,92,246,0.22); transform: translateX(2px); }
        .cal-region-link svg { width: 12px; height: 12px; }
        .cal-region-link b { font-weight: 800; }
        .cal-region-card.active .cal-region-link {
          background: rgba(196,181,253,0.18); color: #d4c5ff;
        }
        .cal-region-card.active .cal-region-link:hover { background: rgba(196,181,253,0.28); color: white; }
        .cal-region-card.active .cal-meta-line { color: #b8a9d1; }
        .cal-region-card .cal-note { font-size: 12px; color: #92400e; background: #fffbeb; padding: 8px 12px; border-radius: 10px; margin: 0 0 12px; font-style: italic; }
        .cal-cdg-list { list-style: none; padding: 0; margin: 0; }
        .cal-cdg-list li { font-size: 13px; color: #3a2f4a; padding: 6px 0; border-top: 1px dashed #ece9f0; line-height: 1.45; }
        .cal-cdg-list li:first-child { border-top: 0; }
        .cal-cdg-list b { color: #1a1325; font-weight: 800; }
        .cal-cdg-list .cal-deps { color: #8b7ea3; font-weight: 600; }
        .cal-cdg-list a { color: #8b5cf6; font-weight: 700; }
        .cal-cdg-list a:hover { text-decoration: underline; }
        .cal-region-card.active .cal-cdg-list li { color: #d4c5ff; border-top-color: rgba(255,255,255,0.1); }
        .cal-region-card.active .cal-cdg-list b { color: white; }
        .cal-region-card.active .cal-cdg-list .cal-deps { color: #9b8cba; }
        .cal-region-card.active .cal-cdg-list a { color: #c4b5fd; }

        /* FAQ — style lines */
        .cal-faq-card { background: white; border: 1px solid #ece9f0; border-radius: 24px; padding: 32px 36px; }
        .cal-faq-card > h2 { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; margin: 0 0 6px; }
        .cal-faq-card > p { font-size: 14px; color: #5e5270; margin: 0 0 20px; }
        .cal-faq details { border-top: 1px solid #ece9f0; padding: 18px 0; }
        .cal-faq details:last-of-type { border-bottom: 1px solid #ece9f0; }
        .cal-faq summary {
          cursor: pointer; list-style: none;
          display: flex; align-items: center; justify-content: space-between;
          font-weight: 800; font-size: 15px; color: #1a1325;
          transition: color 0.15s;
        }
        .cal-faq summary::-webkit-details-marker { display: none; }
        .cal-faq summary:hover { color: #8b5cf6; }
        .cal-faq summary svg { width: 18px; height: 18px; color: #8b7ea3; transition: transform 0.2s; flex-shrink: 0; }
        .cal-faq details[open] summary svg { transform: rotate(180deg); color: #8b5cf6; }
        .cal-faq details p { margin: 14px 0 0; font-size: 14px; color: #5e5270; line-height: 1.6; }

        /* CTA */
        .cal-cta {
          background: linear-gradient(160deg, #1a1325 0%, #2d1b4e 100%);
          border-radius: 24px; padding: 36px 36px; color: white; text-align: center;
          position: relative; overflow: hidden; max-width: 720px; margin: 0 auto;
        }
        .cal-cta::before { content: ''; position: absolute; width: 320px; height: 320px; right: -80px; top: -100px; background: radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%); pointer-events: none; }
        .cal-cta::after  { content: ''; position: absolute; width: 240px; height: 240px; left: -80px; bottom: -90px; background: radial-gradient(circle, rgba(236,72,153,0.30), transparent 70%); pointer-events: none; }
        .cal-cta-inner { position: relative; }
        .cal-cta h2 { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; margin: 0 0 10px; line-height: 1.15; }
        .cal-cta h2 em {
          font-style: normal;
          background: linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 50%, #fcd34d 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .cal-cta p { color: #b8a9d1; font-size: 14px; margin: 0 0 22px; line-height: 1.55; }
        .cal-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: #1a1325; padding: 11px 20px; border-radius: 999px;
          font-weight: 800; font-size: 13px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cal-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgba(0,0,0,0.4); }
        .cal-cta-btn svg { width: 16px; height: 16px; }

        @media (max-width: 1100px) {
          .cal-wrap { padding: 40px 0 60px; }
          .cal-inner { padding: 0 32px; }
          .cal-map-wrap { grid-template-columns: minmax(0, 1fr); }
          .cal-regions-grid { grid-template-columns: minmax(0, 1fr); }
          .cal-region-card { min-width: 0; overflow: hidden; }
          .cal-cdg-list li { overflow-wrap: anywhere; }
          .cal-timeline { grid-template-columns: 1fr; gap: 28px; }
          .cal-timeline::before {
            top: 0; bottom: 0; left: 27px; right: auto;
            width: 3px; height: auto;
            background: linear-gradient(180deg, #8b5cf6 0%, #ec4899 25%, #f43f5e 50%, #f59e0b 75%, #10b981 100%);
          }
          .cal-tl-step { text-align: left; padding-left: 80px; }
          .cal-tl-dot { position: absolute; left: 0; top: 0; margin: 0; }
          .cal-tl-meta { min-height: 0; margin-bottom: 2px; }
          .cal-tl-month { margin-bottom: 0; line-height: 1.1; }
        }
        @media (max-width: 720px) {
          .cal-wrap { padding: 28px 0 56px; }
          .cal-inner { padding: 0 18px; }
          .cal-hero h1 { font-size: 36px; }
          .cal-hero p { font-size: 16px; }
          .cal-timeline-card { padding: 28px 22px; }
          .cal-faq-card { padding: 24px 22px; }
          .cal-cta { padding: 32px 22px; }
          .cal-cta h2 { font-size: 22px; }
          .cal-region-card { padding: 18px 20px; }
          .cal-region-link { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .cal-map-card, .cal-map-info { padding: 22px 18px; }
          .cal-detail-cdg li { padding: 10px 12px; }
        }
      `}</style>

      {/* ─── NAVBAR (existante, conservée) ─── */}
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
                {!authLoading && (user ? (
                  <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 text-center">Mon espace</a>
                ) : (
                  <>
                    <a href="/login" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Connexion</a>
                    <a href="/signup" className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 transition text-center">Inscription</a>
                  </>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── CONTENU NEW DESIGN ─── */}
      <div className="cal-wrap">
       <div className="cal-inner">

        {/* HERO */}
        <header className="cal-hero">
          <h1>Le calendrier du <em>concours ATSEM 2026</em>, par région et par CDG.</h1>
          <p>Toutes les dates clés, les CDG organisateurs et les départements rattachés.<br/>Cliquez sur votre région pour voir le détail.</p>
          <div className="cal-hero-meta">
            <span><b>{nb2026}</b> régions organisatrices</span>
            <span><b>{nbCdg}</b> CDG en 2026</span>
            <span><b>~2 500</b> postes attendus</span>
          </div>
        </header>

        {/* TIMELINE */}
        <section className="cal-section">
          <div className="cal-section-head">
            <div className="cal-section-title">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Dates nationales 2026
            </div>
          </div>
          <div className="cal-timeline-card">
            <div className="cal-timeline">
              {TIMELINE_STEPS.map((s, i) => (
                <div className={`cal-tl-step ${s.cls} ${i === currentStepIdx ? 'cal-tl-current' : ''}`} key={i}>
                  <div className="cal-tl-dot"><span>{s.num}</span></div>
                  <div className="cal-tl-label"><span>{s.label}</span></div>
                  <div className="cal-tl-meta">
                    <div className="cal-tl-month">{s.month}</div>
                    {s.year && <div className="cal-tl-year">{s.year}</div>}
                  </div>
                  <div className="cal-tl-detail">{s.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARTE */}
        <section className="cal-section">
          <div className="cal-section-head">
            <div className="cal-section-title">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              Carte des régions
            </div>
          </div>
          <div className="cal-map-wrap">
            <div className="cal-map-card">
              <div className="cal-region-name-display">
                {hoveredData ? (
                  <span className={`cal-pill ${hoveredData.concours_2026 ? 'active' : 'inactive'}`}>
                    {hoveredData.nom}{!hoveredData.concours_2026 && ' — 2027'}
                  </span>
                ) : (
                  <span className="cal-pill empty">Survolez une région</span>
                )}
              </div>
              {mounted && (
                <svg viewBox={FranceMap.viewBox} className="cal-map-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte des régions de France">
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
                          <title>{region?.nom || location.name}{!active ? ' — Prochain concours : 2027' : ''}</title>
                        </path>
                      </a>
                    )
                  })}
                </svg>
              )}
              <div className="cal-legend">
                <div className="cal-legend-item"><span className="cal-legend-swatch" style={{background:'#c4b5fd'}}></span> Concours 2026</div>
                <div className="cal-legend-item"><span className="cal-legend-swatch" style={{background:'#e5e1ed'}}></span> Non organisé en 2026</div>
              </div>
            </div>

            <div className="cal-map-info">
              {selectedData ? (
                <>
                  <div className="cal-detail-head">
                    <div>
                      <span className={`cal-badge ${selectedData.concours_2026 ? 'active' : 'inactive'}`}>
                        {selectedData.concours_2026 ? 'Concours 2026' : 'Prochain : 2027'}
                      </span>
                      <h2 style={{marginTop: 8}}>{selectedData.nom}</h2>
                    </div>
                    <button onClick={() => setSelectedRegion(null)} className="cal-detail-close" aria-label="Fermer">
                      <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  {selectedData.concours_2026 && (
                    <div className="cal-detail-dates">
                      <div className="cal-detail-date-row"><span>Inscriptions</span><b>{DATES_NATIONALES.inscription_debut} → {DATES_NATIONALES.inscription_fin}</b></div>
                      <div className="cal-detail-date-row"><span>Dépôt dossier</span><b>{DATES_NATIONALES.depot_dossier}</b></div>
                      <div className="cal-detail-date-row"><span>Épreuves écrites</span><b>{DATES_NATIONALES.epreuves_ecrites}</b></div>
                      <div className="cal-detail-date-row"><span>Oraux</span><b>{DATES_NATIONALES.epreuves_orales}</b></div>
                    </div>
                  )}

                  {selectedData.note && <p className="cal-note" style={{marginBottom: 16}}>{selectedData.note}</p>}

                  <h3 className="cal-detail-subtitle">CDG organisateurs</h3>
                  <ul className="cal-detail-cdg">
                    {selectedData.cdg_organisateurs.map((c, i) => (
                      <li key={i}>
                        <b>{c.nom}</b>
                        <span className="cal-deps">{c.departements.join(', ')}</span>
                        {c.site && <a href={c.site} target="_blank" rel="noopener noreferrer">Site officiel →</a>}
                      </li>
                    ))}
                  </ul>

                  {selectedData.concours_2026 && (
                    <a href="https://www.concours-territorial.fr" target="_blank" rel="noopener noreferrer" className="cal-detail-cta">
                      S'inscrire sur concours-territorial.fr
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                  )}
                </>
              ) : (
                <>
                  <h2>Comment ça marche ?</h2>
                  <p>Le concours ATSEM est organisé par les <b>Centres de Gestion (CDG)</b> de la Fonction Publique Territoriale, regroupés par région. Tous les CDG n'organisent pas le concours chaque année.</p>
                  <div className="cal-info-stats">
                    <div className="cal-info-stat">
                      <b>{nb2026}<span style={{fontSize:14, fontWeight:700, color:'#8b7ea3'}}>/13</span></b>
                      <span>Régions en 2026</span>
                    </div>
                    <div className="cal-info-stat">
                      <b>~3%</b>
                      <span>Taux de réussite</span>
                    </div>
                  </div>
                  <div className="cal-alert">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                    <span>Inscriptions clôturées à minuit le dernier jour. Un dossier incomplet = candidature refusée.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* LISTE COMPLETE DES REGIONS */}
        <section className="cal-section">
          <div className="cal-section-head">
            <div className="cal-section-title">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
              Toutes les régions et leurs CDG
            </div>
          </div>
          <div className="cal-regions-grid">
            {REGIONS.map((r) => {
              const linkedId = REGION_LINKS[r.id]
              const linked = linkedId ? REGIONS.find(x => x.id === linkedId) : null
              return (
              <article
                key={r.id}
                id={r.id}
                className={`cal-region-card ${r.concours_2026 ? 'active' : 'inactive'}`}
              >
                <div className="cal-region-card-head">
                  <h3>{r.nom}</h3>
                  <span className={`cal-badge ${r.concours_2026 ? 'active' : 'inactive'}`}>
                    {r.concours_2026 ? 'Concours 2026' : 'Prochain : 2027'}
                  </span>
                </div>
                {linked && (
                  <a href={`#${linked.id}`} className="cal-region-link">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    Organisation conjointe avec <b>{linked.nom}</b>
                  </a>
                )}
                {r.concours_2026 && (
                  <p className="cal-meta-line">
                    Inscriptions {DATES_NATIONALES.inscription_debut} → {DATES_NATIONALES.inscription_fin} · Écrits {DATES_NATIONALES.epreuves_ecrites}
                  </p>
                )}
                {r.note && !linked && <p className="cal-note">{r.note}</p>}
                <ul className="cal-cdg-list">
                  {r.cdg_organisateurs.map((c, i) => (
                    <li key={i}>
                      <b>{c.nom}</b> <span className="cal-deps">— {c.departements.join(', ')}</span>
                      {c.site && <> · <a href={c.site} target="_blank" rel="noopener noreferrer">site officiel</a></>}
                    </li>
                  ))}
                </ul>
              </article>
              )
            })}
            {/* Outre-Mer */}
            <article className="cal-region-card inactive" id="outre-mer">
              <div className="cal-region-card-head">
                <h3>Outre-Mer</h3>
                <span className="cal-badge inactive">Concours 2026 (calendrier propre)</span>
              </div>
              <ul className="cal-cdg-list">
                {OUTRE_MER.map((dom, i) => (
                  <li key={i}>
                    <b>{dom.cdg}</b> <span className="cal-deps">— {dom.nom}</span> · inscriptions du {dom.inscription_debut} au {dom.inscription_fin}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* FAQ */}
        <section className="cal-section">
          <div className="cal-section-head">
            <div className="cal-section-title">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Questions fréquentes
            </div>
          </div>
          <div className="cal-faq-card">
            <h2>Tout savoir sur le concours 2026</h2>
            <p>Les réponses aux questions les plus posées sur les dates, les CDG et l'inscription.</p>
            <div className="cal-faq">
              {FAQ_ITEMS.map((f, i) => (
                <details key={i}>
                  <summary>
                    <span>{f.q}</span>
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                  </summary>
                  <p>{f.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cal-section" style={{marginBottom:0}}>
          <div className="cal-cta">
            <div className="cal-cta-inner">
              <h2>Le concours ATSEM, c'est <em>3% de taux d'admission</em>.</h2>
              <p>Plus de 80 000 candidats pour environ 2 500 postes.<br/>Préparez-vous sérieusement dès maintenant.</p>
              <a className="cal-cta-btn" href="/auth">
                Commencer ma préparation
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </section>
       </div>
      </div>

      {/* ─── FOOTER (existant, conservé) ─── */}
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
