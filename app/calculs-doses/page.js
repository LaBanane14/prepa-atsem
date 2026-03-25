'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Stethoscope = ({className}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>

export default function CalculsDosesPage() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const navLinks = [
    { href: '/', label: 'Accueil', active: false },
    { href: '/calculs-doses', label: 'Calculs de doses', active: true },
    { href: '/blog', label: 'Blog', active: false },
    { href: '/tarifs', label: 'Tarifs', active: false }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-200 flex flex-col">

      {/* NAVIGATION */}
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
              <a key={link.label} href={link.href} className={link.active ? 'text-red-600' : 'hover:text-red-600 transition'}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {!authLoading && (user ? (
              <>
                <a href="/dashboard" className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-red-200 transition transform hover:-translate-y-0.5 text-sm">Mon tableau de bord</a>
                <button onClick={handleLogout} className="hidden md:block text-slate-400 hover:text-red-600 transition cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
              </>
            ) : (
              <>
                <a href="/login" className="hidden md:block text-slate-600 font-bold hover:text-slate-900 transition text-sm">Connexion</a>
                <a href="/signup" className="hidden md:inline-flex bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-slate-200 transition transform hover:-translate-y-0.5 text-sm">Inscription</a>
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
                <a key={link.label} href={link.href} className={`block py-3 px-4 rounded-xl font-bold transition ${link.active ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}>{link.label}</a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <a href="/dashboard" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Mon espace</a>
                    <button onClick={handleLogout} className="block py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition text-center w-full">Déconnexion</button>
                  </>
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

      {/* HEADER */}
      <header className="pt-16 pb-12 bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-700 text-sm font-bold mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            Entraînement ciblé
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Maîtrisez les <span className="text-red-600">calculs de doses</span></h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">Révisez toutes les formules essentielles et entraînez-vous avec des exercices générés à l'infini. C'est la clé pour assurer vos points à l'épreuve écrite.</p>
        </div>
      </header>

      {/* SECTION FORMULES */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-500/5 rounded-full"></div>
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-slate-700/30 rounded-full"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white mb-4">Les formules indispensables</h2>
            <p className="text-slate-400 font-medium">Apprenez-les par cœur — elles reviennent à chaque concours.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Produit en croix */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Produit en croix</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 text-center mb-4">
                <p className="text-2xl font-black text-slate-900">x = (a × d) / b</p>
              </div>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">La base de tout calcul de dose. Si <strong className="text-slate-800">b mg</strong> correspondent à <strong className="text-slate-800">d ml</strong>, alors pour <strong className="text-slate-800">a mg</strong> il faut <strong className="text-slate-800">x ml</strong>.</p>
            </div>

            {/* Débit en gouttes */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 14.69c1.34 0 2.44-1.12 2.44-2.48 0-.71-.35-1.38-1.05-1.95S12.6 9.08 12.44 8.2c-.18.88-.7 1.74-1.4 2.3s-1.16 1.24-1.16 1.7c0 1.36 1.12 2.48 2.44 2.48z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Débit en gouttes/min</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 text-center mb-4">
                <p className="text-2xl font-black text-slate-900">Débit = (Volume × 20) / (Temps × 60)</p>
              </div>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">Volume en ml, temps en heures. <strong className="text-slate-800">1 ml = 20 gouttes</strong> (perfuseur standard). Pour un perfuseur pédiatrique : 1 ml = 60 gouttes.</p>
            </div>

            {/* Conversions */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Conversions de masse</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 text-center mb-4 space-y-1">
                <p className="text-lg font-black text-slate-900">1 g = 1 000 mg</p>
                <p className="text-lg font-black text-slate-900">1 mg = 1 000 µg</p>
              </div>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">La première étape avant tout calcul : <strong className="text-slate-800">convertir dans la même unité</strong>. Beaucoup d'erreurs viennent d'un oubli de conversion.</p>
            </div>

            {/* Pourcentage */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Concentration en %</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 text-center mb-4">
                <p className="text-2xl font-black text-slate-900">X% = X g pour 100 ml</p>
              </div>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">Exemple : <strong className="text-slate-800">G5 (Glucosé 5%)</strong> signifie 5 g de glucose dans 100 ml. Un flacon de 500 ml contient donc 25 g.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION ENTRAÎNEMENT */}
      <section className="py-20 bg-red-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="w-20 h-20 bg-white/20 text-white rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Prêt à vous entraîner ?</h2>
          <p className="text-lg text-red-100 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">Testez vos connaissances avec notre QCM de 20 questions couvrant tous les types de calculs : produit en croix, débits, conversions, pourcentages et calcul mental.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/qcm" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-red-600 font-bold px-8 py-4 rounded-2xl transition-all shadow-xl group text-lg">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
              Lancer le test gratuit
            </a>
            <a href="/signup" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg text-lg">
              Accès illimité
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION ASTUCES */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Astuces de calcul mental</h2>
            <p className="text-slate-600 font-medium">Les petits raccourcis qui font gagner du temps le jour J.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mb-4">1</div>
              <h4 className="font-bold text-slate-900 mb-2">Diviser par 0,5</h4>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">Diviser par 0,5 revient à <strong className="text-slate-800">multiplier par 2</strong>. Exemple : 60 / 0,5 = 120.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mb-4">2</div>
              <h4 className="font-bold text-slate-900 mb-2">Diviser par 0,25</h4>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">Diviser par 0,25 revient à <strong className="text-slate-800">multiplier par 4</strong>. Très courant dans les dilutions.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mb-4">3</div>
              <h4 className="font-bold text-slate-900 mb-2">Trouver 10% puis ajuster</h4>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">Pour trouver 5%, calculez d'abord <strong className="text-slate-800">10% puis divisez par 2</strong>. Rapide et fiable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><Stethoscope className="w-5 h-5 text-red-500" /><h4 className="text-white font-bold text-lg">Prépa FPC</h4></div>
            <p className="max-w-xs leading-relaxed">La plateforme d'entraînement de référence pour la réussite du concours infirmier.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources IFSI</h4>
            <ul className="space-y-3">
              <li><a href="/blog" className="hover:text-white transition">Dates concours FPC</a></li>
              <li><a href="/blog" className="hover:text-white transition">Dossier Passerelle AS/AP</a></li>
              <li><a href="/calculs-doses" className="hover:text-white transition">Formules calculs de doses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Légal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
              <li><a href="#" className="hover:text-white transition">CGV &amp; CGU</a></li>
              <li><a href="mailto:contact@prepa-fpc.fr" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center">
          <p>&copy; 2026 Prépa FPC (passerelle-fpc.fr). Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
