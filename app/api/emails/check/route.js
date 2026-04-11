import { NextResponse } from 'next/server'
import { supabaseAdmin, buildEmailHtml, claimAndSend, hasEmailBeenSent, hasRecentEmail } from '../../../../lib/email'

const siteUrl = 'https://www.prepa-atsem.fr'

export async function POST(request) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Récupérer l'utilisateur
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (userError || !user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    const email = user.email
    const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Candidat'

    // Vérifier si abonnement actif → skip les relances
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (sub && new Date(sub.current_period_end) > new Date()) {
      return NextResponse.json({ checked: true, sent: [], reason: 'premium' })
    }

    // Calcul des jours d'essai
    const created = new Date(user.created_at)
    const now = new Date()
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    const trialDays = Math.max(0, 7 - diffDays)

    const sent = []

    // === J+5 : 2 jours restants ===
    if (trialDays === 2) {
      const alreadySent = await hasEmailBeenSent(userId, 'trial_j5')
      if (!alreadySent) {
        const html = buildEmailHtml({
          title: `Plus que 2 jours d'essai, ${firstName} !`,
          emoji: '⏳',
          greeting: 'Votre période d\'essai gratuite touche à sa fin.',
          sections: [
            'Il vous reste <strong>2 jours</strong> pour profiter de l\'accès complet à la plateforme Prépa FPC.',
            'Après cette période, vous devrez souscrire à un abonnement pour continuer vos entraînements.',
            'Ne perdez pas votre progression — <strong>abonnez-vous maintenant</strong> pour garder un accès illimité à tous les exercices, annales et examens blancs.'
          ],
          ctaText: 'Voir les tarifs',
          ctaUrl: `${siteUrl}/tarifs`
        })
        const didSend = await claimAndSend(userId, 'trial_j5', {
          to: email,
          subject: 'Plus que 2 jours d\'essai gratuit — Prépa FPC',
          html
        })
        if (didSend) sent.push('trial_j5')
      }
    }

    // === J+7 : Essai terminé ===
    if (trialDays <= 0) {
      const alreadySent = await hasEmailBeenSent(userId, 'trial_j7')
      if (!alreadySent) {
        const html = buildEmailHtml({
          title: `Votre essai gratuit est terminé, ${firstName}`,
          emoji: '😢',
          greeting: 'Merci d\'avoir testé <strong style="color:#0f172a;">Prépa FPC</strong> pendant 7 jours !',
          sections: [
            'Votre période d\'essai gratuite est maintenant terminée.',
            'Pour continuer à vous entraîner avec nos <strong>QCM de mathématiques</strong>, nos <strong>sujets de rédaction</strong>, nos <strong>examens blancs</strong> et la <strong>préparation à l\'oral</strong>, souscrivez à un abonnement.',
            'Des milliers de candidats ont déjà réussi leur concours FPC grâce à notre plateforme. Rejoignez-les !'
          ],
          ctaText: 'Souscrire maintenant',
          ctaUrl: `${siteUrl}/tarifs`
        })
        const didSend = await claimAndSend(userId, 'trial_j7', {
          to: email,
          subject: 'Votre essai gratuit est terminé — Prépa FPC',
          html
        })
        if (didSend) sent.push('trial_j7')
      }
    }

    // === Inactivité 7 jours ===
    const { data: lastActivity } = await supabaseAdmin
      .from('historique')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastActivity && lastActivity.length > 0) {
      const lastDate = new Date(lastActivity[0].created_at)
      const daysSinceActivity = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))

      if (daysSinceActivity >= 7) {
        const recentlySent = await hasRecentEmail(userId, 'inactivity_7d', 14)
        if (!recentlySent) {
          const html = buildEmailHtml({
            title: `On vous attend, ${firstName} !`,
            emoji: '💪',
            greeting: `Cela fait ${daysSinceActivity} jours que vous n'avez pas révisé.`,
            sections: [
              'La régularité est la clé de la réussite au concours FPC. Même <strong>15 minutes par jour</strong> font la différence.',
              'Vos exercices et vos statistiques vous attendent sur votre tableau de bord.',
              'Reprenez là où vous en étiez et continuez votre progression vers le concours !'
            ],
            ctaText: 'Reprendre mes révisions',
            ctaUrl: `${siteUrl}/dashboard`
          })
          const { error: insertError } = await supabaseAdmin
            .from('email_logs')
            .insert({ user_id: userId, email_type: 'inactivity_7d' })
          if (!insertError) {
            try {
              const { sendEmail } = await import('../../../../lib/email')
              await sendEmail({ to: email, subject: 'Reprenez vos révisions — Prépa FPC', html })
              sent.push('inactivity_7d')
            } catch (e) {
              console.error('Inactivity email failed:', e)
              await supabaseAdmin.from('email_logs').delete().eq('user_id', userId).eq('email_type', 'inactivity_7d').eq('sent_at', (await supabaseAdmin.from('email_logs').select('sent_at').eq('user_id', userId).eq('email_type', 'inactivity_7d').order('sent_at', { ascending: false }).limit(1)).data?.[0]?.sent_at)
            }
          }
        }
      }
    }

    return NextResponse.json({ checked: true, sent })
  } catch (err) {
    console.error('Email check error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
