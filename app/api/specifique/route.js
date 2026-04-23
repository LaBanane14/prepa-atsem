import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '@/lib/rate-limit'
import { SYSTEM_QCM_THEMATIQUE, PROMPTS_THEMATIQUES, CATEGORIES_LABELS } from '@/lib/prompts/qcm-thematique'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

async function callClaude(system, userPrompt) {
  const client = getClient()
  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 12000,
    system,
    messages: [
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: '{' }
    ]
  })
  const message = await stream.finalMessage()
  return '{' + message.content[0].text
}

// Rebrassage des propositions pour casser le biais LLM (tendance à placer la bonne réponse en A/B).
// Mélange aléatoire + réattribution des lettres A, B, C, D... dans l'ordre.
function shuffleAnswers(question) {
  const props = Array.isArray(question.propositions) ? question.propositions : []
  if (props.length < 2) return question
  const correctLetter = String(question.reponse_correcte || '').toUpperCase()
  const correctProp = props.find(p => String(p.lettre).toUpperCase() === correctLetter)
  if (!correctProp) return question
  const shuffled = [...props].sort(() => Math.random() - 0.5)
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const newProps = shuffled.map((p, i) => ({ ...p, lettre: LETTERS[i] }))
  const newCorrectIdx = shuffled.findIndex(p => p === correctProp)
  return {
    ...question,
    propositions: newProps,
    reponse_correcte: LETTERS[newCorrectIdx]
  }
}

function parseJSON(text) {
  function clean(str) {
    return str.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ')
      .trim()
  }
  // Insère les virgules manquantes entre éléments adjacents (}{, ][, "" hors string, etc.)
  function insertMissingCommas(str) {
    // }<whitespace>{ → },{
    str = str.replace(/}(\s*){/g, '},$1{')
    // ]<whitespace>[ → ],[
    str = str.replace(/\](\s*)\[/g, '],$1[')
    // }<whitespace>" (clé suivante manquante) → },"
    str = str.replace(/}(\s*)"/g, '},$1"')
    // "<whitespace>" entre deux strings dans un array (rare) → ","
    str = str.replace(/"(\s*\n\s*)"/g, '",$1"')
    return str
  }

  try { return JSON.parse(clean(text)) } catch {}

  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  let candidate = first !== -1 && last > first ? clean(text.substring(first, last + 1)) : clean(text)

  try { return JSON.parse(candidate) } catch {}
  try { return JSON.parse(insertMissingCommas(candidate)) } catch {}

  // Réparation aggressive : virgules manquantes + brackets/braces
  let fixed = insertMissingCommas(candidate).replace(/,\s*([}\]])/g, '$1')
  const opens = (fixed.match(/\{/g) || []).length
  const closes = (fixed.match(/\}/g) || []).length
  const ob = (fixed.match(/\[/g) || []).length
  const cb = (fixed.match(/\]/g) || []).length
  for (let i = 0; i < ob - cb; i++) fixed += ']'
  for (let i = 0; i < opens - closes; i++) fixed += '}'
  return JSON.parse(fixed)
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques secondes.' }, { status: 429 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API Claude manquante.' }, { status: 500 })
    }

    const body = await request.json()
    const { action, categorie } = body

    if (action === 'generer') {
      if (!categorie || !PROMPTS_THEMATIQUES[categorie]) {
        return NextResponse.json({ error: 'Catégorie non reconnue.' }, { status: 400 })
      }

      // Retry jusqu'à 3 fois en cas de JSON malformé par Claude
      let data = null
      let lastErr = null
      for (let attempt = 0; attempt < 3; attempt++) {
        const seed = Math.floor(Math.random() * 100000)
        const prompt = PROMPTS_THEMATIQUES[categorie] + `\n\nSeed de variabilité : #${seed}. Génère des questions DIFFÉRENTES des sessions précédentes.`
        const text = await callClaude(SYSTEM_QCM_THEMATIQUE, prompt)
        if (!text) { lastErr = 'Réponse Claude vide.'; continue }
        try {
          data = parseJSON(text)
          break
        } catch (e) {
          lastErr = e.message
          console.error(`Tentative ${attempt + 1} : parse JSON échoué (${e.message})`)
        }
      }
      if (!data) return NextResponse.json({ error: 'Erreur de génération : ' + (lastErr || 'JSON invalide après plusieurs tentatives') }, { status: 500 })
      const questions = (data.questions || []).map((q, i) => shuffleAnswers({
        numero: q.numero || i + 1,
        enonce: q.enonce || '',
        propositions: q.propositions || [],
        reponse_correcte: (q.reponse_correcte || '').toUpperCase(),
        explication: q.explication || ''
      }))

      return NextResponse.json({
        categorie,
        label: CATEGORIES_LABELS[categorie] || categorie,
        questions
      })
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Erreur serveur : ' + error.message }, { status: 500 })
  }
}
