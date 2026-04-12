import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const validCategories = ['bug', 'question', 'suggestion', 'autre']
const categoryLabels = { bug: 'Bug', question: 'Question', suggestion: 'Suggestion', autre: 'Autre' }

const allowedOrigins = [
  'https://prepa-atsem.fr',
  'https://www.prepa-atsem.fr',
  'https://prepa-atsem.vercel.app',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
]

// Rate limit store (en mémoire, reset au redémarrage)
const rateLimitMap = new Map()

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

export async function POST(request) {
  try {
    // Protection CSRF : vérifier l'origine
    const origin = request.headers.get('origin')
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 })
    }

    const { email, subject, message, category, honeypot } = await request.json()

    // Anti-spam : honeypot
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    // Validation catégorie
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Veuillez sélectionner une catégorie.' }, { status: 400 })
    }

    // Validation champs
    if (!email || !subject || !message) {
      return NextResponse.json({ error: 'Veuillez remplir tous les champs.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
    }
    if (subject.length > 200) {
      return NextResponse.json({ error: 'Le sujet ne doit pas dépasser 200 caractères.' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Le message ne doit pas dépasser 5000 caractères.' }, { status: 400 })
    }

    // Rate limiting par IP (max 3 messages / 15 min)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const now = Date.now()
    const windowMs = 15 * 60 * 1000
    const ipData = rateLimitMap.get(ip) || []
    const recent = ipData.filter(t => now - t < windowMs)
    if (recent.length >= 3) {
      return NextResponse.json({ error: 'Trop de messages envoyés. Veuillez réessayer dans 15 minutes.' }, { status: 429 })
    }
    recent.push(now)
    rateLimitMap.set(ip, recent)

    // Échappement HTML
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message)
    const safeCategory = categoryLabels[category]

    // Envoi email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration email manquante.' }, { status: 500 })
    }
    const resend = new Resend(apiKey)
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: 'Prépa ATSEM - Contact <noreply@prepa-atsem.fr>',
      to: 'support@prepa-atsem.fr',
      replyTo: email,
      subject: `[${safeCategory}] ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6b21a8; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0;">Nouveau message — ${safeCategory}</h2>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 8px;"><strong>De :</strong> ${safeEmail}</p>
            <p style="margin: 0 0 8px;"><strong>Catégorie :</strong> ${safeCategory}</p>
            <p style="margin: 0 0 16px;"><strong>Sujet :</strong> ${safeSubject}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <div style="white-space: pre-wrap; color: #334155; line-height: 1.6;">${safeMessage}</div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">IP : ${ip} — Envoyé depuis le formulaire de contact Prépa ATSEM</p>
          </div>
        </div>
      `
    })

    if (sendError) {
      return NextResponse.json({ error: 'Erreur lors de l\'envoi. Veuillez réessayer.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 })
  }
}
