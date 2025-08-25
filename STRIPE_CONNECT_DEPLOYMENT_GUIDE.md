# 🚀 VAI Platform - Stripe Connect Integration Deployment Guide

## Overview

This guide covers deploying the complete Stripe Connect marketplace integration with 48-hour delayed payouts for the VAI Tourism Platform. The system enables:

- **11% Platform Commission**: Automatic split with 89% to operators
- **48-Hour Delayed Payouts**: Funds released after tour completion + 48 hours
- **Stripe Connect Express**: Simplified operator onboarding
- **Marketplace Model**: VAI Studio, LLC collects payments and distributes to operators

## ✅ Prerequisites

### 1. Stripe Account Setup
- ✅ VAI Studio, LLC Stripe account (live mode active)
- ✅ Stripe Connect Client ID: `ca_SrCGzl5madKvLb6wmpNOyYDYlQIsWHJg`
- ✅ Test keys configured in environment

### 2. Infrastructure
- ✅ Supabase project with service role key
- ✅ Operator dashboard deployed (Render.com)
- ✅ Tourist app deployed
- ✅ Atlas company structure complete

## 🏗️ Database Migrations

### Step 1: Run Database Schema Updates

```bash
# In operator-dashboard directory
cd operator-dashboard

# Apply the new Stripe Connect migration
supabase db push --include-all
```

**Key Schema Changes:**
- **operators table**: Added Stripe Connect fields (account_id, status, commission_rate)
- **bookings table**: Added tour completion and payout tracking fields
- **New indexes**: For payout processing and Connect account lookups

### Step 2: Verify Migration Success

```sql
-- Check operators table has new fields
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'operators' AND column_name LIKE 'stripe_%';

-- Expected: stripe_connect_account_id, stripe_connect_status, etc.

-- Check bookings table has payout fields  
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name LIKE '%payout%';

-- Expected: payout_status, payout_transfer_id, tour_completed_at, etc.
```

## 🔧 Supabase Edge Functions Deployment

### Step 3: Deploy New Edge Functions

```bash
# Deploy Connect account creation
supabase functions deploy create-connect-account --project-ref YOUR_PROJECT_REF

# Deploy Connect status checking
supabase functions deploy check-connect-status --project-ref YOUR_PROJECT_REF

# Deploy tour completion marking
supabase functions deploy mark-tour-completed --project-ref YOUR_PROJECT_REF

# Deploy payout processing  
supabase functions deploy process-tour-payouts --project-ref YOUR_PROJECT_REF

# Deploy Connect payment intents (for tourist app)
supabase functions deploy create-connect-payment-intent --project-ref YOUR_PROJECT_REF
```

### Step 4: Set Environment Variables for Edge Functions

```bash
# Set production Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_... --project-ref YOUR_PROJECT_REF

# Set operator dashboard URL for Connect redirects
supabase secrets set OPERATOR_DASHBOARD_URL=https://vai-operator-dashboard.onrender.com --project-ref YOUR_PROJECT_REF

# Verify secrets are set
supabase secrets list --project-ref YOUR_PROJECT_REF
```

## 🎯 Environment Configuration

### Step 5: Operator Dashboard Environment

**Render.com Environment Variables:**
```bash
# Add to Render dashboard environment variables
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51RvAV6EAOphBIIb6r0hjll5W4fAWYn5oPzF05GcHyYYU6Xjh1xe38RwxdDFXaOb0eyY0V1Q8iKbETRzk8l6XYgxZ00COtlUyOy

# For production, replace with live key:
# REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Step 6: Tourist App Environment

**Update `.env` file:**
```bash
# Add Stripe Connect Client ID
VITE_STRIPE_CONNECT_CLIENT_ID=ca_SrCGzl5madKvLb6wmpNOyYDYlQIsWHJg

# Ensure publishable key is set
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RvAV6EAOphBIIb6r0hjll5W4fAWYn5oPzF05GcHyYYU6Xjh1xe38RwxdDFXaOb0eyY0V1Q8iKbETRzk8l6XYgxZ00COtlUyOy
```

## 📱 Application Deployment

### Step 7: Deploy Updated Applications

```bash
# Operator Dashboard (trigger redeploy on Render)
# - Commit and push changes
# - Render will auto-deploy with new environment variables

# Tourist App  
cd tourist-app
npm run build
# Deploy to your hosting platform (Netlify/Vercel/etc)
```

## 🧪 Testing & Validation

### Step 8: Test Stripe Connect Flow

#### A. Test Operator Onboarding
1. **Access operator dashboard** → Profile tab
2. **Click "Connect Stripe Account"** 
3. **Complete Express onboarding** in test mode
4. **Verify account status** shows "Active" with payouts enabled

#### B. Test Marketplace Payment Flow
1. **Tourist books tour** via tourist app
2. **Verify payment authorization** (not captured) with destination charge
3. **Operator confirms booking** → payment should capture automatically
4. **Check commission split** in Stripe dashboard

#### C. Test 48-Hour Payout System
1. **Mark tour as completed** in operator dashboard
2. **Verify 48-hour countdown** starts
3. **Manually trigger payout processing**: 
   ```bash
   # Call Edge function directly (for testing)
   curl -X POST 'YOUR_SUPABASE_URL/functions/v1/process-tour-payouts' \
        -H 'Authorization: Bearer YOUR_ANON_KEY' \
        -H 'Content-Type: application/json' \
        -d '{"force_process": true, "booking_id": "BOOKING_ID"}'
   ```
4. **Verify transfer** appears in Stripe dashboard

### Step 9: Production Testing Checklist

#### Operator Dashboard
- [ ] Stripe Connect card appears in Profile tab
- [ ] Express account onboarding opens in popup
- [ ] Account status updates after onboarding
- [ ] Tour completion button works for confirmed bookings
- [ ] Payout countdown displays correctly
- [ ] Payout processing works after 48 hours

#### Tourist App  
- [ ] Payment form uses Connect payment endpoint
- [ ] Commission split data stored in booking
- [ ] Authorization-only flow works (no immediate capture)
- [ ] Error handling for operators without Connect accounts

#### Payment Flow
- [ ] Marketplace model: VAI collects, operator receives 89%
- [ ] Platform gets 11% commission automatically  
- [ ] Payments only captured after operator confirmation
- [ ] Refunds work for declined bookings

## 🔄 Automated Payout Processing

### Step 10: Set Up Cron Job for Payouts

**Option 1: Supabase Cron (Recommended)**
```sql
-- Add to your Supabase project
SELECT cron.schedule(
  'process-tour-payouts',
  '0 */6 * * *', -- Every 6 hours
  'SELECT net.http_post(
    url:=''https://YOUR_PROJECT.supabase.co/functions/v1/process-tour-payouts'',
    headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}''::jsonb,
    body:=''{}''::jsonb
  );'
);
```

**Option 2: External Cron Service**
- Set up service like GitHub Actions, Render Cron Jobs, or similar
- Call the `process-tour-payouts` endpoint every 6 hours
- Include proper authentication headers

### Step 11: Monitor Payout Processing

**Logging & Monitoring:**
```sql
-- Query for pending payouts
SELECT 
  b.id,
  b.booking_reference,
  b.tour_completed_at,
  b.payout_status,
  b.operator_amount_cents,
  o.name as operator_name
FROM bookings b
JOIN operators o ON o.id = b.operator_id  
WHERE b.payout_status = 'pending'
  AND b.tour_completed_at < NOW() - INTERVAL '48 hours'
  AND b.operator_amount_cents IS NOT NULL;

-- Query for failed payouts
SELECT * FROM bookings WHERE payout_status = 'failed';
```

## 🚨 Production Readiness

### Step 12: Switch to Live Stripe Keys

**⚠️ ONLY AFTER FULL TESTING ⚠️**

1. **Generate live Stripe keys** from dashboard.stripe.com
2. **Update all environment variables** to use live keys:
   - `STRIPE_SECRET_KEY=sk_live_...` (Supabase secrets)
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...` (Render env vars)
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` (Tourist app env)

3. **Test with small real transaction** before full launch

### Step 13: Final Verification

- [ ] All operators can onboard via Stripe Connect Express
- [ ] Live payments process through marketplace model
- [ ] Commission splits work correctly (11% platform, 89% operator)
- [ ] 48-hour payout delay enforced
- [ ] Automatic payout processing runs via cron
- [ ] Error handling and logging working
- [ ] Stripe dashboard shows proper transaction flow

## 📊 Currency Configuration

The current system is set up for:
- **Display Currency**: XPF (Pacific Franc) for local users
- **Processing Currency**: USD (required by Stripe for international processing)
- **Conversion**: Automatic XPF→USD at payment time

**To Allow Operators to Choose Currency:**
1. Add `preferred_payout_currency` field to operators table
2. Update payout processing to respect operator preference
3. Handle multi-currency transfers in Stripe Connect

## 🎯 Success Metrics

Post-deployment, monitor:
1. **Operator Onboarding Rate**: % completing Connect setup
2. **Payment Success Rate**: Marketplace payments vs standard
3. **Payout Processing**: Automated transfers success rate
4. **Commission Accuracy**: 11%/89% split verification
5. **48-Hour Compliance**: Payout timing accuracy

## 🆘 Troubleshooting

### Common Issues

**Operator Can't Connect Account:**
- Check Stripe Connect Client ID is correct
- Verify operator dashboard URL in environment variables
- Ensure Stripe account supports Connect in target region

**Payments Failing:**
- Verify operator has completed Express onboarding
- Check if operator's Connect account has charges_enabled: true
- Review Stripe logs for specific error messages

**Payouts Not Processing:**
- Check cron job is running
- Verify 48-hour delay calculation
- Ensure operator has payouts_enabled: true
- Check Stripe transfer limits

**Commission Split Wrong:**
- Verify commission_rate in operators table
- Check marketplace payment intent creation
- Review application_fee_amount in Stripe dashboard

## 📞 Support Contacts

- **Stripe Support**: For Connect account or payment issues
- **Supabase Support**: For Edge Function or database issues  
- **VAI Technical Lead**: For business logic or integration questions

---

## ✅ Deployment Complete!

Once all steps are completed, your VAI Platform will have:

✅ **Automatic Commission Splitting**: 11% to platform, 89% to operators  
✅ **48-Hour Delayed Payouts**: Funds held until tour completion + safety period  
✅ **Streamlined Operator Onboarding**: Express Connect accounts  
✅ **Marketplace Payment Processing**: VAI collects and distributes  
✅ **Automated Payout Management**: Cron-based processing system  
✅ **Multi-Currency Support**: XPF display, USD processing  

The system now provides the complete Stripe Connect marketplace experience with proper commission handling and operator payout management as specified in your requirements.