'use client'
import { useState, useEffect, useRef } from 'react'

// Accueil du site public : refonte reprise du design Prépa FPC, contenus
// adaptés au concours ATSEM (bascule de juillet 2026).

// ---- Les entraînements et thèmes affichés dans la pile du hero ----

const MODULES = [
  // Liste cochée
  { label: 'QCM thématiques', bg: 'linear-gradient(145deg, #a855f7, #9333ea)', ink: '#ffffff', accent: '#9333ea', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg> },
  // Goutte d'eau
  { label: 'Hygiène & propreté', bg: 'linear-gradient(145deg, #67e8f9, #22d3ee)', ink: '#083344', accent: '#0eb5d4', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg> },
  // Pousse qui grandit
  { label: "Développement de l'enfant", bg: 'linear-gradient(145deg, #f9a8d4, #f472b6)', ink: '#500724', accent: '#ec4899', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg> },
  // Pomme
  { label: 'Nutrition', bg: 'linear-gradient(145deg, #bef264, #a3e635)', ink: '#1a2e05', accent: '#65a30d', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg> },
  // Livre ouvert
  { label: 'Annales corrigées', bg: 'linear-gradient(145deg, #cbd5e1, #94a3b8)', ink: '#0f172a', accent: '#64748b', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  // Chronomètre
  { label: 'Examen blanc', bg: 'linear-gradient(145deg, #fcd34d, #fbbf24)', ink: '#451a03', accent: '#e5a50c', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/></svg> },
  // Micro
  { label: 'Oral', bg: 'linear-gradient(145deg, #6ee7b7, #34d399)', ink: '#064e3b', accent: '#10b981', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg> },
  // Cubes de construction
  { label: 'Pédagogie', bg: 'linear-gradient(145deg, #a5b4fc, #818cf8)', ink: '#1e1b4b', accent: '#6366f1', icon: (c) => <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="7" height="7" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/></svg> },
]

// ---- Composants animés ----

// Pile d'icônes animée du hero : la carte du dessus s'envole, la suivante prend sa place
function AppLogoStack({ onChange }) {
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const indexRef = useRef(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaving(true)
      // Notifier dès le début de l'envol : la bascule du titre (840 ms, couleur
      // changée à mi-course = 420 ms) tombe pile quand la nouvelle tuile apparaît
      const next = (indexRef.current + 1) % MODULES.length
      onChangeRef.current?.(MODULES[next])
      setTimeout(() => { indexRef.current = next; setIndex(next); setLeaving(false) }, 420)
    }, 2400)
    return () => clearInterval(interval)
  }, [])
  const mod = MODULES[index]
  return (
    <div className="relative w-[88px] h-[88px] mx-auto" aria-hidden="true">
      <div className="absolute inset-0 rounded-[24px] bg-[#ececec]" style={{transform: 'translateY(-14px) scale(0.84)'}}></div>
      <div className="absolute inset-0 rounded-[24px] bg-[#f7f7f7] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" style={{transform: 'translateY(-7px) scale(0.92)'}}></div>
      <div
        key={index}
        className="tuile-entree absolute inset-0 rounded-[24px] flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.14)]"
        style={{
          background: mod.bg,
          transition: leaving ? 'transform 0.42s cubic-bezier(0.55,0.06,0.68,0.19), opacity 0.42s cubic-bezier(0.55,0.06,0.68,0.19)' : 'none',
          transform: leaving ? 'translateY(-34px) scale(0.9)' : undefined,
          opacity: leaving ? 0 : undefined,
        }}
      >
        {mod.icon(mod.ink)}
      </div>
    </div>
  )
}

// La nouvelle couleur balaie le mot de gauche à droite : une copie du mot,
// colorée et rognée par clip-path, se déploie par-dessus l'ancienne couleur.
// `delai` et `duree` permettent d'enchaîner plusieurs mots en un seul
// mouvement continu (le balayage du second démarre quand le premier finit).
function FlipWord({ color, delai = 420, duree = 300, courbe, children }) {
  const prevRef = useRef(color)
  const [etat, setEtat] = useState({ base: color, balayage: null, key: 0 })
  useEffect(() => {
    if (color === prevRef.current) return
    const nouvelle = color
    prevRef.current = color
    let t2
    const t1 = setTimeout(() => {
      setEtat(e => ({ ...e, balayage: nouvelle, key: e.key + 1 }))
      t2 = setTimeout(() => setEtat(e => ({ ...e, base: nouvelle, balayage: null })), duree)
    }, delai)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [color, delai, duree])
  return (
    <span className="relative inline-block" style={{ color: etat.base }}>
      {children}
      {etat.balayage && (
        <span key={etat.key} aria-hidden="true" className="balaye-mot absolute inset-0" style={{ color: etat.balayage, animationDuration: `${duree}ms`, animationTimingFunction: courbe }}>{children}</span>
      )}
    </span>
  )
}

// Mini-aperçu d'interface pour chaque module du zigzag (fenêtre d'app factice)
function ApercuModule({ i, bord, teinte, titre, badgeFenetre }) {
  // Compte à rebours réel pour les modules chronométrés (annales, examen blanc)
  const depart = i === 1 ? 41 * 60 + 26 : 32 * 60 + 12
  const dureeTotale = 45 * 60
  const accentChrono = i === 1 ? '#60a5fa' : '#facc15'
  const [tempsRestant, setTempsRestant] = useState(depart)
  useEffect(() => {
    if (i !== 1 && i !== 2) return
    const t = setInterval(() => setTempsRestant(s => (s <= 0 ? depart : s - 1)), 1000)
    return () => clearInterval(t)
  }, [i, depart])
  const chrono = `${String(Math.floor(tempsRestant / 60)).padStart(2, '0')}:${String(tempsRestant % 60).padStart(2, '0')}`
  return (
    <div className="max-w-sm mx-auto rounded-2xl overflow-hidden bg-white ring-1 ring-black/10 transition-transform duration-300 hover:-translate-y-1.5" style={{boxShadow: `0 18px 45px ${bord}2e`}}>
      {/* Barre de fenêtre — les modules chronométrés ont le vrai chrono d'épreuve sur fond sombre */}
      {i === 1 || i === 2 ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a]">
          <span className="text-[11px] font-bold text-white">{titre}</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-1000" style={{width: `${(tempsRestant / dureeTotale) * 100}%`, background: accentChrono}}></div>
            </div>
            <svg className="w-7 h-4 heartbeat-anim" viewBox="0 0 80 24" fill="none" stroke={accentChrono} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{strokeDasharray: 200, strokeDashoffset: 0}}><polyline points="0,12 15,12 20,12 25,2 30,22 35,6 40,18 45,12 50,12 55,12 60,12 65,8 68,16 70,12 80,12"/></svg>
            <span className="text-[13px] font-black text-white tabular-nums">{chrono}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-4 py-2.5" style={{background: teinte}}>
          <span className="w-2 h-2 rounded-full" style={{background: `${bord}55`}}></span>
          <span className="w-2 h-2 rounded-full" style={{background: `${bord}55`}}></span>
          <span className="ml-2 text-[11px] font-bold" style={{color: bord}}>{titre}</span>
          <span className="ml-auto text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{background: bord}}>{badgeFenetre}</span>
        </div>
      )}
      {/* Corps selon le module */}
      <div className="p-5">
        {i === 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-black/70">Question 3/10</span>
              <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-md" style={{background: teinte, color: bord}}>Hygiène</span>
            </div>
            <div className="h-1 rounded-full bg-black/[0.07] mb-3.5 overflow-hidden"><div className="h-full rounded-full" style={{width: '30%', background: bord}}></div></div>
            <p className="text-[11px] font-bold text-black/75 leading-snug mb-3">Quelle est la température maximale réglementaire d&apos;un réfrigérateur destiné aux denrées périssables&nbsp;?</p>
            <div className="space-y-2 mb-3">
              {[['0 °C', false], ['+4 °C', true], ['+8 °C', false], ['+10 °C', false]].map(([opt, sel], j) => (
                <div key={j} className="h-8 rounded-lg flex items-center justify-between px-3 text-[11px] font-bold" style={sel ? {border: `1.5px solid ${bord}`, background: teinte, color: bord} : {border: '1.5px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.6)'}}>
                  {opt}
                  <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={sel ? {border: `1.5px solid ${bord}`} : {border: '1.5px solid rgba(0,0,0,0.2)'}}>
                    {sel && <span className="w-1.5 h-1.5 rounded-full" style={{background: bord}}></span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white" style={{background: bord}}>Valider ✓</div>
          </div>
        )}
        {i === 1 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{background: bord}}>7</span>
                <span className="text-[11px] font-extrabold text-black/80">Annale CDG de la Manche · 2023</span>
              </div>
              <span className="text-[11px] font-extrabold text-black/70">7/20</span>
            </div>
            <div className="rounded-md px-2.5 py-2 mb-3 text-[9.5px] font-medium text-black/60 leading-snug" style={{background: teinte, borderLeft: `3px solid ${bord}`}}>Cochez toutes les bonnes réponses. Une seule erreur annule la question.</div>
            <p className="text-[10px] font-bold text-black/75 leading-snug mb-2">Parmi ces missions, lesquelles relèvent de l&apos;ATSEM&nbsp;?</p>
            <div className="space-y-1.5">
              {[['Assister l\'enseignant pendant les activités', true], ['Assurer la propreté des locaux et du matériel', true], ['Concevoir seul le programme pédagogique', false], ['Accompagner les enfants pendant la sieste', true]].map(([opt, coche], j) => (
                <div key={j} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg ring-1 ring-black/[0.07]">
                  <span className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0" style={coche ? {background: bord} : {border: '1.5px solid rgba(0,0,0,0.2)'}}>
                    {coche && <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  </span>
                  <span className="text-[9.5px] font-bold text-black/65 leading-tight">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {i === 2 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-black/10">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background: bord}}>✓</span>
              <span className="text-xs font-bold text-black/70">Sujet généré par IA</span>
              <span className="ml-auto text-[10px] font-bold text-black/40">20 questions</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg p-3" style={{border: `1.5px solid ${bord}`, background: teinte}}>
              <span className="w-6 h-6 rounded-full ring-1 ring-black/15 bg-white flex items-center justify-center text-xs">✍️</span>
              <span className="text-xs font-bold text-black/70">Question 12/20</span>
              <span className="ml-auto text-[10px] font-bold" style={{color: bord}}>en cours</span>
            </div>
            <div className="h-2 rounded-full bg-black/[0.08] overflow-hidden"><div className="h-full rounded-full" style={{width: '60%', background: bord}}></div></div>
            <div className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-black/10 opacity-60">
              <span className="w-6 h-6 rounded-full ring-1 ring-black/15 bg-white flex items-center justify-center text-xs">🏁</span>
              <span className="text-xs font-bold text-black/70">Note /20 et correction</span>
              <span className="ml-auto text-[10px] font-bold text-black/40">à venir</span>
            </div>
          </div>
        )}
        {i === 3 && (
          <div className="text-center">
            <div className="rounded-xl p-3.5 mb-7 text-left" style={{background: teinte}}>
              <p className="text-[11px] font-bold leading-snug" style={{color: bord}}>«&nbsp;Un enfant refuse de manger à la cantine&nbsp;: que faites-vous&nbsp;?&nbsp;»</p>
            </div>
            <div className="relative inline-flex items-center justify-center mb-6">
              <span className="micro-pulse absolute w-16 h-16 rounded-full" style={{background: `${bord}22`}}></span>
              <span className="micro-pulse-retard absolute w-12 h-12 rounded-full" style={{background: `${bord}33`}}></span>
              <span className="micro-beat relative w-9 h-9 rounded-full flex items-center justify-center" style={{background: bord}}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              </span>
            </div>
            <p className="text-[10px] font-bold text-black/40">Répondez à voix haute, puis passez à la suivante</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Nuage de petits points qui flottent derrière le hero
function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf, w, h
    const dots = []
    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio
      h = canvas.height = canvas.offsetHeight * devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)
    const N = Math.round((canvas.offsetWidth * canvas.offsetHeight) / 14000)
    for (let i = 0; i < N; i++) {
      dots.push({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.6 + 0.8) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        violet: Math.random() < 0.12,
        phase: Math.random() * Math.PI * 2,
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const t = performance.now() / 1000
      for (const d of dots) {
        d.x += d.vx + Math.sin(t * 0.6 + d.phase) * 0.12 * devicePixelRatio
        d.y += d.vy + Math.cos(t * 0.5 + d.phase) * 0.1 * devicePixelRatio
        if (d.x < -10) d.x = w + 10; if (d.x > w + 10) d.x = -10
        if (d.y < -10) d.y = h + 10; if (d.y > h + 10) d.y = -10
        const tw = 0.5 + 0.5 * Math.sin(t * 1.2 + d.phase * 2)
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = d.violet ? `rgba(147,51,234,${0.25 + tw * 0.3})` : `rgba(13,13,13,${0.10 + tw * 0.14})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{maskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 100%)'}} />
}

const FAQ_DATA = [
  { q: "Quelles sont les conditions pour passer le concours ATSEM externe ?", a: "Le concours externe est ouvert aux titulaires du CAP AEPE (ex CAP Petite Enfance) ou d'un diplôme équivalent, sans aucune expérience professionnelle exigée. Les parents de 3 enfants et les sportifs de haut niveau sont dispensés de diplôme." },
  { q: "En quoi consiste l'épreuve écrite ?", a: "Un QCM de 20 questions à résoudre en 45 minutes, couvrant les 6 familles thématiques du concours : environnement institutionnel, hygiène, santé, pédagogie, relations professionnelles et calculs." },
  { q: "Comment se déroule l'épreuve orale ?", a: "L'oral d'admission dure 15 minutes : un entretien avec un jury qui évalue vos motivations, vos connaissances du métier et votre aptitude au travail en équipe, avec des mises en situation fréquentes. C'est l'épreuve la plus importante du concours, avec un coefficient 2 contre 1 pour l'écrit : il faut donc s'y préparer sérieusement." },
  { q: "La plateforme est-elle adaptée aux débutantes ?", a: "Absolument ! Nos QCM couvrent les 6 familles thématiques du concours avec des corrections détaillées. Chaque question est accompagnée d'une explication complète." },
  { q: "Y a-t-il une période d'essai gratuite ?", a: "Oui, dès votre inscription, vous profitez de 7 jours d'essai gratuit, sans carte bancaire. Vous accédez sans limite à toute la plateforme !" },
  { q: "Combien de temps consacrer aux révisions ?", a: "Nous conseillons 3 à 6 mois avant le concours, 2 à 4 heures par semaine. Révisez à votre rythme, sur mobile ou ordinateur." },
  { q: "Quelles sont les dates du concours ATSEM ?", a: "Pour la session 2026, les inscriptions sont ouvertes du 24 mars au 29 avril 2026 sur concours-territorial.fr, l'épreuve écrite se tient à partir du 14 octobre 2026 et les oraux s'étalent de décembre 2026 à janvier 2027. Retrouvez les dates et les CDG organisateurs de votre région dans <a href='/calendrier'>notre calendrier des concours</a>." },
  { q: "Comment vous contacter ?", a: "Une question, un souci ? Notre équipe vous répond sous 24h à l'adresse <strong>support@prepa-atsem.fr</strong>." }
]

export default function AccueilPage() {
  const [activeFaq, setActiveFaq] = useState(null)
  // Éligibilité : les 3 voies d'accès au concours ATSEM
  const VOIES = [
    { titre: 'Concours externe', badge: 'Ouvert à tous', couleur: '#7e22ce', fond: '#f3e8ff', places: '≤ 30 %',
      desc: "Ouvert à tous les titulaires du CAP AEPE (ex CAP Petite Enfance) ou d'un diplôme équivalent.",
      conditions: ['CAP AEPE ou diplôme équivalent', 'Dispense de diplôme pour les parents de 3 enfants et les sportifs de haut niveau', 'Aucune expérience professionnelle exigée'],
      icone: <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></> },
    { titre: 'Concours interne', badge: 'Le plus de places', couleur: '#2563eb', fond: '#eff6ff', places: '≥ 60 %',
      desc: 'Réservé aux agents de la fonction publique déjà en poste auprès de jeunes enfants.',
      conditions: ['Être fonctionnaire ou agent public', '2 ans de services publics effectifs auprès de jeunes enfants'],
      icone: <><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><path d="M12 2 20 7 H4 Z"/></> },
    { titre: '3ᵉ concours', badge: 'Sans diplôme', couleur: '#059669', fond: '#ecfdf5', places: '5-10 %',
      desc: "Pour celles et ceux qui ont l'expérience du terrain, sans passer par le CAP.",
      conditions: ["4 ans d'expérience auprès de jeunes enfants", 'Assistante maternelle, garde à domicile, crèche…'],
      icone: <><rect width="20" height="14" x="2" y="6" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></> },
  ]
  // Les temps forts du jour J (durées proportionnelles sur la frise)
  const ECRIT = [
    { court: 'QCM', titre: 'QCM de 20 questions', etiquette: '/20', duree: '45 min', bg: '#9333ea', clair: '#d8b4fe', desc: 'Réponses multiples sur les 6 familles thématiques : cochez toutes les bonnes réponses, sans erreur.' },
  ]
  const ORAL = [
    { court: 'Parcours', titre: 'Parcours & motivations', etiquette: '≈ 7 min', duree: '≈ 7 min', bg: '#3b82f6', clair: '#93c5fd', desc: 'Présentez votre parcours et votre projet professionnel d’ATSEM.' },
    { court: 'Situations', titre: 'Mises en situation', etiquette: '≈ 8 min', duree: '≈ 8 min', bg: '#2563eb', clair: '#93c5fd', desc: 'Le jury évalue vos réactions face à des situations concrètes en école maternelle.' },
  ]
  const DETAILS = [
    ECRIT[0],
    { titre: 'Seuil d’admissibilité', etiquette: 'écrit', bg: '#7e22ce', clair: '#d8b4fe', desc: 'Fixé par le jury (souvent autour de 13/20) : au-dessus, vous êtes convoqué à l’oral.' },
    ...ORAL,
  ]

  // Progression de la ligne verticale des 4 entraînements (suit le scroll).
  // Chaque pastille s'allume quand le remplissage atteint sa position réelle.
  const catRef = useRef(null)
  const [catProgress, setCatProgress] = useState(0)
  const [catActifs, setCatActifs] = useState([false, false, false, false])
  useEffect(() => {
    const onScroll = () => {
      const el = catRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - r.top) / r.height))
      setCatProgress(p)
      const hautPiste = r.top + 24
      const fillY = hautPiste + p * (r.height - 48)
      const rangees = [...el.children].filter(c => c.className.includes('grid'))
      setCatActifs(rangees.map(row => {
        const rr = row.getBoundingClientRect()
        return fillY >= rr.top + rr.height / 2
      }))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const CAT_COLORS = ['#9333ea', '#2563eb', '#eab308', '#16a34a']
  const catActive = Math.max(0, catActifs.lastIndexOf(true))
  // Couleur du titre synchronisée avec la tuile affichée dans la pile du hero
  const [heroMod, setHeroMod] = useState(MODULES[0])

  // Fade-in au scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>

      {/* ===================== HERO ===================== */}
      <section className="relative grid place-items-center px-5 pb-4 pt-[68px] md:pt-[150px] text-center">
        <div aria-hidden="true" className="hero-grid absolute inset-0 pointer-events-none"></div>
        {/* Brume bleu marine foncé sur le bas et les côtés du hero */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(ellipse 46% 324px at 5% calc(100% - 54px), rgba(107,33,168,0.17), transparent 70%), radial-gradient(ellipse 44% 46% at 98% 70%, rgba(107,33,168,0.15), transparent 70%), radial-gradient(ellipse 72% 252px at 50% calc(100% + 72px), rgba(107,33,168,0.12), transparent 70%), radial-gradient(ellipse 42% 306px at 96% calc(100% - 27px), rgba(107,33,168,0.16), transparent 70%), radial-gradient(ellipse 38% 216px at 50% calc(100% - 9px), rgba(107,33,168,0.13), transparent 70%)'}}></div>
        <ParticleField />
        <div className="relative z-10 grid place-items-center">
        <AppLogoStack onChange={setHeroMod} />
        <h1 className="mt-9 text-[2.7rem] sm:text-6xl lg:text-[4.6rem] font-extrabold tracking-[-0.035em] leading-[1.02] max-w-4xl">
          Réussissez le<br /><FlipWord color={heroMod.accent} delai={420} duree={300} courbe="cubic-bezier(0.55,0,1,1)">concours</FlipWord> <FlipWord color={heroMod.accent} delai={720} duree={300} courbe="cubic-bezier(0,0,0.45,1)">ATSEM</FlipWord> 2026
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-black/55 font-medium max-w-3xl leading-relaxed">
          La première plateforme web de révision conçue exclusivement pour le concours d&apos;Agent Territorial Spécialisé des Écoles Maternelles. <strong className="font-bold text-black/75">QCM illimités</strong>, <strong className="font-bold text-black/75">annales corrigées des CDG</strong> (2015-2025) et <strong className="font-bold text-black/75">simulations d&apos;oral par IA</strong>.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-3">
          <a href="/auth?mode=signup" className="btn-shine inline-flex items-center gap-2 justify-center bg-[#0d0d0d] hover:bg-black/85 text-white font-semibold text-base px-7 py-3.5 rounded-full transition group">
            Commencer l&apos;entraînement
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </a>
          <a href="#composition-examen" className="inline-flex items-center justify-center font-semibold text-base px-7 py-3.5 rounded-full ring-1 ring-black/10 hover:bg-black/5 transition">
            Découvrez le concours
          </a>
        </div>

        {/* Indice de scroll */}
        <a href="#eligibilite" aria-label="Faire défiler vers la suite" className="mt-8 flex flex-col items-center text-black/30 hover:text-black/60 transition-colors">
          <svg className="scroll-cue-1 w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
          <svg className="scroll-cue-2 w-6 h-6 -mt-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
        </a>

        </div>
      </section>

      {/* ===================== ÉLIGIBILITÉ ===================== */}
      <section id="eligibilite" className="relative overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-16 px-5 fade-in-up" style={{background: 'linear-gradient(to bottom, #ffffff 0%, #f7f6f4 90px, #f7f6f4 calc(100% - 140px), #ffffff 100%)', scrollMarginTop: '115px'}}>
        {/* Prolongement de la brume bleu marine du hero (mêmes positions, fondu vers le bas) */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[340px] pointer-events-none" style={{background: 'radial-gradient(ellipse 46% 324px at 5% -54px, rgba(107,33,168,0.17), transparent 70%), radial-gradient(ellipse 72% 252px at 50% 72px, rgba(107,33,168,0.12), transparent 70%), radial-gradient(ellipse 42% 306px at 96% -27px, rgba(107,33,168,0.16), transparent 70%), radial-gradient(ellipse 38% 216px at 50% -9px, rgba(107,33,168,0.13), transparent 70%)'}}></div>
        {/* Décorations */}
        <div aria-hidden="true" className="absolute top-20 -left-24 w-80 h-64 bg-purple-500/[0.07] rounded-full blur-3xl pointer-events-none"></div>
        <div aria-hidden="true" className="absolute bottom-16 -right-20 w-72 h-56 bg-indigo-500/[0.06] rounded-full blur-3xl pointer-events-none"></div>
        <svg aria-hidden="true" className="absolute top-[30%] left-[10%] w-6 h-6 text-black/[0.12] hidden md:block pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{transform: 'rotate(-10deg)'}}><path d="M12 5v14M5 12h14"/></svg>
        <svg aria-hidden="true" className="absolute bottom-[22%] left-[16%] w-4 h-4 text-purple-500/30 hidden md:block pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{transform: 'rotate(18deg)'}}><path d="M12 5v14M5 12h14"/></svg>
        <svg aria-hidden="true" className="absolute top-[62%] right-[9%] w-5 h-5 text-black/[0.1] hidden md:block pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{transform: 'rotate(-14deg)'}}><path d="M12 5v14M5 12h14"/></svg>
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.2]"><span style={{background: 'linear-gradient(100deg, rgba(100,116,139,0) 0.8%, rgba(100,116,139,0.32) 2.8%, rgba(100,116,139,0.25) 50%, rgba(100,116,139,0.32) 97%, rgba(100,116,139,0) 99.2%)', borderRadius: '0.45em 0.2em 0.55em 0.25em', padding: '0.04em 0.22em', margin: '0 -0.06em', WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone'}}>Êtes-vous éligible au concours ATSEM&nbsp;?</span></h2>
            <p className="mt-5 text-lg text-black/55 font-medium leading-relaxed">3 voies possibles pour devenir ATSEM</p>
          </div>
          {/* Les 3 voies d'accès : cartes qui apparaissent en cascade au scroll */}
          <div className="relative max-w-4xl mx-auto">
            {/* Annotation manuscrite vers la voie externe */}
            <div aria-hidden="true" className="absolute hidden xl:block pointer-events-none z-20 w-[180px]" style={{top: '26px', left: '-205px'}}>
              <p className="text-[1.45rem] leading-[1.15] text-purple-500 -rotate-3" style={{fontFamily: "'Caveat', cursive", fontWeight: 700}}>Prepa ATSEM est spécialisé pour cette voie</p>
              <svg className="w-24 h-20 text-purple-500/80 ml-[88px] mt-1" viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6 C 18 22, 30 34, 50 42"/><path d="M40 43.5 50 42 47 32"/></svg>
            </div>
            {/* Variante mobile de l'annotation : au-dessus de la carte externe, flèche vers la carte */}
            <div aria-hidden="true" className="md:hidden pointer-events-none flex items-start justify-center gap-1 mb-2 pl-1">
              <p className="text-[1.4rem] leading-[1.1] text-purple-500 -rotate-2 max-w-[200px]" style={{fontFamily: "'Caveat', cursive", fontWeight: 700}}>Prepa ATSEM est spécialisé pour cette voie</p>
              <svg className="w-12 h-14 text-purple-500/80 mt-3 shrink-0" viewBox="0 0 40 52" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6 C 22 12, 30 26, 27 44"/><path d="M20 37.5 27 44 33.5 36.5"/></svg>
            </div>
            <style>{`
              @keyframes frise-pop { from { opacity: 0; transform: translateY(18px) scale(0.92); } to { opacity: 1; transform: none; } }
              .frise-etape { opacity: 0; }
              .fade-in-up.visible .frise-etape { animation: frise-pop 0.55s cubic-bezier(0.25, 1, 0.4, 1) both; }
            `}</style>
            <div className="grid md:grid-cols-3 gap-5">
              {VOIES.map((v, i) => (
                <div key={i} className="frise-etape bg-white rounded-[24px] ring-1 ring-black/[0.07] p-6 flex flex-col transition-transform duration-300 hover:-translate-y-1" style={{animationDelay: `${0.15 + i * 0.2}s`, boxShadow: `0 18px 45px ${v.couleur}14`}}>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center" style={{background: v.fond, color: v.couleur}}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{v.icone}</svg>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-right" style={{background: v.fond, color: v.couleur}}>{v.badge}</span>
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight">{v.titre}</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold tracking-tight" style={{color: v.couleur}}>{v.places}</span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-black/40">des places réservées</span>
                  </div>
                  <p className="mt-2 text-sm text-black/50 font-medium leading-relaxed">{v.desc}</p>
                  <ul className="mt-4 pt-4 border-t border-black/[0.06] space-y-2.5">
                    {v.conditions.map((c, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm font-semibold text-black/70 leading-snug">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{color: v.couleur}} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-sm text-black/45 font-medium">Répartition applicable jusqu&apos;en avril 2030 (décret n° 2025-360 du 18 avril 2025). Inscriptions auprès du CDG de votre département du 24 mars au 29 avril 2026 : consultez <a href="/calendrier" className="text-purple-700 font-bold underline hover:text-purple-800 transition">le calendrier des concours</a>.</p>
            <div className="text-center mt-8">
              <a href="/auth?mode=signup" className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold px-7 py-3.5 rounded-full transition shadow-lg shadow-slate-600/25 group/btn">
                Commencer ma préparation
                <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LES 4 ENTRAÎNEMENTS (zigzag) ===================== */}
      <section className="px-5 py-16 sm:py-24 fade-in-up">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05]">4 entraînements pour maximiser<br />vos chances de réussite</h2>
            <p className="mt-5 text-lg text-black/55 font-medium leading-relaxed">Chaque module cible une partie précise du concours externe.</p>
          </div>
          <div ref={catRef} className="relative space-y-16 sm:space-y-24">
            {/* Ligne de progression verticale */}
            <div aria-hidden="true" className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-[3px] rounded-full bg-black/[0.07]">
              <div className="w-full rounded-full transition-[height,background-color] duration-300" style={{height: `${catProgress * 100}%`, backgroundColor: CAT_COLORS[catActive]}}></div>
            </div>
            {[
              { ancre: 'entrainement-qcm', titre: 'QCM thématiques', pied: 'Ne compte pas dans la moyenne', bord: '#9333ea', teinte: '#faf5ff', num: '1', sur: 'Se concentrer sur un thème', points: ['Les 6 familles du concours : institutionnel, hygiène, santé, pédagogie, relations professionnelles, calculs', 'Correction détaillée après chaque question', 'Aucune note, afin de progresser en amont des tests'] },
              { ancre: 'annales', titre: 'Annales corrigées', pied: 'Note /20', bord: '#2563eb', teinte: '#eff6ff', num: '2', sur: 'Se mesurer aux vrais sujets', points: ['Plus de 60 annales déjà référencées : les vrais sujets des centres de gestion, de 2015 à 2025', '45 minutes chrono, comme le jour du concours', 'Note sur 20 et correction détaillée'] },
              { ancre: 'examen-blanc', titre: 'Examen blanc', pied: 'Note /20', bord: '#eab308', teinte: '#fefce8', num: '3', sur: 'Répéter le jour J', points: ['20 questions à réponses multiples générées par IA, inspirées des annales', '45 minutes en conditions réelles', 'Note sur 20 et correction finale détaillée'] },
              { ancre: 'preparation-oral', titre: 'Préparation à l’oral', pied: 'Pas de note', bord: '#16a34a', teinte: '#f0fdf4', num: '4', sur: 'Préparer l’oral sereinement', points: ['Importez votre CV et répondez aux questions personnalisées du jury', 'Mises en situation en école maternelle, comme à l’entretien', 'Sans note : l’objectif est d’arriver confiant devant le jury'] },
            ].map((c, i) => (
              <div key={i} id={c.ancre} style={{scrollMarginTop: '110px'}} className="relative grid md:grid-cols-2 gap-8 md:gap-24 items-center">
                {/* Pastille d'étape sur la ligne centrale */}
                <div
                  aria-hidden="true"
                  className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full items-center justify-center text-sm font-extrabold transition-all duration-300"
                  style={catActifs[i]
                    ? { backgroundColor: c.bord, color: '#ffffff', boxShadow: `0 6px 18px ${c.bord}55` }
                    : { backgroundColor: '#ffffff', color: 'rgba(0,0,0,0.35)', boxShadow: '0 0 0 2px rgba(0,0,0,0.10)' }}
                >{c.num}</div>
                {/* Titre au-dessus de l'aperçu sur mobile */}
                <div className="md:hidden -mb-3">
                  <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{color: c.bord}}>{c.titre}</p>
                  <h3 className="text-2xl font-extrabold tracking-[-0.02em] leading-tight">{c.sur}</h3>
                </div>
                {/* Aperçu d'interface */}
                <div className={`${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <ApercuModule i={i} bord={c.bord} teinte={c.teinte} titre={c.titre} badgeFenetre={['Sans note', '41:26', '32:12', 'Question 2/10'][i]} />
                </div>
                {/* Explication */}
                <div className={`${i % 2 === 1 ? 'md:order-1' : ''}`}>
                  <p className="hidden md:block text-xs font-extrabold uppercase tracking-widest mb-3" style={{color: c.bord}}>{c.titre}</p>
                  <h3 className="hidden md:block text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] leading-tight mb-5">{c.sur}</h3>
                  <ul className="space-y-3.5">
                    {c.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{background: c.teinte}}>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke={c.bord} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                        <span className="text-[15px] text-black/60 font-medium leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-center mt-7">
                    <a href="/auth?mode=signup" className="inline-flex items-center gap-2 text-[15px] font-bold text-white px-6 py-3 rounded-full transition-transform duration-200 hover:scale-[1.04] group" style={{backgroundColor: c.bord, boxShadow: `0 8px 20px ${c.bord}40`}}>
                      Commencer cet entraînement
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMPOSITION DU CONCOURS ===================== */}
      <section id="composition-examen" className="relative overflow-hidden bg-[#0d0d0d] py-20 sm:py-28 px-5 fade-in-up">
        <div aria-hidden="true" className="absolute -top-32 -right-24 w-[32rem] h-[24rem] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div aria-hidden="true" className="absolute -bottom-32 -left-24 w-[28rem] h-[20rem] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-white">Déroulement du concours</h2>
            <p className="mt-5 text-lg text-white/55 font-medium leading-relaxed">L&apos;écrit vous qualifie, mais c&apos;est l&apos;oral (<strong className="font-bold text-white">coefficient 2</strong>) qui fait la différence au classement final.</p>
          </div>
          <style>{`
            @keyframes chrono-pousse { from { transform: scaleX(0); } to { transform: scaleX(1); } }
            @keyframes chrono-fondu { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
            .chrono-seg { transform: scaleX(0); transform-origin: left; }
            .fade-in-up.visible .chrono-seg { animation: chrono-pousse 0.65s cubic-bezier(0.4, 0, 0.2, 1) both; }
            .chrono-detail { opacity: 0; }
            .fade-in-up.visible .chrono-detail { animation: chrono-fondu 0.5s ease-out both; }
          `}</style>

          {/* ===== Frise chronologique du jour J (desktop) ===== */}
          <div className="hidden md:block">
            {/* En-têtes des deux blocs */}
            <div className="flex gap-6 mb-4">
              <div className="flex items-center gap-2.5" style={{width: '68%'}}>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <h3 className="text-lg font-extrabold text-white">Épreuve écrite</h3>
                <span className="text-sm font-bold text-white/45">45 min · 20 points · coeff. 1</span>
              </div>
              <div className="flex items-center gap-2.5 flex-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-lg font-extrabold text-white whitespace-nowrap">Épreuve orale</h3>
                <span className="text-sm font-bold text-white/45 whitespace-nowrap">15 min · 20 points · coeff. 2</span>
              </div>
            </div>
            {/* Barre du temps : segments proportionnels aux durées */}
            <div className="flex items-stretch gap-6">
              <div className="flex h-14 rounded-2xl overflow-hidden ring-1 ring-white/10" style={{width: '68%'}}>
                {ECRIT.map((s, i) => (
                  <div key={i} className="chrono-seg flex items-center justify-center gap-2.5" style={{width: '100%', background: s.bg, animationDelay: '0.1s'}}>
                    <span className="text-[15px] font-extrabold text-white">{s.court}</span>
                    <span className="text-[11px] font-bold text-white/75">{s.duree}</span>
                  </div>
                ))}
              </div>
              <div className="flex h-14 rounded-2xl overflow-hidden ring-1 ring-white/10 flex-1">
                {ORAL.map((s, i) => (
                  <div key={i} className="chrono-seg flex items-center justify-center gap-2" style={{width: '50%', background: s.bg, animationDelay: `${1 + i * 0.25}s`}}>
                    <span className="text-[15px] font-extrabold text-white">{s.court}</span>
                    <span className="text-[11px] font-bold text-white/75">{s.duree}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Graduations */}
            <div className="flex gap-6 mt-2.5 text-[11px] font-bold text-white/35">
              <div className="relative h-4" style={{width: '68%'}}>
                <span className="absolute left-0">0</span>
                <span className="absolute left-1/2 -translate-x-1/2">22 min 30</span>
                <span className="absolute right-0">45 min</span>
              </div>
              <div className="relative h-4 flex-1">
                <span className="absolute left-0">0</span>
                <span className="absolute left-1/2 -translate-x-1/2">7 min 30</span>
                <span className="absolute right-0">15 min</span>
              </div>
            </div>
          </div>

          {/* ===== Version mobile : parcours vertical (écrit, seuil, oral) ===== */}
          <div className="md:hidden">
            {/* Épreuve écrite */}
            <div className="flex items-center gap-3 mb-3.5">
              <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-base font-extrabold text-white" style={{background: '#9333ea', boxShadow: '0 6px 18px rgba(147,51,234,0.33)'}}>1</span>
              <div>
                <h3 className="text-xl font-extrabold text-white leading-tight">Épreuve écrite</h3>
                <p className="text-[12px] font-bold text-white/45 mt-0.5">45 min · 20 points · coeff. 1</p>
              </div>
            </div>
            <div className="chrono-detail rounded-2xl p-5" style={{animationDelay: '0.1s', background: 'rgba(147,51,234,0.14)', border: '1px solid rgba(192,132,252,0.28)'}}>
              <div className="h-1 w-9 rounded-full mb-3.5" style={{background: ECRIT[0].bg}}></div>
              <p className="font-bold text-white text-[15px]">{ECRIT[0].titre} <span className="ml-1 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md align-middle whitespace-nowrap" style={{background: `${ECRIT[0].bg}33`, color: ECRIT[0].clair}}>45 min · /20</span></p>
              <p className="text-[13px] text-white/55 font-medium leading-relaxed mt-1.5">{ECRIT[0].desc}</p>
            </div>
            {/* Passerelle entre les deux épreuves : le seuil d'admissibilité */}
            <div className="chrono-detail ml-6 my-2 pl-5 py-2 border-l-2 border-dashed border-purple-400/35" style={{animationDelay: '0.4s'}}>
              <p className="text-[13px] text-white/55 font-medium leading-relaxed"><span className="font-extrabold text-purple-300">Seuil d’admissibilité</span> fixé par le jury (souvent autour de 13/20) : au-dessus, vous êtes convoqué à l’oral.</p>
            </div>
            {/* Épreuve orale */}
            <div className="flex items-center gap-3 mb-3.5">
              <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-base font-extrabold text-white" style={{background: '#2563eb', boxShadow: '0 6px 18px rgba(37,99,235,0.33)'}}>2</span>
              <div>
                <h3 className="text-xl font-extrabold text-white leading-tight">Épreuve orale</h3>
                <p className="text-[12px] font-bold text-white/45 mt-0.5">15 min · 20 points · coeff. 2</p>
              </div>
            </div>
            <div className="space-y-3">
              {ORAL.map((s, i) => (
                <div key={i} className="chrono-detail rounded-2xl p-5" style={{animationDelay: `${0.6 + i * 0.2}s`, background: `${s.bg}24`, border: '1px solid rgba(147,197,253,0.28)'}}>
                  <div className="h-1 w-9 rounded-full mb-3.5" style={{background: s.bg}}></div>
                  <p className="font-bold text-white text-[15px]">{s.titre} <span className="ml-1 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md align-middle whitespace-nowrap" style={{background: `${s.bg}33`, color: s.clair}}>{s.etiquette}</span></p>
                  <p className="text-[13px] text-white/55 font-medium leading-relaxed mt-1.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Détails des 4 temps forts (desktop, alignés sous la frise) */}
          <div className="hidden md:grid grid-cols-4 gap-4 mt-7">
            {DETAILS.map((s, i) => (
              <div key={i} className="chrono-detail bg-white/[0.04] ring-1 ring-white/[0.06] rounded-2xl p-5" style={{animationDelay: `${0.35 + i * 0.35}s`}}>
                <div className="h-1 w-9 rounded-full mb-4" style={{background: s.bg}}></div>
                <p className="font-bold text-white text-[15px] leading-snug">{s.titre} <span className="ml-1 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md align-middle whitespace-nowrap" style={{background: `${s.bg}33`, color: s.clair}}>{s.etiquette}</span></p>
                <p className="text-sm text-white/55 font-medium leading-relaxed mt-2">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Seuil éliminatoire et note finale */}
          <div className="chrono-detail mt-8 flex items-center justify-center gap-2.5" style={{animationDelay: '1.6s'}}>
            <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <p className="text-sm text-purple-200/90 font-medium">Note finale = écrit + (oral × 2). Une note en dessous de <strong className="font-bold text-white">7/20</strong> à l&apos;oral est <strong className="font-bold text-white">éliminatoire</strong>.</p>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      {/* Schéma FAQPage pour Google (réponses sans balises HTML) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_DATA.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') }
        }))
      })}} />
      <section id="faq" className="py-20 sm:py-28 px-5 fade-in-up">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl sm:text-[52px] font-extrabold tracking-[-0.03em] leading-[1.05] text-center mb-12">Questions fréquentes</h2>
          <div>
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="border-b border-black/10 last:border-b-0">
                <button
                  className="w-full px-1 py-[22px] text-left flex justify-between items-center gap-4 cursor-pointer group"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-extrabold text-[19px] leading-snug group-hover:text-black/70 transition">{faq.q}</span>
                  <svg className={`w-5 h-5 shrink-0 text-black/45 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
                </button>
                <div className="px-1 overflow-hidden transition-all duration-300" style={{ maxHeight: activeFaq === index ? '400px' : '0', opacity: activeFaq === index ? 1 : 0 }}>
                  <p className="pb-6 text-black/55 font-medium leading-relaxed [&_a]:text-purple-700 [&_a]:font-bold [&_a]:underline" dangerouslySetInnerHTML={{__html: faq.a}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
