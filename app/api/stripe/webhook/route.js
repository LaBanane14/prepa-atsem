import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}
function getSupabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function POST(req) {
  const stripe = getStripe()
  const supabaseAdmin = getSupabaseAdmin()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // Session checkout terminée (marche pour mensuel ET annuel)
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan

        if (!userId) { console.error('checkout.session.completed - no userId'); break }

        if (plan === 'monthly' && session.subscription) {
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + 1)
          const { error } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription.id,
            plan: 'monthly',
            status: 'active',
            current_period_end: endDate.toISOString(),
          }, { onConflict: 'user_id' })
          if (error) console.error('Supabase upsert error (monthly checkout):', error)
        }

        if (plan === 'yearly') {
          const expiresAt = new Date()
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)
          const { error } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            plan: 'yearly',
            status: 'active',
            current_period_end: expiresAt.toISOString(),
          }, { onConflict: 'user_id' })
          if (error) console.error('Supabase upsert error (yearly checkout):', error)
        }
        break
      }

      // Paiement unique réussi (pack annuel) - backup
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const userId = paymentIntent.metadata?.userId
        const plan = paymentIntent.metadata?.plan

        if (!userId || plan !== 'yearly') break

        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)

        const { error } = await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: paymentIntent.customer,
          plan: 'yearly',
          status: 'active',
          current_period_end: expiresAt.toISOString(),
        }, { onConflict: 'user_id' })
        if (error) console.error('Supabase upsert error (yearly):', error)
        break
      }

      // Abonnement mensuel : premier paiement ou renouvellement
      case 'invoice.paid': {
        const invoice = event.data.object
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
        if (!subId) break

        const subscription = await stripe.subscriptions.retrieve(subId)
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('Missing userId in subscription metadata. Sub ID:', subId)
          break
        }

        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)

        const { error } = await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: subId,
          plan: 'monthly',
          status: 'active',
          current_period_end: endDate.toISOString(),
        }, { onConflict: 'user_id' })
        if (error) console.error('Supabase upsert error (monthly):', error)
        break
      }

      // Annulation abonnement
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await supabaseAdmin.from('subscriptions').update({
          status: 'canceled',
        }).eq('stripe_subscription_id', subscription.id)
        break
      }

      // Paiement échoué
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
        if (subId) {
          await supabaseAdmin.from('subscriptions').update({
            status: 'past_due',
          }).eq('stripe_subscription_id', subId)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
