// Mentions légales — version maquette (contenu identique à la page réelle)
const SECTIONS = [
  {
    title: "Éditeur du site",
    html: `<p>Le site <strong>www.prepa-atsem.fr</strong> est édité par :</p>
<ul>
<li>Raison sociale : <strong>LP Labs</strong>, SAS au capital de 50 €</li>
<li>Siège social : <strong>20 route de la Rousserie, 50200 Monthuchon, France</strong></li>
<li>SIRET : <strong>102 976 990 00014</strong></li>

<li>Contact : <strong><a href="mailto:support@prepa-atsem.fr" class="text-purple-700 hover:underline">support@prepa-atsem.fr</a></strong></li>
</ul>`
  },
  {
    title: "Hébergeur",
    html: `<ul>
<li>Raison sociale : <strong>Vercel Inc.</strong></li>
<li>Adresse : <strong>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</strong></li>
<li>Site web : <strong>vercel.com</strong></li>
</ul>`
  },
  {
    title: "Propriété intellectuelle",
    html: `<p>L'ensemble des contenus présents sur le site <strong>www.prepa-atsem.fr</strong> (textes, exercices, algorithmes, design, logos, code source, images) est la <strong>propriété exclusive de LP Labs</strong> et est protégé par le droit français et international de la propriété intellectuelle.</p>
<p>Toute reproduction, représentation, diffusion ou redistribution, totale ou partielle, du contenu de ce site est <strong>strictement interdite</strong> sans autorisation écrite préalable de LP Labs.</p>`
  },
  {
    title: "Protection des données personnelles (RGPD)",
    html: `<p>Conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong> et à la <strong>loi Informatique et Libertés</strong>, LP Labs collecte et traite les données personnelles suivantes :</p>
<ul>
<li><strong>Données d'inscription</strong> : prénom, adresse email</li>
<li><strong>Données d'utilisation</strong> : historique d'exercices, scores, progression</li>
<li><strong>Données techniques</strong> : adresse IP, données de navigation</li>
</ul>
<p>Ces données sont <strong>nécessaires à la fourniture du service</strong> et ne sont jamais vendues à des tiers.</p>
<p>Ces données sont traitées par nos sous-traitants techniques : <strong>Supabase</strong> (base de données et authentification), <strong>Stripe</strong> (paiements) et <strong>Vercel</strong> (hébergement), dans le cadre strict de la fourniture du service.</p>
<p>Vous disposez d'un <strong>droit d'accès, de rectification, de suppression et de portabilité</strong> de vos données en contactant <strong><a href="mailto:support@prepa-atsem.fr" class="text-purple-700 hover:underline">support@prepa-atsem.fr</a></strong>. Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (<a href="https://www.cnil.fr" target="_blank" rel="noopener" class="text-purple-700 hover:underline">www.cnil.fr</a>).</p>
<p>Durée de conservation : les données sont conservées pendant la durée du compte et supprimées <strong>12 mois</strong> après la dernière connexion.</p>`
  },
  {
    title: "Cookies",
    html: `<p>La Plateforme utilise des <strong>cookies essentiels</strong> au fonctionnement du service (authentification, préférences). Des cookies analytiques peuvent être utilisés pour mesurer l'audience.</p>
<p>Vous pouvez configurer votre navigateur pour <strong>refuser les cookies optionnels</strong>. Le refus des cookies essentiels peut empêcher l'utilisation de certaines fonctionnalités.</p>`
  },
  {
    title: "Limitation de responsabilité",
    html: `<p>LP Labs ne saurait être tenue responsable :</p>
<ul>
<li>Des interruptions de service pour maintenance ou raisons techniques</li>
<li>Des <strong>résultats obtenus au concours ATSEM</strong></li>
<li>De l'utilisation faite par l'utilisateur des contenus pédagogiques</li>
<li>Du contenu des sites tiers accessibles par des liens hypertextes</li>
</ul>`
  },
  {
    title: "Droit applicable",
    html: `<p>Les présentes mentions légales sont soumises au <strong>droit français</strong>. En cas de litige, les <strong>tribunaux compétents de Coutances (Manche)</strong> seront seuls compétents.</p>`
  },
  {
    title: "Contact",
    html: `<ul>
<li>Email : <strong><a href="mailto:support@prepa-atsem.fr" class="text-purple-700 hover:underline">support@prepa-atsem.fr</a></strong></li>
<li>Adresse : <strong>LP Labs, 20 route de la Rousserie, 50200 Monthuchon</strong></li>
</ul>`
  }
]

export default function MaquetteMentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto w-full px-5 sm:px-6 pt-[110px] md:pt-[140px] pb-16 sm:pb-24">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-[2.6rem] font-extrabold tracking-[-0.03em] leading-[1.12] mb-3">Mentions légales</h1>
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
