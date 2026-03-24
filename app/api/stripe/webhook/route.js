import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Webhook event type:', event.type)

  try {
    switch (event.type) {
      // Paiement unique réussi (pack annuel)
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
        else console.log('Yearly subscription created for user:', userId)
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
          console.error('Missing userId in subscription metadata')
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
        else console.log('Monthly subscription updated for user:', userId)
        break
      }

      // Annulation abonnement
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await supabaseAdmin.from('subscriptions').update({
          status: 'canceled',
        }).eq('stripe_subscription_id', subscription.id)
        console.log('Subscription canceled:', subscription.id)
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
