import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const allowedOrigins = [
  'https://prepa-fpc.fr',
  'https://www.prepa-fpc.fr',
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

    const { rating, comment, email } = await request.json()

    if (!rating || typeof rating !== 'number' || rating < 0.5 || rating > 5 || (rating * 2) % 1 !== 0) {
      return NextResponse.json({ error: 'Note invalide (0.5 à 5).' }, { status: 400 })
    }
    if (comment && comment.length > 2000) {
      return NextResponse.json({ error: 'Le commentaire ne doit pas dépasser 2000 caractères.' }, { status: 400 })
    }

    // Rate limit : 1 avis par IP par heure
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const now = Date.now()
    const windowMs = 60 * 60 * 1000
    const lastSent = rateLimitMap.get(ip)
    if (lastSent && now - lastSent < windowMs) {
      return NextResponse.json({ error: 'Vous avez déjà envoyé un avis récemment. Réessayez plus tard.' }, { status: 429 })
    }
    rateLimitMap.set(ip, now)

    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)
    const stars = '★'.repeat(fullStars) + (hasHalf ? '⯨' : '') + '☆'.repeat(emptyStars)
    const safeComment = comment ? escapeHtml(comment) : ''
    const safeEmail = email ? escapeHtml(email) : 'Non connecté'

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration email manquante.' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: 'Prépa FPC - Avis <noreply@prepa-fpc.fr>',
      to: 'support@prepa-fpc.fr',
      subject: `${stars} Nouvel avis (${rating}/5)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0;">Nouvel avis utilisateur</h2>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 8px;"><strong>Utilisateur :</strong> ${safeEmail}</p>
            <p style="margin: 0 0 16px; font-size: 28px; letter-spacing: 4px; color: #f59e0b;">${stars}</p>
            <p style="margin: 0 0 8px;"><strong>Note :</strong> ${rating}/5</p>
            ${safeComment ? `
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p style="margin: 0 0 8px;"><strong>Commentaire :</strong></p>
              <div style="white-space: pre-wrap; color: #334155; line-height: 1.6; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${safeComment}</div>
            ` : '<p style="margin: 0; color: #94a3b8; font-style: italic;">Aucun commentaire</p>'}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">IP : ${ip} — Envoyé depuis le tableau de bord Prépa FPC</p>
          </div>
        </div>
      `
    })

    if (sendError) {
      console.error('Review email error:', sendError)
      return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review API error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
