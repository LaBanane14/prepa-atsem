import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function sendEmail({ to, subject, html }) {
  const { error } = await resend.emails.send({
    from: 'Prépa FPC <noreply@prepa-fpc.fr>',
    to,
    subject,
    html
  })
  if (error) throw error
}

export function buildEmailHtml({ title, greeting, sections, ctaText, ctaUrl }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#dc2626;color:white;padding:24px 32px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Prépa FPC</h1>
      <p style="margin:6px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;">La passerelle IFSI</p>
    </div>
    <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;">
      ${title ? `<h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">${title}</h2>` : ''}
      ${greeting ? `<p style="margin:0 0 20px;color:#64748b;font-size:15px;">${greeting}</p>` : ''}
      ${sections.map(s => `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${s}</p>`).join('')}
      ${ctaText && ctaUrl ? `
      <div style="text-align:center;margin:28px 0 12px;">
        <a href="${ctaUrl}" style="display:inline-block;background:#0f172a;color:white;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          ${ctaText}
        </a>
      </div>` : ''}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:11px;margin:16px 0 0;">
      © 2026 Prépa FPC (prepa-fpc.fr) — Tous droits réservés.
    </p>
  </div>
</body>
</html>`
}

export async function hasEmailBeenSent(userId, emailType) {
  const { data } = await supabaseAdmin
    .from('email_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .limit(1)
  return data && data.length > 0
}

export async function hasRecentEmail(userId, emailType, days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('email_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .gte('sent_at', since)
    .limit(1)
  return data && data.length > 0
}

export async function claimAndSend(userId, emailType, { to, subject, html }) {
  const { error } = await supabaseAdmin
    .from('email_logs')
    .insert({ user_id: userId, email_type: emailType })

  if (error?.code === '23505') return false

  try {
    await sendEmail({ to, subject, html })
    return true
  } catch (sendError) {
    await supabaseAdmin
      .from('email_logs')
      .delete()
      .eq('user_id', userId)
      .eq('email_type', emailType)
    console.error(`Email ${emailType} failed for ${userId}:`, sendError)
    return false
  }
}

export { supabaseAdmin }
