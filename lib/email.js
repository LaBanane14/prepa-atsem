import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

let _resend
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

let _supabaseAdmin
function getSupabaseAdmin() {
  if (!_supabaseAdmin) _supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  return _supabaseAdmin
}

const supabaseAdmin = new Proxy({}, {
  get(_, prop) { return getSupabaseAdmin()[prop] }
})

export async function sendEmail({ to, subject, html }) {
  const { error } = await getResend().emails.send({
    from: 'Prépa ATSEM <noreply@prepa-atsem.fr>',
    to,
    subject,
    html
  })
  if (error) throw error
}

export function buildEmailHtml({ title, emoji, greeting, sections, ctaText, ctaUrl }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f0ff;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#6b21a8;border-radius:12px;padding:8px;margin-bottom:12px;">
        <img src="https://www.prepa-atsem.fr/favicon.png" width="28" height="28" alt="Prépa ATSEM" style="display:block;" />
      </div>
      <div>
        <span style="font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Prépa </span><span style="font-size:24px;font-weight:900;color:#6b21a8;letter-spacing:-0.5px;">ATSEM</span>
        <p style="margin:4px 0 0;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:3px;">Concours ATSEM</p>
      </div>
    </div>
    <div style="background:white;border-radius:20px;border:1px solid #e2e8f0;padding:32px;text-align:center;">
      ${title ? `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">${title}${emoji ? ' ' + emoji : ''}</h1>` : ''}
      ${greeting ? `<p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">${greeting}</p>` : ''}
      ${sections.map(s => `<p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6;">${s}</p>`).join('')}
      ${ctaText && ctaUrl ? `
      <div style="text-align:center;margin:24px 0 12px;">
        <a href="${ctaUrl}" style="display:inline-block;background:#0f172a;color:white;font-weight:700;font-size:14px;padding:14px 40px;border-radius:12px;text-decoration:none;">
          ${ctaText}
        </a>
      </div>` : ''}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:11px;margin:20px 0 0;">
      © 2026 Prépa ATSEM — prepa-atsem.fr
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
