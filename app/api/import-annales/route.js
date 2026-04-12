import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import annalesData from '../../../data/annales-atsem.json'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Config Supabase manquante' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Supprimer les anciennes annales
  await supabase.from('annales').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const rows = annalesData.annales.map(a => ({
    region: a.region,
    region_nom: a.region_nom,
    cdg: a.cdg || null,
    annee: a.annee,
    duree_minutes: a.duree_minutes || 45,
    nb_questions: a.nb_questions || a.questions?.length || 20,
    bareme: a.bareme || null,
    questions: a.questions
  }))

  const { error } = await supabase.from('annales').insert(rows)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, inserted: rows.length, message: '30 annales avec corrections insérées' })
}
