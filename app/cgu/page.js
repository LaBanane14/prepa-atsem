'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Stethoscope = ({className}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>

export default function CGUPage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setAuthLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const navLinks = [
    { href: '/', label: 'Accueil', active: false },
    { href: '/calculs-doses', label: 'Calculs de doses', active: false },
    { href: '/blog', label: 'Blog', active: false },
    { href: '/tarifs', label: 'Tarifs', active: false }
  ]

  const sections = [
    {
      title: "Article 1 — Objet",
      html: `<p>Les présentes <strong>Conditions Générales d'Utilisation et de Vente</strong> (CGU/CGV) définissent les conditions d'accès et d'utilisation de la Plateforme <strong>Prépa FPC</strong> (<strong>www.prepa-fpc.fr</strong>), destinée à la préparation du concours FPC d'entrée en IFSI pour les professionnels en reconversion (aides-soignants, auxiliaires de puériculture).</p>
<p>La Plateforme propose des outils d'entraînement : <strong>QCM de mathématiques</strong>, exercices de <strong>calculs de doses</strong>, sujets de <strong>rédaction</strong>, <strong>examens blancs</strong>, préparation à l'<strong>oral</strong> et articles de blog informatifs.</p>`
    },
    {
      title: "Article 2 — Acceptation",
      html: `<p>L'utilisation de la Plateforme implique l'<strong>acceptation pleine et entière</strong> des présentes CGU/CGV. LP Labs se réserve le droit de modifier les CGU/CGV à tout moment. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation après modification vaut acceptation.</p>`
    },
    {
      title: "Article 3 — Accès à la Plateforme",
      html: `<p>La Plateforme est accessible <strong>gratuitement pendant 7 jours</strong> à compter de l'inscription. Au-delà, l'accès aux fonctionnalités premium nécessite la souscription d'un <strong>abonnement payant</strong>.</p>
<p>LP Labs s'efforce d'assurer la disponibilité <strong>24h/24 et 7j/7</strong>, mais ne saurait être tenue responsable des interruptions pour maintenance, mises à jour ou cas de force majeure.</p>`
    },
    {
      title: "Article 4 — Création de compte",
      html: `<p>L'inscription est ouverte à toute personne physique <strong>âgée d'au moins 17 ans</strong>. L'utilisateur s'engage à fournir des informations exactes et à maintenir la <strong>confidentialité de ses identifiants</strong>.</p>
<p>Chaque utilisateur est responsable de toute activité réalisée depuis son compte. En cas d'utilisation non autorisée, contactez immédiatement <strong><a href="mailto:support@prepa-fpc.fr" class="text-red-600 hover:underline">support@prepa-fpc.fr</a></strong>.</p>`
    },
    {
      title: "Article 5 — Utilisation de la Plateforme",
      html: `<p>L'utilisateur s'engage à utiliser la Plateforme de manière conforme à sa destination. Sont <strong>strictement interdits</strong> :</p>
<ul>
<li>La <strong>reproduction, copie ou extraction</strong> du contenu de la Plateforme</li>
<li>L'utilisation de <strong>robots, scripts ou outils automatisés</strong></li>
<li>Le <strong>partage de compte</strong> ou d'identifiants avec des tiers</li>
<li>Toute tentative de <strong>contournement des mesures de sécurité</strong></li>
<li>La <strong>revente ou redistribution</strong> du contenu pédagogique</li>
</ul>`
    },
    {
      title: "Article 6 — Propriété intellectuelle",
      html: `<p>L'ensemble des contenus de la Plateforme est la <strong>propriété exclusive de LP Labs</strong> et est protégé par le droit de la propriété intellectuelle.</p>
<p>L'utilisateur bénéficie d'un droit d'utilisation <strong>personnel et non cessible</strong>. Toute reproduction ou diffusion non autorisée constitue une <strong>contrefaçon sanctionnée pénalement</strong>.</p>`
    },
    {
      title: "Article 7 — Contenu pédagogique",
      html: `<p>Les exercices, QCM et examens blancs sont des <strong>outils d'entraînement complémentaires</strong>. Ils ne se substituent pas à une formation officielle et <strong>ne garantissent pas la réussite</strong> au concours FPC.</p>
<p>Les sujets générés par intelligence artificielle sont calibrés sur les <strong>annales officielles</strong> du concours mais peuvent comporter des approximations.</p>`
    },
    {
      title: "Article 8 — Abonnements et paiements (CGV)",
      html: `<p>La Plateforme propose deux formules payantes dont les tarifs sont indiqués sur la page <strong><a href="/tarifs" class="text-red-600 hover:underline">Tarifs</a></strong>. Les paiements sont sécurisés par <strong>Stripe</strong>.</p>
<ul>
<li><strong>Abonnement mensuel — 12,99 €/mois</strong> : renouvellement automatique chaque mois, résiliable à tout moment depuis votre espace personnel</li>
<li><strong>Pack annuel — 89,99 € (paiement unique)</strong> : accès pour 12 mois, sans renouvellement automatique</li>
</ul>
<br/>
<p>Pour l'abonnement mensuel, la résiliation prend effet à la <strong>fin de la période en cours</strong>. Aucun remboursement au prorata ne sera effectué pour la période restante.</p>
<p>Le pack annuel n'est <strong>pas renouvelé automatiquement</strong>. À l'issue des 12 mois, l'accès premium est désactivé sauf nouvelle souscription.</p>
<p>Conformément à l'article <strong>L221-28 du Code de la consommation</strong>, le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement après l'achat.</p>`
    },
    {
      title: "Article 9 — Suspension et résiliation",
      html: `<p>LP Labs se réserve le droit de <strong>suspendre ou supprimer</strong> un compte utilisateur, <strong>sans préavis ni indemnité</strong>, en cas de violation des présentes CGU/CGV, notamment en cas de fraude, d'utilisation abusive ou de comportement nuisible.</p>`
    },
    {
      title: "Article 10 — Droit applicable et litiges",
      html: `<p>Les présentes CGU/CGV sont soumises au <strong>droit français</strong>. En cas de litige, les parties s'engagent à rechercher une <strong>solution amiable</strong>. À défaut, les <strong>tribunaux compétents de Coutances (Manche)</strong> seront seuls compétents.</p>`
    },
    {
      title: "Article 11 — Contact",
      html: `<ul>
<li>Email : <strong><a href="mailto:support@prepa-fpc.fr" class="text-red-600 hover:underline">support@prepa-fpc.fr</a></strong></li>
<li>Formulaire : <strong><a href="/contact" class="text-red-600 hover:underline">www.prepa-fpc.fr/contact</a></strong></li>
<li>Adresse : <strong>LP Labs, 20 route de la Rousserie, 50200 Monthuchon</strong></li>
</ul>`
    }
  ]

  return (
    <div className="min-h-screen bg-[#eceef1] text-slate-900 selection:bg-red-200 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-xl shadow-sm"><Stethoscope className="w-7 h-7" /></div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900 block leading-none">Prépa <span className="text-red-600">FPC</span></span>
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">La passerelle IFSI</span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className="hover:text-red-600 transition">{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {!authLoading && (user ? (
              <a href="/dashboard" className="hidden md:inline-flex bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-slate-200 transition transform hover:-translate-y-0.5">Mon tableau de bord</a>
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
                <a key={link.label} href={link.href} className="block py-3 px-4 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition">{link.label}</a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                {user ? (
                  <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Mon espace</a>
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Conditions Générales d'Utilisation et de Vente</h1>
          <p className="text-slate-500 font-medium">Dernière mise à jour : 1er avril 2026</p>
        </div>
        <div className="space-y-6">
          {sections.map((section, i) => (
            <section key={i} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-black text-slate-900 mb-4">{section.title}</h2>
              <div className="text-sm text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_p]:mb-3 [&_li]:leading-relaxed" dangerouslySetInnerHTML={{__html: section.html}} />
            </section>
          ))}
        </div>
      </main>

      <footer className="bg-slate-950 text-slate-400 py-12 text-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><Stethoscope className="w-5 h-5 text-red-500" /><h4 className="text-white font-bold text-lg">Prépa FPC</h4></div>
            <p className="max-w-xs leading-relaxed">La plateforme d'entraînement dédiée aux candidats en reconversion professionnelle qui préparent le concours FPC. Entraînez-vous dans les conditions réelles du concours.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources IFSI</h4>
            <ul className="space-y-3">
              <li><a href="/blog/dates-concours-fpc-infirmier-2026" className="hover:text-white transition">Dates concours FPC</a></li>
              <li><a href="/blog" className="hover:text-white transition">Dossier Passerelle AS/AP</a></li>
              <li><a href="/calculs-doses" className="hover:text-white transition">Formules calculs de doses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Légal</h4>
            <ul className="space-y-3">
              <li><a href="/mentions-legales" className="hover:text-white transition">Mentions légales</a></li>
              <li><a href="/cgu" className="hover:text-white transition">CGV &amp; CGU</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center">
          <p>&copy; 2026 Prépa FPC (prepa-fpc.fr). Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
