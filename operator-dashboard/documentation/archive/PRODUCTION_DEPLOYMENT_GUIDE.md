# 🚀 VAI Production Deployment Guide

## ✅ **COMPLETED: Edge Functions Deployed**

All 4 Edge Functions have been successfully deployed to **PRODUCTION**:

### **Supabase Production Project: `rizqwxcmpzhdmqjjqgyw`**
- ✅ `create-payment-intent` - **Tourist-app payment creation**
- ✅ `capture-payment` - **Operator-dashboard payment capture**
- ✅ `refund-payment` - **Operator-dashboard payment refund** 
- ✅ `get-payment-status` - **Payment status checks**

**Dashboard**: https://supabase.com/dashboard/project/rizqwxcmpzhdmqjjqgyw/functions

---

## 🔧 **NEXT STEPS: Production Configuration**

### **1. Set Production Stripe Secret Key** 
```bash
cd operator-dashboard
./setup-stripe-secrets-production.sh
```
**You need your PRODUCTION Stripe secret key** (starts with `sk_live_...`)

### **2. Update Render.com Environment Variables**
Set these in your Render.com dashboard for both apps:

```bash
# Production Supabase  
REACT_APP_SUPABASE_URL=https://rizqwxcmpzhdmqjjqgyw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpenF3eGNtcHpoZG1xampxZ3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3MTIsImV4cCI6MjA2NjI3OTcxMn0.dlNpxINvs2yzlFQndTZIrfQTBgWpQ5Ee0aPGVwRPHo0

# Production Stripe (replace with your live keys)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### **3. Test Production Payment Flow**
1. **VAI Tickets**: Tourist creates booking → Payment authorized  
2. **Operator Dashboard**: Operator confirms booking → Payment captured
3. **Verify**: Check Stripe Live Dashboard for transactions

---

## 🏗️ **Architecture Overview**

### **Payment Flow:**
```
1. Tourist (VAI Tickets) → create-payment-intent → Payment Authorized
2. Operator Dashboard → capture-payment → Payment Captured  
3. Operator Dashboard → refund-payment → Payment Refunded (if declined)
```

### **Supabase Projects:**
- **Staging**: `wewwhxhtpqjqhxfxbzyz.supabase.co` (sandbox Stripe)
- **Production**: `rizqwxcmpzhdmqjjqgyw.supabase.co` (live Stripe)

### **App Deployments:**
- **VAI Tickets**: Deployed on Render.com 
- **Operator Dashboard**: Deployed on Render.com
- **Edge Functions**: Deployed on Supabase

---

## ⚡ **Quick Production Checklist**

- [x] **Edge Functions deployed to production** ✅
- [ ] **Production Stripe secret key set** (run setup script)
- [ ] **Render.com environment variables updated** 
- [ ] **End-to-end payment testing completed**

---

## 🆘 **Troubleshooting**

### **Payment Creation Fails**
- Check: Tourist-app calls `create-payment-intent` ✅ (deployed)
- Check: Stripe secret key set in Supabase Edge Functions

### **Payment Capture Fails** 
- Check: Operator-dashboard calls `capture-payment` ✅ (deployed)
- Check: Both apps use same Supabase production project

### **Environment Variables**
- **VAI Tickets**: Uses `VITE_` prefixed variables
- **Operator Dashboard**: Uses `REACT_APP_` prefixed variables
- **Edge Functions**: Uses `Deno.env.get('STRIPE_SECRET_KEY')`

---

**Status**: 🚀 **Ready for Production** (after Stripe secret key setup)