import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { name, email, message, honeypot } = await request.json()

    // Anti-spam : honeypot
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Veuillez remplir tous les champs.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Le message est trop long (5000 caractères max).' }, { status: 400 })
    }

    // Rate limiting par IP (max 3 messages/heure)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', oneHourAgo)

    if (count >= 3) {
      return NextResponse.json({ error: 'Trop de messages envoyés. Veuillez réessayer dans une heure.' }, { status: 429 })
    }

    // Insert en base
    const { error } = await supabase
      .from('contacts')
      .insert({ name, email, message, ip })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Erreur lors de l\'envoi. Veuillez réessayer.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 })
  }
}
