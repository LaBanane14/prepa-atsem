import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join } from 'path'
import { checkRateLimit } from '@/lib/rate-limit'
import { BASE_ORAL, FORMAT_SORTIE_ORAL } from '@/lib/prompts/base-oral'
import { SYSTEM_ORAL, PROMPT_ORAL } from '@/lib/prompts/simulation-oral'

// Charger la banque de 300 questions
let questionsBank = []
try {
  const raw = JSON.parse(readFileSync(join(process.cwd(), 'data', 'questions-oral-atsem.json'), 'utf8'))
  questionsBank = raw.questions || []
} catch (e) {
  console.error('Impossible de charger la banque de questions oral:', e.message)
}

function getRandomQuestions(n = 40) {
  const shuffled = [...questionsBank].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const categoryMap = {
  parcours: 'Motivation et parcours',
  motivation_parcours: 'Motivation et parcours',
  missions: 'Missions de l\'ATSEM',
  missions_statut: 'Missions de l\'ATSEM',
  collectivites: 'Collectivités et droit public',
  collectivites_droit: 'Collectivités et droit public',
  sante: 'Santé et sécurité',
  sante_secours: 'Santé et sécurité',
  mise_en_situation: 'Mise en situation',
  mises_en_situation: 'Mise en situation',
  hygiene: 'Hygiène et entretien',
  hygiene_entretien: 'Hygiène et entretien',
  developpement: 'Développement de l\'enfant',
  developpement_enfant: 'Développement de l\'enfant',
  protection_enfance: 'Protection de l\'enfance',
  piege: 'Question piège'
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques secondes.' }, { status: 429 })

    // Vérifier si c'est une requête JSON (mode aléatoire) ou FormData (mode CV)
    const contentType = request.headers.get('content-type') || ''

    // === MODE QUESTIONS AU SORT (pas besoin de Claude) ===
    if (contentType.includes('application/json')) {
      const body = await request.json()
      if (body.action === 'aleatoire') {
        const n = body.nb_questions || 20
        const selected = getRandomQuestions(n)
        const questions = selected.map((q, i) => ({
          id: i + 1,
          question: q.question,
          category: categoryMap[q.categorie] || q.categorie || 'Question',
          reponse_attendue: q.reponse_attendue || ''
        }))
        return NextResponse.json({ questions, mode: 'aleatoire' })
      }
    }

    // === MODE CV (avec Claude) ===
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API Claude manquante.' }, { status: 500 })
    }

    const formData = await request.formData()
    const pdfFile = formData.get('pdf')

    if (!pdfFile) {
      return NextResponse.json({ error: 'Veuillez télécharger votre CV au format PDF.' }, { status: 400 })
    }

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
    const pdfBase64 = pdfBuffer.toString('base64')

    // Piocher 40 questions aléatoires de la banque pour inspirer Claude
    const sampleQuestions = getRandomQuestions(40)
    const questionsContext = sampleQuestions.length > 0
      ? '\n\n## EXEMPLES DE QUESTIONS RÉELLES (inspire-toi de ces questions pour varier tes formulations) :\n' +
        sampleQuestions.map(q => `- [${q.categorie}] ${q.question}\n  → ${q.reponse_attendue}`).join('\n')
      : ''

    // Assembler les prompts
    const systemInstruction = BASE_ORAL + '\n\n' + SYSTEM_ORAL + questionsContext
    const userPrompt = PROMPT_ORAL + '\n\n' + FORMAT_SORTIE_ORAL

    // Appel Claude avec le PDF en base64 (streaming pour éviter timeout)
    const client = getClient()
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 16384,
      system: systemInstruction,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          { type: 'text', text: userPrompt }
        ]
      }]
    })
    const message = await stream.finalMessage()

    const text = message.content[0]?.text
    if (!text) return NextResponse.json({ error: 'Réponse Claude vide' }, { status: 500 })

    let raw
    try {
      raw = JSON.parse(text)
    } catch {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      raw = JSON.parse(cleaned)
    }

    // Mapper vers le format attendu par le front (numero→id, categorie→category)
    const questions = (raw.questions || []).map((q, i) => ({
      id: q.numero || i + 1,
      question: q.question || '',
      category: categoryMap[q.categorie] || q.categorie || 'Parcours professionnel'
    }))

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Erreur serveur : ' + error.message }, { status: 500 })
  }
}
