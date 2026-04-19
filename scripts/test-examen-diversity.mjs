// Test la diversité du QCM "Examen blanc"
// Lance 3 générations, compare les questions, signale doublons / similitudes
// Usage: node scripts/test-examen-diversity.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Charger .env.local manuellement
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
try {
  const env = readFileSync(envPath, 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch { console.warn('Pas de .env.local') }

// === Réplique des prompts (simplifié, fidèle à app/api/maths/route.js) ===
const SYSTEM_EXAMEN_ATSEM = `Tu es un concepteur officiel d'épreuves du concours externe d'ATSEM principal de 2e classe. Tu connais parfaitement le cadre statutaire, les missions, l'hygiène, la santé de l'enfant, les premiers secours, les maladies infantiles, la vie scolaire et la protection de l'enfance.`

const PROMPT_QUESTIONS_ONLY = `Génère un QCM de 20 questions simulant l'épreuve écrite du concours externe d'ATSEM principal de 2e classe.

Répartition thématique OBLIGATOIRE :
- Questions 1-4 : Missions et statut de l'ATSEM
- Questions 5-8 : Hygiène et produits d'entretien (dont 1 calcul de dilution)
- Questions 9-12 : Santé de l'enfant et premiers secours
- Questions 13-14 : Maladies infantiles et évictions scolaires
- Questions 15-17 : Vie scolaire et cadre institutionnel
- Questions 18-19 : Développement et bien-être de l'enfant
- Question 20 : Protection de l'enfance

Inclus au moins 2 pièges classiques et 1 question formulée en négatif.

Réponds UNIQUEMENT avec le JSON ci-dessous. NE GÉNÈRE PAS la correction. Aucun texte avant ni après, aucun backtick.
{
  "questions": [
    {
      "numero": 1,
      "theme": "missions_statut",
      "enonce": "Énoncé complet",
      "propositions": [
        {"lettre": "A", "texte": "..."},
        {"lettre": "B", "texte": "..."},
        {"lettre": "C", "texte": "..."},
        {"lettre": "D", "texte": "..."}
      ]
    }
  ]
}`

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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function fetchAnnalesInspiration() {
  const { data } = await supabase.from('annales').select('region_nom, annee, questions').not('questions', 'is', null)
  if (!data?.length) return ''
  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 3)
  const examples = []
  for (const a of shuffled) {
    const qs = Array.isArray(a.questions) ? a.questions : []
    const picked = [...qs].sort(() => Math.random() - 0.5).slice(0, 3)
    for (const q of picked) {
      if (!q.enonce || !q.propositions) continue
      const props = q.propositions.map(p => `${String(p.lettre).toUpperCase()}. ${p.texte}`).join('\n')
      examples.push(`[Annale ${a.region_nom} ${a.annee}]\n${q.enonce}\n${props}`)
    }
  }
  return `\n\nVoici des exemples RÉELS tirés d'annales ATSEM passées. Tu peux REPRENDRE OU ADAPTER au MAXIMUM 4 questions sur les 20 (soit 20%) parmi celles-ci. Les 16 autres questions DOIVENT être nouvelles, créées dans le même esprit (style, vocabulaire, niveau de détail, types de pièges) :\n\n${examples.join('\n\n---\n\n')}`
}

async function generate(runIdx) {
  const ctx = contexts[Math.floor(Math.random() * contexts.length)]
  const seed = Math.floor(Math.random() * 100000)
  const inspiration = await fetchAnnalesInspiration()
  const prompt = PROMPT_QUESTIONS_ONLY
    + `\n\nIMPORTANT : Contextualise certaines questions autour de cette situation : "${ctx}". Seed de variabilité : #${seed}. Génère des questions DIFFÉRENTES des sessions précédentes. Varie les formulations, les contextes et les pièges.`
    + inspiration

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 24000,
    system: SYSTEM_EXAMEN_ATSEM,
    messages: [{ role: 'user', content: prompt }, { role: 'assistant', content: '{' }]
  })
  const message = await stream.finalMessage()
  const text = '{' + message.content[0].text
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  const json = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1))
  console.log(`[Run ${runIdx + 1}] ${json.questions?.length || 0} questions générées`)
  return json.questions || []
}

// === Similarité ===
function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
function tokens(s) { return new Set(normalize(s).split(' ').filter(w => w.length > 3)) }
function jaccard(a, b) {
  const A = tokens(a), B = tokens(b)
  const inter = [...A].filter(x => B.has(x)).length
  const uni = new Set([...A, ...B]).size
  return uni === 0 ? 0 : inter / uni
}

async function main() {
  console.log('Génération de 3 QCM en parallèle...\n')
  const runs = await Promise.all([generate(0), generate(1), generate(2)])

  // Aplatir avec marquage du run
  const all = []
  runs.forEach((qs, ri) => qs.forEach((q, qi) => all.push({ run: ri + 1, idx: qi + 1, enonce: q.enonce, theme: q.theme })))

  console.log(`\n=== Total : ${all.length} questions ===\n`)

  // Trouver doublons (similarité >= seuil)
  const SEUIL_DOUBLON = 0.7
  const SEUIL_SIMILAIRE = 0.45
  const doublons = []
  const similaires = []
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (all[i].run === all[j].run) continue // ignorer doublons intra-run
      const sim = jaccard(all[i].enonce, all[j].enonce)
      if (sim >= SEUIL_DOUBLON) doublons.push({ a: all[i], b: all[j], sim })
      else if (sim >= SEUIL_SIMILAIRE) similaires.push({ a: all[i], b: all[j], sim })
    }
  }

  console.log(`=== DOUBLONS (similarité >= ${SEUIL_DOUBLON}) : ${doublons.length} ===`)
  doublons.sort((a, b) => b.sim - a.sim).forEach(d => {
    console.log(`\n  [${d.sim.toFixed(2)}] Run${d.a.run}#${d.a.idx} ↔ Run${d.b.run}#${d.b.idx}`)
    console.log(`    A: ${d.a.enonce.slice(0, 100)}`)
    console.log(`    B: ${d.b.enonce.slice(0, 100)}`)
  })

  console.log(`\n=== SIMILAIRES (${SEUIL_SIMILAIRE} <= sim < ${SEUIL_DOUBLON}) : ${similaires.length} ===`)
  similaires.sort((a, b) => b.sim - a.sim).slice(0, 10).forEach(d => {
    console.log(`\n  [${d.sim.toFixed(2)}] Run${d.a.run}#${d.a.idx} ↔ Run${d.b.run}#${d.b.idx}`)
    console.log(`    A: ${d.a.enonce.slice(0, 100)}`)
    console.log(`    B: ${d.b.enonce.slice(0, 100)}`)
  })

  console.log(`\n=== RÉSUMÉ ===`)
  console.log(`- ${doublons.length} paires de doublons (>= ${SEUIL_DOUBLON})`)
  console.log(`- ${similaires.length} paires similaires (>= ${SEUIL_SIMILAIRE})`)
  console.log(`- Total paires comparées : ${all.length * (all.length - 1) / 2 - 60}`) // -60 pour exclure intra-run
}

main().catch(e => { console.error(e); process.exit(1) })
