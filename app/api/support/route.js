import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const categoryLabels = { bug: 'Bug 🐛', abonnement: 'Abonnement 💳', suggestion: 'Suggestion 💡', autre: 'Autre 💬' }
const validCategories = Object.keys(categoryLabels)

const allowedOrigins = [
  'https://prepa-atsem.fr',
  'https://www.prepa-atsem.fr',
  'https://prepa-atsem.vercel.app',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
]

const rateLimitMap = new Map()

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 })
    }

    const formData = await request.formData()
    const category = formData.get('category')
    const message = formData.get('message')
    const email = formData.get('email')
    const file = formData.get('file')

    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message requis.' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message trop long (max 5000 caractères).' }, { status: 400 })
    }

    // Rate limit : 3 messages par IP par 15 min
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const now = Date.now()
    const windowMs = 15 * 60 * 1000
    const ipData = rateLimitMap.get(ip) || []
    const recent = ipData.filter(t => now - t < windowMs)
    if (recent.length >= 3) {
      return NextResponse.json({ error: 'Trop de messages. Réessayez dans 15 minutes.' }, { status: 429 })
    }
    recent.push(now)
    rateLimitMap.set(ip, recent)

    const safeEmail = email ? escapeHtml(email) : 'Non renseigné'
    const safeMessage = escapeHtml(message)
    const label = categoryLabels[category]

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration email manquante.' }, { status: 500 })
    }

    // Préparer la pièce jointe si présente
    const attachments = []
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo).' }, { status: 400 })
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      attachments.push({
        filename: file.name,
        content: buffer
      })
    }

    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: 'Prépa ATSEM - Support <noreply@prepa-atsem.fr>',
      to: 'support@prepa-atsem.fr',
      replyTo: email || undefined,
      subject: `[${label}] Nouveau ticket support`,
      attachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0;">Nouveau ticket support — ${label}</h2>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 8px;"><strong>Utilisateur :</strong> ${safeEmail}</p>
            <p style="margin: 0 0 16px;"><strong>Catégorie :</strong> ${label}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <div style="white-space: pre-wrap; color: #334155; line-height: 1.6; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${safeMessage}</div>
            ${attachments.length > 0 ? `<p style="margin: 16px 0 0; font-size: 13px; color: #64748b;">📎 Pièce jointe : ${escapeHtml(file.name)} (${(file.size / 1024).toFixed(0)} Ko)</p>` : ''}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">IP : ${ip} — Envoyé depuis le tableau de bord Prépa FPC</p>
          </div>
        </div>
      `
    })

    if (sendError) {
      console.error('Support email error:', sendError)
      return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Support API error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
