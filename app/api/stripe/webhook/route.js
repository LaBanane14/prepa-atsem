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
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Session metadata:', JSON.stringify(session.metadata))
        console.log('Session customer:', session.customer)
        console.log('Session subscription:', session.subscription)

        const userId = session.metadata?.userId
        const plan = session.metadata?.plan
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

        if (!userId || !plan) {
          console.error('Missing metadata:', { userId, plan })
          break
        }

        if (plan === 'yearly') {
          const expiresAt = new Date()
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)

          const { error } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            plan: 'yearly',
            status: 'active',
            current_period_end: expiresAt.toISOString(),
          }, { onConflict: 'user_id' })
          if (error) console.error('Supabase upsert error (yearly):', error)
        }

        if (plan === 'monthly') {
          // Calcul simple : +1 mois à partir de maintenant
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + 1)

          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id || null

          const { error } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            plan: 'monthly',
            status: 'active',
            current_period_end: endDate.toISOString(),
          }, { onConflict: 'user_id' })
          if (error) console.error('Supabase upsert error (monthly):', error)
          else console.log('Subscription created for user:', userId)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
        if (subId) {
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + 1)
          await supabaseAdmin.from('subscriptions').update({
            status: 'active',
            current_period_end: endDate.toISOString(),
          }).eq('stripe_subscription_id', subId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await supabaseAdmin.from('subscriptions').update({
          status: 'canceled',
        }).eq('stripe_subscription_id', subscription.id)
        break
      }

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
