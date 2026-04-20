const { useState, useEffect } = React;

// ============== DATA ==============
const THEMES = [
  {
    id: 'institut',
    title: 'Institutionnel',
    desc: 'Statut, missions, hiérarchie, cadre légal',
    short: 'Cadre réglementaire',
    count: 10,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="16" height="13" rx="1"/>
        <path d="M4 8l8-5 8 5"/>
        <path d="M9 21v-6h6v6"/>
        <path d="M7 12h.01M12 12h.01M17 12h.01"/>
      </svg>
    ),
  },
  {
    id: 'hygiene',
    title: 'Hygiène',
    desc: 'Bionettoyage, dilutions, protocoles, HACCP',
    short: 'Protocoles & HACCP',
    count: 10,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2h6v4H9z"/>
        <path d="M8 6h8v4a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6z"/>
        <path d="M10 14v7h4v-7"/>
        <path d="M17 4l2 1M17 7l2-1"/>
      </svg>
    ),
  },
  {
    id: 'sante',
    title: 'Santé',
    desc: "Premiers secours, PAI, gestes d'urgence",
    short: 'Premiers secours',
    count: 10,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/>
      </svg>
    ),
  },
  {
    id: 'pedago',
    title: 'Pédagogie',
    desc: 'Programme, sieste, ateliers, développement',
    short: 'Programme & ateliers',
    count: 10,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9l10-5 10 5-10 5L2 9z"/>
        <path d="M6 11v5a6 6 0 0 0 12 0v-5"/>
        <path d="M22 9v5"/>
      </svg>
    ),
  },
  {
    id: 'relation',
    title: 'Relations pro',
    desc: 'Discrétion, devoir de réserve, communication',
    short: 'Posture & communication',
    count: 10,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.9"/>
        <path d="M16 3.1a4 4 0 0 1 0 7.8"/>
      </svg>
    ),
  },
  {
    id: 'calc',
    title: 'Calculs',
    desc: 'Dilutions, surfaces, proportions',
    short: 'Dilutions & surfaces',
    count: 10,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <path d="M8 6h8M8 10h3M13 10h3M8 14h3M13 14h3M8 18h3M13 18h3"/>
      </svg>
    ),
  },
];

// ============== SIDEBAR ==============
function Sidebar() {
  const items = [
    { id: 'home', label: 'Accueil', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/>
      </svg>
    )},
    { id: 'stats', label: 'Mes stats', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
      </svg>
    )},
    { id: 'history', label: 'Historique', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/>
      </svg>
    )},
    { id: 'account', label: 'Compte', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>
      </svg>
    )},
    { id: 'premium', label: 'Devenir Premium', active: true, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>
      </svg>
    )},
  ];
  return (
    <aside className="sidebar">
      <div className="sb-logo">#</div>
      <div className="sb-items">
        {items.map(it => (
          <button key={it.id} className={'sb-item' + (it.active ? ' active' : '')}>
            {it.icon}
            <span style={{ whiteSpace: 'nowrap', fontSize: it.id === 'premium' ? '10px' : '11px', textAlign: 'center', lineHeight: 1.15 }}>
              {it.id === 'premium' ? <>Devenir<br/>Premium</> : it.label}
            </span>
          </button>
        ))}
      </div>
      <div className="sb-foot">
        <div className="sb-avatar">P</div>
        <button className="sb-logout" aria-label="Déconnexion">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6l-12 12"/>
  </svg>
);
const ArrIcon = (p={}) => (
  <svg width={p.w||16} height={p.w||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>
  </svg>
);

// ============== V1 : EDITORIAL CARDS (colored) ==============
const V1_COLOR_CLASS = {
  institut: 'v1-card-inst',
  hygiene:  'v1-card-hyg',
  sante:    'v1-card-sante',
  pedago:   'v1-card-pedago',
  relation: 'v1-card-relation',
  calc:     'v1-card-calc',
};
function V1() {
  return (
    <section className="v1">
      <div className="v1-topbar">
        <div className="v1-crumb">Quiz · Thématique</div>
        <button className="v1-close"><CloseIcon/></button>
      </div>
      <div className="v1-hero">
        <h1>Choisissez votre <em>thématique</em>.</h1>
        <p>10 questions générées par IA pour chaque catégorie. Une bonne réponse sur 4 — concentre-toi, on démarre quand tu veux.</p>
        <div className="v1-meta">
          <span><b>6</b> catégories</span>
          <span><b>60</b> questions disponibles</span>
          <span><b>~4 min</b> par session</span>
        </div>
      </div>
      <div className="v1-grid">
        {THEMES.map((t, i) => (
          <article key={t.id} className={'v1-card ' + V1_COLOR_CLASS[t.id]}>
            <div className="v1-card-top">
              <div className="v1-icon">{t.icon}</div>
              <div className="v1-num">0{i+1}</div>
            </div>
            <div className="v1-card-body">
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <div className="v1-cta">
                <span className="v1-qcount">{t.count} questions</span>
                <span className="v1-arrow"><ArrIcon/></span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============== V2 : DASHBOARD ASYMETRIQUE ==============
function V2() {
  const featured = THEMES[0];
  const rest = THEMES.slice(1);
  return (
    <section className="v2">
      <div className="v2-head">
        <div className="v2-head-l">
          <h1>Choisissez votre thématique</h1>
          <p>10 questions générées par IA sur la catégorie choisie. Une bonne réponse sur 4.</p>
        </div>
        <div className="v2-stats">
          <div className="v2-stat"><b>247</b><span>Répondues</span></div>
          <div className="v2-stat"><b>78 %</b><span>Réussite</span></div>
          <div className="v2-stat"><b>12 j</b><span>Série</span></div>
        </div>
      </div>
      <div className="v2-grid">
        <article className="v2-card featured">
          <span className="v2-tag">⚡ Recommandé pour toi</span>
          <div className="v2-icon-square">{featured.icon}</div>
          <h3>{featured.title}</h3>
          <p>{featured.desc}. Tu as complété 2 sessions sur ce thème cette semaine.</p>
          <div className="v2-foot">
            <span className="v2-q">{featured.count} questions · IA</span>
            <span className="v2-go">Commencer <ArrIcon/></span>
          </div>
        </article>
        {rest.map(t => (
          <article key={t.id} className="v2-card">
            <div className="v2-icon-square">{t.icon}</div>
            <span className="v2-tag" style={{marginTop: 4}}>{t.short}</span>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
            <div className="v2-foot">
              <span className="v2-q">{t.count} questions</span>
              <span className="v2-go">Lancer <ArrIcon/></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============== V3 : PLAYFUL COLORED ==============
function V3() {
  const colorClasses = ['v3-c-institut','v3-c-hygiene','v3-c-sante','v3-c-pedago','v3-c-relation','v3-c-calc'];
  return (
    <section className="v3">
      <div className="v3-head">
        <div>
          <h1>Choisis ta <span className="hl">thématique</span></h1>
          <p>10 questions, 4 réponses, 1 bonne. Let's go ! 🎯</p>
        </div>
        <div className="v3-streak">
          <span className="flame">🔥</span>
          <span>12 jours de suite</span>
        </div>
      </div>
      <div className="v3-grid">
        {THEMES.map((t, i) => (
          <article key={t.id} className={`v3-card ${colorClasses[i]}`}>
            <div className="v3-emoji">{t.icon}</div>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
            <div className="v3-foot">
              <span className="v3-pill">{t.count} Q</span>
              <span className="v3-go"><ArrIcon/></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============== V4 : MINIMAL MONOCHROME ==============
function V4() {
  return (
    <section className="v4">
      <div className="v4-topbar">
        <div className="v4-meta">
          <span>Index</span>
          <span>Quiz / Thématique</span>
        </div>
        <div className="v4-meta">
          <span>19.04.2026</span>
          <span>6 catégories</span>
        </div>
      </div>
      <div className="v4-hero">
        <h1>Choisis<br/>ta <em>thématique</em>.</h1>
        <div className="v4-hero-r">
          <p>10 questions générées par IA sur la catégorie sélectionnée. Une bonne réponse parmi quatre propositions. Chaque session dure environ quatre minutes.</p>
          <p style={{ color: '#737373', fontSize: 13 }}>Survole une ligne pour la sélectionner — clique pour démarrer.</p>
        </div>
      </div>
      <div className="v4-list">
        {THEMES.map((t, i) => (
          <div key={t.id} className="v4-row">
            <span className="v4-num">— 0{i+1}</span>
            <div className="v4-ic">{t.icon}</div>
            <div className="v4-ttl">
              <b>{t.title}</b>
              <span>{t.short}</span>
            </div>
            <div className="v4-desc">{t.desc}</div>
            <div className="v4-arr"><ArrIcon/></div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============== TWEAKS ==============
const VARIATIONS = [
  { id: 1, name: 'Editorial Cards',     sub: 'Grille + hero typographique' },
  { id: 2, name: 'Dashboard asymétrique', sub: 'Carte hero + stats' },
  { id: 3, name: 'Playful coloré',      sub: 'Neo-brutalisme, teinté' },
  { id: 4, name: 'Minimal monochrome',  sub: 'Liste éditoriale noir/blanc' },
];

function Tweaks({ variation, setVariation, open }) {
  return (
    <div className={'tweaks' + (open ? ' open' : '')}>
      <h4>Tweaks · Variation</h4>
      {VARIATIONS.map(v => (
        <button
          key={v.id}
          className={'tw-opt' + (variation === v.id ? ' active' : '')}
          onClick={() => setVariation(v.id)}
        >
          <span className="tw-num">0{v.id}</span>
          <span>{v.name}</span>
          <div style={{ fontSize: 11, opacity: 0.65, fontWeight: 500, marginTop: 2, marginLeft: 26 }}>{v.sub}</div>
        </button>
      ))}
    </div>
  );
}

// ============== APP ==============
function App() {
  const [variation, setVariationState] = useState(() => {
    const saved = localStorage.getItem('dash-variation');
    return saved ? Number(saved) : (window.TWEAK_DEFAULTS?.variation || 1);
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const setVariation = (v) => {
    setVariationState(v);
    localStorage.setItem('dash-variation', String(v));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { variation: v } }, '*');
  };

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const views = { 1: <V1/>, 2: <V2/>, 3: <V3/>, 4: <V4/> };

  return (
    <div className="app" data-screen-label={`0${variation} ${VARIATIONS[variation-1].name}`}>
      <Sidebar/>
      <main className="content">
        {views[variation]}
      </main>
      <Tweaks variation={variation} setVariation={setVariation} open={tweaksOpen}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
