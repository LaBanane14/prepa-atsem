'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getReorderedQuiz } from '../../lib/quizData'

const letters = ['A', 'B', 'C', 'D']

const catColors = {
  "Institutionnel": { badge: "bg-purple-50 text-purple-600", wrapper: "bg-purple-100/60", card: "bg-purple-50 border-purple-200", iconText: "text-purple-600", progressBar: "bg-purple-600" },
  "Hygiène": { badge: "bg-cyan-50 text-cyan-600", wrapper: "bg-cyan-100/60", card: "bg-cyan-50 border-cyan-200", iconText: "text-cyan-600", progressBar: "bg-cyan-500" },
  "Santé": { badge: "bg-red-50 text-red-600", wrapper: "bg-red-100/60", card: "bg-red-50 border-red-200", iconText: "text-red-600", progressBar: "bg-red-500" },
  "Pédagogie": { badge: "bg-amber-50 text-amber-600", wrapper: "bg-amber-100/60", card: "bg-amber-50 border-amber-200", iconText: "text-amber-600", progressBar: "bg-amber-500" },
  "Relations pro": { badge: "bg-blue-50 text-blue-600", wrapper: "bg-blue-100/60", card: "bg-blue-50 border-blue-200", iconText: "text-blue-600", progressBar: "bg-blue-600" },
  "Calculs": { badge: "bg-emerald-50 text-emerald-600", wrapper: "bg-emerald-100/60", card: "bg-emerald-50 border-emerald-200", iconText: "text-emerald-600", progressBar: "bg-emerald-500" }
}

function LogoSvg({ className }) {
  return (
    <svg viewBox="2 -2 36 26" fill="currentColor" className={className}><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div></div>}>
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
  const colors = catColors[data.category] || catColors["Institutionnel"]

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

    // Dictionnaire d'icônes SVG pour chaque catégorie ATSEM
    const catIcons = {
      "Institutionnel": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"/></svg>,
      "Hygiène": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 21h10M12 3v3M8 6h8l1 5H7l1-5zM9 11v4a3 3 0 006 0v-4"/></svg>,
      "Santé": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
      "Pédagogie": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
      "Relations pro": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
      "Calculs": <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h3M13 14h3M8 18h3M13 18h3"/></svg>
    };

    // Message conditionnel selon la note
    let resultMessage = "";
    if (finalScore < 10) {
      resultMessage = "Pas mal de choses à revoir, nous vous conseillons le Pack Sérénité pour bien préparer le concours ATSEM";
    } else if (finalScore < 15) {
      resultMessage = "Bravo, vous avez déjà de bonnes bases ! Continuez à vous entraîner pour être prêt(e) le jour du concours ATSEM";
    } else {
      resultMessage = "Bravo, excellente maîtrise ! Vous êtes sur la bonne voie pour réussir le concours ATSEM";
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f0ff 15%, #ede9fe 30%, #f5f3ff 50%, #faf5ff 65%, #fdf4ff 80%, #fce7f3 100%)' }}>
        <Nav />
        <main className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="max-w-3xl w-full bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-slate-100 relative overflow-hidden text-center">

            {/* Effets de fond */}
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            {/* Croix pour fermer / revenir à l'accueil */}
            <a href="/" className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors z-20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </a>

            <div className="relative z-10">
              <div className="mb-2">
                <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-900">Votre Résultat Global</span>
              </div>

              {/* Note globale */}
              <div className="flex justify-center items-center mb-4">
                <span className="text-6xl sm:text-7xl font-black text-purple-800 tracking-tighter">{finalScore}</span>
                <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter">/{reorderedQuizData.length}</span>
              </div>

              <p className="text-slate-600 mb-8 font-medium text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                {resultMessage}
              </p>

              {/* Bouton d'action */}
              <div className="flex flex-col items-center justify-center w-full mb-8">
                <a href="/signup" className="w-full bg-purple-800 hover:bg-purple-900 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl transition-all shadow-xl shadow-purple-800/20 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm sm:text-base transform hover:-translate-y-1">
                  Continuer à m'entraîner en m'inscrivant dès maintenant
                  <svg className="w-5 h-5 shrink-0 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
              </div>

              {/* Détail par catégorie */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 mb-8 text-left">
                <h3 className="font-bold text-slate-800 mb-4 text-sm sm:text-base">Détail de vos compétences :</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(categoryStats).map(([cat, stats]) => {
                    const catColor = catColors[cat] || catColors["Institutionnel"];
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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f0ff 15%, #ede9fe 30%, #f5f3ff 50%, #faf5ff 65%, #fdf4ff 80%, #fce7f3 100%)' }}>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .notebook-bg {
          background-image:
            linear-gradient(#e5e7eb30 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb30 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .notebook-holes {
          position: relative;
        }
        .notebook-holes::before {
          content: '';
          position: absolute;
          left: 12px;
          top: 12%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 60px 0 #f1f5f9, 0 120px 0 #f1f5f9, 0 180px 0 #f1f5f9, 0 240px 0 #f1f5f9;
          z-index: 3;
        }
        .notebook-spine {
          position: absolute;
          left: 0;
          top: -1px;
          bottom: -1px;
          width: 34px;
          z-index: 1;
          overflow: hidden;
        }
        .notebook-spine::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            180deg,
            transparent 0px,
            transparent 12px,
            #c4b5d8 12px,
            #c4b5d8 14px,
            transparent 14px,
            transparent 18px
          );
          opacity: 0.5;
        }
        .notebook-spine::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #d1d5db40;
        }
        .notebook-margin {
          position: absolute;
          left: 34px;
          top: 0;
          bottom: 0;
          width: 1.5px;
          background: #fca5a550;
          z-index: 2;
        }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-fuchsia-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
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
            <a href="/" className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-purple-800 hover:bg-purple-900 text-white rounded-full flex items-center justify-center transition shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </a>

            {/* QCM CARD — Style cahier d'écolier */}
            <div className="relative">
            <div className="notebook-bg bg-[#fefefe] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden relative notebook-holes" style={{ maxWidth: '580px', margin: '0 auto' }}>
              <div className="notebook-spine">
                {/* Petits dessins d'enfants griffonnés dans la marge */}
                <svg className="absolute left-[6px] top-[15%] w-[22px] h-[22px] text-purple-300/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12,2 15,9 22,9.5 17,14 18.5,21 12,17 5.5,21 7,14 2,9.5 9,9"/></svg>
                <svg className="absolute left-[8px] top-[32%] w-[18px] h-[18px] text-pink-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="10" r="5"/><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><circle cx="9" cy="16" r="4"/><circle cx="15" cy="16" r="4"/><line x1="12" y1="15" x2="12" y2="24"/></svg>
                <svg className="absolute left-[5px] top-[50%] w-[24px] h-[20px] text-amber-300/50" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="20" cy="10" r="7"/><line x1="20" y1="0" x2="20" y2="2"/><line x1="20" y1="18" x2="20" y2="20"/><line x1="10" y1="10" x2="12" y2="10"/><line x1="28" y1="10" x2="30" y2="10"/><line x1="13" y1="4" x2="14.5" y2="5.5"/><line x1="25.5" y1="14.5" x2="27" y2="16"/></svg>
                <svg className="absolute left-[7px] top-[68%] w-[20px] h-[20px] text-emerald-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                <svg className="absolute left-[6px] top-[83%] w-[22px] h-[16px] text-blue-300/50" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 18 L15 5 L25 18"/><rect x="11" y="12" width="8" height="6"/><rect x="13" y="14" width="4" height="4"/></svg>
              </div>
              <div className="notebook-margin"></div>
              {/* Header */}
              <div className="relative flex flex-wrap justify-between items-center p-3 sm:p-5 pl-11 sm:pl-12 border-b border-purple-100/30 gap-2">
                <span className="text-slate-600 font-bold text-xs sm:text-sm tracking-wide">Question {current + 1}/{reorderedQuizData.length}</span>
                <span className={`${colors.badge} px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide uppercase transition-colors duration-300`}>{data.category}</span>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-purple-100">
                  <div className="h-full bg-purple-700 transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
              </div>

              {/* Question */}
              <div className="p-4 sm:p-6 pl-11 sm:pl-12 flex-grow relative">
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
                      optClass += 'border-purple-800 bg-purple-50 shadow-[0_0_0_4px_rgba(91,33,182,0.05)] cursor-pointer '
                      letterClass += 'bg-purple-800 text-white '
                      circleContent = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-purple-800 flex items-center justify-center"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-800 rounded-full"></div></div>
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
              <div className="p-4 sm:p-5 pl-11 sm:pl-12 pt-0 flex gap-3">
                {current > 0 && (
                  <button onClick={goPrev} className="bg-slate-100 text-slate-700 font-bold py-3 px-4 sm:px-5 rounded-xl transition-colors hover:bg-slate-200 flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg>
                    <span className="hidden sm:inline">Précédent</span>
                  </button>
                )}
                <button onClick={handleAction} className={`flex-grow bg-purple-800 text-white font-bold py-3 px-4 rounded-xl transition-colors hover:bg-purple-900 flex items-center justify-center gap-2 text-sm sm:text-base shadow-md ${state === 'questioning' && selected === null ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
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
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
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
        <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
          <a href="/" className="hover:text-purple-800 transition">Accueil</a>
          <a href="/calendrier" className="hover:text-purple-800 transition">Calendrier</a>
          <a href="/blog" className="hover:text-purple-800 transition">Blog</a>
          <a href="/tarifs" className="hover:text-purple-800 transition">Tarifs</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="hidden md:block text-slate-600 font-semibold hover:text-purple-800 transition">Connexion</a>
          <a href="/signup" className="hidden md:inline-flex bg-purple-800 hover:bg-purple-900 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-purple-200 transition transform hover:-translate-y-0.5">Inscription</a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white pb-4 shadow-lg absolute w-full z-40">
          <div className="max-w-6xl mx-auto px-4 pt-4 space-y-2">
            {[{href:'/',label:'Accueil'},{href:'/calendrier',label:'Calendrier'},{href:'/blog',label:'Blog'},{href:'/tarifs',label:'Tarifs'}].map(link => (
              <a key={link.label} href={link.href} className="block py-3 px-4 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition">{link.label}</a>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
              <a href="/login" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-center">Connexion</a>
              <a href="/signup" className="block py-3 px-4 rounded-xl font-bold text-white bg-purple-800 hover:bg-purple-900 transition text-center">Inscription</a>
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
            <LogoSvg className="w-5 h-5 text-purple-500" />
            <h4 className="text-white font-bold text-lg">Prépa ATSEM</h4>
          </div>
          <p className="max-w-xs leading-relaxed">La seule plateforme d'entraînement pour préparer le concours ATSEM. Entraînez-vous dans les conditions réelles du concours.</p>
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
            <li><a href="/cgu" className="hover:text-white transition">CGV &amp; CGU</a></li>
            <li><span className="text-white text-sm font-medium">support@prepa-atsem.fr</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center">
        <p>&copy; 2026 Prépa ATSEM. Tous droits réservés.</p>
      </div>
    </footer>
  )
}
