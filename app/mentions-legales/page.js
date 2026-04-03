'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Stethoscope = ({className}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>

export default function MentionsLegalesPage() {
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
      title: "Éditeur du site",
      html: `<p>Le site <strong>www.prepa-fpc.fr</strong> est édité par :</p>
<ul>
<li>Raison sociale : <strong>LP Labs</strong>, SAS au capital de 50 €</li>
<li>Siège social : <strong>20 route de la Rousserie, 50200 Monthuchon, France</strong></li>
<li>SIRET : <strong>102 976 990 00014</strong></li>

<li>Contact : <strong><a href="mailto:support@prepa-fpc.fr" class="text-red-600 hover:underline">support@prepa-fpc.fr</a></strong></li>
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
      html: `<p>L'ensemble des contenus présents sur le site <strong>www.prepa-fpc.fr</strong> (textes, exercices, algorithmes, design, logos, code source, images) est la <strong>propriété exclusive de LP Labs</strong> et est protégé par le droit français et international de la propriété intellectuelle.</p>
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
<p>Vous disposez d'un <strong>droit d'accès, de rectification, de suppression et de portabilité</strong> de vos données en contactant <strong><a href="mailto:support@prepa-fpc.fr" class="text-red-600 hover:underline">support@prepa-fpc.fr</a></strong>.</p>
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
<li>Des <strong>résultats obtenus au concours FPC</strong></li>
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
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Mentions légales</h1>
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
              <li><span className="text-slate-500 text-xs">&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#64;&#112;&#114;&#101;&#112;&#97;&#45;&#102;&#112;&#99;&#46;&#102;&#114;</span></li>
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
