#!/bin/bash
# Setup Stripe secrets for Supabase Edge Functions

echo "🔐 Setting up Stripe secrets for VAI Operator Dashboard..."

# Set Stripe secret key for Edge Functions
echo "Setting STRIPE_SECRET_KEY..."
supabase secrets set STRIPE_SECRET_KEY=sk_test_51RvAV6EAOphBIIb6FpmN2MgUZFKWJRbfrzz6CcGAyytowRKYmrANVltF9Zqz8Gm7DPqBWnQMXwJMt9BwXd2fkHip00Sz6zRRg8

echo "✅ Stripe secrets configured successfully!"
echo "🚀 Now you can deploy the Edge Functions:"
echo "   supabase functions deploy capture-payment"
echo "   supabase functions deploy refund-payment" 
echo "   supabase functions deploy get-payment-status"