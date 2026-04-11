import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '@/lib/rate-limit'
import { BASE_SYSTEM, FORMAT_SORTIE } from '@/lib/prompts/base-maths'
import { SYSTEM_POURCENTAGES, PROMPT_POURCENTAGES } from '@/lib/prompts/famille-pourcentages'
import { SYSTEM_PROPORTIONNALITE, PROMPT_PROPORTIONNALITE } from '@/lib/prompts/famille-proportionnalite'
import { SYSTEM_CONVERSIONS, PROMPT_CONVERSIONS } from '@/lib/prompts/famille-conversions'
import { SYSTEM_EQUATIONS, PROMPT_EQUATIONS } from '@/lib/prompts/famille-equations'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

async function callClaude(system, userPrompt) {
  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    system,
    messages: [{ role: 'user', content: userPrompt }]
  })
  return message.content[0].text
}

const FAMILLES = {
  operations: { system: SYSTEM_PROPORTIONNALITE, prompt: PROMPT_PROPORTIONNALITE },
  pourcentages: { system: SYSTEM_POURCENTAGES, prompt: PROMPT_POURCENTAGES },
  conversions: { system: SYSTEM_CONVERSIONS, prompt: PROMPT_CONVERSIONS },
  equations: { system: SYSTEM_EQUATIONS, prompt: PROMPT_EQUATIONS }
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques secondes.' }, { status: 429 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API Claude manquante.' }, { status: 500 })
    }

    const body = await request.json()
    const { action, famille } = body

    if (action === 'generer') {
      if (!famille || !FAMILLES[famille]) {
        return NextResponse.json({ error: 'Famille non reconnue.' }, { status: 400 })
      }

      const config = FAMILLES[famille]
      const systemInstruction = BASE_SYSTEM + '\n\n' + config.system
      const userPrompt = config.prompt + '\n\n' + FORMAT_SORTIE

      const text = await callClaude(systemInstruction, userPrompt)
      if (!text) return NextResponse.json({ error: 'Réponse Claude vide' }, { status: 500 })

      let sujetData
      try {
        sujetData = JSON.parse(text)
      } catch {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        sujetData = JSON.parse(cleaned)
      }

      // Mapper les champs pour compatibilité avec le front (numero→id, enonce→question)
      if (sujetData.questions) {
        sujetData.questions = sujetData.questions.map(q => ({
          id: q.numero || q.id,
          question: q.enonce || q.question,
          reponse: q.reponse,
          explication: q.explication || ''
        }))
      }

      return NextResponse.json({ sujet: sujetData })
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Erreur serveur : ' + error.message }, { status: 500 })
  }
}
