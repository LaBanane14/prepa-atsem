import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { plan, userId, userEmail } = await req.json()

    if (!plan || !userId || !userEmail) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Chercher ou créer le customer Stripe
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = existingSub?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      })
      customerId = customer.id
    }

    if (plan === 'monthly') {
      // Créer un abonnement incomplet — Stripe renvoie le client_secret
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: process.env.STRIPE_PRICE_MONTHLY }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        metadata: { userId, plan: 'monthly' },
        expand: ['latest_invoice.payment_intent'],
      })

      return NextResponse.json({
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        subscriptionId: subscription.id,
        customerId,
      })
    }

    if (plan === 'yearly') {
      // Paiement unique
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 8999, // 89,99€ en centimes
        currency: 'eur',
        customer: customerId,
        metadata: { userId, plan: 'yearly' },
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        customerId,
      })
    }

    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  } catch (err) {
    console.error('Create payment error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
