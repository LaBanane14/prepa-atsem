import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const data = JSON.parse(readFileSync('data/annales-atsem.json', 'utf8'))

async function main() {
  console.log(`\n📚 Insertion de ${data.total_annales} annales (${data.total_questions} questions)...\n`)

  let inserted = 0
  let errors = 0

  for (const annale of data.annales) {
    const { error } = await supabase.from('annales').upsert({
      region: annale.region,
      region_nom: annale.region_nom,
      cdg: annale.cdg || null,
      annee: annale.annee,
      duree_minutes: annale.duree_minutes || 45,
      nb_questions: annale.nb_questions || annale.questions?.length || 20,
      bareme: annale.bareme || null,
      questions: annale.questions
    }, { onConflict: 'region,cdg,annee' })

    if (error) {
      console.error(`  ❌ ${annale.region} ${annale.annee}: ${error.message}`)
      errors++
    } else {
      console.log(`  ✅ ${annale.region_nom} ${annale.annee} — ${annale.questions.length} questions`)
      inserted++
    }
  }

  console.log(`\n✅ ${inserted} annales insérées, ${errors} erreurs`)
}

main().catch(console.error)
