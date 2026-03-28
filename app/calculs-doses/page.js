'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const Stethoscope = ({className}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>

export default function CalculsDosesPage() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('fiches')
  const [exCategory, setExCategory] = useState('concentrations')
  const [exercise, setExercise] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [exState, setExState] = useState('idle')
  const [exLoading, setExLoading] = useState(false)
  const [exError, setExError] = useState('')
  const [exRemaining, setExRemaining] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 })
  const ficheRefs = useRef([])

  async function downloadFiche(index, title) {
    const el = ficheRefs.current[index]
    if (!el) return
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf().set({
      margin: 10,
      filename: `fiche-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save()
  }

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

  async function generateExercise() {
    setExLoading(true)
    setExError('')
    setExercise(null)
    setUserAnswer('')
    setExState('idle')
    try {
      const res = await fetch('/api/calculs-doses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: exCategory }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setExercise(data.exercise)
      if (data.remaining !== undefined) setExRemaining(data.remaining)
    } catch (err) {
      setExError(err.message)
    }
    setExLoading(false)
  }

  function checkAnswer() {
    if (!userAnswer || !exercise) return
    const userVal = parseFloat(userAnswer.replace(',', '.'))
    const expectedVal = parseFloat(exercise.answer)
    const tolerance = exCategory === 'debit' ? 1 : 0.1
    const correct = Math.abs(userVal - expectedVal) <= tolerance
    setIsCorrect(correct)
    setExState('answered')
    setSessionScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }))
  }

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
      <header className="pt-16 pb-8 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 whitespace-nowrap">Maîtrisez parfaitement les <span className="text-red-600">calculs pour le concours</span></h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">Révisez les formules avec les 4 fiches de révisions indispensables !</p>
        </div>
      </header>

      {/* ONGLETS */}
      <div className="bg-slate-50 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        <div className="flex justify-center gap-2 relative z-10">
          <button onClick={() => setActiveTab('fiches')} className={`px-6 py-2.5 rounded-full font-bold text-sm transition cursor-pointer ${activeTab === 'fiches' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Fiches de révision</button>
          <button onClick={() => setActiveTab('exercices')} className={`px-6 py-2.5 rounded-full font-bold text-sm transition cursor-pointer ${activeTab === 'exercices' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Générateur d'exercices</button>
        </div>
      </div>

      {/* ==================== FICHES DE RÉVISION ==================== */}
      {activeTab === 'fiches' && (
        <>
        <section className="py-12 md:py-16 bg-gradient-to-b from-slate-200 to-slate-50">
          <div className="max-w-[90rem] mx-auto px-4 grid md:grid-cols-2 gap-8">

            {/* Produit en croix */}
            <div ref={el => ficheRefs.current[0] = el} className="bg-white rounded-3xl shadow-md p-7 hover:shadow-lg transition border-2 border-purple-300" style={{backgroundImage:'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize:'16px 16px'}}>
              <div className="relative mb-5 text-center">
                <span className="absolute left-0 -top-1 w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center font-black text-base text-slate-900">1</span>
                <h3 className="text-xl font-black text-slate-900">Le Produit en croix</h3>
                <button onClick={() => downloadFiche(0, 'produit-en-croix')} className="absolute right-0 top-0 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Télécharger en PDF"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button>
              </div>

                {/* Principe */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Le principe en une phrase</p>
                <div className="bg-purple-50 border border-slate-200 rounded-2xl p-5 mb-7 text-sm text-slate-700 leading-relaxed">
                  Tu connais <strong className="text-purple-600">3 valeurs sur 4</strong> dans un tableau. Tu veux trouver la 4e.<br/>Tu <strong className="text-purple-600">multiplies en diagonale</strong>, puis tu <strong className="text-purple-600">divises par la valeur restante</strong>.
                </div>

                {/* Méthode */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">La méthode en 3 étapes</p>
                <div className="space-y-3 mb-7">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Pose ton tableau</strong> — à gauche ce que tu as, à droite ce que tu cherches. Vérifie que les <mark className="bg-purple-100 text-inherit px-1 rounded">unités correspondent</mark> ligne par ligne.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Multiplie en diagonale</strong> — les deux valeurs qui se font face (celles que tu connais).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Divise par la valeur restante</strong> — celle qui est seule dans son coin.</p>
                  </div>
                </div>

                {/* Tableau en croix visuel */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Le tableau en croix</p>
                <div className="flex flex-col items-center gap-3 mb-7">
                  <div className="grid grid-cols-2 rounded-2xl overflow-hidden border-2 border-slate-200 w-72">
                    <div className="bg-slate-50 p-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border border-slate-200">Quantité</div>
                    <div className="bg-slate-50 p-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border border-slate-200">Volume</div>
                    <div className="p-4 text-center font-bold text-slate-900 border border-slate-200">500 mg</div>
                    <div className="p-4 text-center font-bold text-slate-900 border border-slate-200">5 ml</div>
                    <div className="p-4 text-center font-bold text-slate-900 border border-slate-200">750 mg</div>
                    <div className="p-4 text-center font-black text-purple-700 text-lg bg-slate-50 border border-slate-200">? ml</div>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold text-center">On multiplie <span className="text-purple-600 font-extrabold">750 × 5</span> (diagonale connue) puis on divise par <span className="text-slate-900 font-extrabold">500</span></p>
                </div>

                {/* Exemple 1 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 1 — Amoxicilline</p>
                <div className="bg-purple-50 border border-slate-200 rounded-2xl p-5 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-slate-200">Prescription : <span className="text-purple-700 font-extrabold">750 mg</span> d'amoxicilline. Disponible : flacon de <span className="text-purple-700 font-extrabold">500 mg / 5 ml</span>.</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">Étape 1 — Je pose mon tableau</p>
                  <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-slate-200 w-fit mx-auto mb-4 bg-white">
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200"></div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Quantité</div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Volume</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je sais</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">500 mg</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">5 ml</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je cherche</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">750 mg</div>
                    <div className="p-2.5 px-4 text-center font-black text-purple-700 bg-purple-100 border border-slate-200">?</div>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">Étape 2 & 3 — Diagonale / restante</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center font-bold text-sm text-slate-700">
                    (750 × 5) / 500 = 3 750 / 500 = <span className="text-purple-700 font-black text-base">7,5 ml</span>
                  </div>
                </div>

                {/* Exemple 2 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 2 — Paracétamol</p>
                <div className="bg-purple-50 border border-slate-200 rounded-2xl p-5 mb-7">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-slate-200">Prescription : <span className="text-purple-700 font-extrabold">200 mg</span> de paracétamol. Disponible : sirop <span className="text-purple-700 font-extrabold">120 mg / 5 ml</span>.</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">Étape 1 — Je pose mon tableau</p>
                  <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-slate-200 w-fit mx-auto mb-4 bg-white">
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200"></div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Quantité</div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Volume</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je sais</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">120 mg</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">5 ml</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je cherche</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">200 mg</div>
                    <div className="p-2.5 px-4 text-center font-black text-purple-700 bg-purple-100 border border-slate-200">?</div>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">Étape 2 & 3 — Diagonale / restante</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center font-bold text-sm text-slate-700">
                    (200 × 5) / 120 = 1 000 / 120 ≈ <span className="text-purple-700 font-black text-base">8,3 ml</span>
                  </div>
                </div>

                {/* Exemple 3 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 3 — Insuline (piège unités !)</p>
                <div className="bg-purple-50 border border-slate-200 rounded-2xl p-5 mb-7">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-slate-200">Prescription : <span className="text-purple-700 font-extrabold">0,5 g</span> de médicament. Disponible : ampoule de <span className="text-purple-700 font-extrabold">250 mg / 2 ml</span>.</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">Étape 1 — Je convertis d'abord !</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600">
                    <p><span className="text-slate-400 mr-1">.</span> 0,5 g = 0,5 x 1 000 = <strong>500 mg</strong></p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">Étape 2 — Je pose mon tableau</p>
                  <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-slate-200 w-fit mx-auto mb-4 bg-white">
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200"></div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Quantité</div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Volume</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je sais</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">250 mg</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">2 ml</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je cherche</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">500 mg</div>
                    <div className="p-2.5 px-4 text-center font-black text-purple-700 bg-purple-100 border border-slate-200">?</div>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">Étape 3 — Diagonale / restante</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center font-bold text-sm text-slate-700">
                    (500 x 2) / 250 = 1 000 / 250 = <span className="text-purple-700 font-black text-base">4 ml</span>
                  </div>
                </div>

                {/* Pièges */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Pièges fréquents</p>
                <div className="bg-purple-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Unités différentes</strong> — Si la prescription est en g et le flacon en mg, convertis d'abord ! (1 g = 1 000 mg)</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Valeurs inversées</strong> — Assure-toi que mg est avec mg et ml avec ml, sur la même colonne.</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Résultat aberrant ?</strong> — Si tu trouves 75 ml de sirop pour un enfant, c'est probablement faux. Vérifie toujours !</span></div>
                </div>


            </div>

            {/* Débit en gouttes/min */}
            <div ref={el => ficheRefs.current[1] = el} className="bg-white rounded-3xl shadow-md p-7 hover:shadow-lg transition border-2 border-blue-300" style={{backgroundImage:'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize:'16px 16px'}}>
              <div className="relative mb-5 text-center">
                <span className="absolute left-0 -top-1 w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center font-black text-base text-slate-900">2</span>
                <h3 className="text-xl font-black text-slate-900">Débit en gouttes / min</h3>
                <button onClick={() => downloadFiche(1, 'debit-gouttes-min')} className="absolute right-0 top-0 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Télécharger en PDF"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button>
              </div>

                {/* Principe */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Le principe en une phrase</p>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-7 text-sm text-slate-700 leading-relaxed">
                  Tu connais le <strong className="text-blue-600">volume à perfuser</strong> et le <strong className="text-blue-600">temps prévu</strong>.<br/>Tu calcules combien de <strong className="text-blue-600">gouttes par minute</strong> doivent tomber pour que la perfusion se termine à temps.
                </div>

                {/* Types de tubulure */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">La clé : le type de tubulure</p>
                <div className="grid grid-cols-2 gap-3 mb-7">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 mb-2">Standard</p>
                    <p className="text-3xl font-black text-blue-600 mb-1">x20</p>
                    <p className="text-xs font-semibold text-slate-500">1 ml = 20 gouttes</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 mb-2">Pédiatrique</p>
                    <p className="text-3xl font-black text-blue-600 mb-1">x60</p>
                    <p className="text-xs font-semibold text-slate-500">1 ml = 60 gouttes</p>
                  </div>
                </div>

                {/* Méthode */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">La méthode en 3 étapes</p>
                <div className="space-y-3 mb-7">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Repère tes données</strong> — le volume en ml et le temps en heures. Note le type de tubulure (<mark className="bg-blue-100 text-inherit px-1 rounded">x20</mark> ou <mark className="bg-blue-100 text-inherit px-1 rounded">x60</mark>).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Au numérateur</strong> — multiplie le volume par le facteur de gouttes (20 ou 60). C'est le <mark className="bg-blue-100 text-inherit px-1 rounded">nombre total de gouttes</mark>.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Au dénominateur</strong> — convertis le temps en minutes (heures x 60). Puis divise. <mark className="bg-blue-100 text-inherit px-1 rounded">Arrondi à l'entier</mark> !</p>
                  </div>
                </div>

                {/* Formule décomposée */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">La formule décomposée</p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-7 flex items-center justify-center gap-3 flex-wrap">
                  <div className="text-center"><div className="bg-blue-200 text-blue-800 font-black text-lg px-4 py-2 rounded-xl">?</div><p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Débit</p></div>
                  <span className="text-2xl font-black text-slate-300">=</span>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="text-center"><div className="bg-blue-100 text-blue-700 font-black text-lg px-4 py-2 rounded-xl">Vol</div><p className="text-[10px] font-bold text-slate-400 mt-1">en ml</p></div>
                      <span className="text-xl font-black text-slate-300">x</span>
                      <div className="text-center"><div className="bg-blue-100 text-blue-700 font-black text-lg px-4 py-2 rounded-xl">20</div><p className="text-[10px] font-bold text-slate-400 mt-1">gttes/ml</p></div>
                    </div>
                    <div className="w-full h-[3px] bg-slate-400 rounded"></div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="text-center"><div className="bg-blue-100 text-blue-700 font-black text-lg px-4 py-2 rounded-xl">Heures</div><p className="text-[10px] font-bold text-slate-400 mt-1">durée</p></div>
                      <span className="text-xl font-black text-slate-300">x</span>
                      <div className="text-center"><div className="bg-blue-100 text-blue-700 font-black text-lg px-4 py-2 rounded-xl">60</div><p className="text-[10px] font-bold text-slate-400 mt-1">min/h</p></div>
                    </div>
                  </div>
                </div>

                {/* Exemple 1 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 1 — Perfusion standard</p>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-blue-200">Prescription : <span className="text-blue-700 font-extrabold">1 000 ml</span> de NaCl en <span className="text-blue-700 font-extrabold">6 heures</span>. Tubulure standard x20.</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 mb-2">Étape 1 — Je repère mes données</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400 mr-1">.</span> Volume = 1 000 ml</p>
                    <p><span className="text-slate-400 mr-1">.</span> Temps = 6 h = 6 x 60 = 360 min</p>
                    <p><span className="text-slate-400 mr-1">.</span> Tubulure standard = 20 gttes/ml</p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 mb-2">Étape 2 & 3 — Je calcule</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400 mr-1">.</span> Numérateur : 1 000 x 20 = 20 000 gouttes</p>
                    <p><span className="text-slate-400 mr-1">.</span> Dénominateur : 6 x 60 = 360 minutes</p>
                    <p className="pt-2 border-t border-dashed border-slate-200 font-bold text-slate-900"><span className="text-slate-400 mr-1">.</span> 20 000 / 360 ≈ <span className="text-blue-700 font-black text-base">56 gouttes/min</span></p>
                  </div>
                </div>

                {/* Exemple 2 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 2 — Formule simplifiée</p>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-blue-200">Prescription : <span className="text-blue-700 font-extrabold">250 ml</span> en <span className="text-blue-700 font-extrabold">2 heures</span>. Tubulure standard x20.</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 mb-2">Astuce : 20 / 60 = 1/3</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400 mr-1">.</span> (Vol x 20) / (Heures x 60) = Vol / (Heures x 3)</p>
                    <p><span className="text-slate-400 mr-1">.</span> = 250 / (2 x 3) = 250 / 6</p>
                    <p className="pt-2 border-t border-dashed border-slate-200 font-bold text-slate-900"><span className="text-slate-400 mr-1">.</span> ≈ <span className="text-blue-700 font-black text-base">42 gouttes/min</span></p>
                  </div>
                </div>

                {/* Exemple 3 — Pédiatrique */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 3 — Perfusion pédiatrique</p>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-7">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-blue-200">Prescription : <span className="text-blue-700 font-extrabold">100 ml</span> de G5% en <span className="text-blue-700 font-extrabold">4 heures</span>. Tubulure pédiatrique x60.</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 mb-2">Calcul avec tubulure pédiatrique</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400 mr-1">.</span> Numérateur : 100 x 60 = 6 000 gouttes</p>
                    <p><span className="text-slate-400 mr-1">.</span> Dénominateur : 4 x 60 = 240 minutes</p>
                    <p className="pt-2 border-t border-dashed border-slate-200 font-bold text-slate-900"><span className="text-slate-400 mr-1">.</span> 6 000 / 240 = <span className="text-blue-700 font-black text-base">25 gouttes/min</span></p>
                  </div>
                </div>

                {/* Pièges */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Pièges fréquents</p>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Standard ou pédiatrique ?</strong> — Confondre x20 et x60 change complètement le résultat.</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Heures ≠ minutes</strong> — Si on te donne 6h, convertis : 6 x 60 = 360 min. Si c'est déjà en minutes, ne multiplie pas !</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Toujours arrondir à l'entier</strong> — Une goutte ne se coupe pas en deux. 41,6 → 42 gouttes/min.</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Résultat aberrant ?</strong> — Un débit &gt; 150 ou &lt; 5 gttes/min devrait te mettre la puce à l'oreille.</span></div>
                </div>

            </div>

            {/* Conversions */}
            <div ref={el => ficheRefs.current[2] = el} className="bg-white rounded-3xl shadow-md p-7 hover:shadow-lg transition border-2 border-red-300" style={{backgroundImage:'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize:'16px 16px'}}>
              <div className="relative mb-5 text-center">
                <span className="absolute left-0 -top-1 w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center font-black text-base text-slate-900">3</span>
                <h3 className="text-xl font-black text-slate-900">Conversions de masse</h3>
                <button onClick={() => downloadFiche(2, 'conversions-masse')} className="absolute right-0 top-0 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Télécharger en PDF"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button>
              </div>

                {/* Principe */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Le principe en une phrase</p>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-7 text-sm text-slate-700 leading-relaxed">
                  En pharmacie, les doses s'expriment en <strong className="text-red-600">g</strong>, <strong className="text-red-600">mg</strong> ou <strong className="text-red-600">µg</strong>.<br/>Pour passer d'une unité à l'autre, on <strong className="text-red-600">multiplie ou divise par 1 000</strong>. La virgule se déplace de <strong className="text-red-600">3 rangs</strong>.
                </div>

                {/* Échelle des unités */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">L'échelle des unités</p>
                <div className="flex items-center justify-center gap-0 mb-7 flex-wrap">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center w-36">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 mb-1">Gramme</p>
                    <p className="text-2xl font-black text-red-600">1 g</p>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <p className="text-[10px] font-extrabold text-red-500">x 1 000 →</p>
                    <p className="text-[10px] font-extrabold text-red-400">← / 1 000</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center w-36">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 mb-1">Milligramme</p>
                    <p className="text-2xl font-black text-red-600">1 000 mg</p>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <p className="text-[10px] font-extrabold text-red-500">x 1 000 →</p>
                    <p className="text-[10px] font-extrabold text-red-400">← / 1 000</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center w-36">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 mb-1">Microgramme</p>
                    <p className="text-xl font-black text-red-600">1 000 000 µg</p>
                  </div>
                </div>

                {/* Le truc à retenir */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Le truc à retenir</p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-7 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-red-100 text-red-600 font-extrabold text-xs px-3 py-1 rounded-lg shrink-0">→ Droite</span>
                    <p className="text-sm text-slate-700">Vers une unité <strong>plus petite</strong> (g → mg → µg) : <mark className="bg-red-100 text-inherit px-1 rounded">x 1 000</mark></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-100 text-red-600 font-extrabold text-xs px-3 py-1 rounded-lg shrink-0">← Gauche</span>
                    <p className="text-sm text-slate-700">Vers une unité <strong>plus grande</strong> (µg → mg → g) : <mark className="bg-red-100 text-inherit px-1 rounded">/ 1 000</mark></p>
                  </div>
                </div>

                {/* Méthode */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">La méthode en 2 étapes</p>
                <div className="space-y-3 mb-7">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Dans quel sens je vais ?</strong> — De g vers mg = unité plus petite → je multiplie. De µg vers mg = unité plus grande → je divise.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Je déplace la virgule de 3 rangs</strong> — vers la droite si x 1 000, vers la gauche si / 1 000. S'il manque des chiffres, j'ajoute des zéros.</p>
                  </div>
                </div>

                {/* Exemple 1 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 1 — Gramme vers milligramme</p>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-red-200">Convertir <span className="text-red-600 font-extrabold">0,075 g</span> en <span className="text-red-600 font-extrabold">mg</span></p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 mb-2">Étape 1 — Dans quel sens ?</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600">
                    <p><span className="text-slate-400 mr-1">.</span> g vers mg = unité plus petite → je <strong>multiplie</strong> par 1 000</p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 mb-2">Étape 2 — Je déplace la virgule</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center mb-3">
                    <p className="text-2xl font-black text-slate-900 tracking-widest">0<span className="text-red-500">,</span>075</p>
                    <p className="text-xs font-bold text-red-500 my-2">virgule → 3 rangs vers la droite</p>
                    <p className="text-2xl font-black text-slate-900 tracking-widest">0<span className="text-red-500">75</span><span className="text-red-500">,</span>0</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center font-bold text-sm text-slate-700">
                    0,075 g = 0,075 x 1 000 = <span className="text-red-600 font-black text-base">75 mg</span>
                  </div>
                </div>

                {/* Exemple 2 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 2 — Microgramme vers milligramme</p>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-red-200">Convertir <span className="text-red-600 font-extrabold">2 500 µg</span> en <span className="text-red-600 font-extrabold">mg</span></p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 mb-2">Étape 1 — Dans quel sens ?</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600">
                    <p><span className="text-slate-400 mr-1">.</span> µg vers mg = unité plus grande → je <strong>divise</strong> par 1 000</p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 mb-2">Étape 2 — Je déplace la virgule</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center mb-3">
                    <p className="text-2xl font-black text-slate-900 tracking-widest">2500<span className="text-red-500">,</span>0</p>
                    <p className="text-xs font-bold text-red-500 my-2">virgule ← 3 rangs vers la gauche</p>
                    <p className="text-2xl font-black text-slate-900 tracking-widest">2<span className="text-red-500">,</span><span className="text-red-500">500</span></p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center font-bold text-sm text-slate-700">
                    2 500 µg = 2 500 / 1 000 = <span className="text-red-600 font-black text-base">2,5 mg</span>
                  </div>
                </div>

                {/* Exemple 3 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 3 — Double saut : g vers µg</p>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-7">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-red-200">Convertir <span className="text-red-600 font-extrabold">0,003 g</span> en <span className="text-red-600 font-extrabold">µg</span></p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 mb-2">Étape 1 — Deux paliers à franchir</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600">
                    <p><span className="text-slate-400 mr-1">.</span> g → µg = 2 paliers → x 1 000 x 1 000 = <strong>x 1 000 000</strong></p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 mb-2">Étape 2 — Virgule : 6 rangs vers la droite</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center mb-3">
                    <p className="text-2xl font-black text-slate-900 tracking-widest">0<span className="text-red-500">,</span>003000</p>
                    <p className="text-xs font-bold text-red-500 my-2">virgule → 6 rangs vers la droite</p>
                    <p className="text-2xl font-black text-slate-900 tracking-widest"><span className="text-red-500">3000</span><span className="text-red-500">,</span>0</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center font-bold text-sm text-slate-700">
                    0,003 g = 0,003 x 1 000 000 = <span className="text-red-600 font-black text-base">3 000 µg</span>
                  </div>
                </div>

                {/* Pièges */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Pièges fréquents</p>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Virgule dans le mauvais sens</strong> — Plus petit = droite (x), plus grand = gauche (/). Pense à l'escalier.</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Convertir AVANT de calculer</strong> — Si la prescription est en g et le flacon en mg, convertis d'abord. Puis fais le produit en croix.</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>mg ≠ µg → facteur 1 000 !</strong> — Confondre = donner 1 000 fois trop ou pas assez. Risque de <mark className="bg-red-100 text-inherit px-1 rounded">surdosage</mark>.</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Zéros manquants</strong> — Si la virgule se déplace au-delà des chiffres, ajoute des zéros ! 5 mg → µg = 5 000 µg.</span></div>
                </div>

            </div>

            {/* Concentrations */}
            <div ref={el => ficheRefs.current[3] = el} className="bg-white rounded-3xl shadow-md p-7 hover:shadow-lg transition border-2 border-amber-300" style={{backgroundImage:'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize:'16px 16px'}}>
              <div className="relative mb-5 text-center">
                <span className="absolute left-0 -top-1 w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center font-black text-base text-slate-900">4</span>
                <h3 className="text-xl font-black text-slate-900">Concentration en %</h3>
                <button onClick={() => downloadFiche(3, 'concentration-pourcentage')} className="absolute right-0 top-0 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Télécharger en PDF"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button>
              </div>

                {/* Principe */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Le principe en une phrase</p>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-7 text-sm text-slate-700 leading-relaxed">
                  Quand un produit est dosé en <strong className="text-amber-600">pourcentage</strong>, c'est un nombre de <strong className="text-amber-600">grammes pour 100 ml</strong>.<br/>Si tu connais le volume total, tu peux calculer la <strong className="text-amber-600">masse de principe actif</strong>.
                </div>

                {/* Règle d'or */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">La règle d'or</p>
                <div className="bg-amber-200 border border-amber-300 rounded-2xl p-6 text-center mb-7">
                  <p className="text-2xl font-black text-amber-900">X % = X g pour 100 ml</p>
                  <p className="text-sm font-bold text-amber-700 mt-2">Le % TE DONNE directement le nombre de grammes. Il suffit de lire le chiffre !</p>
                </div>

                {/* Traduction concrète */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Traduction concrète</p>
                <div className="space-y-2 mb-7">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 font-black text-lg text-amber-600 shrink-0">G5%</div>
                    <div className="text-slate-400 px-2">→</div>
                    <div className="px-4 py-3 text-sm font-bold text-slate-700 bg-white flex-1"><span className="text-amber-600 font-extrabold">5 g</span> de glucose dans 100 ml</div>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 font-black text-lg text-amber-600 shrink-0">Bétadine 10%</div>
                    <div className="text-slate-400 px-2">→</div>
                    <div className="px-4 py-3 text-sm font-bold text-slate-700 bg-white flex-1"><span className="text-amber-600 font-extrabold">10 g</span> de povidone iodée dans 100 ml</div>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 font-black text-lg text-amber-600 shrink-0">NaCl 0,9%</div>
                    <div className="text-slate-400 px-2">→</div>
                    <div className="px-4 py-3 text-sm font-bold text-slate-700 bg-white flex-1"><span className="text-amber-600 font-extrabold">0,9 g</span> de chlorure de sodium dans 100 ml</div>
                  </div>
                </div>

                {/* Méthode */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">La méthode en 3 étapes</p>
                <div className="space-y-3 mb-7">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Lis le %</strong> — c'est le nombre de grammes pour 100 ml. Ex : G5% → <mark className="bg-amber-100 text-inherit px-1 rounded">5 g / 100 ml</mark>.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Regarde le volume réel</strong> — le flacon fait combien de ml ? Si c'est en litres, convertis d'abord (<mark className="bg-amber-100 text-inherit px-1 rounded">1 L = 1 000 ml</mark>).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">Produit en croix</strong> — si c'est 100 ml, lis directement. Sinon, pose le tableau et calcule.</p>
                  </div>
                </div>

                {/* Exemple 1 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 1 — G5%, flacon 500 ml</p>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-amber-200">Combien de grammes de glucose dans un flacon de <span className="text-amber-600 font-extrabold">G5%</span> de <span className="text-amber-600 font-extrabold">500 ml</span> ?</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-2">Étape 1 — Je traduis le %</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600">
                    <p><span className="text-slate-400 mr-1">.</span> G5% = 5 g de glucose pour 100 ml</p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-2">Étape 2 — Je pose mon tableau</p>
                  <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-slate-200 w-fit mx-auto mb-3 bg-white">
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200"></div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Masse</div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Volume</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je sais</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">5 g</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">100 ml</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je cherche</div>
                    <div className="p-2.5 px-4 text-center font-black text-amber-600 bg-amber-50 border border-slate-200">?</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">500 ml</div>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-2">Étape 3 — Produit en croix</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400 mr-1">.</span> (5 x 500) / 100 = 2 500 / 100</p>
                    <p className="pt-2 border-t border-dashed border-slate-200 font-bold text-slate-900"><span className="text-slate-400 mr-1">.</span> = <span className="text-amber-600 font-black text-base">25 g</span> de glucose</p>
                  </div>
                </div>

                {/* Exemple 2 */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 2 — Bétadine 10%, flacon 125 ml</p>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-amber-200">Combien de grammes dans un flacon de <span className="text-amber-600 font-extrabold">Bétadine 10%</span> de <span className="text-amber-600 font-extrabold">125 ml</span> ?</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-2">Calcul</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400 mr-1">.</span> 10% = 10 g pour 100 ml</p>
                    <p><span className="text-slate-400 mr-1">.</span> (10 x 125) / 100 = 1 250 / 100</p>
                    <p className="pt-2 border-t border-dashed border-slate-200 font-bold text-slate-900"><span className="text-slate-400 mr-1">.</span> = <span className="text-amber-600 font-black text-base">12,5 g</span> de povidone iodée</p>
                  </div>
                </div>

                {/* Exemple 3 — Piège litres */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Exemple 3 — NaCl 0,9%, poche 1 L (piège !)</p>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-7">
                  <p className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-dashed border-amber-200">Combien de grammes de NaCl dans une poche de <span className="text-amber-600 font-extrabold">NaCl 0,9%</span> de <span className="text-amber-600 font-extrabold">1 L</span> ?</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-2">Étape 1 — Je traduis le %</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600">
                    <p><span className="text-slate-400 mr-1">.</span> 0,9% = <strong>0,9 g</strong> pour 100 ml (pas 9 g !)</p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-2">Étape 2 — Je convertis les litres</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-sm text-slate-600">
                    <p><span className="text-slate-400 mr-1">.</span> 1 L = <strong>1 000 ml</strong></p>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-2">Étape 3 — Produit en croix</p>
                  <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-slate-200 w-fit mx-auto mb-3 bg-white">
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200"></div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Masse</div>
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Volume</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je sais</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">0,9 g</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">100 ml</div>
                    <div className="bg-slate-50 p-2 px-3 text-center text-[9px] font-extrabold uppercase text-slate-400 border border-slate-200">Je cherche</div>
                    <div className="p-2.5 px-4 text-center font-black text-amber-600 bg-amber-50 border border-slate-200">?</div>
                    <div className="p-2.5 px-4 text-center font-bold text-sm border border-slate-200">1 000 ml</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400 mr-1">.</span> (0,9 x 1 000) / 100 = 900 / 100</p>
                    <p className="pt-2 border-t border-dashed border-slate-200 font-bold text-slate-900"><span className="text-slate-400 mr-1">.</span> = <span className="text-amber-600 font-black text-base">9 g</span> de NaCl</p>
                  </div>
                </div>

                {/* Pièges */}
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Pièges fréquents</p>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>0,9% ≠ 9 g pour 100 ml</strong> — Le chiffre du % EST le nombre de grammes. 0,9% = 0,9 g. Lis tel quel !</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>Litres → millilitres</strong> — Le % est défini pour 100 ml. Si l'énoncé donne des litres, convertis d'abord.</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>% ≠ g/L</strong> — 5% = 5 g pour 100 ml = 50 g/L. Ne confonds pas, le facteur est de 10 !</span></div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-700"><span className="shrink-0 font-bold">.</span><span><strong>100 ml pile ?</strong> — Pas besoin de calcul ! G5% en 100 ml = 5 g, point.</span></div>
                </div>

            </div>

          </div>
        </section>

        <section className="py-16 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-black text-white mb-3">Prêt(e) à passer à la pratique ?</h2>
            <p className="text-slate-400 font-medium text-sm mb-8">Inscrivez-vous et accédez à tous les entraînements pour le concours FPC. Essai gratuit de 7 jours, sans carte bancaire.</p>
            <a href="/signup" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl transition shadow-lg shadow-red-200/30 text-sm">
              Commencer à m'entraîner <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </a>
          </div>
        </section>
        </>
      )}

      {/* ==================== GÉNÉRATEUR D'EXERCICES ==================== */}
      {activeTab === 'exercices' && (
        <section className="py-12 bg-slate-50 flex-1">
          <div className="max-w-2xl mx-auto px-4">

            {/* Sélection catégorie */}
            <div className="flex justify-center gap-3 mb-8">
              <button onClick={() => { setExCategory('concentrations'); setExercise(null); setExState('idle') }} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${exCategory === 'concentrations' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Concentrations en %</button>
              <button onClick={() => { setExCategory('debit'); setExercise(null); setExState('idle') }} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${exCategory === 'debit' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Débit gouttes/min</button>
            </div>

            {/* Compteur */}
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{exRemaining !== null ? `${exRemaining} exercice${exRemaining > 1 ? 's' : ''} restant${exRemaining > 1 ? 's' : ''} aujourd'hui` : '20 exercices / jour'}</span>
            </div>

            {/* Bouton générer */}
            {!exercise && (
              <div className="text-center">
                <button onClick={generateExercise} disabled={exLoading} className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl transition shadow-lg shadow-red-200 text-sm cursor-pointer disabled:opacity-50">
                  {exLoading ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Génération en cours...</span>
                  ) : 'Générer un exercice'}
                </button>
                {exError && <p className="text-red-600 font-bold text-sm mt-4">{exError}</p>}
              </div>
            )}

            {/* Exercice */}
            {exercise && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${exCategory === 'concentrations' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{exCategory === 'concentrations' ? 'Concentration' : 'Débit'}</span>
                  </div>
                  <p className="text-slate-900 font-bold text-lg leading-relaxed mb-6">{exercise.question}</p>

                  {exState === 'idle' && (
                    <div>
                      <div className="flex gap-3">
                        <input type="number" step="any" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && userAnswer && checkAnswer()} placeholder="Votre réponse" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400" />
                        <span className="flex items-center text-slate-500 font-bold text-sm">{exercise.unit}</span>
                      </div>
                      <button onClick={checkAnswer} disabled={!userAnswer} className="w-full mt-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition shadow-lg shadow-red-200 text-sm cursor-pointer disabled:opacity-50">Vérifier ma réponse</button>
                    </div>
                  )}

                  {exState === 'answered' && (
                    <div>
                      <div className={`rounded-2xl p-5 mb-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {isCorrect ? (
                            <><svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span className="font-black text-emerald-800">Bonne réponse !</span></>
                          ) : (
                            <><svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg><span className="font-black text-red-800">Mauvaise réponse — la bonne réponse est {exercise.answer} {exercise.unit}</span></>
                          )}
                        </div>
                        <p className="text-sm font-medium leading-relaxed mt-3 whitespace-pre-line" style={{color: isCorrect ? '#065f46' : '#991b1b'}}>{exercise.explanation}</p>
                      </div>
                      <button onClick={() => { setExercise(null); setUserAnswer(''); setExState('idle'); setIsCorrect(false) }} className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black rounded-xl transition text-sm cursor-pointer">Exercice suivant</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Score session */}
            {sessionScore.total > 0 && (
              <div className="mt-6 text-center">
                <span className="text-sm font-bold text-slate-500">{sessionScore.correct}/{sessionScore.total} bonne{sessionScore.correct > 1 ? 's' : ''} réponse{sessionScore.correct > 1 ? 's' : ''} cette session</span>
              </div>
            )}
          </div>
        </section>
      )}

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
              <li><a href="/blog/dates-concours-fpc-infirmier-2026" className="hover:text-white transition">Dates concours FPC</a></li>
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
          <p>&copy; 2026 Prépa FPC (prepa-fpc.fr). Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
