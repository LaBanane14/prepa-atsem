// CGU / CGV — version maquette (contenu identique à la page réelle,
// liens internes pointés vers l'univers maquette)
const SECTIONS = [
  {
    title: "Article 1 — Objet",
    html: `<p>Les présentes <strong>Conditions Générales d'Utilisation et de Vente</strong> (CGU/CGV) définissent les conditions d'accès et d'utilisation de la Plateforme <strong>Prépa ATSEM</strong> (<strong>www.prepa-atsem.fr</strong>), destinée à la préparation du concours ATSEM.</p>
<p>La Plateforme propose des outils d'entraînement : <strong>QCM thématiques</strong>, <strong>annales corrigées</strong>, <strong>examens blancs</strong>, préparation à l'<strong>oral</strong> et articles de blog informatifs.</p>`
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
<p>Chaque utilisateur est responsable de toute activité réalisée depuis son compte. En cas d'utilisation non autorisée, contactez immédiatement <strong><a href="mailto:support@prepa-atsem.fr" class="text-purple-700 hover:underline">support@prepa-atsem.fr</a></strong>.</p>`
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
    html: `<p>Les exercices, QCM et examens blancs sont des <strong>outils d'entraînement complémentaires</strong>. Ils ne se substituent pas à une formation officielle et <strong>ne garantissent pas la réussite</strong> au concours ATSEM.</p>
<p>Les sujets générés par intelligence artificielle sont calibrés sur les <strong>annales officielles</strong> du concours mais peuvent comporter des approximations.</p>`
  },
  {
    title: "Article 8 — Abonnements et paiements (CGV)",
    html: `<p>La Plateforme propose deux formules payantes dont les tarifs sont indiqués sur la page <strong><a href="/maquette/tarifs" class="text-purple-700 hover:underline">Tarifs</a></strong>. Les paiements sont sécurisés par <strong>Stripe</strong>.</p>
<ul>
<li><strong>Abonnement mensuel (12,99 €/mois)</strong> : renouvellement automatique chaque mois, résiliable à tout moment depuis votre espace personnel</li>
<li><strong>Pack semestriel (49,99 €, paiement unique)</strong> : accès pour 6 mois, sans renouvellement automatique</li>
</ul>
<br/>
<p>Pour l'abonnement mensuel, la résiliation prend effet à la <strong>fin de la période en cours</strong>. Aucun remboursement au prorata ne sera effectué pour la période restante.</p>
<p>Le pack semestriel n'est <strong>pas renouvelé automatiquement</strong>. À l'issue des 6 mois, l'accès premium est désactivé sauf nouvelle souscription.</p>
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
<li>Email : <strong><a href="mailto:support@prepa-atsem.fr" class="text-purple-700 hover:underline">support@prepa-atsem.fr</a></strong></li>
<li>Adresse : <strong>LP Labs, 20 route de la Rousserie, 50200 Monthuchon</strong></li>
</ul>`
  }
]

export default function MaquetteCGUPage() {
  return (
    <main className="max-w-3xl mx-auto w-full px-5 sm:px-6 pt-[110px] md:pt-[140px] pb-16 sm:pb-24">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-[2.6rem] font-extrabold tracking-[-0.03em] leading-[1.12] mb-3">Conditions Générales d&apos;Utilisation et de Vente</h1>
        <p className="text-black/45 font-semibold text-sm">Dernière mise à jour : 26 juillet 2026</p>
      </div>
      <div className="space-y-5">
        {SECTIONS.map((section, i) => (
          <section key={i} className="bg-white rounded-[24px] ring-1 ring-black/[0.07] p-6 sm:p-8">
            <h2 className="text-lg font-extrabold tracking-tight mb-4">{section.title}</h2>
            <div className="text-sm text-black/60 font-medium leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_p]:mb-3 [&_li]:leading-relaxed [&_strong]:text-black/80" dangerouslySetInnerHTML={{__html: section.html}} />
          </section>
        ))}
      </div>
    </main>
  )
}
