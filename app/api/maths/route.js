import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_BASE, FACTS_BY_THEME, PIEGES, THEME_LABELS, PROMPT_CORRECTION_ONLY } from '@/lib/prompts/examen'
import { checkRateLimit } from '@/lib/rate-limit'
import { supabase } from '@/lib/supabase'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Construit un system prompt dynamique : pioche ~33% des faits par thème
// + 3 pièges sur 8. Évite la répétition des mêmes questions entre sessions.
function buildDynamicSystem() {
  let block = SYSTEM_BASE + '\n\n## FAITS À MOBILISER POUR CETTE SESSION (non exhaustifs)\n'
  for (const [key, label] of Object.entries(THEME_LABELS)) {
    const facts = FACTS_BY_THEME[key] || []
    const n = Math.max(2, Math.ceil(facts.length * 0.33))
    const picked = shuffle(facts).slice(0, n)
    block += `\n### ${label}\n` + picked.map(f => `- ${f}`).join('\n') + '\n'
  }
  const pieges = shuffle(PIEGES).slice(0, 3)
  block += `\n## PIÈGES À INTÉGRER DANS CE QCM (au moins 2 parmi ces 3)\n` + pieges.map((p, i) => `${i + 1}. ${p}`).join('\n')
  return block
}

// Construit le prompt utilisateur avec répartition thématique légèrement randomisée
function buildQuestionsPrompt() {
  // Cibles de base : 3-4 / 3-4 / 3-4 / 2 / 2-3 / 2-3 / 1-2 — on randomise dans la tolérance
  const base = { missions_statut: 4, hygiene_produits: 4, sante_secours: 4, maladies_evictions: 2, vie_scolaire: 3, developpement_enfant: 2, protection_enfance: 1 }
  const keys = Object.keys(base)
  const counts = { ...base }
  // ±1 sur 2 thèmes au hasard, en maintenant le total à 20
  for (let i = 0; i < 2; i++) {
    const up = keys[Math.floor(Math.random() * keys.length)]
    const down = keys[Math.floor(Math.random() * keys.length)]
    if (up !== down && counts[up] < 5 && counts[down] > 1) { counts[up]++; counts[down]-- }
  }
  const lignes = keys.map(k => `- ${THEME_LABELS[k]} : ${counts[k]} question(s)`).join('\n')
  const includeCalcul = Math.random() < 0.5
  const contrainteCalcul = includeCalcul ? '- Inclure 1 question avec un calcul (dilution, quantité de matériel, conversion).\n' : ''

  return `Génère un QCM de 20 questions simulant l'épreuve écrite du concours externe d'ATSEM principal de 2e classe.

Répartition thématique (tolérance ±1) :
${lignes}

${contrainteCalcul}Inclus au moins 1 question formulée en NÉGATIF.

Réponds UNIQUEMENT avec le JSON ci-dessous. NE GÉNÈRE PAS la correction. Aucun texte avant ni après, aucun backtick.
{
  "questions": [
    {
      "numero": 1,
      "theme": "missions_statut",
      "enonce": "Énoncé complet de la question SANS inclure les propositions de réponse. L'énoncé doit se terminer par un point d'interrogation ou un deux-points.",
      "propositions": [
        {"lettre": "A", "texte": "Proposition A"},
        {"lettre": "B", "texte": "Proposition B"},
        {"lettre": "C", "texte": "Proposition C"},
        {"lettre": "D", "texte": "Proposition D"}
      ]
    }
  ]
}`
}

// Récupère 3 annales aléatoires et en extrait un échantillon de questions réelles
// pour servir d'exemples d'inspiration à Claude (style, vocabulaire, pièges).
async function fetchAnnalesInspiration() {
  if (!supabase) return ''
  try {
    const { data } = await supabase
      .from('annales')
      .select('region_nom, annee, questions')
      .not('questions', 'is', null)
    if (!data || data.length === 0) return ''

    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 3)
    const examples = []

    for (const annale of shuffled) {
      const qs = Array.isArray(annale.questions) ? annale.questions : []
      if (qs.length === 0) continue
      const picked = [...qs].sort(() => Math.random() - 0.5).slice(0, 3)
      for (const q of picked) {
        if (!q.enonce || !q.propositions) continue
        const props = (q.propositions || []).map(p => `${String(p.lettre).toUpperCase()}. ${p.texte}`).join('\n')
        examples.push(`[Annale ${annale.region_nom} ${annale.annee}]\n${q.enonce}\n${props}`)
      }
    }
    if (examples.length === 0) return ''
    return `\n\nVoici des exemples RÉELS tirés d'annales ATSEM passées. Tu peux REPRENDRE OU ADAPTER au MAXIMUM 4 questions sur les 20 (soit 20%) parmi celles-ci. Les 16 autres questions DOIVENT être nouvelles, créées dans le même esprit (style, vocabulaire, niveau de détail, types de pièges) :\n\n${examples.join('\n\n---\n\n')}`
  } catch (e) {
    console.error('fetchAnnalesInspiration error:', e.message)
    return ''
  }
}

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

async function callClaude(system, userPrompt, retries = 2) {
  const client = getClient()
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 24000,
        temperature: 1,
        system,
        messages: [
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: '{' }
        ]
      })
      const message = await stream.finalMessage()
      if (message.stop_reason === 'max_tokens') {
        console.error('Claude truncated (max_tokens). Attempt:', attempt + 1)
        if (attempt < retries) continue
      }
      return '{' + message.content[0].text
    } catch (e) {
      if (attempt === retries) throw e
      console.error(`Claude attempt ${attempt + 1} failed:`, e.message)
    }
  }
}

function parseJSON(text) {
  function cleanAndParse(str) {
    let s = str
      .replace(/```json\n?/g, '').replace(/```\n?/g, '')
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ')
      .trim()
    return JSON.parse(s)
  }

  try { return cleanAndParse(text) } catch {}

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = text.substring(firstBrace, lastBrace + 1)
    try { return cleanAndParse(extracted) } catch {}
  }

  let fixed = text.substring(firstBrace !== -1 ? firstBrace : 0).replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  fixed = fixed.replace(/,\s*([}\]])/g, '$1')
  const opens = (fixed.match(/\{/g) || []).length
  const closes = (fixed.match(/\}/g) || []).length
  const openBrackets = (fixed.match(/\[/g) || []).length
  const closeBrackets = (fixed.match(/\]/g) || []).length
  for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']'
  for (let i = 0; i < opens - closes; i++) fixed += '}'
  try { return cleanAndParse(fixed) } catch {}

  console.error('JSON non parsable. Length:', text.length, 'Début:', text.substring(0, 300), '... Fin:', text.substring(text.length - 300))
  throw new Error('Impossible de parser le JSON')
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques secondes.' }, { status: 429 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API Claude manquante.' }, { status: 500 })
    }

    const body = await request.json()
    const { action } = body

    // === GÉNÉRER UNIQUEMENT LES QUESTIONS (rapide) — utilisé par /examen ===
    if (action === 'generer_questions') {
      const contexts = [
        "C'est le matin, les enfants arrivent à l'école.",
        "C'est l'heure de la cantine, les enfants déjeunent.",
        "C'est l'heure de la sieste en petite section.",
        "Une sortie scolaire est prévue au parc.",
        "C'est la récréation, les enfants jouent dans la cour.",
        "Un parent vient chercher son enfant plus tôt que prévu.",
        "L'inspecteur académique visite l'école aujourd'hui.",
        "C'est la rentrée de septembre, nouveaux élèves en TPS.",
        "Un exercice incendie est prévu cet après-midi.",
        "La fête de l'école approche, les préparatifs commencent.",
        "Un enfant allergique rejoint la classe en cours d'année.",
        "Les vacances approchent, bilan de fin de période.",
        "Un nouvel ATSEM rejoint l'équipe ce matin.",
        "C'est le jour du conseil d'école.",
        "L'infirmière scolaire est de passage aujourd'hui."
      ]
      const randomContext = contexts[Math.floor(Math.random() * contexts.length)]
      const randomSeed = Math.floor(Math.random() * 100000)
      const inspiration = await fetchAnnalesInspiration()
      const dynamicSystem = buildDynamicSystem()
      const diversityPrompt = buildQuestionsPrompt() + `\n\nIMPORTANT : Contextualise certaines questions autour de cette situation : "${randomContext}". Seed de variabilité : #${randomSeed}. Génère des questions DIFFÉRENTES des sessions précédentes. Varie les formulations, les contextes et les pièges.` + inspiration

      const text = await callClaude(dynamicSystem, diversityPrompt)
      if (!text) return NextResponse.json({ error: 'Réponse Claude vide' }, { status: 500 })

      const raw = parseJSON(text)
      return NextResponse.json({ questions: raw.questions || [] })
    }

    // === GÉNÉRER LA CORRECTION (en arrière-plan) — utilisé par /examen ===
    if (action === 'generer_correction') {
      const { questions } = body
      if (!questions) return NextResponse.json({ error: 'Questions requises.' }, { status: 400 })

      const prompt = PROMPT_CORRECTION_ONLY.replace('{QUESTIONS_JSON}', JSON.stringify(questions, null, 2))
      const text = await callClaude(SYSTEM_BASE, prompt)
      if (!text) return NextResponse.json({ error: 'Réponse Claude vide' }, { status: 500 })

      const raw = parseJSON(text)
      return NextResponse.json({ correction: raw.correction || [] })
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Erreur serveur : ' + error.message }, { status: 500 })
  }
}
