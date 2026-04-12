'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { ArrowLeft, Clock, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'

export default function AnnalePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [annale, setAnnale] = useState(null)
  const [loading, setLoading] = useState(true)

  // Exam state
  const [step, setStep] = useState('info') // info, exam, correcting, result
  const [reponses, setReponses] = useState({})
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      setAuthLoading(false)

      // Charger l'annale
      const { data, error } = await supabase
        .from('annales')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        window.location.href = '/annales'
        return
      }
      setAnnale(data)
      setTimeLeft((data.duree_minutes || 45) * 60)
      setLoading(false)
    })
  }, [id])

  // Timer
  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setTimerActive(false)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerActive])

  function startExam() {
    setStep('exam')
    setTimerActive(true)
    setReponses({})
  }

  function toggleProposition(qNum, lettre) {
    setReponses(prev => {
      const current = prev[qNum] || []
      if (current.includes(lettre)) {
        return { ...prev, [qNum]: current.filter(l => l !== lettre) }
      } else {
        return { ...prev, [qNum]: [...current, lettre] }
      }
    })
  }

  async function handleSubmit(auto = false) {
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)

    const questions = annale.questions || []
    let total = 0

    questions.forEach(q => {
      const userAnswers = (reponses[q.numero] || []).sort()
      const correctAnswers = (q.reponses_correctes || []).map(r => r.toLowerCase()).sort()
      if (correctAnswers.length > 0 && userAnswers.length === correctAnswers.length && userAnswers.every((v, i) => v === correctAnswers[i])) {
        total++
      }
    })

    setScore(total)

    // Sauvegarder dans Supabase
    const timeUsed = Math.round(((annale.duree_minutes || 45) * 60 - timeLeft) / 60)
    try {
      await supabase.from('scores_annales').insert({
        user_id: user.id,
        annale_id: annale.id,
        score: total,
        score_max: questions.length,
        temps_passe: timeUsed,
        reponses
      })
      await supabase.from('historique').insert({
        user_id: user.id,
        type: 'Examen',
        label: `Annale ${annale.region_nom} ${annale.annee}${annale.cdg ? ' (' + annale.cdg + ')' : ''}`,
        note: total,
        note_max: questions.length,
        nb_questions: questions.length,
        duration_minutes: timeUsed || 1,
      })
    } catch (e) { console.error('Erreur sauvegarde:', e) }

    setStep('result')
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isUrgent = timeLeft < 5 * 60
  const questions = annale?.questions || []
  const answeredCount = Object.values(reponses).filter(arr => arr.length > 0).length

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div></div>
  if (!annale) return null

  // INFO SCREEN
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg max-w-lg w-full overflow-hidden">
          <div className="bg-slate-900 text-white p-6">
            <a href="/annales" className="text-slate-400 hover:text-white transition text-sm flex items-center gap-1 mb-4"><ArrowLeft size={16} /> Retour aux annales</a>
            <h1 className="text-xl font-black">Annale {annale.region_nom} {annale.annee}</h1>
            {annale.cdg && <p className="text-slate-400 text-sm mt-1">{annale.cdg}</p>}
            <p className="text-slate-400 text-sm mt-1">Conditions réelles</p>
          </div>
          <div className="p-6 space-y-4">
            {[
              { icon: '📝', title: `QCM de ${questions.length} questions`, text: 'Chaque question peut avoir une ou plusieurs bonnes réponses.' },
              { icon: '⏱️', title: `Durée : ${annale.duree_minutes || 45} minutes`, text: 'Le chronomètre démarre dès le début. Envoi auto à la fin du temps.' },
              { icon: '📊', title: annale.bareme || '1 point par bonne réponse complète', text: 'Il faut cocher TOUTES les bonnes réponses sans erreur.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
            <button onClick={startExam} className="w-full bg-purple-800 hover:bg-purple-900 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm cursor-pointer mt-4">
              Commencer l'annale
            </button>
          </div>
        </div>
      </div>
    )
  }

  // EXAM SCREEN
  if (step === 'exam') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Header fixe */}
        <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">{annale.region_nom} {annale.annee}</p>
            <p className="text-xs text-slate-400">{answeredCount}/{questions.length} répondues</p>
          </div>
          <div className={`text-2xl font-black tabular-nums ${isUrgent ? 'text-red-400 animate-pulse' : ''}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <button onClick={() => handleSubmit(false)} className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-sm cursor-pointer transition">
            Soumettre
          </button>
        </div>

        {/* Questions */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full">
          <div className="space-y-6">
            {questions.map(q => {
              const selected = reponses[q.numero] || []
              return (
                <div key={q.numero} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">{q.numero}</span>
                    <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed">{q.enonce}</p>
                  </div>
                  <div className="space-y-2 ml-0 sm:ml-12">
                    {(q.propositions || []).map(p => {
                      const isSelected = selected.includes(p.lettre.toLowerCase())
                      return (
                        <div key={p.lettre} onClick={() => toggleProposition(q.numero, p.lettre.toLowerCase())} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-500'}`}>{p.lettre.toUpperCase()}</div>
                          <span className={`text-sm ${isSelected ? 'text-purple-900 font-semibold' : 'text-slate-700'}`}>{p.texte}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 mb-12">
            <button onClick={() => handleSubmit(false)} className="w-full bg-purple-800 hover:bg-purple-900 text-white font-bold py-4 rounded-2xl transition shadow-lg text-base cursor-pointer">
              Soumettre mes réponses ({answeredCount}/{questions.length})
            </button>
          </div>
        </div>
      </div>
    )
  }

  // RESULT SCREEN
  if (step === 'result') {
    const percent = Math.round((score / questions.length) * 100)

    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Score */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 text-center">
            <h1 className="text-lg font-bold text-slate-500 mb-2">Annale {annale.region_nom} {annale.annee}</h1>
            <div className="text-6xl font-black text-slate-900 mb-2">{score}<span className="text-2xl text-slate-400">/{questions.length}</span></div>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 max-w-xs mx-auto">
              <div className={`h-3 rounded-full transition-all ${percent >= 80 ? 'bg-emerald-500' : percent >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-sm text-slate-500 font-semibold">{percent}% de réussite</p>
            <div className="flex gap-3 justify-center mt-6">
              <a href="/annales" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl transition text-sm">Retour aux annales</a>
              <button onClick={() => { setStep('info'); setReponses({}); setTimeLeft((annale.duree_minutes || 45) * 60) }} className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-xl transition text-sm cursor-pointer">Refaire cette annale</button>
            </div>
          </div>

          {/* Correction détaillée */}
          <h2 className="text-lg font-black text-slate-900 mb-4">Correction détaillée</h2>
          <div className="space-y-4">
            {questions.map(q => {
              const userAnswers = (reponses[q.numero] || []).sort()
              const correctAnswers = (q.reponses_correctes || []).map(r => r.toLowerCase()).sort()
              const hasCorrection = correctAnswers.length > 0
              const isCorrect = hasCorrection && userAnswers.length === correctAnswers.length && userAnswers.every((v, i) => v === correctAnswers[i])

              return (
                <div key={q.numero} className={`bg-white rounded-2xl border-2 p-5 ${isCorrect ? 'border-emerald-200' : hasCorrection ? 'border-red-200' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : hasCorrection ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{q.numero}</span>
                    <p className="text-sm text-slate-800 font-semibold leading-relaxed flex-1">{q.enonce}</p>
                    {hasCorrection && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isCorrect ? '1/1' : '0/1'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 ml-0 sm:ml-11">
                    {(q.propositions || []).map(p => {
                      const l = p.lettre.toLowerCase()
                      const wasSelected = userAnswers.includes(l)
                      const isGood = correctAnswers.includes(l)

                      let cls = 'border-slate-100 text-slate-500'
                      if (hasCorrection) {
                        if (isGood && wasSelected) cls = 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        else if (isGood && !wasSelected) cls = 'border-emerald-300 bg-emerald-50/50 text-emerald-600 border-dashed'
                        else if (!isGood && wasSelected) cls = 'border-red-300 bg-red-50 text-red-700'
                      } else if (wasSelected) {
                        cls = 'border-purple-300 bg-purple-50 text-purple-800'
                      }

                      return (
                        <div key={p.lettre} className={`flex items-center gap-2 p-2.5 rounded-lg border ${cls} text-sm`}>
                          <span className="font-bold text-xs w-5">{p.lettre.toUpperCase()}</span>
                          <span className="flex-1">{p.texte}</span>
                          {hasCorrection && isGood && wasSelected && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                          {hasCorrection && !isGood && wasSelected && <XCircle size={16} className="text-red-500 shrink-0" />}
                          {hasCorrection && isGood && !wasSelected && <span className="text-xs text-emerald-500 font-bold shrink-0">Manquée</span>}
                        </div>
                      )
                    })}
                  </div>
                  {q.explication && (
                    <div className="mt-3 ml-0 sm:ml-11 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Explication</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.explication}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}
