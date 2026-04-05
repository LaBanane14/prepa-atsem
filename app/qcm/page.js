'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getReorderedQuiz } from '../../lib/quizData'

const letters = ['A', 'B', 'C', 'D']

const catColors = {
  "Calcul de dose": { badge: "bg-red-50 text-red-600", wrapper: "bg-red-100/60", card: "bg-red-50 border-red-200", iconText: "text-red-600", progressBar: "bg-red-600" },
  "Pourcentage": { badge: "bg-purple-50 text-purple-600", wrapper: "bg-purple-100/60", card: "bg-purple-50 border-purple-200", iconText: "text-purple-600", progressBar: "bg-purple-600" },
  "Produit en croix": { badge: "bg-amber-50 text-amber-600", wrapper: "bg-amber-100/60", card: "bg-amber-50 border-amber-200", iconText: "text-amber-600", progressBar: "bg-amber-500" },
  "Calcul mental": { badge: "bg-blue-50 text-blue-600", wrapper: "bg-blue-100/60", card: "bg-blue-50 border-blue-200", iconText: "text-blue-600", progressBar: "bg-blue-600" },
  "Équation": { badge: "bg-emerald-50 text-emerald-600", wrapper: "bg-emerald-100/60", card: "bg-emerald-50 border-emerald-200", iconText: "text-emerald-600", progressBar: "bg-emerald-500" },
  "Conversion": { badge: "bg-cyan-50 text-cyan-600", wrapper: "bg-cyan-100/60", card: "bg-cyan-50 border-cyan-200", iconText: "text-cyan-600", progressBar: "bg-cyan-500" }
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div></div>}>
      <QuizContent />
    </Suspense>
  )
}

function QuizContent() {
  const searchParams = useSearchParams()
  const startFrom = parseInt(searchParams.get('start')) || 0
  const homeAnswer = searchParams.get('a') !== null ? parseInt(searchParams.get('a')) : null
  const [reorderedQuizData] = useState(() => getReorderedQuiz())
  const [current, setCurrent] = useState(startFrom)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState(() => {
    const initial = new Array(reorderedQuizData.length).fill(null)
    if (startFrom > 0 && homeAnswer !== null) {
      initial[0] = homeAnswer
    }
    return initial
  })
  const [state, setState] = useState('questioning')
  const [showResults, setShowResults] = useState(false)
  const data = reorderedQuizData[current]
  const hasAnswered = answers[current] !== null
  const progress = ((current + 1) / reorderedQuizData.length) * 100
  const colors = catColors[data.category] || catColors["Calcul de dose"]

  function selectOption(index) {
    if (state !== 'questioning') return
    setSelected(index)
  }

  function validate() {
    if (selected === null) return
    const newAnswers = [...answers]
    newAnswers[current] = selected
    setAnswers(newAnswers)
    setState('answered')
  }

  function goNext() {
    if (current < reorderedQuizData.length - 1) {
      setCurrent(current + 1)
      setSelected(null)
      setState(answers[current + 1] !== null ? 'answered' : 'questioning')
    } else {
      setShowResults(true)
    }
  }

  function goPrev() {
    if (current > 0) {
      setCurrent(current - 1)
      setSelected(answers[current - 1])
      setState(answers[current - 1] !== null ? 'answered' : 'questioning')
    }
  }

  function handleAction() {
    if (state === 'questioning') validate()
    else goNext()
  }

  const isCorrect = hasAnswered && answers[current] === data.correct

  if (showResults) {
    // Calcul du score final
    const finalScore = answers.reduce((acc, answer, index) => {
      return acc + (answer === reorderedQuizData[index].correct ? 1 : 0);
    }, 0);
    const percentage = (finalScore / reorderedQuizData.length) * 100;
    
    // Statistiques par catégorie
    const categoryStats = {};
    reorderedQuizData.forEach((q, index) => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0 };
      }
      categoryStats[q.category].total++;
      if (answers[index] === q.correct) {
        categoryStats[q.category].correct++;
      }
    });

    // Dictionnaire d'icônes SVG pour chaque catégorie avec les nouveaux logos
    const catIcons = {
      "Calcul de dose": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>,
      "Pourcentage": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 5L5 19M9 7a2 2 0 100-4 2 2 0 000 4zM19 21a2 2 0 100-4 2 2 0 000 4z"/></svg>,
      "Produit en croix": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>,
      "Calcul mental": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5M9 18h6M10 22h4"/></svg>,
      "Équation": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"/><path d="M9 11.2h5.7"/></svg>,
      "Conversion": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    };

    // Message conditionnel selon la note
    let resultMessage = "";
    if (finalScore < 10) {
      resultMessage = "Pas mal de chose à revoir, nous vous conseillons le Pack Sérénité";
    } else if (finalScore < 15) {
      resultMessage = "Bravo , vous avez déjà les bases ! Nous vous conseillons 6 mois de révision pour assurer au concours (oral et rédaction)";
    } else {
      resultMessage = "Bravo , les maths c'est acquis ! Nous vous conseillons 2 mois de révision pour assurer la partie rédactionnelle et oral";
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Nav />
        <main className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="max-w-3xl w-full bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-slate-100 relative overflow-hidden text-center">
            
            {/* Effets de fond */}
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            
            {/* Croix pour fermer / revenir à l'accueil */}
            <a href="/" className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors z-20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </a>

            <div className="relative z-10">
              <div className="mb-2">
                <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-900">Votre Résultat Global</span>
              </div>
              
              {/* Note globale (Toujours en rouge text-red-600) */}
              <div className="flex justify-center items-center mb-4">
                <span className="text-6xl sm:text-7xl font-black text-red-600 tracking-tighter">{finalScore}</span>
                <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter">/{reorderedQuizData.length}</span>
              </div>
              
              <p className="text-slate-600 mb-8 font-medium text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                {resultMessage}
              </p>

              {/* Bouton d'action */}
              <div className="flex flex-col items-center justify-center w-full mb-8">
                <a href="/signup" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl transition-all shadow-xl shadow-slate-900/20 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm sm:text-base transform hover:-translate-y-1">
                  Continuer à m'entrainer en m'inscrivant dès maintenant
                  <svg className="w-5 h-5 shrink-0 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
              </div>

              {/* Détail par catégorie */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 mb-8 text-left">
                <h3 className="font-bold text-slate-800 mb-4 text-sm sm:text-base">Détail de vos compétences :</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(categoryStats).map(([cat, stats]) => {
                    const catColor = catColors[cat] || catColors["Calcul de dose"];
                    const catPercent = Math.round((stats.correct / stats.total) * 100);
                    
                    // La barre de progression utilise maintenant la couleur de la matière
                    const barColor = catColor.progressBar;

                    return (
                      <div key={cat} className={`p-3 sm:p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 transition-transform hover:-translate-y-0.5 ${catColor.card}`}>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 ${catColor.iconText}`}>
                          {catIcons[cat] || <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">{cat}</span>
                            <span className="font-black text-slate-900 text-xs sm:text-sm">{stats.correct}/{stats.total}</span>
                          </div>
                          <div className="w-full bg-white/70 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${barColor}`} style={{width: `${catPercent}%`}}></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-rose-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
      </div>

      <Nav />

      {/* Utilisation de CSS Grid avec 1fr_auto_1fr pour forcer le centrage mathématique */}
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-6 xl:gap-8 items-start w-full">
          
          {/* Colonne 1 : Vide, elle sert à équilibrer la grille pour garder le centre parfaitement au milieu */}
          <div className="hidden xl:block"></div>

          {/* Colonne 2 : QCM CARD */}
          <div className="w-full max-w-2xl mx-auto xl:w-[650px] relative mt-2 sm:mt-4">
            {/* Croix quitter (hors du cadre, en haut à droite) */}
            <a href="/" className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 hover:bg-black text-white rounded-full flex items-center justify-center transition shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </a>

            {/* QCM CARD */}
            <div className={`${colors.wrapper} rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm`}>
            <div className="bg-white rounded-xl sm:rounded-[2rem] shadow-xl flex flex-col overflow-hidden relative">
              {/* Header */}
              <div className="relative flex flex-wrap justify-between items-center p-3 sm:p-5 border-b border-slate-100 gap-2">
                <span className="text-slate-600 font-bold text-xs sm:text-sm tracking-wide">Question {current + 1}/{reorderedQuizData.length}</span>
                <span className={`${colors.badge} px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide uppercase transition-colors duration-300`}>{data.category}</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                  <div className="h-full bg-slate-900 transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
              </div>

              {/* Question */}
              <div className="p-4 sm:p-6 flex-grow">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5 leading-relaxed">{data.question}</h2>
                <div className="space-y-2 sm:space-y-3">
                  {data.options.map((option, index) => {
                    let optClass = 'p-3 sm:p-4 border rounded-xl flex justify-between items-center group transition-all '
                    let letterClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold flex items-center justify-center text-xs sm:text-sm shrink-0 transition-all '
                    let circleContent = null

                    if (hasAnswered) {
                      if (index === data.correct) {
                        optClass += 'border-green-500 bg-green-50 '
                        letterClass += 'bg-green-500 text-white '
                        circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                      } else if (index === answers[current]) {
                        optClass += 'border-red-500 bg-red-50 '
                        letterClass += 'bg-red-500 text-white '
                        circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div>
                      } else {
                        optClass += 'border-slate-200 opacity-50 '
                        letterClass += 'bg-slate-100 text-slate-500 '
                        circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-300"></div>
                      }
                    } else if (selected === index) {
                      optClass += 'border-slate-900 bg-slate-50 shadow-[0_0_0_4px_rgba(15,23,42,0.05)] cursor-pointer '
                      letterClass += 'bg-slate-900 text-white '
                      circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-900 flex items-center justify-center"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-900 rounded-full"></div></div>
                    } else {
                      optClass += 'border-slate-200 cursor-pointer hover:bg-slate-50 '
                      letterClass += 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 '
                      circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-300"></div>
                    }

                    return (
                      <div key={index} className={optClass} onClick={() => !hasAnswered && selectOption(index)}>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className={letterClass}>{letters[index]}</span>
                          <span className="font-bold text-slate-800 text-sm sm:text-base">{option}</span>
                        </div>
                        {circleContent}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 sm:p-5 pt-0 flex gap-3">
                {current > 0 && (
                  <button onClick={goPrev} className="bg-slate-100 text-slate-700 font-bold py-3 px-4 sm:px-5 rounded-xl transition-colors hover:bg-slate-200 flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg>
                    <span className="hidden sm:inline">Précédent</span>
                  </button>
                )}
                <button onClick={handleAction} className={`flex-grow bg-slate-900 text-white font-bold py-3 px-4 rounded-xl transition-colors hover:bg-black flex items-center justify-center gap-2 text-sm sm:text-base shadow-md ${state === 'questioning' && selected === null ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
                  {state === 'questioning' ? (
                    <>Valider ma réponse <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></>
                  ) : current === reorderedQuizData.length - 1 ? (
                    <>Voir mes résultats <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></>
                  ) : (
                    <>Question suivante <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></>
                  )}
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* Colonne 3 : EXPLANATION - Apparaît à droite (ou en dessous sur mobile) */}
          <div className="w-full max-w-2xl mx-auto xl:mx-0 flex flex-col justify-start xl:pr-4">
            {hasAnswered && (
              <div className={`animate-fade-in mt-2 sm:mt-4 xl:mt-8 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col border-2 transition-colors duration-300 ${isCorrect ? 'bg-green-50 border-green-400 text-green-900' : 'bg-red-50 border-red-400 text-red-900'}`}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isCorrect ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl font-black">{isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}</span>
                </div>
                <div className="leading-relaxed font-medium text-slate-900 bg-white/60 p-3 sm:p-5 rounded-xl border border-white/40 shadow-sm text-sm sm:text-base" dangerouslySetInnerHTML={{__html: data.explanation}}></div>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function Nav() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="bg-purple-800 text-white p-1 rounded-xl shadow-sm">
            <svg viewBox="2 -2 36 26" fill="currentColor" className="w-9 h-9"><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-slate-900 block leading-none">Prépa <span className="text-red-600">FPC</span></span>
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">La passerelle IFSI</span>
          </div>
        </a>
        <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
          <a href="/" className="hover:text-red-600 transition">Accueil</a>
          <a href="/calculs-doses" className="hover:text-red-600 transition">Calculs de doses</a>
          <a href="/blog" className="hover:text-red-600 transition">Blog</a>
          <a href="/tarifs" className="hover:text-red-600 transition">Tarifs</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="hidden md:block text-slate-600 font-semibold hover:text-slate-900 transition">Connexion</a>
          <a href="/signup" className="hidden md:inline-flex bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-slate-200 transition transform hover:-translate-y-0.5">Inscription</a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white pb-4 shadow-lg absolute w-full z-40">
          <div className="max-w-6xl mx-auto px-4 pt-4 space-y-2">
            {[{href:'/',label:'Accueil'},{href:'/calculs-doses',label:'Calculs de doses'},{href:'/blog',label:'Blog'},{href:'/tarifs',label:'Tarifs'}].map(link => (
              <a key={link.label} href={link.href} className="block py-3 px-4 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition">{link.label}</a>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
              <a href="/login" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Connexion</a>
              <a href="/signup" className="block py-3 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-black transition text-center">Inscription</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-purple-500" viewBox="2 -2 36 26" fill="currentColor"><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            <h4 className="text-white font-bold text-lg">Prépa FPC</h4>
          </div>
          <p className="max-w-xs leading-relaxed">La plateforme d'entraînement dédiée aux candidats en reconversion professionnelle qui préparent le concours FPC. Entraînez-vous dans les conditions réelles du concours.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Ressources IFSI</h4>
          <ul className="space-y-3">
            <li><a href="/blog/dates-concours-fpc-infirmier-2026" className="hover:text-white transition">Dates concours FPC</a></li>
            <li><a href="/blog/dossier-inscription-concours-fpc-infirmier-guide-complet-2026" className="hover:text-white transition">Préparer son dossier FPC</a></li>
            <li><a href="/calculs-doses" className="hover:text-white transition">Formules calculs de doses</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Légal</h4>
          <ul className="space-y-3">
            <li><a href="/mentions-legales" className="hover:text-white transition">Mentions légales</a></li>
            <li><a href="/cgu" className="hover:text-white transition">CGV &amp; CGU</a></li>
            <li><span className="text-white text-sm font-medium">&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#64;&#112;&#114;&#101;&#112;&#97;&#45;&#102;&#112;&#99;&#46;&#102;&#114;</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center">
        <p>&copy; 2026 Prépa FPC (prepa-fpc.fr). Tous droits réservés.</p>
      </div>
    </footer>
  )
}