// tourist-app/api/create-payment-intent.js
// Vercel/Netlify serverless function for payment authorization

import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      amount, 
      currency, 
      booking_reference, 
      capture_method = 'manual',
      metadata = {} 
    } = req.body

    // Validate required fields
    if (!amount || !currency || !booking_reference) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, booking_reference' 
      })
    }

    // Validate amount (must be positive integer)
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be a positive integer (in cents)' 
      })
    }

    // Create Payment Intent with authorization only
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      capture_method: capture_method, // 'manual' for auth/capture flow
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_reference: booking_reference,
        platform: 'VAI_Tickets',
        created_at: new Date().toISOString(),
        ...metadata
      },
      description: `VAI Tickets Booking - ${booking_reference}`,
      statement_descriptor: 'VAI Tickets',
      receipt_email: metadata.customer_email || null,
    })

    // Return client secret for frontend confirmation
    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    })

  } catch (error) {
    console.error('Payment Intent creation error:', error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card error',
        message: error.message,
        code: error.code
      })
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid request',
        message: error.message
      })
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create payment intent'
    })
  }
}

// Alternative for local development/testing
// Option: Create this as a simple Express.js endpoint:

/*
// tourist-app/server/payment-api.js (if prefer local server)
import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

app.use(cors())
app.use(express.json())

app.post('/api/create-payment-intent', async (req, res) => {
  // Same logic as above serverless function
})

app.listen(3001, () => {
  console.log('Payment API running on port 3001')
})
*/