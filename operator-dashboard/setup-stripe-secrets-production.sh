#!/bin/bash

# setup-stripe-secrets-production.sh
# Set Stripe secret key for PRODUCTION Edge Functions in Supabase

echo "🔐 Setting up Stripe secrets for PRODUCTION Edge Functions..."

# Production Supabase project reference
PROJECT_REF="rizqwxcmpzhdmqjjqgyw"

echo ""
echo "⚠️  IMPORTANT: You need your PRODUCTION Stripe secret key (starts with sk_live_...)"
echo "   NOT the sandbox key (sk_test_...)"
echo ""
echo "📍 Get your production secret key from:"
echo "   https://dashboard.stripe.com/apikeys (switch to Live mode)"
echo ""

# Prompt for production Stripe secret key
read -p "Enter your PRODUCTION Stripe secret key (sk_live_...): " STRIPE_SECRET_KEY

if [[ ! "$STRIPE_SECRET_KEY" =~ ^sk_live_ ]]; then
    echo "❌ Warning: This doesn't look like a production key (should start with sk_live_)"
    read -p "Are you sure you want to continue? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "❌ Aborted. Please get your production Stripe secret key."
        exit 1
    fi
fi

echo ""
echo "🚀 Setting Stripe secret key for production Edge Functions..."

# Set the secret for the production project
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --project-ref "$PROJECT_REF"

if [ $? -eq 0 ]; then
    echo "✅ Production Stripe secret key set successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. ✅ Edge Functions deployed to production"
    echo "2. ✅ Stripe secret key set for production"
    echo "3. 🔄 Update Render.com with production Stripe publishable key"
    echo "4. 🔄 Update tourist-app .env with production Supabase URL"
    echo ""
    echo "🌍 Production Environment Variables needed:"
    echo "   Render.com:"
    echo "   - REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_..."
    echo "   - REACT_APP_SUPABASE_URL=https://rizqwxcmpzhdmqjjqgyw.supabase.co"
    echo "   - REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo ""
else
    echo "❌ Failed to set Stripe secret key. Please try again or check your Supabase CLI setup."
    exit 1
fi