# 🧪 Testing Suite for VAI Studio Tourist App

## Overview
This directory contains all testing and diagnostic tools for the booking system implementation.

## Files

### 🔬 Automated Testing
- **`automated_booking_test.js`** - Comprehensive booking flow test suite
  - Tests tour availability, user creation, booking creation, concurrent prevention
  - Performance testing (sub-500ms target)
  - Automatic cleanup of test data
  - Usage: `node testing/automated_booking_test.js`

### 🏥 Health Checks & Diagnostics
- **`supabase_database_health_check.sql`** - Database diagnostic queries
  - Checks all tables, functions, triggers, RLS status
  - Validates data integrity and performance
  - Run in Supabase SQL editor

### 🛡️ Safety & Rollback
- **`emergency_rollback.sql`** - Emergency rollback script
  - Reverts all booking system changes if needed
  - Only use in case of critical production issues
  - Usage: `psql $DATABASE_URL -f testing/emergency_rollback.sql`

### 🎭 End-to-End Testing
- **`playwright.config.js`** - Playwright E2E testing configuration
- **`playwright_e2e_setup.js`** - Full frontend booking flow tests
  - Tests complete user journey from discovery to payment
  - Includes Stripe payment testing with test cards
  - Mobile and desktop browser testing

## Environment Setup

### For Automated Testing
```bash
# Install dependencies
npm install @supabase/supabase-js

# Set environment variables in .env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### For E2E Testing
```bash
# Install Playwright
npm install @playwright/test

# Run E2E tests
npx playwright test
```

## Test Scenarios Covered

### Booking Flow Tests
- ✅ Tour availability verification
- ✅ Tourist user creation/lookup
- ✅ Atomic booking creation
- ✅ Concurrent booking prevention
- ✅ Performance benchmarking
- ✅ Automatic test data cleanup

### Error Scenarios
- ✅ Insufficient spots handling
- ✅ Tour not found errors
- ✅ RLS security verification
- ✅ Network error handling
- ✅ Validation error responses

### Performance Targets
- 📊 Booking creation: <500ms
- 📊 Tour lookup: <200ms
- 📊 User creation: <300ms
- 📊 Concurrent handling: 100% atomic

## Production Verification

After any deployment, run the full test suite:
```bash
node testing/automated_booking_test.js
```

Expected output: `🎉 ALL TESTS PASSED! Booking system is working correctly.`

## Monitoring & Alerts

The automated test can be integrated into:
- CI/CD pipelines for regression testing
- Production health monitoring
- Performance regression detection
- Error rate tracking

---
**Testing Status: ✅ Comprehensive Coverage**