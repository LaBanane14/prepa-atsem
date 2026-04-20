// Liste tous les barèmes des annales en base, pour vérification.
// Usage : node scripts/check-baremes.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
try {
  const env = readFileSync(envPath, 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) { console.error('Missing Supabase env vars'); process.exit(1) }

const supabase = createClient(url, key)
const { data, error } = await supabase
  .from('annales')
  .select('id, region_nom, annee, cdg, bareme')
  .order('region_nom').order('annee')

if (error) { console.error(error); process.exit(1) }

let missing = 0
let tooShort = 0
let suspectChars = 0

for (const a of data) {
  const label = `${a.region_nom} ${a.annee}${a.cdg ? ' (' + a.cdg + ')' : ''}`
  console.log('\n──────────────────────────────────────────────')
  console.log(`📄 ${label}`)
  console.log(`   id: ${a.id}`)
  if (!a.bareme) {
    console.log('   ⚠️  AUCUN BARÈME')
    missing++
    continue
  }
  console.log(`   📏 ${a.bareme.length} caractères`)
  console.log(`   📝 "${a.bareme}"`)
  if (a.bareme.length < 30) tooShort++
  // Détection de barèmes "cassés" : décimales fr coupées (chiffre après virgule sans espace)
  if (/\b\d+,\d/.test(a.bareme)) {
    // OK c'est un format français normal
  }
}

console.log('\n══════════════════════════════════════════════')
console.log(`Total : ${data.length} annales`)
console.log(`⚠️  Sans barème : ${missing}`)
console.log(`⚠️  Trop court (< 30 char) : ${tooShort}`)
