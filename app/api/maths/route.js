import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BASE_SYSTEM, buildHistoryContext } from '@/lib/prompts/base-maths'
import { SYSTEM_EXAMEN_ATSEM, PROMPT_EXAMEN_ATSEM, PROMPT_QUESTIONS_ONLY, PROMPT_CORRECTION_ONLY } from '@/lib/prompts/examen'
import { checkRateLimit } from '@/lib/rate-limit'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

async function callClaude(system, userPrompt) {
  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 16384,
    system,
    messages: [{ role: 'user', content: userPrompt }]
  })
  return message.content[0].text
}

function parseJSON(text) {
  // Essai direct
  try { return JSON.parse(text) } catch {}
  // Nettoyer backticks
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(cleaned) } catch {}
  // Extraire le premier objet/array JSON valide
  const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  // Tenter de réparer un JSON tronqué (fermer les crochets/accolades manquants)
  let fixed = cleaned
  const opens = (fixed.match(/\{/g) || []).length
  const closes = (fixed.match(/\}/g) || []).length
  const openBrackets = (fixed.match(/\[/g) || []).length
  const closeBrackets = (fixed.match(/\]/g) || []).length
  for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']'
  for (let i = 0; i < opens - closes; i++) fixed += '}'
  try { return JSON.parse(fixed) } catch {}
  throw new Error('Impossible de parser le JSON')
}

export async function POST(request) {
  try {
    // Rate limiting par IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques secondes.' }, { status: 429 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API Claude manquante.' }, { status: 500 })
    }

    const body = await request.json()
    const { action, exercices, reponses, history } = body

    // === GÉNÉRER UN SUJET ===
    if (action === 'generer') {
      const historyContext = buildHistoryContext(history)
      const systemInstruction = BASE_SYSTEM + '\n\n' + SYSTEM_EXAMEN_ATSEM + (historyContext ? '\n\n' + historyContext : '')

      const text = await callClaude(systemInstruction, PROMPT_EXAMEN_ATSEM)
      if (!text) return NextResponse.json({ error: 'Réponse Claude vide' }, { status: 500 })

      const raw = parseJSON(text)

      // Renvoyer directement le QCM ATSEM (questions + correction)
      return NextResponse.json({
        questions: raw.questions || [],
        correction: raw.correction || [],
        consigne: raw.consigne || '',
        duree_minutes: raw.duree_minutes || 45,
        nb_questions: raw.nb_questions || 20
      })
    }

    // === GÉNÉRER UNIQUEMENT LES QUESTIONS (rapide) ===
    if (action === 'generer_questions') {
      const systemInstruction = BASE_SYSTEM + '\n\n' + SYSTEM_EXAMEN_ATSEM
      const text = await callClaude(systemInstruction, PROMPT_QUESTIONS_ONLY)
      if (!text) return NextResponse.json({ error: 'Réponse Claude vide' }, { status: 500 })

      const raw = parseJSON(text)
      return NextResponse.json({ questions: raw.questions || [] })
    }

    // === GÉNÉRER LA CORRECTION (en arrière-plan) ===
    if (action === 'generer_correction') {
      const { questions } = body
      if (!questions) return NextResponse.json({ error: 'Questions requises.' }, { status: 400 })

      const systemInstruction = BASE_SYSTEM + '\n\n' + SYSTEM_EXAMEN_ATSEM
      const prompt = PROMPT_CORRECTION_ONLY.replace('{QUESTIONS_JSON}', JSON.stringify(questions, null, 2))
      const text = await callClaude(systemInstruction, prompt)
      if (!text) return NextResponse.json({ error: 'Réponse Claude vide' }, { status: 500 })

      const raw = parseJSON(text)
      return NextResponse.json({ correction: raw.correction || [] })
    }

    // === CORRIGER LES RÉPONSES ===
    if (action === 'corriger') {
      if (!exercices || !reponses) {
        return NextResponse.json({ error: 'Exercices et réponses requis.' }, { status: 400 })
      }

      const reponsesFormatted = Object.entries(reponses).map(([id, val]) => `- Question ${id} : "${val}"`).join('\n')

      const prompt = `Tu dois corriger les réponses d'un candidat de manière détaillée, juste et bienveillante.
Rappel du contexte : le candidat disposait de 30 minutes, sans calculatrice.

VOICI LE SUJET ET LE BARÈME (au format JSON) :
${JSON.stringify(exercices, null, 2)}

VOICI LES RÉPONSES DU CANDIDAT :
${reponsesFormatted}

MISSION :
Corrige chaque réponse en :
1. Comparant avec la réponse attendue.
2. Expliquant la méthode de résolution étape par étape de manière pédagogique.
3. Attribuant les points avec justesse. Valorise les méthodes correctes même si le résultat final est faux en accordant des points partiels.
4. Rédigeant un bilan constructif (points forts, points à améliorer, conseil).

RÈGLE IMPORTANTE POUR "reponse_attendue" :
- Si la réponse du candidat est CORRECTE : mets simplement le résultat final (ex: "15 ml").
- Si la réponse du candidat est INCORRECTE ou PARTIELLE : mets le détail des calculs menant au résultat (ex: "1500 / 500 × 5 = 15 ml").

FORMAT DE SORTIE :
Tu dois répondre UNIQUEMENT au format JSON strict :

{
  "note": 7.5,
  "noteMax": 10,
  "appreciation": "Appréciation globale bienveillante sur le travail fourni",
  "corrections": [
    {
      "id": "1a",
      "question": "Rappel de la question",
      "reponse_candidat": "Ce qu'a répondu le candidat",
      "reponse_attendue": "La vraie réponse attendue",
      "correct": "true, false, ou partiel",
      "points_obtenus": 1.5,
      "points_max": 1.5,
      "explication": "Explication pédagogique de la correction"
    }
  ],
  "points_forts": ["Point fort 1", "Point fort 2"],
  "points_ameliorer": ["Axe d'amélioration 1", "Axe d'amélioration 2"],
  "conseil": "Un conseil pratique pour le concours"
}`

      const raw = await callClaude('Tu es un correcteur du concours ATSEM pour l\'épreuve de mathématiques.', prompt)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Erreur de format. Réessayez.' }, { status: 500 })
      }
      const correction = JSON.parse(jsonMatch[0])
      correction.note = typeof correction.note === 'number' ? correction.note : 0
      correction.noteMax = 10
      correction.appreciation = correction.appreciation || ''
      correction.points_forts = Array.isArray(correction.points_forts) ? correction.points_forts : []
      correction.points_ameliorer = Array.isArray(correction.points_ameliorer) ? correction.points_ameliorer : []
      correction.conseil = correction.conseil || ''
      correction.corrections = (correction.corrections || []).map(c => ({
        id: c.id || '',
        question: c.question || '',
        reponse_candidat: c.reponse_candidat || '',
        reponse_attendue: c.reponse_attendue || '',
        correct: c.correct === true || c.correct === 'true' ? true : c.correct === 'partiel' ? 'partiel' : false,
        points_obtenus: typeof c.points_obtenus === 'number' ? c.points_obtenus : 0,
        points_max: typeof c.points_max === 'number' ? c.points_max : 0,
        explication: c.explication || ''
      }))
      return NextResponse.json({ correction })
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Erreur serveur : ' + error.message }, { status: 500 })
  }
}
