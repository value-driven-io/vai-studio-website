“Payout” (Onboarding) Integration Architecture & Flow
Current State

  Stripe Connect Onboarding Process

  The system uses Stripe Express accounts for operators with the following flow:

  1. Account Creation (create-connect-account/index.ts):
    - Creates Express accounts for operators in supported countries (defaults to France for French Polynesia)
    - Sets commission rate to 11% (VAI platform fee)
    - Configures manual payout schedule (triggered after tour completion + 48hr delay)
    - Stores account ID in operators.stripe_connect_account_id
  2. Onboarding Flow (create-account-link/index.ts):
    - Generates time-limited onboarding links for account setup
    - Redirects to dashboard with success/refresh URLs
    - Supports both initial onboarding and account updates
  3. Status Monitoring (check-connect-status/index.ts):
    - Syncs Stripe account status to local database
    - Tracks: stripe_connect_status, stripe_onboarding_complete, stripe_charges_enabled, stripe_payouts_enabled
    - Status states: not_connected, pending, connected, rejected

  Payment Processing Flow

  Tourist-Side (Authorization):
  1. Tourist books through VAI Tickets app
  2. Payment is authorized but not captured (hold on card)
  3. Booking created with payment_status: 'authorized'

  Operator-Side (Capture/Refund):
  1. Confirm Booking → Automatically captures payment via capture-payment function
  2. Decline Booking → Automatically refunds/cancels via refund-payment function
  3. Manual controls available through PaymentActionButtons component

  Verification Process

  Operator Verification:
  - Handled entirely by Stripe Express onboarding
  - Stripe collects: identity documents, business info, tax details, bank account
  - Status tracked via stripe_onboarding_complete, stripe_charges_enabled, stripe_payouts_enabled
  - No custom VAI verification - relies on Stripe's compliance

  Payment States:
  - authorized → Payment held, not captured
  - captured/paid → Payment completed
  - refunded → Payment returned
  - failed → Payment processing failed

  Booking Management System

  Booking Status Flow:
  pending → confirmed → completed
      ↓
   declined

  Status Types:
  - pending - Awaiting operator response
  - confirmed - Operator accepted booking
  - declined - Operator rejected booking
  - completed - Tour finished
  - cancelled - Booking cancelled
  - no_show - Customer didn't show

  Critical Business Logic:
  1. Payment Capture on Confirm: When operator confirms booking, payment is automatically captured
  (paymentService.capturePayment)
  2. Refund on Decline: When operator declines, payment is refunded (paymentService.refundPayment)
  3. Revenue Calculation: Only counts captured payments, not authorizations
  4. Payout Management: 48-hour delay after tour completion before operator payout

  Payout System (process-tour-payouts/index.ts)

  Payout Flow:
  1. Tour marked complete → tour_completed_at timestamp set
  2. 48-hour delay enforced for refund window
  3. Automatic transfer to operator's Stripe Connect account
  4. Platform retains 11% commission automatically

  Key Components:
  - PaymentStatusIndicator.jsx - Visual payment status with badges
  - PaymentActionButtons.jsx - Manual payment controls + Stripe dashboard links
  - TourCompletionCard.jsx - Tour completion and payout management
  - BookingDetailModal.jsx - Complete payment information display

  Database Schema:
  - Payment fields: payment_status, payment_intent_id, stripe_fee, payment_captured_at
  - Payout fields: payout_status, payout_transfer_id, payout_scheduled_at
  - Tour tracking: tour_completed_at, operator_amount_cents, platform_fee_cents

  The system is well-architected with proper error handling, automatic payment processing, and comprehensive audit trails for all
   financial transactions.




TRANSFORMATION:

🏗️ Hybrid Payout System Architecture

  Core Concept: Dual-Track Payout System

  Track 1: Stripe Express (Future/Global)
  - Keep existing implementation for international operators
  - Future-proofs the system for global expansion

  Track 2: Manual Payout Collection (French Polynesia Primary)
  - Secure operator banking data collection
  - Integration-ready for chosen payout provider (Tipalti/Wise/Routable/Payoneer)

⏺ 🔄 Operator Payout Flow Decision Logic

  Operator Registration
          ↓
  Location Detection/Selection
          ↓
     ┌─────────────┐    ┌───────────────────┐
     │ Polynesian  │    │ International     │
     │ Address     │    │ Address           │
     └─────────────┘    └───────────────────┘
          ↓                       ↓
     Manual Payout          Stripe Express
     Data Collection        Onboarding
          ↓                       ↓
     Banking Details        Automated Setup
     KYC/Verification       Stripe Compliance
          ↓                       ↓
     Ready for Manual       Ready for Auto
     Payout Processing      Payout Processing

⏺ 🔒 Secure Data Collection Requirements

  Essential Operator Data for French Polynesian Payouts:

  Personal/Business Identity:
  - Full legal name (individual/business)
  - French Polynesian tax number (TAHITI)
  - National ID/SIREN number
  - Business registration (if applicable)

  Banking Information:
  - Bank name and address
  - Account holder name
  - IBAN/Account number
  - SWIFT/BIC code
  - Currency preference (XPF/EUR/USD)

  Address Verification:
  - Physical address in French Polynesia
  - Postal verification method

  Tax & Legal:
  - Tax residency status
  - VAT number (if applicable)
  - Preferred invoice currency

⏺ 🏛️ System Architecture Concept

  Database Schema Extensions:
  -- Add to operators table
  manual_payout_method VARCHAR(50) -- 'bank_transfer', 'wise', 'payoneer', etc.
  manual_payout_status VARCHAR(50) -- 'incomplete', 'pending_review', 'verified', 'rejected'
  manual_payout_data_encrypted TEXT -- Encrypted JSON with banking details
  payout_preference VARCHAR(20) -- 'stripe_express', 'manual', 'auto_detect'
  verification_documents JSONB -- Document upload tracking
  verification_status VARCHAR(50) -- KYC status

  UI/UX Flow:
  1. Profile Setup Detection - Auto-detect based on operator address
  2. Payout Method Selection - Manual choice or auto-suggested
  3. Step-by-Step Data Collection - Progressive disclosure, secure forms
  4. Document Upload - Secure file handling with encryption
  5. Verification Workflow - Admin review process
  6. Status Dashboard - Clear progress indicators

  Security Measures:
  - Encryption at rest - All banking data encrypted in database
  - PCI-compliant handling - Secure transmission protocols
  - Document scanning - Auto-redaction of sensitive data
  - Audit logging - Complete trail of data access
  - Role-based access - Limited admin access to financial data

⏺ 🔄 Integration Strategy

  Phase 1: Core Infrastructure
  - Database schema updates
  - Encryption service setup
  - Basic manual payout form

  Phase 2: Enhanced Collection
  - Document upload system
  - Address verification
  - Admin review workflow

  Phase 3: Provider Integration
  - API integration with chosen provider (Tipalti/Wise/etc.)
  - Automated payout processing
  - Reconciliation system

  Future Integration Points:
  - Tipalti: Full tax compliance, multi-currency, global coverage
  - Wise: Cost-effective transfers, strong XPF support
  - Routable: B2B focused, good for business operators
  - Payoneer: Wide coverage, flexible payout methods

  ---
  📋 Proposed Concept Summary

  Key Decisions Needed:

  1. Data Collection Scope: Which fields are mandatory vs optional?
  2. Verification Level: Auto-approve, manual review, or hybrid?
  3. Storage Strategy: Local encryption vs external vault service?
  4. Admin Interface: How much manual oversight do you want?
  5. Fallback Handling: What happens when data is incomplete?

  Benefits of This Approach:
  - ✅ Keeps existing Stripe Express for future/international use
  - ✅ Provides secure collection for Polynesian operators
  - ✅ Integration-ready for any payout provider
  - ✅ Maintains audit compliance
  - ✅ Scalable architecture




