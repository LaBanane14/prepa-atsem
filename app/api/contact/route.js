import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const validCategories = ['bug', 'question', 'suggestion', 'abonnement', 'autre']
const categoryLabels = { bug: 'Bug', question: 'Question', suggestion: 'Suggestion', abonnement: 'Abonnement', autre: 'Autre' }
const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const maxFileSize = 5 * 1024 * 1024

export async function POST(request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')
    const category = formData.get('category')
    const honeypot = formData.get('honeypot')
    const files = formData.getAll('files')

    // Anti-spam : honeypot
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    // Validation
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Veuillez sélectionner une catégorie.' }, { status: 400 })
    }
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Veuillez remplir tous les champs.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Le message est trop long (5000 caractères max).' }, { status: 400 })
    }

    // Validation fichiers
    const realFiles = files.filter(f => f && f.size > 0)
    if (realFiles.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 fichiers autorisés.' }, { status: 400 })
    }
    for (const file of realFiles) {
      if (file.size > maxFileSize) {
        return NextResponse.json({ error: `Le fichier "${file.name}" dépasse 5 Mo.` }, { status: 400 })
      }
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Type de fichier non autorisé : ${file.name}` }, { status: 400 })
      }
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

    // Upload fichiers dans Supabase Storage
    const uploadedFiles = []
    const ticketId = Date.now().toString(36).toUpperCase()
    for (const file of realFiles) {
      const ext = file.name.split('.').pop()
      const path = `contact/${ticketId}/${crypto.randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      const { error: uploadError } = await supabase.storage
        .from('contact-files')
        .upload(path, buffer, { contentType: file.type })
      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }
      const { data: urlData } = supabase.storage.from('contact-files').getPublicUrl(path)
      uploadedFiles.push({ name: file.name, url: urlData.publicUrl })
    }

    // Insert en base
    const subject = `${categoryLabels[category]}-${ticketId}`
    const { error } = await supabase
      .from('contacts')
      .insert({
        name, email, message, category, subject, ip,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : null
      })

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
