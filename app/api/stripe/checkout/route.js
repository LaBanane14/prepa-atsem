import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { priceId, userId, userEmail } = await req.json()

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const isRecurring = priceId === process.env.STRIPE_PRICE_MONTHLY

    // Créer ou récupérer un customer Stripe avec pays France pour la TVA
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 })
    let customer
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
        address: { country: 'FR' }
      })
    }

    const sessionParams = {
      customer: customer.id,
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId, plan: isRecurring ? 'monthly' : 'yearly' },
      automatic_tax: { enabled: true },
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard?tab=abonnement&canceled=true`,
    }

    // Transférer les metadata vers le payment_intent (annuel) ou la subscription (mensuel)
    if (isRecurring) {
      sessionParams.subscription_data = { metadata: { userId, plan: 'monthly' } }
    } else {
      sessionParams.payment_intent_data = { metadata: { userId, plan: 'yearly' } }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
